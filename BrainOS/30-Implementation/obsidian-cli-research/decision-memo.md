# Decision Memo: Obsidian CLI in BrainOS

Date: 2026-02-11  
Status: approved for optional-lane adoption

## Executive decision
1. Obsidian CLI should be adopted as an **optional accelerator lane**, not as a core dependency.
2. Immediate adoption is recommended for **developer DX only** (`Go MVP` optional lane).
3. Read-only product-facing usage is recommended as **post-MVP pilot** (`Go post-MVP`).
4. Write-path automation remains **Hold** and auto-delete remains **No-go**.

## Why this decision
- It preserves ADR-001 (runtime remains plugin + HTTP/SSE).
- It preserves ADR-003 (no persistent conversational memory expansion).
- It preserves user-in-control guardrails.
- It captures practical value while managing early-access volatility.

## Candidate decisions
- Go MVP (optional lane): `plugin:reload`, `dev:screenshot`, `dev:console`, `dev:errors`.
- Go post-MVP: read-only Flow A/B and daily assist candidates.
- Hold: command bridge + guarded write-path candidates.
- No-go: automated delete in inbox/process flows.

Reference matrix: `flow-fit-matrix.json`.

## Must / Should / Could
### Must
1. Keep CLI lane optional and feature-gated.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Why: CLI is early access, version-gated, and syntax may change.

2. Keep BrainOS core architecture unchanged (`plugin + HTTP/SSE`).
- Source: `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md`
- Why: canonical MVP decision.

3. Block destructive automation (`delete`) in inbox flows.
- Source: `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
- Why: guardrail requires user-controlled critical actions.

4. Restrict write-path CLI actions to explicit confirmation workflows only.
- Source: `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md`
- Why: accept/reject gating is part of MVP acceptance criteria.

### Should
1. Pilot read-only CLI bundle for Flow A/B after MVP baseline is stable.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Why: high utility with low methodology risk.

2. Add compatibility checks to detect command syntax drift.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Why: official docs state syntax can change during early access.

3. Capture CLI usage in validation reports for reproducibility.
- Source: `BrainOS/30-Implementation/NEXT-BLOCK-PLUGIN-RUNTIME-PLAN.md`
- Why: aligns with reproducible validation requirement.

### Could
1. Explore `command id=<plugin-command-id>` bridge post-MVP once command governance is stable.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Why: useful orchestration potential, moderate coupling risk.

2. Add workspace orchestration helpers (`workspace:load`, `tab:open`) for operator efficiency.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Why: low guardrail risk, moderate utility.

## Risk register
1. Early-access dependency risk.
- Severity: high
- Mitigation: optional feature flag lane + fallback.

2. Syntax/behavior drift risk.
- Severity: high
- Mitigation: contract snapshot and periodic re-validation.

3. Guardrail drift toward over-automation.
- Severity: high
- Mitigation: write-path blocked by default, explicit confirmation mandatory.

4. Security/unsafe eval misuse in automation.
- Severity: medium
- Mitigation: keep `eval` on hold and restrict to manual debug contexts.

## Safe default package
1. Default now: no runtime or product dependency on Obsidian CLI.
2. Allow only developer DX commands in controlled environments.
3. Reassess product-facing CLI lane when Catalyst-enabled validation is available.

## Traceability
- Charter: `research-charter.md`
- Command contract: `capability-catalog.md` + `capability-catalog.json`
- Flow fit: `brainos-flow-fit.md` + `flow-fit-matrix.json`
- Ideas: `idea-backlog.md` + `prioritized-shortlist.md`
- Experiments: `experiment-plan.md` + `experiment-matrix.json`
