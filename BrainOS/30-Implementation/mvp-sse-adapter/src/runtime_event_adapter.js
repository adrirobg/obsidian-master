const EMPTY_EVENT_NAME = 'message';

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function inferType(eventName, payload) {
  if (eventName === 'start') return 'start';
  if (eventName === 'progress') return 'progress';
  if (eventName === 'message') return 'message';
  if (eventName === 'error') return 'error';
  if (eventName === 'end') return 'end';

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.error || payload.type === 'error') return 'error';
  if (payload.progress !== undefined || payload.percent !== undefined) return 'progress';
  if (payload.message !== undefined || payload.delta !== undefined || payload.output !== undefined) return 'message';
  if (payload.status === 'started') return 'start';
  if (payload.status === 'completed') return 'end';

  return null;
}

export class RuntimeEventAdapter {
  constructor({ onTrace } = {}) {
    this.onTrace = onTrace;
    this.sequence = 0;
  }

  normalize({ sessionId, eventName, data, id, receivedAt = new Date().toISOString() }) {
    const rawName = eventName || EMPTY_EVENT_NAME;
    const payload = safeJsonParse(data);
    const type = inferType(rawName, payload);

    if (this.onTrace) {
      this.onTrace({
        sessionId,
        sequence: this.sequence + 1,
        rawEventName: rawName,
        rawId: id ?? null,
        accepted: Boolean(type),
      });
    }

    if (!type) {
      return null;
    }

    this.sequence += 1;
    return {
      sessionId,
      sequence: this.sequence,
      type,
      receivedAt,
      eventId: id ?? null,
      rawEventName: rawName,
      payload: payload ?? { text: data },
      rawData: data,
    };
  }
}
