export type MessageRole = 'user' | 'assistant' | 'system';

export interface SessionMessage {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: number;
}

export type SuggestionStatus = 'pending' | 'shown' | 'accepted' | 'rejected';
export type SuggestionDecision = 'accepted' | 'rejected';

export interface PendingSuggestion {
	id: string;
	title: string;
	payload: string;
	status: SuggestionStatus;
	createdAt: number;
}

export interface SuggestionDecisionRecord {
	id: string;
	suggestionId: string;
	notePath: string;
	decision: SuggestionDecision;
	decidedAt: number;
	sessionId: string | null;
}

export interface SessionMetadata {
	sessionId: string | null;
	startedAt: number | null;
	lastActivityAt: number | null;
	expiresAt: number | null;
}

export interface SessionStateSnapshot {
	metadata: SessionMetadata;
	history: SessionMessage[];
	pendingSuggestions: PendingSuggestion[];
	decisionLog: SuggestionDecisionRecord[];
}

export interface SessionStateManagerOptions {
	maxHistory?: number;
	maxPendingSuggestions?: number;
	maxDecisionLog?: number;
	ttlMs?: number | null;
}

const DEFAULT_LIMITS = Object.freeze({
	maxHistory: 10,
	maxPendingSuggestions: 25,
	maxDecisionLog: 100,
	ttlMs: null as number | null
});

function normalizeLimit(value: number | undefined, fallback: number): number {
	return Number.isInteger(value) && (value ?? 0) > 0 ? (value as number) : fallback;
}

function normalizeTtl(ttlMs: number | null | undefined): number | null {
	if (ttlMs == null) {
		return null;
	}
	return Number.isInteger(ttlMs) && ttlMs > 0 ? ttlMs : null;
}

function assertActiveSession(sessionId: string | null): asserts sessionId is string {
	if (!sessionId) {
		throw new Error('no active session');
	}
}

function cloneSnapshot(state: SessionStateSnapshot): SessionStateSnapshot {
	return {
		metadata: { ...state.metadata },
		history: state.history.map((message) => ({ ...message })),
		pendingSuggestions: state.pendingSuggestions.map((suggestion) => ({ ...suggestion })),
		decisionLog: state.decisionLog.map((decision) => ({ ...decision }))
	};
}

function trimToLimit<T>(items: T[], maxItems: number): void {
	while (items.length > maxItems) {
		items.shift();
	}
}

export class SessionStateManager {
	private readonly limits: {
		maxHistory: number;
		maxPendingSuggestions: number;
		maxDecisionLog: number;
		ttlMs: number | null;
	};

	private state: SessionStateSnapshot;
	private cleanupHooks: Array<() => void> = [];

	constructor(options: SessionStateManagerOptions = {}) {
		this.limits = {
			maxHistory: normalizeLimit(options.maxHistory, DEFAULT_LIMITS.maxHistory),
			maxPendingSuggestions: normalizeLimit(options.maxPendingSuggestions, DEFAULT_LIMITS.maxPendingSuggestions),
			maxDecisionLog: normalizeLimit(options.maxDecisionLog, DEFAULT_LIMITS.maxDecisionLog),
			ttlMs: normalizeTtl(options.ttlMs)
		};
		this.state = this.createDefaultState();
	}

	startSession(sessionId: string, now = Date.now()): void {
		if (!sessionId || typeof sessionId !== 'string') {
			throw new Error('sessionId must be a non-empty string');
		}

		if (this.state.metadata.sessionId !== null) {
			this.resetState();
		}

		this.state.metadata.sessionId = sessionId;
		this.state.metadata.startedAt = now;
		this.state.metadata.lastActivityAt = now;
		this.state.metadata.expiresAt = this.limits.ttlMs == null ? null : now + this.limits.ttlMs;
	}

	restartSession(nextSessionId: string, now = Date.now()): { cleanupErrors: string[] } {
		const { cleanupErrors } = this.clearSession({ reason: 'restart' });
		this.startSession(nextSessionId, now);
		return { cleanupErrors };
	}

	addMessage(message: SessionMessage, now = Date.now()): void {
		assertActiveSession(this.state.metadata.sessionId);
		const normalized: SessionMessage = {
			id: String(message.id),
			role: message.role,
			content: String(message.content),
			timestamp: Number.isFinite(message.timestamp) ? message.timestamp : now
		};
		this.state.history.push(normalized);
		trimToLimit(this.state.history, this.limits.maxHistory);
		this.touch(now);
	}

	addSuggestion(suggestion: PendingSuggestion, now = Date.now()): void {
		assertActiveSession(this.state.metadata.sessionId);
		const normalized: PendingSuggestion = {
			id: String(suggestion.id),
			title: String(suggestion.title),
			payload: String(suggestion.payload),
			status: suggestion.status ?? 'pending',
			createdAt: Number.isFinite(suggestion.createdAt) ? suggestion.createdAt : now
		};
		this.state.pendingSuggestions.push(normalized);
		trimToLimit(this.state.pendingSuggestions, this.limits.maxPendingSuggestions);
		this.touch(now);
	}

	updateSuggestionStatus(suggestionId: string, nextStatus: SuggestionStatus, now = Date.now()): boolean {
		const found = this.state.pendingSuggestions.find((suggestion) => suggestion.id === suggestionId);
		if (!found) {
			return false;
		}

		found.status = nextStatus;
		this.touch(now);
		return true;
	}

	registerDecision(record: Omit<SuggestionDecisionRecord, 'sessionId'>, now = Date.now()): void {
		const normalized: SuggestionDecisionRecord = {
			id: String(record.id),
			suggestionId: String(record.suggestionId),
			notePath: String(record.notePath),
			decision: record.decision,
			decidedAt: Number.isFinite(record.decidedAt) ? record.decidedAt : now,
			sessionId: this.state.metadata.sessionId
		};
		this.state.decisionLog.push(normalized);
		trimToLimit(this.state.decisionLog, this.limits.maxDecisionLog);
		this.touch(now);
	}

	registerCleanupHook(hook: () => void): void {
		this.cleanupHooks.push(hook);
	}

	isExpired(now = Date.now()): boolean {
		const expiresAt = this.state.metadata.expiresAt;
		return expiresAt !== null && now >= expiresAt;
	}

	clearSession(options: { reason?: string } = {}): { cleanupErrors: string[] } {
		const cleanupErrors: string[] = [];
		for (const hook of this.cleanupHooks) {
			try {
				hook();
			} catch (error) {
				const reason = options.reason ?? 'manual-clear';
				const message = error instanceof Error ? error.message : String(error);
				cleanupErrors.push(`${reason}:${message}`);
			}
		}
		this.resetState();
		return { cleanupErrors };
	}

	getSnapshot(): SessionStateSnapshot {
		return cloneSnapshot(this.state);
	}

	private touch(now: number): void {
		this.state.metadata.lastActivityAt = now;
		if (this.limits.ttlMs !== null) {
			this.state.metadata.expiresAt = now + this.limits.ttlMs;
		}
	}

	private createDefaultState(): SessionStateSnapshot {
		return {
			metadata: {
				sessionId: null,
				startedAt: null,
				lastActivityAt: null,
				expiresAt: null
			},
			history: [],
			pendingSuggestions: [],
			decisionLog: []
		};
	}

	private resetState(): void {
		this.state = this.createDefaultState();
	}
}
