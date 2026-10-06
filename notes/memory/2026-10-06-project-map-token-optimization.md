# Session: Project Map & Token Optimization
Date: 2026-10-06

## Summary
The session focused on diagnosing why the architect agent consumed too many tokens (vague "scan relevant dirs" instruction caused defensive over-exploration), then designing and building a pre-computed project index system to fix it. Mostly a design + build session. Left in a working state: script written, command created, architect updated to use the map.

## Decisions
- **Pre-computed project map**: introduced `notes/project-map.md` as a static index agents read instead of scanning directories — *Reason: scanning is expensive and vague prompts cause agents to explore defensively*
- **Two-stage generation**: Python script (`scripts/scan_project.py`) does free static analysis (AST/regex symbol extraction), then `/build-project-map` agent reads files and writes descriptions — *Reason: static analysis is instant and token-free; agent only reads files once per map regeneration*
- **Static JSON path**: `/build-project-map` always reads `notes/project-structure.json` with no arguments — *Reason: simplicity; removes ambiguity*
- **Hard stop on missing map**: both `/build-project-map` and architect-core stop immediately if their required input file is missing, with a clear recovery instruction — *Reason: silent fallback to scanning would defeat the purpose*
- **Always overwrite map**: `map-builder-core.md` fully rewrites `notes/project-map.md` on every run — *Reason: appending would accumulate stale entries*

## Rejected Alternatives
- **Architect scanning directories itself**: rejected because vague scope causes over-exploration and wastes tokens on every architect run
- **Passing JSON path as argument to `/build-project-map`**: rejected in favor of a static path to keep the command simple and unambiguous

## Principles Established
- Agents explore broadly when given vague mandates — explicit "do not glob, use only X" constraints are required
- Split expensive work: cheap static tooling first, targeted AI reading second
- Pre-computed indexes pay a one-time token cost that is recouped on every future agent run

## Open Questions
- `notes/project-map.md` will go stale as new files are added — no automated refresh trigger exists yet; user must re-run manually
- `scripts/scan_project.py` only covers `apps/` — `services/worker/` is not scanned yet
