import {
  OpenCodeNetworkError,
  OpenCodeRuntimeError,
  OpenCodeTimeoutError
} from './errors.js'
import { createStructuredLogger } from './logger.js'

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export class OpenCodeHttpClient {
  constructor({
    baseUrl = 'http://localhost:4096',
    timeoutMs = 10_000,
    logger,
    fetchImpl
  } = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl)
    this.timeoutMs = timeoutMs
    this.logger = logger ?? createStructuredLogger()
    this.fetchImpl = fetchImpl ?? fetch
  }

  async healthCheck() {
    return this.#request({ method: 'GET', path: '/global/health' })
  }

  async createSession(title = 'BrainOS Session') {
    return this.#request({
      method: 'POST',
      path: '/session',
      body: { title }
    })
  }

  async sendPrompt({ sessionId, prompt }) {
    if (!sessionId) {
      throw new OpenCodeRuntimeError('sessionId is required to send prompt', {
        meta: { operation: 'sendPrompt' }
      })
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new OpenCodeRuntimeError('prompt must be a non-empty string', {
        meta: { operation: 'sendPrompt' }
      })
    }

    return this.#request({
      method: 'POST',
      path: `/session/${encodeURIComponent(sessionId)}/prompt`,
      body: {
        parts: [{ type: 'text', text: prompt }]
      }
    })
  }

  async #request({ method, path, body }) {
    const url = `${this.baseUrl}${path}`
    const startedAt = Date.now()
    const headers = body ? { 'content-type': 'application/json' } : undefined
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => {
      timeoutController.abort()
    }, this.timeoutMs)
    const { signal } = timeoutController

    this.logger.info('opencode.request.start', { method, path, timeoutMs: this.timeoutMs })

    try {
      const response = await this.fetchImpl(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal
      })

      const payload = await this.#readPayload(response, { method, path })

      if (!response.ok) {
        throw new OpenCodeRuntimeError('OpenCode runtime returned an error', {
          status: response.status,
          body: payload,
          meta: { method, path }
        })
      }

      this.logger.info('opencode.request.success', {
        method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt
      })

      return payload
    } catch (error) {
      const wrappedError = this.#normalizeError(error, { method, path })
      this.logger.error('opencode.request.failure', {
        method,
        path,
        durationMs: Date.now() - startedAt,
        code: wrappedError.code,
        errorMessage: wrappedError.message,
        status: wrappedError.status
      })
      throw wrappedError
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async #readPayload(response, meta) {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const text = await response.text()

      if (!text || !text.trim()) {
        throw new OpenCodeRuntimeError('OpenCode runtime returned an empty JSON payload', {
          status: response.status,
          body: null,
          meta: { ...meta, reason: 'empty_json_payload' }
        })
      }

      try {
        return JSON.parse(text)
      } catch (cause) {
        throw new OpenCodeRuntimeError('OpenCode runtime returned invalid JSON payload', {
          status: response.status,
          body: { raw: text },
          cause,
          meta: { ...meta, reason: 'invalid_json_payload' }
        })
      }
    }

    const text = await response.text()
    if (!text) {
      return null
    }

    return { text }
  }

  #normalizeError(error, meta) {
    if (error instanceof OpenCodeRuntimeError) {
      return error
    }

    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return new OpenCodeTimeoutError('OpenCode request timed out', { cause: error, meta })
    }

    return new OpenCodeNetworkError('Failed to connect to OpenCode runtime', {
      cause: error,
      meta
    })
  }
}
