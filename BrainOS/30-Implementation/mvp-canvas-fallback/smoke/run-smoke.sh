#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

cp "$ROOT_DIR/fixtures/sample.canvas" "$WORK_DIR/board.canvas"

node "$ROOT_DIR/src/cli.js" validate "$WORK_DIR/board.canvas"
node "$ROOT_DIR/src/cli.js" propose "$WORK_DIR/board.canvas" "$ROOT_DIR/fixtures/sample-proposed.json"
node "$ROOT_DIR/src/cli.js" validate "$WORK_DIR/board-suggested.canvas"
node "$ROOT_DIR/src/cli.js" apply "$WORK_DIR/board.canvas" --approve

echo "SMOKE_OK"
