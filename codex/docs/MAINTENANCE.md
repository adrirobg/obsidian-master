# Runtime Maintenance

## Versioning Rules
1. Edit resources only in `codex/`.
2. Keep local runtime files (`~/.codex/*`) out of git.
3. Use one branch per runtime change set.

## Release Checklist
1. Run `codex/tests/smoke-test.sh`.
2. Run live check in `codex/fixtures/test-vault-zk`.
3. Sync local runtime with `codex/scripts/sync_codex_resources.sh`.
4. Commit with changelog summary in PR description.

## Ownership
- Agent contract: `codex/agents/`.
- Skills and metadata: `codex/skills/`.
- MCP templates: `codex/mcp/` and `codex/config/`.
- Fixtures/tests: `codex/fixtures/`, `codex/tests/`.
