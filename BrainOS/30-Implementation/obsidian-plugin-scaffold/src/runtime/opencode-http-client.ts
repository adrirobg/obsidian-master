import {
	OpenCodeClientError,
	OpenCodeNetworkError,
	OpenCodeRuntimeError,
	OpenCodeTimeoutError
} from './errors';
import { createStructuredLogger, type RuntimeLogger } from './logger';

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export type OpenCodeHttpClientOptions = {
	baseUrl?: string;
	timeoutMs?: number;
	logger?: RuntimeLogger;
	fetchImpl?: typeof fetch;
};

export class OpenCodeHttpClient {
	private baseUrl: string;
	private timeoutMs: number;
	private logger: RuntimeLogger;
	private fetchImpl: typeof fetch;

	constructor({
		baseUrl = 'http://localhost:4096',
		timeoutMs = 10_000,
		logger,
		fetchImpl
	}: OpenCodeHttpClientOptions = {}) {
		this.baseUrl = normalizeBaseUrl(baseUrl);
		this.timeoutMs = timeoutMs;
		this.logger = logger ?? createStructuredLogger();
		this.fetchImpl = fetchImpl ?? window.fetch.bind(window);
	}

	async healthCheck(): Promise<unknown> {
		return this.request({ method: 'GET', path: '/global/health' });
	}

	async createSession(title = 'BrainOS Session'): Promise<unknown> {
		return this.request({
			method: 'POST',
			path: '/session',
			body: { title }
		});
	}

	async sendPrompt({ sessionId, prompt }: SendPromptOptions): Promise<unknown> {
		if (!sessionId) {
			throw new OpenCodeRuntimeError('sessionId is required to send prompt', {
				meta: { operation: 'sendPrompt' }
			});
		}

		if (!prompt || typeof prompt !== 'string') {
			throw new OpenCodeRuntimeError('prompt must be a non-empty string', {
				meta: { operation: 'sendPrompt' }
			});
		}

		return this.request({
			method: 'POST',
			path: `/session/${encodeURIComponent(sessionId)}/prompt`,
			body: {
				parts: [{ type: 'text', text: prompt }]
			}
		});
	}

	private async request({ method, path, body }: RequestOptions): Promise<unknown> {
		const url = `${this.baseUrl}${path}`;
		const startedAt = Date.now();
		const headers = body ? { 'content-type': 'application/json' } : undefined;
		const timeoutController = new AbortController();
		const timeoutId = window.setTimeout(() => {
			timeoutController.abort();
		}, this.timeoutMs);
		const { signal } = timeoutController;

		this.logger.info('opencode.request.start', { method, path, timeoutMs: this.timeoutMs });

		try {
			const response = await this.fetchImpl(url, {
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				signal
			});

			const payload = await this.readPayload(response, { method, path });

			if (!response.ok) {
				throw new OpenCodeRuntimeError('OpenCode runtime returned an error', {
					status: response.status,
					body: payload,
					meta: { method, path }
				});
			}

			this.logger.info('opencode.request.success', {
				method,
				path,
				status: response.status,
				durationMs: Date.now() - startedAt
			});

			return payload;
		} catch (error) {
			const wrappedError = this.normalizeError(error, { method, path });
			this.logger.error('opencode.request.failure', {
				method,
				path,
				durationMs: Date.now() - startedAt,
				code: wrappedError.code,
				errorMessage: wrappedError.message,
				status: errorHasStatus(wrappedError) ? wrappedError.status : null
			});
			throw wrappedError;
		} finally {
			window.clearTimeout(timeoutId);
		}
	}

	private async readPayload(response: Response, meta: { method: string; path: string }): Promise<unknown> {
		const contentType = response.headers.get('content-type') ?? '';
		if (contentType.includes('application/json')) {
			const text = await response.text();

			if (!text || !text.trim()) {
				throw new OpenCodeRuntimeError('OpenCode runtime returned an empty JSON payload', {
					status: response.status,
					body: null,
					meta: { ...meta, reason: 'empty_json_payload' }
				});
			}

			try {
				return JSON.parse(text);
			} catch (cause) {
				throw new OpenCodeRuntimeError('OpenCode runtime returned invalid JSON payload', {
					status: response.status,
					body: { raw: text },
					cause,
					meta: { ...meta, reason: 'invalid_json_payload' }
				});
			}
		}

		const text = await response.text();
		if (!text) {
			return null;
		}

		return { text };
	}

	private normalizeError(error: unknown, meta: { method: string; path: string }): OpenCodeClientError {
		if (error instanceof OpenCodeRuntimeError) {
			return error;
		}

		if (isAbortLikeError(error)) {
			return new OpenCodeTimeoutError('OpenCode request timed out', { cause: error, meta });
		}

		return new OpenCodeNetworkError('Failed to connect to OpenCode runtime', {
			cause: error,
			meta
		});
	}
}

type RequestOptions = {
	method: string;
	path: string;
	body?: Record<string, unknown>;
};

type SendPromptOptions = {
	sessionId: string;
	prompt: string;
};

function isAbortLikeError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	return error.name === 'TimeoutError' || error.name === 'AbortError';
}

function errorHasStatus(error: OpenCodeClientError): error is OpenCodeRuntimeError {
	return error instanceof OpenCodeRuntimeError;
}
