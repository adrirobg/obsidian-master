---
name: obsidian-safe-editor
description: Safely edit Obsidian files (.md, .base, .canvas) with reversible patches and validation checks. Use when applying structured updates that must avoid destructive changes.
---

# Obsidian Safe Editor

## Goal
Apply deterministic, reviewable edits to Obsidian files while minimizing risk.

## Supported Files
- `.md`
- `.base`
- `.canvas`

## Workflow
1. Read target file and detect format.
2. Build patch proposal.
3. Validate format-specific constraints.
4. Apply only approved changes.
5. Return before/after summary.

## `.base` Validation Rules
- Root must be YAML map.
- `views` must be a list.
- Any `filters` value must be a string or map (`and|or|not`).
- Reject list-only filters as invalid contract.

## Output Contract
Return JSON-compatible object:

```json
{
  "file": "...",
  "format": "md|base|canvas",
  "changed": true,
  "patch_summary": ["..."],
  "validation": {
    "passed": true,
    "errors": []
  },
  "needs_approval": false
}
```

## Guardrails
- No destructive overwrite without explicit approval.
- No bulk operations without dry-run preview.
- Preserve user-authored semantic content unless explicitly requested.
