import { SSEParser } from './sse_parser.js';

const DEFAULT_RECONNECT = {
  enabled: true,
  initialDelayMs: 500,
  maxDelayMs: 5000,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildReconnectConfig(userConfig = {}) {
  const merged = { ...DEFAULT_RECONNECT, ...userConfig };
  return {
    enabled: Boolean(merged.enabled),
    initialDelayMs: Number(merged.initialDelayMs),
    maxDelayMs: Number(merged.maxDelayMs),
  };
}

export class SSEClient {
  constructor({ fetchImpl = fetch, adapter, onTrace } = {}) {
    if (!fetchImpl) {
      throw new Error('SSEClient requires a fetch implementation');
    }
    this.fetchImpl = fetchImpl;
    this.adapter = adapter;
    this.onTrace = onTrace;
    this.abortController = null;
    this.closed = false;
    this.currentRetryMs = DEFAULT_RECONNECT.initialDelayMs;
  }

  close() {
    this.closed = true;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async connect({
    url,
    sessionId,
    headers,
    onRawEvent,
    onNormalizedEvent,
    onStatus,
    reconnect,
  }) {
    this.closed = false;
    const reconnectConfig = buildReconnectConfig(reconnect);
    this.currentRetryMs = reconnectConfig.initialDelayMs;

    while (!this.closed) {
      try {
        await this.#consumeOnce({
          url,
          sessionId,
          headers,
          onRawEvent,
          onNormalizedEvent,
          onStatus,
        });

        if (!reconnectConfig.enabled || this.closed) {
          break;
        }

        onStatus?.({ state: 'reconnecting', sessionId, retryMs: this.currentRetryMs });
        await sleep(this.currentRetryMs);
        this.currentRetryMs = Math.min(this.currentRetryMs * 2, reconnectConfig.maxDelayMs);
      } catch (error) {
        if (this.closed) {
          break;
        }

        onStatus?.({ state: 'error', sessionId, error: String(error) });

        if (!reconnectConfig.enabled) {
          throw error;
        }

        onStatus?.({ state: 'reconnecting', sessionId, retryMs: this.currentRetryMs });
        await sleep(this.currentRetryMs);
        this.currentRetryMs = Math.min(this.currentRetryMs * 2, reconnectConfig.maxDelayMs);
      }
    }

    onStatus?.({ state: 'closed', sessionId });
  }

  async #consumeOnce({ url, sessionId, headers, onRawEvent, onNormalizedEvent, onStatus }) {
    this.abortController = new AbortController();
    onStatus?.({ state: 'connecting', sessionId });

    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        ...(headers ?? {}),
      },
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`SSE request failed: HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('SSE response body is empty');
    }

    onStatus?.({ state: 'open', sessionId });

    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    const parser = new SSEParser({
      onRetry: (retryMs) => {
        this.currentRetryMs = retryMs;
      },
      onEvent: (rawEvent) => {
        const event = {
          sessionId,
          eventName: rawEvent.event,
          data: rawEvent.data,
          id: rawEvent.id,
          retry: rawEvent.retry,
          receivedAt: new Date().toISOString(),
        };

        if (this.onTrace) {
          this.onTrace({ sessionId, kind: 'raw-event', eventName: event.eventName, eventId: event.id });
        }

        onRawEvent?.(event);

        if (!this.adapter) {
          return;
        }

        const normalized = this.adapter.normalize(event);
        if (normalized) {
          onNormalizedEvent?.(normalized);
        }
      },
    });

    while (!this.closed) {
      const result = await reader.read();
      if (result.done) {
        onStatus?.({ state: 'stream-ended', sessionId });
        break;
      }

      const text = decoder.decode(result.value, { stream: true });
      parser.feed(text);
    }

    parser.flush();
    reader.releaseLock();
  }
}
