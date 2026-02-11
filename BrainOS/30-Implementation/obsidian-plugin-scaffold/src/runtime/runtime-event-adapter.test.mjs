import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { RuntimeEventAdapter } = jiti('./runtime-event-adapter.ts');

test('categorizes default "message" event name as message', () => {
	const adapter = new RuntimeEventAdapter();
	const normalized = adapter.normalize({
		eventName: 'message',
		data: JSON.stringify({ sessionID: 'session-1', delta: 'hello' }),
		id: 'evt-1',
		receivedAt: '2026-02-11T00:00:00.000Z'
	});

	assert.equal(normalized.eventType, 'message');
	assert.equal(normalized.category, 'message');
	assert.equal(normalized.sessionId, 'session-1');
});

test('keeps unknown events as unknown without throwing', () => {
	const adapter = new RuntimeEventAdapter();

	const normalized = adapter.normalize({
		eventName: 'runtime.custom',
		data: JSON.stringify({ sessionID: 'session-1', foo: 'bar' }),
		id: 'evt-2',
		receivedAt: '2026-02-11T00:00:01.000Z'
	});

	assert.equal(normalized.eventType, 'runtime.custom');
	assert.equal(normalized.category, 'unknown');
	assert.equal(normalized.sessionId, 'session-1');
});
