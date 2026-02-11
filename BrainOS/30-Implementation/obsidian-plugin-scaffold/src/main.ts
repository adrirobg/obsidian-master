import { Notice, Plugin, TFile, requestUrl, requireApiVersion } from 'obsidian';
import {
	createStructuredLogger,
	OpenCodeHttpClient,
	RuntimeBridge,
	type RuntimeNormalizedEvent,
	type RuntimeStreamStatus,
	type RuntimeStreamSubscription,
	SessionStateManager
} from './runtime';
import { CurrentNoteReviewModal, type ReviewDecision } from './review-modal';
import { resolveBasicAuthHeader } from './runtime/auth-header.js';
import { normalizeBatchSize, pickOldestInboxBatch } from './inbox-batch';
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

type InboxBatchSummary = {
	total: number;
	processed: number;
	accepted: number;
	rejected: number;
	errors: number;
};

export default class BrainOSPlugin extends Plugin {
	settings: BrainOSPluginSettings = DEFAULT_SETTINGS;
	private statusBarItemEl: HTMLElement | null = null;
	private activeHealthChecks = new Set<AbortController>();
	private runtimeBridge: RuntimeBridge | null = null;
	private sessionStateManager = new SessionStateManager();
	private readonly runtimeLogger = createStructuredLogger();
	private readonly activeRuntimeStreams = new Map<string, RuntimeStreamSubscription>();
	private processingCurrentNote = false;
	private processingInboxBatch = false;

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
		this.addCommand({
			id: 'brainos-process-current-note',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'BrainOS: Procesar nota actual',
			callback: () => {
				void this.runProcessCurrentNote();
			}
		});
		this.addCommand({
			id: 'brainos-process-inbox-batch',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'BrainOS: Process Inbox Batch',
			callback: () => {
				void this.runProcessInboxBatch();
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
		this.processingCurrentNote = false;
		this.processingInboxBatch = false;

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

	private async runProcessCurrentNote() {
		if (this.processingCurrentNote || this.processingInboxBatch) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			new Notice('BrainOS ya está ejecutando un procesamiento. Espera a que termine.');
			return;
		}

		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile || activeFile.extension !== 'md') {
			new Notice('Abre una nota Markdown activa antes de ejecutar este comando.');
			return;
		}

		const originalContent = await this.app.vault.read(activeFile);
		if (!originalContent.trim()) {
			new Notice('La nota activa está vacía. No hay contenido para procesar.');
			return;
		}

		this.processingCurrentNote = true;
		this.updateRuntimeStatus(`current-note:${activeFile.path}:requesting`);
		const bridge = this.getRuntimeBridge();
		let sessionId = '';

		try {
			sessionId = await bridge.createSession(`BrainOS Process Current Note: ${activeFile.path}`);
			const { cleanupErrors } = this.sessionStateManager.restartSession(sessionId);
			if (cleanupErrors.length > 0) {
				this.runtimeLogger.warn('runtime.current-note.cleanup-errors', {
					sessionId,
					cleanupErrors
				});
			}

			await this.processNoteWithExplicitDecision({
				sessionId,
				file: activeFile,
				originalContent,
				statusPrefix: `current-note:${activeFile.path}`,
				ignoredLogKey: 'runtime.current-note.ignored-event',
				showDecisionNotice: true
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.updateRuntimeStatus('current-note:failed');
			new Notice(`BrainOS no pudo procesar la nota actual: ${message}`);
		} finally {
			this.processingCurrentNote = false;
		}
	}

	private async runProcessInboxBatch() {
		if (this.processingCurrentNote || this.processingInboxBatch) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			new Notice('BrainOS ya está ejecutando un procesamiento. Espera a que termine.');
			return;
		}

		const batchSize = normalizeBatchSize(this.settings.batchSize);
		const candidates = pickOldestInboxBatch(this.app.vault.getMarkdownFiles(), batchSize);
		if (candidates.length === 0) {
			new Notice('No hay notas Markdown en 00-Inbox para procesar.');
			return;
		}

		this.processingInboxBatch = true;
		const summary: InboxBatchSummary = {
			total: candidates.length,
			processed: 0,
			accepted: 0,
			rejected: 0,
			errors: 0
		};
		this.updateRuntimeStatus(`inbox-batch:0/${summary.total}:requesting-session`);
		const bridge = this.getRuntimeBridge();
		let sessionId = '';

		try {
			sessionId = await bridge.createSession(`BrainOS Process Inbox Batch (${summary.total})`);
			const { cleanupErrors } = this.sessionStateManager.restartSession(sessionId);
			if (cleanupErrors.length > 0) {
				this.runtimeLogger.warn('runtime.inbox-batch.cleanup-errors', {
					sessionId,
					cleanupErrors
				});
			}

			for (const [index, file] of candidates.entries()) {
				const itemPosition = `${index + 1}/${summary.total}`;
				const statusPrefix = `inbox-batch:${itemPosition}:${file.path}`;

				try {
					this.updateRuntimeStatus(`${statusPrefix}:running`);
					const originalContent = await this.app.vault.read(file);
					if (!originalContent.trim()) {
						throw new Error('nota vacía, se omite del lote');
					}

					const decision = await this.processNoteWithExplicitDecision({
						sessionId,
						file,
						originalContent,
						statusPrefix,
						ignoredLogKey: 'runtime.inbox-batch.ignored-event',
						showDecisionNotice: false
					});

					summary.processed += 1;
					if (decision === 'accepted') {
						summary.accepted += 1;
					} else {
						summary.rejected += 1;
					}

					new Notice(`Inbox batch ${itemPosition}: ${file.path} -> ${decision}.`);
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					summary.processed += 1;
					summary.errors += 1;
					this.runtimeLogger.error('runtime.inbox-batch.item-error', {
						sessionId,
						notePath: file.path,
						index: index + 1,
						total: summary.total,
						error: message
					});
					this.updateRuntimeStatus(`${statusPrefix}:error`);
					new Notice(`Inbox batch ${itemPosition}: error en ${file.path}: ${message}`);
				}
			}

			const summaryText = `processed=${summary.processed}/${summary.total} accepted=${summary.accepted} rejected=${summary.rejected} errors=${summary.errors}`;
			this.updateRuntimeStatus(`inbox-batch:completed:${summaryText}`);
			new Notice(`Inbox batch finalizado: ${summaryText}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.updateRuntimeStatus('inbox-batch:failed');
			new Notice(`BrainOS no pudo iniciar Process Inbox Batch: ${message}`);
		} finally {
			this.processingInboxBatch = false;
		}
	}

	private async processNoteWithExplicitDecision({
		sessionId,
		file,
		originalContent,
		statusPrefix,
		ignoredLogKey,
		showDecisionNotice
	}: {
		sessionId: string;
		file: TFile;
		originalContent: string;
		statusPrefix: string;
		ignoredLogKey: string;
		showDecisionNotice: boolean;
	}): Promise<ReviewDecision> {
		const bridge = this.getRuntimeBridge();
		let stream: RuntimeStreamSubscription | null = null;

		try {
			let suggestionBuffer = '';
			let settled = false;
			let resolveCompletion: (() => void) | null = null;
			let rejectCompletion: ((error: Error) => void) | null = null;
			const streamCompletion = new Promise<void>((resolve, reject) => {
				resolveCompletion = resolve;
				rejectCompletion = reject;
			});
			const settleSuccess = () => {
				if (settled) {
					return;
				}
				settled = true;
				resolveCompletion?.();
			};
			const settleFailure = (message: string) => {
				if (settled) {
					return;
				}
				settled = true;
				rejectCompletion?.(new Error(message));
			};

			stream = bridge.subscribeToSession({
				sessionId,
				reconnect: { enabled: false },
				onStatus: (status) => {
					this.handleRuntimeStreamStatus(status);
					if (status.state === 'error') {
						settleFailure(status.error ?? 'runtime stream error');
						return;
					}
					if (status.state === 'stream-ended' || status.state === 'closed') {
						settleSuccess();
					}
				},
				onEvent: (event) => {
					if (event.category === 'error') {
						settleFailure(`runtime event error (${event.eventType})`);
						return;
					}

					if (event.category === 'session') {
						if (event.eventType === 'session.error') {
							settleFailure('runtime session ended with error');
							return;
						}
						if (event.eventType === 'session.idle') {
							settleSuccess();
							return;
						}
					}

					if (event.category !== 'message') {
						return;
					}

					const content = this.extractMessageContent(event);
					if (!content) {
						return;
					}

					suggestionBuffer += content;
					this.sessionStateManager.addMessage({
						id: event.eventId ?? `${event.eventType}:${event.sequence}`,
						role: 'assistant',
						content,
						timestamp: Date.now()
					});

					const progressLabel = this.trimForStatus(content);
					this.updateRuntimeStatus(`${statusPrefix}:streaming:${progressLabel}`);
				},
				onIgnoredEvent: (event) => {
					this.runtimeLogger.debug(ignoredLogKey, {
						sessionId,
						eventType: event.eventType,
						eventSessionId: event.sessionId
					});
				}
			});
			this.activeRuntimeStreams.set(sessionId, stream);

			const prompt = this.buildCurrentNotePrompt(file.path, originalContent);
			await bridge.sendPrompt(sessionId, prompt);
			await Promise.race([
				streamCompletion,
				this.timeoutAfter(60_000, `runtime stream timeout while processing ${file.path}`)
			]);

			const suggestedContent = suggestionBuffer.trim();
			if (!suggestedContent) {
				throw new Error(`Runtime no devolvió propuesta para revisar en ${file.path}.`);
			}

			const suggestionId = `${statusPrefix}:${sessionId}:${Date.now()}`;
			this.sessionStateManager.addSuggestion({
				id: suggestionId,
				title: `Propuesta para ${file.path}`,
				payload: suggestedContent,
				status: 'shown',
				createdAt: Date.now()
			});

			const decision = await new CurrentNoteReviewModal(this.app, {
				notePath: file.path,
				proposedContent: suggestedContent
			}).openAndWait();
			const decidedAt = Date.now();
			if (decision === 'accepted') {
				await this.app.vault.modify(file, suggestedContent);
				this.sessionStateManager.updateSuggestionStatus(suggestionId, 'accepted', decidedAt);
				if (showDecisionNotice) {
					new Notice(`Cambios aplicados en ${file.path}.`);
				}
			} else {
				this.sessionStateManager.updateSuggestionStatus(suggestionId, 'rejected', decidedAt);
				if (showDecisionNotice) {
					new Notice(`Propuesta rechazada para ${file.path}.`);
				}
			}
			this.sessionStateManager.registerDecision({
				id: `${suggestionId}:decision:${decidedAt}`,
				suggestionId,
				notePath: file.path,
				decision,
				decidedAt
			});
			this.updateRuntimeStatus(`${statusPrefix}:${decision}`);
			return decision;
		} finally {
			stream?.close();
			this.activeRuntimeStreams.delete(sessionId);
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

	private buildCurrentNotePrompt(notePath: string, originalContent: string): string {
		return [
			'Eres un asistente que propone una version mejorada de una nota Markdown.',
			'Responde solo con el contenido final completo en Markdown, sin explicaciones externas.',
			`Nota objetivo: ${notePath}`,
			'Reglas:',
			'- Mantener idioma y contexto original.',
			'- Mejorar claridad y estructura.',
			'- No inventar hechos.',
			'Contenido original:',
			originalContent
		].join('\n');
	}

	private trimForStatus(content: string, maxLength = 48): string {
		const compact = content.replace(/\s+/g, ' ').trim();
		if (compact.length <= maxLength) {
			return compact;
		}
		return `${compact.slice(0, Math.max(0, maxLength - 3))}...`;
	}

	private timeoutAfter(ms: number, message: string): Promise<never> {
		return new Promise((_, reject) => {
			window.setTimeout(() => {
				reject(new Error(message));
			}, ms);
		});
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

		const batchSize = normalizeBatchSize(raw.batchSize, DEFAULT_SETTINGS.batchSize);

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
