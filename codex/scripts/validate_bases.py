#!/usr/bin/env python3
"""Validate Obsidian .base YAML files against a conservative schema subset."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

import yaml

ALLOWED_FILTER_KEYS = {"and", "or", "not"}


def validate_filter_tree(value, where, errors):
    if isinstance(value, str):
        return
    if not isinstance(value, dict):
        errors.append(f"{where}: filter must be string or map, got {type(value).__name__}")
        return
    for key, branch in value.items():
        if key not in ALLOWED_FILTER_KEYS:
            errors.append(f"{where}: invalid filter key '{key}'")
        if isinstance(branch, list):
            for idx, item in enumerate(branch):
                validate_filter_tree(item, f"{where}.{key}[{idx}]", errors)
        elif isinstance(branch, (str, dict)):
            validate_filter_tree(branch, f"{where}.{key}", errors)
        else:
            errors.append(
                f"{where}.{key}: filter branch must be list/string/map, got {type(branch).__name__}"
            )


def validate_base(path: Path):
    errors = []
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"{path}: YAML parse error: {exc}"]

    if not isinstance(data, dict):
        return [f"{path}: root must be a map"]

    if "filters" in data:
        validate_filter_tree(data["filters"], f"{path}:filters", errors)

    if "formulas" in data and not isinstance(data["formulas"], dict):
        errors.append(f"{path}:formulas must be a map")

    if "views" not in data:
        errors.append(f"{path}:missing required key 'views'")
    elif not isinstance(data["views"], list):
        errors.append(f"{path}:views must be a list")
    else:
        for i, view in enumerate(data["views"]):
            where = f"{path}:views[{i}]"
            if not isinstance(view, dict):
                errors.append(f"{where} must be a map")
                continue
            if "type" not in view:
                errors.append(f"{where} missing 'type'")
            if "filters" in view:
                validate_filter_tree(view["filters"], f"{where}.filters", errors)
            if "order" in view and not isinstance(view["order"], list):
                errors.append(f"{where}.order must be a list")

    return errors


def gather_targets(inputs):
    targets = []
    for raw in inputs:
        p = Path(raw)
        if p.is_dir():
            targets.extend(sorted(p.rglob("*.base")))
        elif p.is_file() and p.suffix == ".base":
            targets.append(p)
    return targets


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "paths",
        nargs="*",
        default=["codex/fixtures/test-vault-zk/50-Bases"],
        help="files or directories containing .base files",
    )
    args = parser.parse_args()

    targets = gather_targets(args.paths)
    if not targets:
        print("no .base files found")
        return 1

    all_errors = []
    for base_path in targets:
        all_errors.extend(validate_base(base_path))

    if all_errors:
        print("BASE VALIDATION FAILED")
        for err in all_errors:
            print(f"- {err}")
        return 1

    print(f"validated {len(targets)} .base files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
