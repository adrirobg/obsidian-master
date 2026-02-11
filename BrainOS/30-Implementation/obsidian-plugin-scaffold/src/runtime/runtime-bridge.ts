import { OpenCodeHttpClient } from './opencode-http-client';
import { OpenCodeRuntimeError } from './errors';
import { createStructuredLogger, type RuntimeLogger } from './logger';
import { RuntimeEventAdapter, type RuntimeNormalizedEvent } from './runtime-event-adapter';
import { SseParser } from './sse-parser';

const DEFAULT_SSE_ENDPOINTS = ['/event', '/global/event'];

export interface RuntimeBridgeOptions {
	baseUrl?: string;
	timeoutMs?: number;
	reconnect?: RuntimeReconnectOptions;
	logger?: RuntimeLogger;
	fetchImpl?: typeof fetch;
	streamFetchImpl?: typeof fetch;
	buildAuthorizationHeader?: () => Promise<string | null>;
}

export interface RuntimeReconnectOptions {
	enabled?: boolean;
	initialDelayMs?: number;
	maxDelayMs?: number;
}

export interface RuntimeStreamStatus {
	state: 'connecting' | 'open' | 'stream-ended' | 'reconnecting' | 'error' | 'closed';
	sessionId: string;
	retryMs?: number;
	error?: string;
}

export interface RuntimeStreamSubscription {
	sessionId: string;
	close: () => void;
	closed: boolean;
}

export interface SubscribeToSessionOptions {
	sessionId: string;
	onStatus?: (status: RuntimeStreamStatus) => void;
	onEvent?: (event: RuntimeNormalizedEvent) => void;
	onIgnoredEvent?: (event: RuntimeNormalizedEvent) => void;
	reconnect?: RuntimeReconnectOptions;
}

interface ReconnectConfig {
	enabled: boolean;
	initialDelayMs: number;
	maxDelayMs: number;
}

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeDelay(value: number | undefined, fallback: number): number {
	return Number.isFinite(value) && (value ?? 0) >= 0 ? (value as number) : fallback;
}

function buildReconnectConfig(options: RuntimeReconnectOptions | undefined): ReconnectConfig {
	const initialDelayMs = normalizeDelay(options?.initialDelayMs, 500);
	const maxDelayMs = normalizeDelay(options?.maxDelayMs, 5_000);

	return {
		enabled: options?.enabled !== false,
		initialDelayMs,
		maxDelayMs: Math.max(initialDelayMs, maxDelayMs)
	};
}

function extractSessionId(payload: unknown): string | null {
	if (!payload || typeof payload !== 'object') {
		return null;
	}

	const record = payload as Record<string, unknown>;
	if (typeof record.sessionID === 'string') {
		return record.sessionID;
	}
	if (typeof record.sessionId === 'string') {
		return record.sessionId;
	}
	if (typeof record.id === 'string') {
		return record.id;
	}

	const data = record.data;
	if (data && typeof data === 'object') {
		const dataRecord = data as Record<string, unknown>;
		if (typeof dataRecord.id === 'string') {
			return dataRecord.id;
		}
	}

	const properties = record.properties;
	if (properties && typeof properties === 'object') {
		const propertiesRecord = properties as Record<string, unknown>;
		const info = propertiesRecord.info;
		if (info && typeof info === 'object') {
			const infoRecord = info as Record<string, unknown>;
			if (typeof infoRecord.id === 'string') {
				return infoRecord.id;
			}
		}
	}

	return null;
}

function sleep(ms: number, signal: AbortSignal): Promise<boolean> {
	return new Promise((resolve) => {
		if (signal.aborted) {
			resolve(false);
			return;
		}

		const timeoutId = window.setTimeout(() => {
			signal.removeEventListener('abort', onAbort);
			resolve(true);
		}, ms);

		const onAbort = () => {
			window.clearTimeout(timeoutId);
			signal.removeEventListener('abort', onAbort);
			resolve(false);
		};

		signal.addEventListener('abort', onAbort, { once: true });
	});
}

export class RuntimeBridge {
	private readonly logger: RuntimeLogger;
	private readonly adapter: RuntimeEventAdapter;
	private readonly reconnect: ReconnectConfig;
	private readonly fetchImpl: typeof fetch;
	private readonly streamFetchImpl: typeof fetch;
	private readonly buildAuthorizationHeader: () => Promise<string | null>;
	private readonly activeControllers = new Set<AbortController>();
	private baseUrl: string;
	private timeoutMs: number;
	private stopped = false;

	constructor({
		baseUrl = 'http://localhost:4096',
		timeoutMs = 10_000,
		reconnect,
		logger,
		fetchImpl,
		streamFetchImpl,
		buildAuthorizationHeader
	}: RuntimeBridgeOptions = {}) {
		this.baseUrl = normalizeBaseUrl(baseUrl);
		this.timeoutMs = timeoutMs;
		this.logger = logger ?? createStructuredLogger();
		this.adapter = new RuntimeEventAdapter();
		this.reconnect = buildReconnectConfig(reconnect);
		this.fetchImpl = fetchImpl ?? window.fetch.bind(window);
		this.streamFetchImpl = streamFetchImpl ?? this.fetchImpl;
		this.buildAuthorizationHeader = buildAuthorizationHeader ?? (async () => null);
	}

	setBaseUrl(baseUrl: string): void {
		this.baseUrl = normalizeBaseUrl(baseUrl);
	}

	async healthCheck(): Promise<unknown> {
		const client = this.createHttpClient();
		return client.healthCheck();
	}

	async createSession(title = 'BrainOS Session'): Promise<string> {
		const client = this.createHttpClient();
		const response = await client.createSession(title);
		const sessionId = extractSessionId(response);
		if (!sessionId) {
			throw new OpenCodeRuntimeError('OpenCode create session response did not include session id', {
				meta: { operation: 'createSession' }
			});
		}
		return sessionId;
	}

	async sendPrompt(sessionId: string, prompt: string): Promise<unknown> {
		const client = this.createHttpClient();
		return client.sendPrompt({ sessionId, prompt });
	}

	subscribeToSession({
		sessionId,
		onStatus,
		onEvent,
		onIgnoredEvent,
		reconnect
	}: SubscribeToSessionOptions): RuntimeStreamSubscription {
		if (!sessionId) {
			throw new OpenCodeRuntimeError('sessionId is required to subscribe', {
				meta: { operation: 'subscribeToSession' }
			});
		}

		const controller = new AbortController();
		this.activeControllers.add(controller);
		const reconnectConfig = buildReconnectConfig(reconnect ?? this.reconnect);
		let closed = false;

		void this.consumeLoop({
			sessionId,
			controller,
			reconnectConfig,
			onStatus,
			onEvent,
			onIgnoredEvent
		}).finally(() => {
			closed = true;
			this.activeControllers.delete(controller);
			onStatus?.({ state: 'closed', sessionId });
		});

		return {
			sessionId,
			close: () => {
				controller.abort();
				closed = true;
			},
			get closed() {
				return closed;
			}
		};
	}

	shutdown(): void {
		this.stopped = true;
		for (const controller of this.activeControllers) {
			controller.abort();
		}
		this.activeControllers.clear();
	}

	private createHttpClient(): OpenCodeHttpClient {
		return new OpenCodeHttpClient({
			baseUrl: this.baseUrl,
			timeoutMs: this.timeoutMs,
			logger: this.logger,
			fetchImpl: this.fetchImpl
		});
	}

	private async consumeLoop({
		sessionId,
		controller,
		reconnectConfig,
		onStatus,
		onEvent,
		onIgnoredEvent
	}: {
		sessionId: string;
		controller: AbortController;
		reconnectConfig: ReconnectConfig;
		onStatus?: (status: RuntimeStreamStatus) => void;
		onEvent?: (event: RuntimeNormalizedEvent) => void;
		onIgnoredEvent?: (event: RuntimeNormalizedEvent) => void;
	}): Promise<void> {
		let currentRetryMs = reconnectConfig.initialDelayMs;

		while (!this.stopped && !controller.signal.aborted) {
			try {
				const endpoint = await this.consumeStreamOnce({
					sessionId,
					controller,
					onStatus,
					onEvent,
					onIgnoredEvent
				});

				currentRetryMs = reconnectConfig.initialDelayMs;
				if (!reconnectConfig.enabled || this.stopped || controller.signal.aborted) {
					break;
				}

				onStatus?.({ state: 'reconnecting', sessionId, retryMs: currentRetryMs });
				this.logger.info('runtime.stream.reconnect', {
					sessionId,
					retryMs: currentRetryMs,
					endpoint
				});

				const shouldRetry = await sleep(currentRetryMs, controller.signal);
				if (!shouldRetry) {
					break;
				}
				currentRetryMs = Math.min(currentRetryMs * 2, reconnectConfig.maxDelayMs);
			} catch (error) {
				if (controller.signal.aborted || this.stopped) {
					break;
				}

				const message = error instanceof Error ? error.message : String(error);
				onStatus?.({ state: 'error', sessionId, error: message });
				this.logger.error('runtime.stream.error', { sessionId, error: message });

				if (!reconnectConfig.enabled) {
					break;
				}

				onStatus?.({ state: 'reconnecting', sessionId, retryMs: currentRetryMs });
				const shouldRetry = await sleep(currentRetryMs, controller.signal);
				if (!shouldRetry) {
					break;
				}
				currentRetryMs = Math.min(currentRetryMs * 2, reconnectConfig.maxDelayMs);
			}
		}
	}

	private async consumeStreamOnce({
		sessionId,
		controller,
		onStatus,
		onEvent,
		onIgnoredEvent
	}: {
		sessionId: string;
		controller: AbortController;
		onStatus?: (status: RuntimeStreamStatus) => void;
		onEvent?: (event: RuntimeNormalizedEvent) => void;
		onIgnoredEvent?: (event: RuntimeNormalizedEvent) => void;
	}): Promise<string> {
		onStatus?.({ state: 'connecting', sessionId });
		const headers = await this.getSseHeaders();
		const { response, endpoint } = await this.openEventStream(headers, controller.signal);

		if (!response.body) {
			throw new OpenCodeRuntimeError('OpenCode SSE response did not include stream body', {
				status: response.status,
				meta: { operation: 'subscribeToSession', endpoint }
			});
		}

		onStatus?.({ state: 'open', sessionId });
		const parser = new SseParser({
			onEvent: (rawEvent) => {
				const normalized = this.adapter.normalize({
					eventName: rawEvent.event,
					data: rawEvent.data,
					id: rawEvent.id,
					receivedAt: new Date().toISOString()
				});

				if (normalized.sessionId !== sessionId) {
					onIgnoredEvent?.(normalized);
					return;
				}

				onEvent?.(normalized);
			}
		});

		const decoder = new TextDecoder();
		const reader = response.body.getReader();
		try {
			while (!controller.signal.aborted) {
				const result = await reader.read();
				if (result.done) {
					onStatus?.({ state: 'stream-ended', sessionId });
					break;
				}

				const text = decoder.decode(result.value, { stream: true });
				parser.feed(text);
			}
		} finally {
			parser.flush();
			reader.releaseLock();
		}

		return endpoint;
	}

	private async getSseHeaders(): Promise<Headers> {
		const headers = new Headers({
			accept: 'text/event-stream'
		});
		const authHeader = await this.buildAuthorizationHeader();
		if (authHeader) {
			headers.set('authorization', authHeader);
		}
		return headers;
	}

	private async openEventStream(
		headers: Headers,
		signal: AbortSignal
	): Promise<{ response: Response; endpoint: string }> {
		let lastError: Error | null = null;

		for (const endpoint of DEFAULT_SSE_ENDPOINTS) {
			const response = await this.streamFetchImpl(`${this.baseUrl}${endpoint}`, {
				method: 'GET',
				headers,
				signal
			});

			if (response.status === 404) {
				lastError = new OpenCodeRuntimeError('OpenCode SSE endpoint not found', {
					status: response.status,
					meta: { endpoint }
				});
				continue;
			}

			if (!response.ok) {
				throw new OpenCodeRuntimeError('OpenCode SSE endpoint returned an error', {
					status: response.status,
					meta: { endpoint }
				});
			}

			return { response, endpoint };
		}

		throw lastError ?? new OpenCodeRuntimeError('OpenCode SSE endpoint unavailable', {
			meta: { endpoints: DEFAULT_SSE_ENDPOINTS }
		});
	}
}
