const NEWLINE = /\r?\n/;

interface ParsedComment {
	kind: 'comment';
	value: string;
}

interface ParsedField {
	kind: 'field';
	field: string;
	value: string;
}

type ParsedLine = ParsedComment | ParsedField;

export interface RawSseEvent {
	event: string;
	data: string;
	id: string | null;
	retry: number | null;
}

type MutableSseEvent = {
	event: string;
	data: string[];
	id: string;
	retry: number | null;
};

export interface SseParserOptions {
	onEvent?: (event: RawSseEvent) => void;
	onRetry?: (retryMs: number) => void;
	onComment?: (value: string) => void;
	onUnknownField?: (value: { field: string; value: string; line: string }) => void;
}

function parseField(line: string): ParsedLine {
	if (line.startsWith(':')) {
		return { kind: 'comment', value: line.slice(1).trimStart() };
	}

	const separator = line.indexOf(':');
	if (separator === -1) {
		return { kind: 'field', field: line, value: '' };
	}

	const field = line.slice(0, separator);
	let value = line.slice(separator + 1);
	if (value.startsWith(' ')) {
		value = value.slice(1);
	}
	return { kind: 'field', field, value };
}

export class SseParser {
	private readonly onEvent?: (event: RawSseEvent) => void;
	private readonly onRetry?: (retryMs: number) => void;
	private readonly onComment?: (value: string) => void;
	private readonly onUnknownField?: (value: { field: string; value: string; line: string }) => void;
	private buffer = '';
	private currentEvent: MutableSseEvent = this.createEmptyEvent();

	constructor(options: SseParserOptions = {}) {
		this.onEvent = options.onEvent;
		this.onRetry = options.onRetry;
		this.onComment = options.onComment;
		this.onUnknownField = options.onUnknownField;
	}

	feed(chunk: string): void {
		this.buffer += chunk;
		const lines = this.buffer.split(NEWLINE);
		this.buffer = lines.pop() ?? '';

		for (const line of lines) {
			this.processLine(line);
		}
	}

	flush(): void {
		if (this.buffer.length > 0) {
			this.processLine(this.buffer);
			this.buffer = '';
		}
		this.dispatchEvent();
	}

	private processLine(line: string): void {
		if (line === '') {
			this.dispatchEvent();
			return;
		}

		const parsed = parseField(line);
		if (parsed.kind === 'comment') {
			this.onComment?.(parsed.value);
			return;
		}

		switch (parsed.field) {
			case 'event':
				this.currentEvent.event = parsed.value;
				break;
			case 'data':
				this.currentEvent.data.push(parsed.value);
				break;
			case 'id':
				this.currentEvent.id = parsed.value;
				break;
			case 'retry': {
				const retryValue = Number.parseInt(parsed.value, 10);
				if (Number.isFinite(retryValue) && retryValue >= 0) {
					this.currentEvent.retry = retryValue;
					this.onRetry?.(retryValue);
				}
				break;
			}
			default:
				this.onUnknownField?.({
					field: parsed.field,
					value: parsed.value,
					line
				});
				break;
		}
	}

	private dispatchEvent(): void {
		const hasData = this.currentEvent.data.length > 0;
		if (!hasData) {
			this.currentEvent = this.createEmptyEvent();
			return;
		}

		this.onEvent?.({
			event: this.currentEvent.event || 'message',
			data: this.currentEvent.data.join('\n'),
			id: this.currentEvent.id || null,
			retry: this.currentEvent.retry
		});
		this.currentEvent = this.createEmptyEvent();
	}

	private createEmptyEvent(): MutableSseEvent {
		return {
			event: '',
			data: [],
			id: '',
			retry: null
		};
	}
}
