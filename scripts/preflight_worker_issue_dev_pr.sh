#!/usr/bin/env bash
set -euo pipefail

context_path="${1:-.codex-issue-context.md}"

echo "[INFO] Running worker preflight..."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[ERROR] Not inside a git worktree."
  exit 1
fi

branch="$(git branch --show-current)"
if [[ -z "${branch}" ]]; then
  echo "[ERROR] Could not detect current branch."
  exit 1
fi

if [[ ! -f "${context_path}" ]]; then
  echo "[ERROR] Context file not found: ${context_path}"
  exit 1
fi

if [[ ! -f "AGENTS.md" ]]; then
  echo "[WARN] AGENTS.md not found in current directory."
  echo "[WARN] Ensure applicable AGENTS.md instructions are loaded from parent scope."
fi

if ! rg -q "issue->dev->PR" "${context_path}"; then
  echo "[WARN] Context file does not include explicit issue->dev->PR marker."
fi

expected_branch="$(sed -n 's/^Trabaja solo en la rama //p' "${context_path}" | head -n 1)"
expected_branch="${expected_branch%.}"
expected_branch="$(printf '%s' "${expected_branch}" | sed 's/[[:space:]]*$//')"
if [[ -n "${expected_branch}" && "${expected_branch}" != "${branch}" ]]; then
  echo "[ERROR] Current branch '${branch}' does not match context branch '${expected_branch}'."
  exit 1
fi
if [[ -z "${expected_branch}" ]]; then
  echo "[WARN] Context file does not include explicit branch line."
fi

echo "[OK] Preflight passed for branch '${branch}'."
echo "[OK] Context file: ${context_path}"
