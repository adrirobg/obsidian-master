# Roadmap: Obsidian CLI Adoption for BrainOS

Date: 2026-02-11  
Status: proposed

## Guiding policy
- CLI remains optional.
- Plugin + HTTP/SSE stays primary runtime architecture.
- User-in-control remains mandatory for note mutations.

## Phase 1: Developer DX lane (MVP-compatible)
Goal: accelerate plugin iteration without touching user note flows.

Scope:
1. `plugin:reload` automation in local development scripts.
2. `dev:screenshot`, `dev:console`, `dev:errors` in validation runbooks.

Exit gates:
1. No changes to product behavior or user note mutations.
2. Reproducible evidence attached in PR validations.
3. Fallback path documented (manual UI operations).

Suggested issues:
- `CLI-DX-01`: Add optional script wrapper for `plugin:reload`.
- `CLI-DX-02`: Add screenshot/error capture runbook for BrainOS plugin QA.

## Phase 2: Read-only product support (post-MVP pilot)
Goal: improve triage and review context with non-destructive commands.

Scope:
1. Flow A helpers: `read`, `diff`, `history:list`.
2. Flow B helpers: `files`, `search`, `tasks`.
3. Daily loop visibility helpers: `daily`, `tasks daily`, `tags`.

Exit gates:
1. No automatic writes triggered by CLI path.
2. User confirmation remains sole gate for changes.
3. Flow quality metrics improve (triage speed, context quality).

Suggested issues:
- `CLI-PILOT-01`: Read-only context bundle for Flow A.
- `CLI-PILOT-02`: Inbox candidate scanner for Flow B (read-only).

## Phase 3: Controlled orchestration (post-MVP+)
Goal: evaluate command bridge and workspace orchestration.

Scope:
1. `commands` + `command` bridge for BrainOS plugin commands.
2. `workspace:load`, `tab:open`, `recents` operator flow helpers.

Exit gates:
1. Command ID governance and compatibility policy in place.
2. No hidden side effects; all actions are observable and reversible.

Suggested issues:
- `CLI-ORCH-01`: Command bridge prototype with strict allowlist.
- `CLI-ORCH-02`: Workspace orchestration helpers for review sessions.

## Phase 4: Guarded write-path exploration
Goal: test safe write candidates under strict controls.

Scope:
1. Evaluate `create`, `append`, `prepend`, `move` only with explicit confirmation + preview + audit log.
2. Keep `delete` automated path rejected.

Exit gates:
1. Confirmation UX accepted by methodology validation.
2. Rollback/recovery validated.
3. No policy violations across test sessions.

Suggested issues:
- `CLI-WRITE-01`: Controlled write experiment (append/prepend).
- `CLI-WRITE-02`: Controlled move experiment with rollback.
- `CLI-WRITE-03`: Maintain no-go policy for automated delete.

## Operational checkpoints
1. Compatibility checkpoint per Obsidian early-access update.
2. Contract checkpoint against official CLI docs before each phase advance.
3. Methodology checkpoint to verify no guardrail erosion.

## Stop conditions
1. Official CLI contract changes break reproducibility.
2. Guardrail violations are observed in experiments.
3. Optional lane starts becoming mandatory for core product behavior.
