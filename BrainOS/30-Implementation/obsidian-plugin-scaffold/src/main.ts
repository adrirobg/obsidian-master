import { Notice, Plugin, requestUrl, requireApiVersion } from 'obsidian';
import { OpenCodeHttpClient } from './runtime';
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

	async onload() {
		if (!requireApiVersion('1.11.4')) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			new Notice('BrainOS runtime scaffold requires Obsidian 1.11.4 or newer.');
			return;
		}

		await this.loadSettings();

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
	}

	onunload() {
		for (const controller of this.activeHealthChecks) {
			controller.abort();
		}
		this.activeHealthChecks.clear();

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

	private createRuntimeFetch(pluginSignal: AbortSignal): typeof fetch {
		return async (input, init) => {
			const authHeader = this.buildAuthorizationHeader(this.settings.auth);
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

	private buildAuthorizationHeader(auth: RuntimeAuthSettings | null): string | null {
		if (!auth) {
			return null;
		}

		const username = auth.username.trim();
		if (!username) {
			return null;
		}

		const secretId = auth.passwordSecretId.trim();
		if (!secretId) {
			return null;
		}

		const password = this.app.secretStorage.getSecret(secretId);
		if (!password) {
			return null;
		}

		const encoded = this.encodeBase64(`${username}:${password}`);
		return `Basic ${encoded}`;
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
