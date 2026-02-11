import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { SessionStateManager } = jiti('./session-state-manager.ts');

test('session state manager registers accepted decision with note path and session id', () => {
	const manager = new SessionStateManager();
	const now = 1700000000000;
	manager.startSession('session-a', now);
	manager.addSuggestion({
		id: 's1',
		title: 'Proposal',
		payload: '# Proposed content',
		status: 'shown',
		createdAt: now
	});

	manager.registerDecision({
		id: 'd1',
		suggestionId: 's1',
		notePath: 'Inbox/active-note.md',
		decision: 'accepted',
		decidedAt: now + 10
	});

	const snapshot = manager.getSnapshot();
	assert.equal(snapshot.decisionLog.length, 1);
	assert.deepEqual(snapshot.decisionLog[0], {
		id: 'd1',
		suggestionId: 's1',
		notePath: 'Inbox/active-note.md',
		decision: 'accepted',
		decidedAt: now + 10,
		sessionId: 'session-a'
	});
});

test('session state manager trims decision log to configured limit', () => {
	const manager = new SessionStateManager({ maxDecisionLog: 2 });
	manager.startSession('session-b', 200);
	manager.registerDecision({
		id: 'd1',
		suggestionId: 's1',
		notePath: 'a.md',
		decision: 'accepted',
		decidedAt: 201
	});
	manager.registerDecision({
		id: 'd2',
		suggestionId: 's2',
		notePath: 'b.md',
		decision: 'rejected',
		decidedAt: 202
	});
	manager.registerDecision({
		id: 'd3',
		suggestionId: 's3',
		notePath: 'c.md',
		decision: 'accepted',
		decidedAt: 203
	});

	const snapshot = manager.getSnapshot();
	assert.equal(snapshot.decisionLog.length, 2);
	assert.equal(snapshot.decisionLog[0].id, 'd2');
	assert.equal(snapshot.decisionLog[1].id, 'd3');
});
