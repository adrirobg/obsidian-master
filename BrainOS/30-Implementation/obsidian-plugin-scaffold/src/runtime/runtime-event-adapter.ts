const DEFAULT_EVENT_NAME = 'message';

export interface RuntimeRawEvent {
	eventName: string | null;
	data: string;
	id: string | null;
	receivedAt: string;
}

export type RuntimeEventCategory = 'message' | 'session' | 'permission' | 'error' | 'unknown';

export interface RuntimeNormalizedEvent {
	sequence: number;
	rawEventName: string;
	eventType: string;
	eventId: string | null;
	receivedAt: string;
	sessionId: string | null;
	category: RuntimeEventCategory;
	payload: Record<string, unknown>;
	rawData: string;
}

function safeJsonParse(raw: string): Record<string, unknown> | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

function readString(value: unknown): string | null {
	return typeof value === 'string' && value.length > 0 ? value : null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function extractSessionId(payload: Record<string, unknown>): string | null {
	const topLevel = readString(payload.sessionID) ?? readString(payload.sessionId);
	if (topLevel) {
		return topLevel;
	}

	const properties = readRecord(payload.properties);
	if (!properties) {
		return null;
	}

	const direct = readString(properties.sessionID) ?? readString(properties.sessionId);
	if (direct) {
		return direct;
	}

	const part = readRecord(properties.part);
	if (part) {
		const partSession = readString(part.sessionID) ?? readString(part.sessionId);
		if (partSession) {
			return partSession;
		}
	}

	const info = readRecord(properties.info);
	if (!info) {
		return null;
	}

	return (
		readString(info.sessionID) ??
		readString(info.sessionId) ??
		readString(info.id)
	);
}

function resolveEventType(payload: Record<string, unknown> | null, rawEventName: string): string {
	const payloadType = payload ? readString(payload.type) : null;
	return payloadType ?? rawEventName;
}

function categorize(eventType: string): RuntimeEventCategory {
	if (eventType === 'error' || eventType.endsWith('.error')) {
		return 'error';
	}
	if (eventType === 'message' || eventType.startsWith('message.')) {
		return 'message';
	}
	if (eventType.startsWith('session.')) {
		return 'session';
	}
	if (eventType.startsWith('permission.')) {
		return 'permission';
	}
	return 'unknown';
}

export class RuntimeEventAdapter {
	private sequence = 0;

	normalize(rawEvent: RuntimeRawEvent): RuntimeNormalizedEvent {
		const rawEventName = rawEvent.eventName ?? DEFAULT_EVENT_NAME;
		const payload = safeJsonParse(rawEvent.data);
		const eventType = resolveEventType(payload, rawEventName);

		this.sequence += 1;
		return {
			sequence: this.sequence,
			rawEventName,
			eventType,
			eventId: rawEvent.id,
			receivedAt: rawEvent.receivedAt,
			sessionId: payload ? extractSessionId(payload) : null,
			category: categorize(eventType),
			payload: payload ?? { text: rawEvent.data },
			rawData: rawEvent.data
		};
	}
}
