#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -lt 1 ]]; then
  echo "Uso: $0 <ruta-apunte-1.md> [ruta-apunte-2.md ...]" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VAULT_IMPORTS_DIR="$ROOT_DIR/Test-Vault-Zettelkasten/00-Inbox/Imports"
TODAY="$(date +%F)"

mkdir -p "$VAULT_IMPORTS_DIR"

for SRC in "$@"; do
  if [[ ! -f "$SRC" ]]; then
    echo "[skip] No existe: $SRC" >&2
    continue
  fi

  BASE="$(basename "$SRC")"
  STEM="${BASE%.md}"
  SAFE_STEM="$(echo "$STEM" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  DEST="$VAULT_IMPORTS_DIR/APUNTE-IMPORT-$SAFE_STEM.md"

  {
    echo "# Apunte importado - $STEM"
    echo
    echo "import_source: $SRC"
    echo "imported_on: $TODAY"
    echo
    echo "---"
    echo
    sed -n '1,120p' "$SRC"
  } > "$DEST"

  echo "[ok] $SRC -> $DEST"
done
