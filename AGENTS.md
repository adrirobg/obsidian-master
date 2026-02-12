# BrainOS Development Workflow (Skills-Oriented)

Repository-level instructions for Codex sessions in this repo.

## Scope
- Apply this workflow for BrainOS implementation and integration work.
- Execute one issue per branch/worktree.
- Keep issue scope strict and reproducible.

## Canonical Reading Order
1. `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
2. `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md`
3. `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md`
4. `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-003-Memory-Persistence.md`
5. Issue context file (`.codex-issue-context.md` or the path provided by queue/plan).

## Skill Routing
Use these skills as the default operating system:

1. Plugin-level research and architecture guidance:
- Use [$brainos-obsidian-playbook](/Users/adri/.codex/skills/brainos-obsidian-playbook/SKILL.md).
- Mandatory when defining or reviewing plugin-wide technical decisions (stack, architecture, DX, testing, build/release, maintenance, phased plans).
- Treat this skill as the documentation and decision playbook for the Obsidian plugin scope.
- Complement with implementation skill(s), do not replace issue execution workflow.

2. OpenCode runtime research and integration guidance:
- Use [$brainos-opencode-playbook](/Users/adri/.codex/skills/brainos-opencode-playbook/SKILL.md).
- Mandatory when defining or reviewing OpenCode integration decisions (server/SDK contract, HTTP + SSE events, auth, errors, timeouts, version compatibility, local ops, and testing strategy).
- Use this before coding when OpenCode behavior is version-sensitive or affects architecture.

3. Parallelizable issue batches:
- Use [$orchestrate-issue-swarm](/Users/adri/.codex/skills/orchestrate-issue-swarm/SKILL.md).
- Input: normalized `issues.json`.
- Output: `plan.json`, context files, prompts, worktree scripts.

4. Dependent/non-parallel issues:
- Use [$sequential-issue-coordinator](/Users/adri/.codex/skills/sequential-issue-coordinator/SKILL.md).
- Initialize queue from `plan.json`.
- Run one issue at a time (`start -> complete -> next`).

5. Worker execution for one issue:
- Use [$worker-issue-dev-pr](/Users/adri/.codex/skills/worker-issue-dev-pr/SKILL.md).
- Run preflight before coding.
- Implement only acceptance criteria.
- Produce PR-ready summary with `Closes #<n>`.

6. Context regeneration or patching:
- Use [$issue-context-packer](/Users/adri/.codex/skills/issue-context-packer/SKILL.md).
- Rebuild deterministic context when scope/acceptance/non-goals change.

## Branch and Merge Policy
- Set `--base-branch` explicitly when generating swarm plans. Do not assume `main`.
- Use deterministic worker branches (`<prefix>/issue-XX-...`).
- Use `codex/research/<tema>` for research branches.
- Ensure current worker branch matches the branch declared in context.
- For sequential flow, only advance queue after merge into queue `base_branch` (or issue `merge_target`).

## Mandatory Worker Contract
1. Restate objective, scope, and non-goals before edits.
2. Change only files required for acceptance criteria.
3. Run local validation relevant to touched code.
4. Report:
- changed files,
- validation commands/results,
- risks/follow-ups,
- PR summary with `Closes #<n>`.

## Validation Baseline (when applicable)
- `cd BrainOS/30-Implementation/mvp-http-client && npm test && npm run smoke`
- `cd BrainOS/30-Implementation/mvp-sse-adapter && npm test`
- `node --test BrainOS/30-Implementation/session/SessionStateManager.test.js`
- `node --test BrainOS/30-Implementation/mvp-review-ui/review-state.test.mjs`

## Guardrails
- Respect user-in-control methodology constraints.
- Do not add persistent conversational memory in MVP critical path.
- Do not change transport architecture beyond HTTP + SSE in MVP unless explicitly requested.
- Keep commits focused; avoid unrelated refactors.
