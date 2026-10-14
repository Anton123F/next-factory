#!/usr/bin/env python3
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
ARTIFACTS_DIR = ROOT / ".factory" / "artifacts"
OUTPUT_FILE = ROOT / "notes" / "pending-map-update.md"
LAST_PROCESSED = ROOT / ".factory" / "last-processed-dev-result.txt"

SECTIONS = [
    "## Newly Created Files",
    "## Newly Created Directories",
    "## Modified Files",
]

def find_latest() -> Path | None:
    results = sorted(ARTIFACTS_DIR.glob("*/dev/dev-result.md"))
    return results[-1] if results else None


def already_processed(path: Path) -> bool:
    return LAST_PROCESSED.exists() and LAST_PROCESSED.read_text().strip() == str(path)


def extract(text: str) -> list[str]:
    lines_out = []
    current = None
    for line in text.splitlines():
        s = line.strip()
        if s in SECTIONS:
            current = s
            lines_out.append(f"\n{s}")
        elif current and s.startswith("- "):
            lines_out.append(s)
        elif s.startswith("## ") and s not in SECTIONS:
            current = None
    return lines_out


def main():
    latest = find_latest()
    if not latest or already_processed(latest):
        sys.exit(0)

    entries = extract(latest.read_text(encoding="utf-8"))
    if not entries:
        sys.exit(0)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        "# Pending Map Update\n" + "\n".join(entries) + "\n",
        encoding="utf-8",
    )
    LAST_PROCESSED.write_text(str(latest), encoding="utf-8")
    print(f"[map-update] wrote {OUTPUT_FILE.name} from {latest.parent.parent.name}")


if __name__ == "__main__":
    main()
