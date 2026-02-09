# Context7 MCP Integration

Use Context7 as a fallback source for up-to-date docs when local skill references are insufficient.

## Policy
1. Prefer local skill references for stable vault workflow rules.
2. Use Context7 for volatile APIs, setup details, or version-specific docs.
3. Record source URL and consultation date in decisions.

## Opencode Snippet
Use `codex/config/opencode.context7.example.json` as base.

## Codex Runtime
Keep `~/.codex/config.toml` minimal and local. Store only templates in this repo.
