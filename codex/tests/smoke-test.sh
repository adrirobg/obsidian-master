#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$ROOT_DIR/scripts/validate_bases.py" "$ROOT_DIR/fixtures/test-vault-zk/50-Bases"

for required in \
  "$ROOT_DIR/agents/AGENTS-OBSIDIAN-VAULT.md" \
  "$ROOT_DIR/skills/vault-bootstrap/SKILL.md" \
  "$ROOT_DIR/skills/zettelkasten-operator/SKILL.md" \
  "$ROOT_DIR/skills/obsidian-safe-editor/SKILL.md"; do
  [ -f "$required" ] || { echo "missing required file: $required"; exit 1; }
done

echo "smoke test passed"
