---
name: vault-bootstrap
description: Bootstrap or audit an Obsidian vault for BrainOS workflows. Use when creating a new vault structure, installing templates, validating base folders, or preparing a safe test vault.
---

# Vault Bootstrap

## Goal
Create a consistent operational baseline in an Obsidian vault without destructive changes.

## Inputs
- Vault root path.
- Optional target profile (`minimal` default).
- Optional overwrite policy (`never` default).

## Workflow
1. Detect vault root and `.obsidian/` presence.
2. Ensure base folders exist:
- `00-Inbox`
- `10-Literature`
- `20-Permanent`
- `30-Index`
- `40-Projects`
- `50-Bases`
- `99-Templates`
3. Ensure template files exist (create only missing by default).
4. Ensure baseline `.base` views exist in `50-Bases`.
5. Return a dry-run summary and required approvals for any overwrite.

## Output Contract
Return JSON-compatible object:

```json
{
  "vault_root": "...",
  "created": ["..."],
  "updated": ["..."],
  "skipped": ["..."],
  "needs_approval": ["..."],
  "warnings": ["..."]
}
```

## Guardrails
- Never overwrite existing files unless explicitly approved.
- Never delete files/folders.
- Keep paths relative to vault root.
