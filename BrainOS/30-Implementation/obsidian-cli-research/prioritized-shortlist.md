# Prioritized Shortlist (Top 5)

Date: 2026-02-11
Source backlog: `idea-backlog.md`

## Selection criteria
- High priority score from backlog.
- Low guardrail impact.
- Clear incremental value for BrainOS workflows.
- Feasible with optional lane design.

| Rank | Candidate | Decision | Why now | Gate to start |
|---|---|---|---|---|
| 1 | `plugin:reload` automation (`I01`) | Go MVP | Highest ROI for plugin iteration speed, no vault mutation required. | Catalyst lane available in contributor environment.
| 2 | `dev:errors` capture (`I03`) | Go MVP | Fast feedback loop for runtime/UI regressions with low risk. | Standardized error parsing and report format.
| 3 | `dev:screenshot` runner (`I02`) | Go MVP | Enables reproducible visual checks in PR validation. | Deterministic viewport and naming convention.
| 4 | Read-only review bundle (`read` + `diff` + `history:list`) (`I07`,`I08`) | Go post-MVP | Improves suggestion quality without auto-write behavior. | Explicit policy: read-only mode first.
| 5 | Inbox triage scanner (`files` + `search` + `tasks`) (`I09`,`I10`) | Go post-MVP | Supports Flow B candidate selection and visibility. | Guardrail rule: no move/delete automation.

## Deferred / blocked highlights
- `command` bridge (`I05`) -> Hold until command contract and policy are stable.
- Write automation via `create/move` (`I22`,`I23`) -> Hold until explicit confirm UX + audit logs exist.
- `delete` automation (`I24`) -> No-go in MVP and post-MVP initial stages.

## Practical recommendation
1. Execute rank 1-3 first as a developer-only optional lane.
2. Introduce rank 4-5 behind read-only feature flags.
3. Re-evaluate `I05` after command ID governance and compatibility checks are in place.
