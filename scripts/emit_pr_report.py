#!/usr/bin/env python3
"""
Emit a standardized worker PR-ready report scaffold.
"""

from __future__ import annotations

import argparse
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Emit a worker issue-dev-pr report.")
    parser.add_argument("--issue-number", type=int, required=True)
    parser.add_argument("--status", choices=("si", "no"), default="si")
    parser.add_argument("--changed", action="append", default=[])
    parser.add_argument("--validation", action="append", default=[])
    parser.add_argument("--risk", action="append", default=[])
    parser.add_argument("--next-step", action="append", default=[])
    parser.add_argument("--source", action="append", default=[])
    return parser.parse_args()


def format_bullets(items: list[str], fallback: str) -> str:
    if not items:
        return f"- {fallback}"
    return "\n".join(f"- {item}" for item in items)


def main() -> int:
    args = parse_args()
    if args.status == "si" and not args.validation:
        print("[ERROR] Provide at least one --validation item when status=si.", file=sys.stderr)
        return 1

    print(f"**Objetivo cumplido**\n- {args.status}")
    print("\n**Archivos creados/modificados**")
    print(format_bullets(args.changed, "Sin cambios reportados."))
    print("\n**Validación local**")
    print(format_bullets(args.validation, "No se ejecutó validación local."))
    print("\n**Riesgos/follow-ups**")
    print(format_bullets(args.risk, "Sin riesgos adicionales identificados."))
    print("\n**Resumen listo para PR**")
    print(f"- Closes #{args.issue_number}")
    print(format_bullets(args.next_step, "What changed / Why / Validation / Risks listos para PR."))
    if args.source:
        print("\n**Sources consulted**")
        print(format_bullets(args.source, "N/A"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
