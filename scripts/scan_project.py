"""
Scans apps/ and outputs a JSON structure with extracted symbols per file.
Usage: python scripts/scan_project.py [output_path]
Default output: notes/project-structure.json
"""

import ast
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
APPS_DIR = ROOT / "apps"
DEFAULT_OUTPUT = ROOT / "notes" / "project-structure.json"


def extract_python_symbols(path: Path) -> list[str]:
    try:
        tree = ast.parse(path.read_text(encoding="utf-8"))
    except SyntaxError:
        return []

    symbols = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            decorators = []
            for d in node.decorator_list:
                if isinstance(d, ast.Attribute):
                    decorators.append(f"@{d.attr}")
                elif isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute):
                    decorators.append(f"@{d.func.attr}")
            prefix = "".join(decorators) + " " if decorators else ""
            symbols.append(f"{prefix}def {node.name}")
        elif isinstance(node, ast.ClassDef):
            symbols.append(f"class {node.name}")

    return symbols


def extract_ts_symbols(path: Path) -> list[str]:
    try:
        src = path.read_text(encoding="utf-8")
    except Exception:
        return []

    symbols = []

    if re.search(r"['\"]use client['\"]", src):
        symbols.append("'use client'")

    for m in re.finditer(r"export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+(\w+)", src):
        symbols.append(f"export {m.group(1)}")

    for m in re.finditer(r"(?:router|app)\.(get|post|put|delete|patch)\(['\"]([^'\"]+)['\"]", src):
        symbols.append(f"{m.group(1).upper()} {m.group(2)}")

    return symbols


def scan() -> list[dict]:
    entries = []

    for path in sorted(APPS_DIR.rglob("*")):
        if not path.is_file():
            continue
        if any(p in path.parts for p in ("__pycache__", "node_modules", ".next", ".venv")):
            continue

        rel = path.relative_to(ROOT).as_posix()
        suffix = path.suffix.lower()

        if suffix == ".py":
            symbols = extract_python_symbols(path)
            file_type = "python"
        elif suffix in (".ts", ".tsx"):
            symbols = extract_ts_symbols(path)
            file_type = "typescript"
        else:
            symbols = []
            file_type = suffix.lstrip(".") or "unknown"

        entries.append({
            "path": rel,
            "type": file_type,
            "symbols": symbols,
        })

    return entries


def main():
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUTPUT
    output.parent.mkdir(parents=True, exist_ok=True)

    entries = scan()
    output.write_text(json.dumps(entries, indent=2), encoding="utf-8")
    print(f"Scanned {len(entries)} files -> {output}")


if __name__ == "__main__":
    main()
