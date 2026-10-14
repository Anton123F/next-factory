# Build Project Map

Maintains per-directory `CLAUDE.md` file indexes so the architect agent can navigate the project without scanning.

## Modes

### Incremental (default — run after a developer agent finishes)

Check if `notes/pending-map-update.md` exists and is non-empty.
If it exists — run in incremental mode: update only the directories affected by the last dev run.

### Full rebuild

If `notes/pending-map-update.md` does not exist, check for `notes/project-structure.json`.
If it exists — run in full rebuild mode: re-index every file in the JSON.
If neither file exists, stop and tell the user:

> Nothing to process. Either run `python scripts/scan_project.py` for a full rebuild, or wait for a developer agent run to produce `notes/pending-map-update.md`.

@.claude/shared/map-builder-core.md
