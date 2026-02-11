# Capability Catalog: Obsidian CLI (official contract)

Date: 2026-02-11  
Primary source: [Obsidian CLI](https://help.obsidian.md/cli)

## Method
- Parsed official Obsidian CLI markdown source from the published help page.
- Extracted all command sections (`### \`command\``) and normalized fields into `capability-catalog.json`.
- Captured parameter/flag names from each command syntax block.

Machine-readable catalog: `capability-catalog.json` (112 commands).

## Source-backed constraints
1. Obsidian CLI is early access and can change.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applies to BrainOS because we must treat CLI integration as optional and compatibility-gated.

2. CLI requires Obsidian 1.12+ and Catalyst at this stage.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applies because current operational assumption is no Catalyst now; immediate implementation cannot depend on this path.

3. CLI is app-connected; first command launches Obsidian if needed.
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applies because command execution has desktop/runtime coupling implications for automation design.

4. Developer commands exist and explicitly support plugin development workflows (`plugin:reload`, `dev:*`, `eval`).
- Source: [https://help.obsidian.md/cli](https://help.obsidian.md/cli)
- Applies because BrainOS plugin DX can benefit immediately when Catalyst lane is available.

## Domain distribution (normalized)
| Domain | Commands |
|---|---:|
| `files_folders` | 27 |
| `workspace` | 12 |
| `developer` | 10 |
| `plugins` | 9 |
| `themes_snippets` | 9 |
| `commands` | 8 |
| `sync` | 7 |
| `publish` | 6 |
| `links` | 5 |
| `bases` | 4 |
| `daily` | 4 |
| `templates` | 3 |
| `bookmarks` | 2 |
| `search` | 2 |
| `tags` | 2 |
| `tasks` | 2 |

## High-value command families for BrainOS analysis
1. Content and file manipulation
- `read`, `append`, `prepend`, `create`, `move`, `delete`, `diff`, `history:*`.

2. Workflow and triage support
- `daily`, `daily:append`, `tasks`, `task`, `search`, `tags`, `links`, `backlinks`.

3. Plugin and command orchestration
- `commands`, `command`, `plugin:reload`, `plugin:enable`, `plugin:disable`.

4. Development instrumentation
- `dev:screenshot`, `dev:console`, `dev:errors`, `dev:dom`, `eval`.

5. Workspace control
- `workspace`, `workspaces`, `tab:open`, `recents`, `vault`.

## Catalog field contract
`capability-catalog.json` uses:
- `command`
- `domain`
- `params`
- `flags`
- `requires_desktop`
- `requires_catalyst`
- `stability_level`
- `notes`

## Notes
- Current catalog marks all commands as `requires_desktop=true` and `requires_catalyst=true` due the present early-access gate documented in official CLI docs.
- Stability is set to `early-access` globally until Obsidian marks CLI as stable GA.
