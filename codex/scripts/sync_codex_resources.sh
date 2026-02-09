#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
SKILLS_SRC="$ROOT_DIR/skills"
SKILLS_DEST="$CODEX_HOME_DIR/skills"

mkdir -p "$SKILLS_DEST"

for skill_dir in "$SKILLS_SRC"/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  dest="$SKILLS_DEST/$skill_name"
  mkdir -p "$dest"
  rsync -a --delete "$skill_dir/" "$dest/"
  echo "synced skill: $skill_name -> $dest"
done

echo "done. restart Codex to pick up updated skills."
