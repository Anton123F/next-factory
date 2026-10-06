# AI Factory Blueprint — Page Feature Factory

## Factory shape

A **coordinator** drives a sequential chain of **sub-agents**.
The coordinator holds no artifact content in context — only status markers from a shared journal.
Sub-agents write artifacts to disk, stamp the journal, and return a single "done" signal.

---

## Coordinator contract

**What it holds:**
- The ordered step plan (this file's agent chain table)
- The path to `journal.md`
- The current step index

**What it does NOT hold:**
- Artifact content — it never reads artifact bodies
- Sub-agent output beyond the done signal

**Loop:**
1. Read `journal.md` — find the last `[DONE]` entry
2. Verify the artifact path in that entry exists on disk
3. Spawn the next agent in the plan, passing: task description + artifact path from previous step
4. Wait for sub-agent's standard done message
5. Re-read `journal.md` to confirm the new entry was written
6. Advance step index → repeat until all steps are done

---

## Journal format (`journal.md`)

One line per completed step, append-only:

```
[DONE] <agent-name> | artifact: <relative/path/to/artifact/folder> | step: <N>
```

Example after two steps complete:
```
[DONE] designer  | artifact: .factory/artifacts/design | step: 1
[DONE] architect | artifact: .factory/artifacts/arch   | step: 2
```

The coordinator reads only this file — no artifact content ever enters coordinator context.

---

## Sub-agent contract

**Inputs received from coordinator:**
- Task description for this step
- Path to previous step's artifact folder (taken from journal)

**Responsibilities:**
- Read the previous artifact(s) from the provided path
- Do the work within its area of expertise
- Write output file(s) to its own designated artifact folder

**Outputs:**
- Artifact files written to: `.factory/artifacts/<agent-name>/`
- Journal entry appended: `[DONE] <agent-name> | artifact: .factory/artifacts/<agent-name> | step: <N>`
- Return to coordinator: one message only — `"Step <N> complete."`

Sub-agents never return artifact content to the coordinator.

---

## Agent chain — page feature factory

| Step | Agent | Reads | Produces | Artifact folder |
|------|-------|-------|----------|-----------------|
| 1 | **designer** | task brief from coordinator | `design-plan.md` — page layout, component list, UX notes, what must be drawn (no code, design intent only) | `.factory/artifacts/design/` |
| 2 | **architect** | `design-plan.md` + project file tree scan | `ui-plan.md` — UI files to create/modify + component logic; `backend-plan.md` — routes/services/handlers + business logic; `db-plan.md` — schema changes, migrations, seeds | `.factory/artifacts/arch/` |
| 3 | **ui** | `ui-plan.md` + `design-plan.md` | UI implementation: components, layout, styles, page wiring | `.factory/artifacts/ui/` or direct project files |
| 4 | **backend** | `backend-plan.md` | Backend implementation: routes, handlers, services, business logic | `.factory/artifacts/backend/` or direct project files |
| 5 | **db** | `db-plan.md` | Schema changes, migrations, seed data | `.factory/artifacts/db/` or direct project files |

---

## Artifact folder layout

```
.factory/
  blueprint.md        ← this file (coordinator reads at start)
  journal.md          ← shared state, append-only
  artifacts/
    design/           ← designer output
    arch/             ← architect output (ui-plan.md, backend-plan.md, db-plan.md)
    ui/               ← ui agent output
    backend/          ← backend agent output
    db/               ← db agent output
```

---

## How to instantiate on a new project

1. Create the `.factory/` tree above at the project root
2. Place this file at `.factory/blueprint.md`
3. Place `full-workflow.md` in `.claude/commands/full-workflow.md`
5. Create an empty `.factory/journal.md`

**To run:**
```
/full-workflow "build the login page — needs form validation and error states"
```

The coordinator boots, reads the journal to find its step, and drives the chain.
Same command resumes a partial run — journal position is the only state that matters.

---

## Rules for the instantiating model

- **Coordinator context is sacred** — it reads journal markers only, never artifact bodies
- **Sub-agents are stateless** — read from disk, write to disk, stamp journal, exit
- **Journal is append-only** — never rewrite or delete entries
- **No done entry = not done** — if a step has no journal entry, coordinator re-spawns it (MAX ATTEMPS IS 2)
- **Artifact folders are the handoff** — not return values, not coordinator context
- **Step count is flexible** — add or remove agents by editing the chain table; the coordinator loop doesn't change
- **Always sequential** — agents run one at a time, in chain table order, no exceptions; parallel execution only if the user explicitly requests it in the task brief
