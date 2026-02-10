# MVP-06: Inbox Batch Flow (small batch, user-controlled)

Status: implemented at spec level for branch `codex/issue-06-mvp-inbox-batch`  
Related issue: #6

## 1. Goal

Implement Flow B from realtime MVP as a local-first, user-controlled inbox workflow:

- select a small configurable batch size `N`
- process notes sequentially (one-by-one)
- show progress per item
- present suggestion per note with explicit accept/reject
- record decisions for methodological validation

## 2. Scope

Included in MVP-06:

- batch selection from `00-Inbox` with configurable small `N`
- deterministic sequence order (oldest first by default)
- realtime progress visible in UI for each item
- explicit user decision per note: `accept` or `reject`
- decision log persisted as local validation artifact
- guardrail: never auto-delete inbox notes

Out of scope:

- large unattended batch runs
- automatic destructive actions over inbox
- transport changes beyond HTTP + SSE
- durable conversational memory

## 3. Runtime and session constraints (MVP)

- Transport remains `HTTP + SSE` (ADR-001).
- Session state remains in-memory (ADR-003).
- Plugin config may persist minimal settings (`batchSize`).
- Suggested default for `batchSize`: `3`.
- Safe allowed range: `1..5` for MVP.

## 4. High-level flow

1. User invokes `Process Inbox Batch`.
2. Plugin reads up to `N` candidate notes from `00-Inbox`.
3. Plugin opens or reuses runtime session via HTTP.
4. For each note (sequential):
   - send processing request over HTTP
   - consume SSE events through event adapter
   - render per-item progress state
   - render final suggestion
   - wait for explicit user decision (`accept` or `reject`)
   - apply accepted change only after confirmation
   - append decision to local log
5. Finish with summary (`processed`, `accepted`, `rejected`, `errors`).

## 5. Data contracts (internal, plugin-side)

Do not hardcode external runtime event names as stable contract.  
Use adapter mapping from runtime raw events to plugin semantic events.

```ts
type InboxBatchConfig = {
  batchSize: number; // MVP: 1..5
  sourceFolder: "00-Inbox";
  order: "oldest_first";
};

type BatchItemStatus =
  | "queued"
  | "running"
  | "awaiting_user"
  | "accepted"
  | "rejected"
  | "error";

type BatchItemProgress = {
  itemId: string;
  index: number; // 1-based
  total: number;
  status: BatchItemStatus;
  message?: string;
};

type InboxDecision = {
  timestamp: string; // ISO 8601
  itemId: string;
  itemPath: string;
  action: "accept" | "reject";
  reason?: string;
  sessionId: string;
};
```

## 6. Sequential processor (reference pseudocode)

```ts
async function processInboxBatch(config: InboxBatchConfig): Promise<void> {
  const items = await pickInboxItems(config.sourceFolder, config.batchSize, config.order);
  const session = await runtime.ensureSession();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    ui.updateProgress({ itemId: item.id, index: i + 1, total: items.length, status: "running" });

    try {
      const suggestion = await runtime.processItemWithSSE(session.id, item, (evt) => {
        const mapped = eventAdapter.map(evt);
        ui.updateFromRuntimeEvent(item.id, mapped);
      });

      ui.showSuggestion(item.id, suggestion);
      ui.updateProgress({ itemId: item.id, index: i + 1, total: items.length, status: "awaiting_user" });

      const decision = await ui.awaitUserDecision(item.id); // accept | reject

      if (decision.action === "accept") {
        await applySuggestionWithConfirmation(item, suggestion);
        ui.updateProgress({ itemId: item.id, index: i + 1, total: items.length, status: "accepted" });
      } else {
        ui.updateProgress({ itemId: item.id, index: i + 1, total: items.length, status: "rejected" });
      }

      await appendDecisionLog({
        timestamp: new Date().toISOString(),
        itemId: item.id,
        itemPath: item.path,
        action: decision.action,
        reason: decision.reason,
        sessionId: session.id,
      });
    } catch (err) {
      ui.updateProgress({ itemId: item.id, index: i + 1, total: items.length, status: "error", message: String(err) });
      await appendProcessingError(item, err, session.id);
    }
  }
}
```

## 7. Decision log format (methodology validation)

Recommended local file:

- `BrainOS/30-Implementation/artifacts/inbox-batch-decisions.jsonl`

JSON Lines example:

```json
{"timestamp":"2026-02-10T18:10:11.000Z","itemId":"20260209102301","itemPath":"00-Inbox/idea-a.md","action":"accept","reason":"clear next step","sessionId":"sess_001"}
{"timestamp":"2026-02-10T18:11:42.000Z","itemId":"20260209103055","itemPath":"00-Inbox/link-b.md","action":"reject","reason":"not relevant this week","sessionId":"sess_001"}
```

This log supports playbook metrics:

- decision coverage per inbox item
- acceptance/rejection ratio
- friction patterns in repeated rejects/errors

## 8. UI minimum requirements for MVP-06

- visible batch header: `Processing item X/N`
- per-item state badge (`running`, `awaiting_user`, `accepted`, `rejected`, `error`)
- explicit action controls for each suggestion (`Accept`, `Reject`)
- no automatic deletion control in this workflow

## 9. Acceptance criteria mapping

1. User can process at least 3 consecutive notes.  
   - covered by configurable `batchSize`, default `3`, sequential loop.
2. Each note preserves accept/reject control.  
   - covered by explicit `awaitUserDecision()` step.
3. Progress per item is visible.  
   - covered by `BatchItemProgress` updates and `Processing X/N`.
4. No auto-deletion of inbox notes.  
   - explicitly prohibited in scope and flow.

## 10. Risks and safe defaults

- Risk: runtime event schema changes between releases.
  - Mitigation: keep adapter boundary and avoid binding UI directly to raw event names.
- Risk: user fatigue with large queues.
  - Mitigation: keep MVP batch small (`1..5`, default `3`).
- Risk: accidental destructive actions.
  - Mitigation: explicit confirmation + no auto-delete guardrail.
