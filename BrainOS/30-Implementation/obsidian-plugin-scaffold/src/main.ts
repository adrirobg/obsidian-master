import { Notice, Plugin, requestUrl, requireApiVersion } from 'obsidian';
import {
	createStructuredLogger,
	OpenCodeHttpClient,
	RuntimeBridge,
	type RuntimeNormalizedEvent,
	type RuntimeStreamStatus,
	type RuntimeStreamSubscription,
	SessionStateManager
} from './runtime';
import { resolveBasicAuthHeader } from './runtime/auth-header.js';
import {
	BrainOSPluginSettings,
	BrainOSSettingTab,
	DEFAULT_SETTINGS,
	RuntimeAuthSettings
} from './settings';

type RuntimeHealthPayload = {
	healthy?: boolean;
	version?: string;
	status?: string;
};

export default class BrainOSPlugin extends Plugin {
	settings: BrainOSPluginSettings = DEFAULT_SETTINGS;
	private statusBarItemEl: HTMLElement | null = null;
	private activeHealthChecks = new Set<AbortController>();
	private runtimeBridge: RuntimeBridge | null = null;
	private sessionStateManager = new SessionStateManager();
	private readonly runtimeLogger = createStructuredLogger();
	private readonly activeRuntimeStreams = new Map<string, RuntimeStreamSubscription>();

	async onload() {
		if (!requireApiVersion('1.11.4')) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			new Notice('BrainOS runtime scaffold requires Obsidian 1.11.4 or newer.');
			return;
		}

		await this.loadSettings();
		this.initializeRuntimeBridge();
		this.sessionStateManager = new SessionStateManager();

		this.statusBarItemEl = this.addStatusBarItem();
		this.updateRuntimeStatus('idle');

		this.addSettingTab(new BrainOSSettingTab(this.app, this));
		this.addCommand({
			id: 'brainos-runtime-health-check',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'BrainOS: Runtime Health Check',
			callback: () => {
				void this.runRuntimeHealthCheck();
			}
		});
		this.addCommand({
			id: 'brainos-runtime-session-smoke-test',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'BrainOS: Runtime Session Smoke Test',
			callback: () => {
				void this.runRuntimeSessionSmokeTest();
			}
		});
	}

	onunload() {
		for (const controller of this.activeHealthChecks) {
			controller.abort();
		}
		this.activeHealthChecks.clear();

		for (const stream of this.activeRuntimeStreams.values()) {
			stream.close();
		}
		this.activeRuntimeStreams.clear();

		if (this.runtimeBridge) {
			this.runtimeBridge.shutdown();
			this.runtimeBridge = null;
		}

		this.sessionStateManager.clearSession({ reason: 'plugin-unload' });

		if (this.statusBarItemEl) {
			this.statusBarItemEl.remove();
			this.statusBarItemEl = null;
		}
	}

	async loadSettings() {
		const raw = await this.loadData() as Partial<BrainOSPluginSettings> | null;
		this.settings = this.normalizeSettings(raw ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private initializeRuntimeBridge(): void {
		this.runtimeBridge = new RuntimeBridge({
			baseUrl: this.settings.runtimeBaseUrl,
			fetchImpl: this.createRuntimeFetch(),
			streamFetchImpl: this.createRuntimeStreamFetch(),
			logger: this.runtimeLogger,
			buildAuthorizationHeader: async () => this.buildAuthorizationHeader(this.settings.auth)
		});
	}

	private getRuntimeBridge(): RuntimeBridge {
		if (!this.runtimeBridge) {
			this.initializeRuntimeBridge();
		}
		this.runtimeBridge?.setBaseUrl(this.settings.runtimeBaseUrl);
		return this.runtimeBridge as RuntimeBridge;
	}

	private async runRuntimeHealthCheck() {
		const healthCheckController = new AbortController();
		this.activeHealthChecks.add(healthCheckController);
		this.updateRuntimeStatus('checking');

		const client = new OpenCodeHttpClient({
			baseUrl: this.settings.runtimeBaseUrl,
			fetchImpl: this.createRuntimeFetch(healthCheckController.signal)
		});

		try {
			const payload = await client.healthCheck() as RuntimeHealthPayload;
			const healthy = typeof payload.healthy === 'boolean' ? payload.healthy : false;
			const version = typeof payload.version === 'string' ? payload.version : 'unknown';
			const runtimeStatus = typeof payload.status === 'string' ? payload.status : (healthy ? 'healthy' : 'unhealthy');

			this.updateRuntimeStatus(`${runtimeStatus} (v${version})`);
			new Notice(`BrainOS runtime ${runtimeStatus} (version ${version})`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.updateRuntimeStatus('error');
			new Notice(`BrainOS runtime health check failed: ${message}`);
		} finally {
			this.activeHealthChecks.delete(healthCheckController);
		}
	}

	private async runRuntimeSessionSmokeTest() {
		this.updateRuntimeStatus('session:connecting');
		const bridge = this.getRuntimeBridge();

		for (const stream of this.activeRuntimeStreams.values()) {
			stream.close();
		}
		this.activeRuntimeStreams.clear();

		try {
			const sessionId = await bridge.createSession('BrainOS Runtime Smoke Test');
			const { cleanupErrors } = this.sessionStateManager.restartSession(sessionId);
			if (cleanupErrors.length > 0) {
				this.runtimeLogger.warn('runtime.session.cleanup-errors', { cleanupErrors });
			}

			const subscription = bridge.subscribeToSession({
				sessionId,
				onStatus: (status) => {
					this.handleRuntimeStreamStatus(status);
				},
				onEvent: (event) => {
					this.handleRuntimeEvent(sessionId, event);
				},
				onIgnoredEvent: (event) => {
					this.runtimeLogger.debug('runtime.stream.ignored-event', {
						sessionId,
						eventType: event.eventType,
						eventSessionId: event.sessionId
					});
				}
			});
			this.activeRuntimeStreams.set(sessionId, subscription);

			await bridge.sendPrompt(
				sessionId,
				'Resume en tres bullets las siguientes acciones sugeridas para organizar una nota de trabajo.'
			);

			new Notice(`BrainOS runtime session started (${sessionId}). Streaming incremental activo.`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.updateRuntimeStatus('error');
			new Notice(`BrainOS runtime session smoke test failed: ${message}`);
		}
	}

	private handleRuntimeEvent(sessionId: string, event: RuntimeNormalizedEvent): void {
		if (event.sessionId !== sessionId) {
			return;
		}

		switch (event.category) {
			case 'message': {
				const content = this.extractMessageContent(event);
				if (content) {
					this.sessionStateManager.addMessage({
						id: event.eventId ?? `${event.eventType}:${event.sequence}`,
						role: 'assistant',
						content,
						timestamp: Date.now()
					});
				}
				break;
			}
			case 'session':
				if (event.eventType === 'session.idle') {
					const stream = this.activeRuntimeStreams.get(sessionId);
					stream?.close();
					this.activeRuntimeStreams.delete(sessionId);
					this.updateRuntimeStatus('session:idle');
				}
				break;
			case 'error':
				this.updateRuntimeStatus('session:error');
				this.runtimeLogger.error('runtime.session.event-error', {
					sessionId,
					eventType: event.eventType
				});
				break;
			default:
				this.runtimeLogger.debug('runtime.session.unknown-event', {
					sessionId,
					eventType: event.eventType
				});
				break;
		}
	}

	private handleRuntimeStreamStatus(status: RuntimeStreamStatus): void {
		switch (status.state) {
			case 'connecting':
				this.updateRuntimeStatus(`session:${status.sessionId}:connecting`);
				break;
			case 'open':
				this.updateRuntimeStatus(`session:${status.sessionId}:streaming`);
				break;
			case 'reconnecting':
				this.updateRuntimeStatus(`session:${status.sessionId}:reconnecting`);
				break;
			case 'stream-ended':
				this.updateRuntimeStatus(`session:${status.sessionId}:ended`);
				break;
			case 'error':
				this.updateRuntimeStatus(`session:${status.sessionId}:error`);
				break;
			case 'closed':
				this.updateRuntimeStatus(`session:${status.sessionId}:closed`);
				break;
			default:
				break;
		}
	}

	private extractMessageContent(event: RuntimeNormalizedEvent): string | null {
		const payload = event.payload;
		const text = this.readNestedString(payload, ['properties', 'delta'])
			?? this.readNestedString(payload, ['properties', 'text'])
			?? this.readNestedString(payload, ['properties', 'message'])
			?? this.readNestedString(payload, ['properties', 'info', 'text'])
			?? this.readNestedString(payload, ['properties', 'info', 'content'])
			?? this.readNestedString(payload, ['text']);
		return text && text.trim().length > 0 ? text : null;
	}

	private readNestedString(input: Record<string, unknown>, path: string[]): string | null {
		let cursor: unknown = input;
		for (const key of path) {
			if (!cursor || typeof cursor !== 'object') {
				return null;
			}
			cursor = (cursor as Record<string, unknown>)[key];
		}

		return typeof cursor === 'string' ? cursor : null;
	}

	private createRuntimeFetch(pluginSignal?: AbortSignal): typeof fetch {
		return async (input, init) => {
			const authHeader = await this.buildAuthorizationHeader(this.settings.auth);
			const headers = new Headers(init?.headers ?? {});
			if (authHeader) {
				headers.set('authorization', authHeader);
			}

			const signal = this.combineAbortSignals(init?.signal, pluginSignal);
			if (signal?.aborted) {
				throw this.createAbortError();
			}

			const requestPromise = requestUrl({
				url: this.normalizeRequestUrl(input),
				method: init?.method ?? 'GET',
				headers: this.headersToRecord(headers),
				body: this.normalizeRequestBody(init?.body),
				throw: false
			});

			const response = signal
				? await Promise.race([requestPromise, this.abortPromise(signal)])
				: await requestPromise;

			return new Response(response.text, {
				status: response.status,
				headers: new Headers(response.headers)
			});
		};
	}

	private createRuntimeStreamFetch(pluginSignal?: AbortSignal): typeof fetch {
		return async (input, init) => {
			const authHeader = await this.buildAuthorizationHeader(this.settings.auth);
			const headers = new Headers(init?.headers ?? {});
			if (authHeader) {
				headers.set('authorization', authHeader);
			}

			const signal = this.combineAbortSignals(init?.signal, pluginSignal);
			if (signal?.aborted) {
				throw this.createAbortError();
			}

			return window.fetch(input, {
				...init,
				headers,
				signal
			});
		};
	}

	private combineAbortSignals(
		a?: AbortSignal | null,
		b?: AbortSignal | null
	): AbortSignal | undefined {
		if (!a && !b) {
			return undefined;
		}

		if (!a) {
			return b ?? undefined;
		}

		if (!b) {
			return a ?? undefined;
		}

		if (a.aborted || b.aborted) {
			const abortedController = new AbortController();
			abortedController.abort();
			return abortedController.signal;
		}

		const merged = new AbortController();
		const abortMerged = () => {
			if (!merged.signal.aborted) {
				merged.abort();
			}
		};
		a.addEventListener('abort', abortMerged, { once: true });
		b.addEventListener('abort', abortMerged, { once: true });
		return merged.signal;
	}

	private async buildAuthorizationHeader(auth: RuntimeAuthSettings | null): Promise<string | null> {
		return resolveBasicAuthHeader({
			auth,
			secretStorage: this.app.secretStorage,
			encodeBase64: (value) => this.encodeBase64(value)
		});
	}

	private encodeBase64(value: string): string {
		return btoa(value);
	}

	private normalizeRequestUrl(input: RequestInfo | URL): string {
		if (typeof input === 'string') {
			return input;
		}

		if (input instanceof URL) {
			return input.toString();
		}

		return input.url;
	}

	private normalizeRequestBody(body: BodyInit | null | undefined): string | ArrayBuffer | undefined {
		if (typeof body === 'string' || body instanceof ArrayBuffer) {
			return body;
		}

		return undefined;
	}

	private headersToRecord(headers: Headers): Record<string, string> {
		const output: Record<string, string> = {};
		headers.forEach((value, key) => {
			output[key] = value;
		});
		return output;
	}

	private abortPromise(signal: AbortSignal): Promise<never> {
		return new Promise((_, reject) => {
			signal.addEventListener('abort', () => {
				reject(this.createAbortError());
			}, { once: true });
		});
	}

	private createAbortError(): Error {
		const error = new Error('aborted');
		error.name = 'AbortError';
		return error;
	}

	private normalizeSettings(raw: Partial<BrainOSPluginSettings>): BrainOSPluginSettings {
		const runtimeBaseUrl = typeof raw.runtimeBaseUrl === 'string' && raw.runtimeBaseUrl.trim()
			? raw.runtimeBaseUrl.trim()
			: DEFAULT_SETTINGS.runtimeBaseUrl;

		const batchSize = Number.isInteger(raw.batchSize) && (raw.batchSize ?? 0) > 0
			? raw.batchSize as number
			: DEFAULT_SETTINGS.batchSize;

		let auth: RuntimeAuthSettings | null = null;
		if (raw.auth && typeof raw.auth === 'object') {
			const username = typeof raw.auth.username === 'string' ? raw.auth.username.trim() : '';
			const passwordSecretId = typeof raw.auth.passwordSecretId === 'string'
				? raw.auth.passwordSecretId.trim()
				: '';
			if (username) {
				auth = { username, passwordSecretId };
			}
		}

		return {
			runtimeBaseUrl,
			batchSize,
			auth
		};
	}

	private updateRuntimeStatus(status: string) {
		if (this.statusBarItemEl) {
			this.statusBarItemEl.setText(`BrainOS Runtime: ${status}`);
		}
	}
}
