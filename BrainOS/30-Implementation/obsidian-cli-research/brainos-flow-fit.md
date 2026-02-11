# BrainOS Flow Fit: Obsidian CLI

Date: 2026-02-11  
Companion data: `flow-fit-matrix.json`

## Canonical BrainOS flows considered
1. Flow A: current note -> runtime -> suggestion -> explicit accept/reject.
2. Flow B: inbox batch (small N) with explicit decision per item.
3. Daily methodology loop (capture, inbox processing, literature/permanent progression).
4. Plugin development cycle (debug/reload/test).

BrainOS sources:
- `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md`
- `BrainOS/30-Implementation/NEXT-BLOCK-PLUGIN-RUNTIME-PLAN.md`

## How Obsidian CLI complements (not replaces)
1. Developer DX lane (strong fit)
- `plugin:reload`, `dev:screenshot`, `dev:console`, `dev:errors` reduce manual testing friction.
- This lane does not change runtime architecture (`plugin + HTTP/SSE`) and has low methodology risk.

2. Read-only assistant lane (good fit)
- `read`, `diff`, `history:list`, `tasks`, `search`, `tags`, `links`, `backlinks` can enrich context and review.
- Read-only mode aligns with user-in-control and avoids destructive automation.

3. Command bridge lane (conditional fit)
- `commands` + `command id=<plugin-command-id>` can orchestrate plugin commands from terminal.
- Useful post-MVP when command IDs and execution policy are stable.

4. Write lane (guarded fit)
- `append`, `prepend`, `create`, `move`, `task` are only acceptable with explicit confirmation gates and preview.
- `delete` conflicts with no-auto-delete inbox guardrail in MVP.

## Official evidence
1. CLI supports developer commands and plugin reload.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applicability: direct acceleration of BrainOS plugin iteration loop.

2. CLI supports file/task/search/workspace operations.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applicability: can support non-destructive triage and orchestration use cases.

3. CLI is early-access with Catalyst + Obsidian 1.12 requirements and potential syntax drift.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applicability: integration must be optional and compatibility-gated.

## Decision matrix summary
From `flow-fit-matrix.json` (27 evaluated pairs):
- `Go MVP`: 4 (all in developer DX lane)
- `Go post-MVP`: 16
- `Hold`: 6
- `No-go`: 1

## Incompatibilities and guardrail conflicts
1. Destructive writes (`delete`, bulk mutation paths) are no-go for MVP.
- Conflict: user-in-control and no-auto-delete inbox.

2. Runtime substitution via CLI is out of scope.
- Conflict: ADR-001 keeps plugin runtime on HTTP + SSE.

3. Stateful memory through CLI is out of scope.
- Conflict: ADR-003 limits persistence to config and secrets.

## Recommended use modes by flow
1. Flow A (current note)
- Recommended: `read`, `diff`, `history:list` as optional context/review utilities.
- Deferred: direct write commands until explicit confirmation UX and safety checks are proven.

2. Flow B (inbox batch)
- Recommended: `files`, `search`, `tasks` for candidate selection and progress visibility.
- Deferred/blocked: `move` hold, `delete` no-go.

3. Daily loop
- Recommended post-MVP: `daily`, `daily:append`, `tasks daily` under controlled prompts.

4. Plugin dev loop
- Recommended now (optional lane): `plugin:reload`, `dev:screenshot`, `dev:console`, `dev:errors`.

## Safe defaults
1. Treat CLI as optional accelerator lane, never as hard dependency.
2. Prefer read-only usage first.
3. Require explicit human confirmation for every write candidate.
4. Version-gate every CLI integration point and keep fallback to current plugin flow.
