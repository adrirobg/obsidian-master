---
name: zettelkasten-operator
description: Operate daily Zettelkasten workflows in an Obsidian vault. Use for capture triage, note classification, link proposals, and review queues with user-in-control decisions.
---

# Zettelkasten Operator

## Goal
Run capture/process/connect/review loops with structured decisions and minimal cognitive leakage.

## Modes
- `capture`
- `process`
- `connect`
- `review`

## Required Inputs
- Mode.
- Target note(s) or folder scope.
- Optional focus topic.

## Decision Rules
- Preserve idea ownership: do not author final permanent note argumentation.
- Prefer explicit links with rationale over link volume.
- Use `incubate` before `discard` when uncertainty is high.

## Output Contract
Return JSON-compatible object:

```json
{
  "mode": "capture|process|connect|review",
  "items": [
    {
      "note_path": "...",
      "decision": "keep_fleeting|promote_literature|candidate_permanent|incubate|discard",
      "confidence": 0.0,
      "priority": "high|medium|low",
      "next_action": "...",
      "needs_approval": true,
      "reasons": ["..."],
      "link_proposals": ["[[...]]"]
    }
  ],
  "warnings": ["..."],
  "pending_supervisor_validation": ["..."]
}
```

## Guardrails
- Never auto-delete notes.
- Never auto-promote to permanent final state.
- Always require approval for move/rename/archive actions.
