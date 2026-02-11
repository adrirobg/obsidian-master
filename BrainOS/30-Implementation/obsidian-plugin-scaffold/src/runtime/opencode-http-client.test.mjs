import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { OpenCodeHttpClient } = jiti('./opencode-http-client.ts');

if (!globalThis.window) {
	globalThis.window = globalThis;
}

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

test('sendPrompt targets /message endpoint in current runtime contract', async () => {
	const calls = [];
	const client = new OpenCodeHttpClient({
		baseUrl: 'http://runtime.local',
		fetchImpl: async (url, init) => {
			const parsed = new URL(String(url));
			calls.push({ path: parsed.pathname, method: init?.method });
			return jsonResponse({ ok: true }, 200);
		}
	});

	await client.sendPrompt({
		sessionId: 'ses_123',
		prompt: 'hola'
	});

	assert.equal(calls.length, 1);
	assert.equal(calls[0].method, 'POST');
	assert.equal(calls[0].path, '/session/ses_123/message');
});

test('sendPrompt falls back to legacy /prompt on 404', async () => {
	const calls = [];
	const client = new OpenCodeHttpClient({
		baseUrl: 'http://runtime.local',
		fetchImpl: async (url, init) => {
			const parsed = new URL(String(url));
			calls.push({ path: parsed.pathname, method: init?.method });

			if (parsed.pathname.endsWith('/message')) {
				return jsonResponse({ error: 'not found' }, 404);
			}
			return jsonResponse({ ok: true }, 200);
		}
	});

	await client.sendPrompt({
		sessionId: 'ses_legacy',
		prompt: 'hola'
	});

	assert.equal(calls.length, 2);
	assert.equal(calls[0].path, '/session/ses_legacy/message');
	assert.equal(calls[1].path, '/session/ses_legacy/prompt');
});
