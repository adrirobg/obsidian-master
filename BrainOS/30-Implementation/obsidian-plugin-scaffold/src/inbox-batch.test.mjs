import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const {
	DEFAULT_BATCH_SIZE,
	MAX_BATCH_SIZE,
	MIN_BATCH_SIZE,
	normalizeBatchSize,
	pickOldestInboxBatch
} = jiti('./inbox-batch.ts');

test('normalizeBatchSize clamps values to the MVP-safe range 1..5', () => {
	assert.equal(normalizeBatchSize(undefined), DEFAULT_BATCH_SIZE);
	assert.equal(normalizeBatchSize(0), MIN_BATCH_SIZE);
	assert.equal(normalizeBatchSize(-1), MIN_BATCH_SIZE);
	assert.equal(normalizeBatchSize(3), 3);
	assert.equal(normalizeBatchSize(9), MAX_BATCH_SIZE);
});

test('pickOldestInboxBatch sorts by ctime asc and returns only markdowns in 00-Inbox', () => {
	const files = [
		{ path: '00-Inbox/003.md', stat: { ctime: 30 } },
		{ path: 'Projects/ignore.md', stat: { ctime: 1 } },
		{ path: '00-Inbox/001.md', stat: { ctime: 10 } },
		{ path: '00-Inbox/002.md', stat: { ctime: 20 } },
		{ path: '00-Inbox/010.md', stat: { ctime: 100 } }
	];

	const batch = pickOldestInboxBatch(files, 3);
	assert.deepEqual(
		batch.map((file) => file.path),
		['00-Inbox/001.md', '00-Inbox/002.md', '00-Inbox/003.md']
	);
});

test('pickOldestInboxBatch keeps deterministic order with same ctime', () => {
	const files = [
		{ path: '00-Inbox/b.md', stat: { ctime: 10 } },
		{ path: '00-Inbox/a.md', stat: { ctime: 10 } }
	];
	const batch = pickOldestInboxBatch(files, 2);
	assert.deepEqual(batch.map((file) => file.path), ['00-Inbox/a.md', '00-Inbox/b.md']);
});
