# Idea Backlog: Obsidian CLI Applicability for BrainOS

Date: 2026-02-11

Scoring model:
- Impact (1-5), Effort (1-5), Risk (1-5), Stability (1-5), Guardrail alignment (1-5)
- Priority score = `Impact + Stability + Guardrail alignment - Effort - Risk`

| ID | Idea | Flow | Impact | Effort | Risk | Stability | Guardrail alignment | Priority score |
|---|---|---|---:|---:|---:|---:|---:|---:|
| I01 | Auto reload plugin after local build (`plugin:reload`) | plugin_dev_cycle | 5 | 1 | 1 | 3 | 5 | 11 |
| I02 | Screenshot runner for visual regression (`dev:screenshot`) | plugin_dev_cycle | 4 | 2 | 1 | 3 | 5 | 9 |
| I03 | Error buffer scraper (`dev:errors`) in test scripts | plugin_dev_cycle | 4 | 2 | 1 | 3 | 5 | 9 |
| I04 | Console capture bundle (`dev:console`) for issue triage | plugin_dev_cycle | 4 | 2 | 1 | 3 | 5 | 9 |
| I05 | Command bridge to run BrainOS plugin commands (`command`) | command_bridge | 5 | 3 | 3 | 2 | 4 | 5 |
| I06 | Enumerate command IDs dynamically (`commands`) | command_bridge | 4 | 2 | 2 | 2 | 5 | 7 |
| I07 | Read-only note intake snapshot (`read` + `diff`) | flow_a_current_note_review | 4 | 2 | 1 | 2 | 5 | 8 |
| I08 | History-aware review hints (`history:list`) | flow_a_current_note_review | 3 | 2 | 1 | 2 | 5 | 7 |
| I09 | Inbox candidate scanner (`files` + `search`) | flow_b_inbox_batch | 4 | 3 | 2 | 2 | 5 | 6 |
| I10 | Task-centric triage (`tasks` + `tasks daily`) | flow_b_inbox_batch | 4 | 2 | 2 | 2 | 5 | 7 |
| I11 | Backlink pre-check before suggestion apply (`backlinks`) | flow_a_current_note_review | 3 | 2 | 1 | 2 | 5 | 7 |
| I12 | Outgoing links quality check (`links`) | flow_a_current_note_review | 3 | 2 | 1 | 2 | 5 | 7 |
| I13 | Daily capture append helper (`daily:append`) | daily_capture_loop | 4 | 2 | 2 | 2 | 4 | 6 |
| I14 | Daily task toggling helper (`task daily`) | daily_capture_loop | 3 | 2 | 2 | 2 | 4 | 5 |
| I15 | Workspace preset opener for review session (`workspace:load`) | workspace_orchestration | 3 | 3 | 2 | 2 | 5 | 5 |
| I16 | Open focused tabs for review context (`tab:open`) | workspace_orchestration | 3 | 2 | 2 | 2 | 5 | 6 |
| I17 | Recents-based re-entry routine (`recents`) | workspace_orchestration | 2 | 1 | 1 | 2 | 5 | 7 |
| I18 | Property health report (`properties all counts`) | flow_b_inbox_batch | 3 | 3 | 2 | 2 | 4 | 4 |
| I19 | Tag hygiene report (`tags counts`) | daily_capture_loop | 3 | 2 | 1 | 2 | 5 | 7 |
| I20 | Sync status health card (`sync:status`) | runtime_ops | 2 | 2 | 1 | 2 | 5 | 6 |
| I21 | Vault diagnostics snapshot (`vault info=size`) | runtime_ops | 2 | 2 | 1 | 2 | 5 | 6 |
| I22 | Controlled create draft note (`create silent`) with manual review | flow_a_current_note_review | 3 | 3 | 4 | 2 | 2 | 0 |
| I23 | Controlled move after explicit approval (`move`) | flow_b_inbox_batch | 3 | 3 | 4 | 2 | 2 | 0 |
| I24 | Automated delete from inbox (`delete`) | flow_b_inbox_batch | 2 | 2 | 5 | 2 | 1 | -2 |

## Observations
1. Top score cluster is developer DX (`I01-I04`) due high value and minimal guardrail impact.
2. Read-only context enrichment (`I07-I12`) is viable post-MVP with moderate effort.
3. Write-path automation (`I22-I24`) has poor score due methodology and safety risk.
4. `I24` is anti-pattern for MVP and marked as no-go candidate.
