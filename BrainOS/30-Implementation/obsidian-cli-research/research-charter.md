# Research Charter: Obsidian CLI for BrainOS

Date: 2026-02-11  
Status: active  
Owner: BrainOS technical research

## Objective
Evaluate how Obsidian CLI can be incorporated into BrainOS to improve current workflows and expand future capabilities without violating MVP guardrails.

## Scope
- In scope:
  - Official contract analysis of Obsidian CLI commands and constraints.
  - Fit analysis against BrainOS canonical flows (Flow A current note, Flow B inbox batch, user confirmation gates).
  - Risk/governance assessment for early-access dependency.
  - Prioritized adoption options and phased roadmap.
- Out of scope:
  - Product code implementation.
  - Any architectural change that replaces HTTP+SSE runtime integration.
  - Persistent conversational memory changes.

## Non-negotiable Constraints
- ADR-001: keep runtime transport on HTTP + SSE.
- ADR-003: in-memory session state; persist only plugin config/secrets.
- User-in-control guardrails: no auto-apply sensitive changes, no auto-delete inbox.

## Subagent Work Breakdown (reasoning=medium)
1. SA-1 source-of-truth
- Mission: consolidate official Obsidian CLI contract.
- Output: `capability-catalog.md`, `capability-catalog.json`.

2. SA-2 capability-mapper
- Mission: map commands to operational capabilities.
- Output: capability-to-flow mapping in `brainos-flow-fit.md` and `flow-fit-matrix.json`.

3. SA-3 brainos-flow-fit
- Mission: map capabilities against BrainOS canonical flows and guardrails.
- Output: fit matrix and compatibility notes.

4. SA-4 risk-and-governance
- Mission: assess early-access, compatibility drift, security, and maintenance risks.
- Output: risk register in `decision-memo.md`.

5. SA-5 brainstorm-facilitator
- Mission: generate and score practical ideas.
- Output: `idea-backlog.md`, `prioritized-shortlist.md`.

6. SA-6 spike-designer
- Mission: design reproducible validation paths with and without Catalyst.
- Output: `experiment-plan.md`, `experiment-matrix.json`.

7. SA-7 decision-synthesizer
- Mission: produce final decision and adoption roadmap.
- Output: `decision-memo.md`, `roadmap.md`.

## Research Questions (frozen)
1. Which Obsidian CLI capabilities provide immediate value for BrainOS without breaking guardrails?
2. Which capabilities are post-MVP candidates requiring stability gates?
3. Which capabilities are no-go for now due to risk, drift, or methodology conflict?
4. Can Obsidian CLI serve as an optional lane while preserving plugin + runtime architecture?

## Success Metrics
1. 100% important recommendations include official source + applicability note.
2. 0 recommendations conflict with ADR-001 or ADR-003.
3. Candidate decision matrix complete (`Go MVP`, `Go post-MVP`, `Hold`, `No-go`).
4. Reproducible runbook defined for Catalyst-enabled validation.
5. Prioritized initiative list includes effort and risk levels.

## Evidence Template
Use this template for each major recommendation:
- Recommendation:
- Decision class (`Go MVP` | `Go post-MVP` | `Hold` | `No-go`):
- Source URL (official):
- Version/date context:
- Why it applies to BrainOS:
- Guardrail impact:
- Safe fallback:

## Key Official Sources
- Obsidian CLI official docs: https://help.obsidian.md/cli
- Obsidian plugin docs root: https://docs.obsidian.md
- BrainOS canonical docs in repo:
  - `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
  - `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md`
  - `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md`
  - `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-003-Memory-Persistence.md`
  - `BrainOS/30-Implementation/NEXT-BLOCK-PLUGIN-RUNTIME-PLAN.md`
