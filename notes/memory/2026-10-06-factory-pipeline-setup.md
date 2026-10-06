# Session: Factory Pipeline Setup
Date: 2026-10-06

## Summary
User is building an AI feature factory — a pipeline of sub-agents (designer → architect → dev) that each produce artifacts to disk and pass work forward via a shared journal. The session was mostly building: we read the blueprint, created the folder structure, and built the designer agent. Left in a working state with designer complete; architect and dev agents still to be built.

## Decisions
- **Timestamped run folders**: Each factory run creates `.factory/artifacts/<YYYY-MM-DDTHH-MM-SS>/` — reason: full history isolation, each run is self-contained
- **`dev/` replaces `ui/` + `backend/` + `db/`**: Merged into a single `dev/` artifact folder — reason: simpler handoff, one agent owns all implementation
- **Designer scope is strictly UX**: Designer produces only `Feature Description` and `UX / Design Intent` — file lists and architecture decisions belong entirely to the architect
- **Agents are independent first**: Each agent must work standalone OR as part of a pipeline — no agent may reference another agent or assume a coordinator exists
- **Skill file = command directly**: A `.claude/commands/<name>.md` skill is the command itself; no separate loader file needed

## Rejected Alternatives
- **Separate `ui/`, `backend/`, `db/` folders**: Rejected in favor of unified `dev/` folder
- **Designer producing file lists**: Rejected — that is architect responsibility, not designer's
- **Separate loader command (`design.md`)**: Redundant once skill file is the command; removed

## Principles Established
- Coordinator reads only `journal.md` markers — never artifact content
- Journal is append-only; one line per completed step
- Sub-agents: read from disk, write to disk, stamp journal, done
- Each agent produces one clean artifact — nothing more

## Open Questions
- Architect agent: not yet built — needs to scan project file tree and produce `arch/` plan
- Dev agent: not yet built — consumes architect output and writes actual code
- Pipeline coordinator command: not yet built
