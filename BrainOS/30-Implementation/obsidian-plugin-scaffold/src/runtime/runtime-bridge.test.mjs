import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { RuntimeBridge } = jiti('./runtime-bridge.ts');

function createSseResponse(chunks) {
	const stream = new ReadableStream({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(new TextEncoder().encode(chunk));
			}
			controller.close();
		}
	});

	return new Response(stream, {
		status: 200,
		headers: { 'content-type': 'text/event-stream' }
	});
}

function waitFor(predicate, timeoutMs = 1_000) {
	return new Promise((resolve, reject) => {
		const startedAt = Date.now();
		const tick = () => {
			if (predicate()) {
				resolve();
				return;
			}

			if (Date.now() - startedAt > timeoutMs) {
				reject(new Error('timeout waiting for condition'));
				return;
			}

			setTimeout(tick, 10);
		};
		tick();
	});
}

test('runtime bridge filters events by sessionId and keeps unknown events in ignored callback', async () => {
	const seenEvents = [];
	const ignoredEvents = [];
	const statuses = [];

	const bridge = new RuntimeBridge({
		baseUrl: 'http://runtime.local',
		fetchImpl: async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
		streamFetchImpl: async () =>
			createSseResponse([
				'data: {"sessionID":"session-target","text":"hello"}\n\n',
				'event: runtime.custom\n',
				'data: {"sessionID":"session-other","foo":"bar"}\n\n'
			]),
		buildAuthorizationHeader: async () => null
	});

	bridge.subscribeToSession({
		sessionId: 'session-target',
		reconnect: { enabled: false },
		onStatus: (status) => {
			statuses.push(status.state);
		},
		onEvent: (event) => {
			seenEvents.push(event);
		},
		onIgnoredEvent: (event) => {
			ignoredEvents.push(event);
		}
	});

	await waitFor(() => statuses.includes('closed'));

	assert.equal(seenEvents.length, 1);
	assert.equal(seenEvents[0].sessionId, 'session-target');
	assert.equal(seenEvents[0].category, 'message');

	assert.equal(ignoredEvents.length, 1);
	assert.equal(ignoredEvents[0].sessionId, 'session-other');
	assert.equal(ignoredEvents[0].category, 'unknown');
	assert.ok(statuses.includes('open'));
	assert.ok(statuses.includes('stream-ended'));
	assert.ok(statuses.includes('closed'));
});
