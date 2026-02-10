const NEWLINE = /\r?\n/;

function parseField(line) {
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

export class SSEParser {
  constructor({ onEvent, onRetry, onComment, onUnknownField } = {}) {
    this.onEvent = onEvent;
    this.onRetry = onRetry;
    this.onComment = onComment;
    this.onUnknownField = onUnknownField;
    this.reset();
  }

  reset() {
    this.buffer = '';
    this.currentEvent = {
      event: '',
      data: [],
      id: '',
      retry: null,
    };
  }

  feed(chunk) {
    this.buffer += chunk;
    const lines = this.buffer.split(NEWLINE);
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      this.#processLine(line);
    }
  }

  flush() {
    if (this.buffer.length > 0) {
      this.#processLine(this.buffer);
      this.buffer = '';
    }
  }

  #processLine(line) {
    if (line === '') {
      this.#dispatchEvent();
      return;
    }

    const parsed = parseField(line);
    if (parsed.kind === 'comment') {
      if (this.onComment) {
        this.onComment(parsed.value);
      }
      return;
    }

    const { field, value } = parsed;
    switch (field) {
      case 'event':
        this.currentEvent.event = value;
        break;
      case 'data':
        this.currentEvent.data.push(value);
        break;
      case 'id':
        this.currentEvent.id = value;
        break;
      case 'retry': {
        const retryValue = Number.parseInt(value, 10);
        if (Number.isFinite(retryValue) && retryValue >= 0) {
          this.currentEvent.retry = retryValue;
          if (this.onRetry) {
            this.onRetry(retryValue);
          }
        }
        break;
      }
      default:
        if (this.onUnknownField) {
          this.onUnknownField({ field, value, line });
        }
        break;
    }
  }

  #dispatchEvent() {
    const hasData = this.currentEvent.data.length > 0;
    const hasName = this.currentEvent.event.length > 0;
    const hasId = this.currentEvent.id.length > 0;

    if (!hasData && !hasName && !hasId) {
      this.currentEvent = { event: '', data: [], id: '', retry: null };
      return;
    }

    const event = {
      event: this.currentEvent.event || 'message',
      data: this.currentEvent.data.join('\n'),
      id: this.currentEvent.id || null,
      retry: this.currentEvent.retry,
    };

    if (this.onEvent) {
      this.onEvent(event);
    }

    this.currentEvent = { event: '', data: [], id: '', retry: null };
  }
}
