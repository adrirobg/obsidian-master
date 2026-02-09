# Codex Runtime Resources

This directory is the versioned source of truth for local runtime resources used to work with Obsidian vaults.

## Scope
- Agent contract for vault operations.
- Obsidian-oriented skills.
- MCP integration templates (Context7).
- Test fixtures and smoke tests.
- Sync scripts for local runtime installation.

## Layout
- `agents/`: agent operating contract.
- `skills/`: installable skills (`SKILL.md` + `agents/openai.yaml`).
- `config/`: config templates/snippets.
- `mcp/`: MCP integration docs/snippets.
- `fixtures/`: test vault and templates.
- `scripts/`: sync and validation scripts.
- `tests/`: smoke tests.
- `research/`: source analysis and transcript-derived docs.

## Operating Model
1. Edit resources in this folder.
2. Run `codex/tests/smoke-test.sh`.
3. Sync to local runtime with `codex/scripts/sync_codex_resources.sh`.
4. Validate behavior in `codex/fixtures/test-vault-zk`.
