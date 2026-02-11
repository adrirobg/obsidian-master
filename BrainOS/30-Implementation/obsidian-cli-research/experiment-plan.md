# Experiment Plan: Obsidian CLI for BrainOS

Date: 2026-02-11  
Companion matrix: `experiment-matrix.json`

## Objective
Validate highest-value CLI candidates with reproducible procedures while preserving BrainOS guardrails and architecture constraints.

## Validation lanes
1. Lane A: without Catalyst (current default)
- Type: documentary + simulated command contract validation.
- Purpose: prepare design, governance, and runbooks with zero runtime dependency.
- Output: validated assumptions, compatibility checklist, ready-to-run scripts once Catalyst is available.

2. Lane B: with Catalyst (future activation)
- Type: real CLI smoke tests in controlled desktop environment.
- Purpose: confirm command behavior, drift tolerance, and operational viability.
- Output: Go/Hold/No-go updates backed by empirical evidence.

## Experiment packs
1. Pack DEV-DX (priority 1)
- Candidates: `I01-I04` (`plugin:reload`, `dev:screenshot`, `dev:errors`, `dev:console`).
- Acceptance:
  - Command invocation reproducible.
  - No impact on user note data.
  - Output can be attached to PR validation.

2. Pack FLOW-A READ-ONLY (priority 2)
- Candidates: `I07-I08` (`read`, `diff`, `history:list`).
- Acceptance:
  - Produces useful review context.
  - No note mutation.
  - Complements existing runtime suggestion flow.

3. Pack FLOW-B TRIAGE READ-ONLY (priority 3)
- Candidates: `I09-I10` (`files`, `search`, `tasks`).
- Acceptance:
  - Produces deterministic top-N candidate view.
  - No automatic move/delete actions.

4. Pack DAILY ASSIST (priority 4)
- Candidate: `I13` (`daily:append`) with explicit confirmation gate.
- Acceptance:
  - Writes only after explicit user approval.
  - Action is audit-visible.

5. Pack WRITE PATH GUARDRAIL (priority 5)
- Candidates: `I22`, `I23`, `I24`.
- Acceptance:
  - `I22`, `I23` remain hold until governance controls exist.
  - `I24` remains rejected no-go.

## Drift and compatibility checks
1. Capture and pin CLI contract snapshot from official docs before running Pack B.
2. Re-run smoke suite when Obsidian CLI syntax changes.
3. Maintain fallback behavior for every candidate (no hard dependency).

## Exit criteria
1. MVP lane decision confirmed for DEV-DX candidates.
2. Post-MVP pilot set confirmed for read-only Flow A/B candidates.
3. Write-path candidates remain blocked unless confirmation + logging + rollback controls are proven.
4. Decision memo updated with evidence links and dates.

## Safety policy for all experiments
1. Never execute automatic delete in inbox-related flows.
2. Never auto-apply sensitive note mutations.
3. Keep CLI integration optional behind feature flags.
4. Preserve plugin + HTTP/SSE as the core architecture.
