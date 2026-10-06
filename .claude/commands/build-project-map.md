# Build Project Map

Reads a pre-scanned project structure and writes `notes/project-map.md`.

## Usage
```
/build-project-map
```

## Instructions

The structure file path is always `notes/project-structure.json`.

Before doing anything else, check if `notes/project-structure.json` exists by attempting to read it.
If the file does not exist, stop immediately and tell the user:

> `notes/project-structure.json` not found. Run `python scripts/scan_project.py` first, then retry.

Do not proceed further if the file is missing.

@.claude/shared/map-builder-core.md
