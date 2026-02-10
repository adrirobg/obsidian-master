export class OpenCodeClientError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = this.constructor.name
    this.code = options.code ?? 'OPENCODE_CLIENT_ERROR'
    this.cause = options.cause
    this.meta = options.meta ?? {}
  }
}

export class OpenCodeNetworkError extends OpenCodeClientError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'OPENCODE_NETWORK_ERROR' })
  }
}

export class OpenCodeTimeoutError extends OpenCodeClientError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'OPENCODE_TIMEOUT_ERROR' })
  }
}

export class OpenCodeRuntimeError extends OpenCodeClientError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'OPENCODE_RUNTIME_ERROR' })
    this.status = options.status ?? null
    this.body = options.body
  }
}
