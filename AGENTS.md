# BrainOS Worker Flow (Issue -> Dev -> PR)

This file defines the mandatory flow for worker sessions in this branch family.

## Scope
- This repository is a BrainOS MVP workspace.
- For this branch family, workers must execute one GitHub issue per branch.

## Required execution flow
1. Read the assigned GitHub issue fully (title, body, acceptance criteria).
2. Restate scope and explicit non-goals before changing code/docs.
3. Implement only what is required to satisfy acceptance criteria.
4. Run local validation relevant to the change (tests/smoke/lint if available).
5. Produce a concise summary with changed files and validation results.
6. Prepare PR with:
- Link to issue (`Closes #<n>` when applicable).
- What changed.
- Why this approach.
- How it was validated.
- Risks/follow-ups.

## Source of truth and architecture constraints
- Follow canonical BrainOS docs first:
- `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md`
- Respect ADR-001 and ADR-003 boundaries for MVP.

## Documentation quality rule
- For framework/library/runtime behavior, use Context7 MCP first.
- Prefer official primary docs and avoid assumptions.
- If unsure, state uncertainty and choose a safe default.

## MVP guardrails
- User-in-control: never auto-apply sensitive edits without explicit user action.
- Do not introduce persistent conversational memory in MVP critical path.
- Do not switch transport architecture beyond HTTP + SSE in MVP.

## Commit and PR style
- Small, focused commits.
- No unrelated refactors.
- Keep branch clean and ready for review.
