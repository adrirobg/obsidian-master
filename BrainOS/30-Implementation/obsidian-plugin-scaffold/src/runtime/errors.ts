export class OpenCodeClientError extends Error {
	code: string;
	cause?: unknown;
	meta: Record<string, unknown>;

	constructor(message: string, options: OpenCodeClientErrorOptions = {}) {
		super(message);
		this.name = this.constructor.name;
		this.code = options.code ?? 'OPENCODE_CLIENT_ERROR';
		this.cause = options.cause;
		this.meta = options.meta ?? {};
	}
}

export class OpenCodeNetworkError extends OpenCodeClientError {
	constructor(message: string, options: OpenCodeClientErrorOptions = {}) {
		super(message, { ...options, code: 'OPENCODE_NETWORK_ERROR' });
	}
}

export class OpenCodeTimeoutError extends OpenCodeClientError {
	constructor(message: string, options: OpenCodeClientErrorOptions = {}) {
		super(message, { ...options, code: 'OPENCODE_TIMEOUT_ERROR' });
	}
}

export class OpenCodeRuntimeError extends OpenCodeClientError {
	status: number | null;
	body?: unknown;

	constructor(message: string, options: OpenCodeRuntimeErrorOptions = {}) {
		super(message, { ...options, code: 'OPENCODE_RUNTIME_ERROR' });
		this.status = options.status ?? null;
		this.body = options.body;
	}
}

export interface OpenCodeClientErrorOptions {
	code?: string;
	cause?: unknown;
	meta?: Record<string, unknown>;
}

export interface OpenCodeRuntimeErrorOptions extends OpenCodeClientErrorOptions {
	status?: number | null;
	body?: unknown;
}
