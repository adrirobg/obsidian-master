import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { SseParser } = jiti('./sse-parser.ts');
const { RuntimeEventAdapter } = jiti('./runtime-event-adapter.ts');

test('SSE parser emits default message event and adapter classifies it as message', () => {
	const events = [];
	const parser = new SseParser({
		onEvent: (event) => {
			events.push(event);
		}
	});

	parser.feed('data: {"sessionID":"session-1","text":"hola"}\n\n');
	parser.flush();

	assert.equal(events.length, 1);
	assert.equal(events[0].event, 'message');

	const adapter = new RuntimeEventAdapter();
	const normalized = adapter.normalize({
		eventName: events[0].event,
		data: events[0].data,
		id: events[0].id,
		receivedAt: '2026-02-11T00:00:02.000Z'
	});

	assert.equal(normalized.eventType, 'message');
	assert.equal(normalized.category, 'message');
	assert.equal(normalized.sessionId, 'session-1');
});

test('SSE parser ignores id-only frames without data', () => {
	const events = [];
	const parser = new SseParser({
		onEvent: (event) => {
			events.push(event);
		}
	});

	parser.feed('id: evt-123\n\n');
	parser.flush();

	assert.equal(events.length, 0);
});
