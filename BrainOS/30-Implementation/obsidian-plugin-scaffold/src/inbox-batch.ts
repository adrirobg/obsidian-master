export const INBOX_FOLDER = '00-Inbox';
export const MIN_BATCH_SIZE = 1;
export const MAX_BATCH_SIZE = 5;
export const DEFAULT_BATCH_SIZE = 3;

export interface InboxCandidateLike {
	path: string;
	stat: {
		ctime: number;
	};
}

export interface ScannedInboxItem<T extends InboxCandidateLike> {
	file: T;
	content: string;
}

export interface PartitionedInboxBatch<T extends InboxCandidateLike> {
	processable: ScannedInboxItem<T>[];
	skippedEmpty: T[];
}

function normalizeCtime(value: unknown): number {
	return Number.isFinite(value) ? Number(value) : Number.POSITIVE_INFINITY;
}

export function normalizeBatchSize(value: number | undefined, fallback = DEFAULT_BATCH_SIZE): number {
	const safeFallback = Number.isInteger(fallback) ? fallback : DEFAULT_BATCH_SIZE;
	const candidate = Number.isInteger(value) ? (value as number) : safeFallback;
	if (candidate < MIN_BATCH_SIZE) {
		return MIN_BATCH_SIZE;
	}
	if (candidate > MAX_BATCH_SIZE) {
		return MAX_BATCH_SIZE;
	}
	return candidate;
}

export function isInboxNotePath(path: string): boolean {
	return path.startsWith(`${INBOX_FOLDER}/`);
}

export function pickOldestInboxBatch<T extends InboxCandidateLike>(files: T[], batchSize: number): T[] {
	const normalizedBatchSize = normalizeBatchSize(batchSize);
	return files
		.filter((file) => isInboxNotePath(file.path))
		.slice()
		.sort((a, b) => {
			const byCreation = normalizeCtime(a.stat.ctime) - normalizeCtime(b.stat.ctime);
			if (byCreation !== 0) {
				return byCreation;
			}
			return a.path.localeCompare(b.path);
		})
		.slice(0, normalizedBatchSize);
}

export function partitionScannedInboxBatch<T extends InboxCandidateLike>(
	scannedItems: ScannedInboxItem<T>[]
): PartitionedInboxBatch<T> {
	const processable: ScannedInboxItem<T>[] = [];
	const skippedEmpty: T[] = [];

	for (const scanned of scannedItems) {
		if (scanned.content.trim().length > 0) {
			processable.push(scanned);
			continue;
		}
		skippedEmpty.push(scanned.file);
	}

	return { processable, skippedEmpty };
}
