import test from 'node:test';
import assert from 'node:assert/strict';

import { RuntimeEventAdapter } from '../src/runtime_event_adapter.js';
import { SSEClient } from '../src/sse_client.js';
import { SSEParser } from '../src/sse_parser.js';

function streamFromText(chunks) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

test('SSEParser parses fields, comments and multiline data', () => {
  const events = [];
  const comments = [];
  const retries = [];

  const parser = new SSEParser({
    onEvent: (event) => events.push(event),
    onComment: (comment) => comments.push(comment),
    onRetry: (retry) => retries.push(retry),
  });

  parser.feed(':keepalive\n');
  parser.feed('event: progress\n');
  parser.feed('id: ev-1\n');
  parser.feed('retry: 1500\n');
  parser.feed('data: {"percent":20}\n');
  parser.feed('data: {"step":"read"}\n\n');
  parser.flush();

  assert.equal(comments[0], 'keepalive');
  assert.equal(retries[0], 1500);
  assert.equal(events.length, 1);
  assert.equal(events[0].event, 'progress');
  assert.equal(events[0].id, 'ev-1');
  assert.equal(events[0].data, '{"percent":20}\n{"step":"read"}');
});

test('RuntimeEventAdapter normalizes known events and ignores unknown safely', () => {
  const traces = [];
  const adapter = new RuntimeEventAdapter({ onTrace: (trace) => traces.push(trace) });

  const normalized = adapter.normalize({
    sessionId: 'sess-123',
    eventName: 'message',
    data: '{"message":"hola"}',
    id: '1',
    receivedAt: '2026-02-10T00:00:00.000Z',
  });

  assert.equal(normalized.type, 'message');
  assert.equal(normalized.sessionId, 'sess-123');

  const unknown = adapter.normalize({
    sessionId: 'sess-123',
    eventName: 'runtime.new_event',
    data: '{"foo":"bar"}',
    id: '2',
  });

  assert.equal(unknown, null);
  assert.equal(traces.length, 2);
  assert.equal(traces[1].accepted, false);
});

test('SSEClient emits normalized events with session_id and supports reconnection + safe close', async () => {
  let fetchCount = 0;

  const fetchImpl = async () => {
    fetchCount += 1;

    const payload = fetchCount === 1
      ? 'event: start\ndata: {"status":"started"}\n\n'
      : 'event: message\ndata: {"message":"ok"}\n\n';

    return new Response(streamFromText([payload]), {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    });
  };

  const statuses = [];
  const normalized = [];

  const adapter = new RuntimeEventAdapter();
  const client = new SSEClient({ fetchImpl, adapter });

  await client.connect({
    url: 'http://localhost:4096/sse/session/test',
    sessionId: 'session-test',
    reconnect: { enabled: true, initialDelayMs: 1, maxDelayMs: 5 },
    onStatus: (status) => statuses.push(status),
    onNormalizedEvent: (event) => {
      normalized.push(event);
      if (event.type === 'message') {
        client.close();
      }
    },
  });

  assert.ok(fetchCount >= 2);
  assert.equal(normalized[0].type, 'start');
  assert.equal(normalized[1].type, 'message');
  assert.equal(normalized[0].sessionId, 'session-test');
  assert.ok(statuses.some((s) => s.state === 'reconnecting'));
  assert.equal(statuses.at(-1).state, 'closed');
});
