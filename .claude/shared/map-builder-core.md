# Map Builder Core

You maintain per-directory `CLAUDE.md` files using a two-level navigation structure. Existing content (conventions, rules, notes) is never touched — you only manage `## File Index` and `## Directory Index` sections.

## Two-level structure

**Top-level CLAUDE.md** (e.g. `apps/api/CLAUDE.md`) — describes what lives one level below:
- `## File Index` for files directly in that directory
- `## Directory Index` for immediate subdirectories

**Sub-directory CLAUDE.md** (e.g. `apps/api/services/CLAUDE.md`) — describes files inside that directory:
- `## File Index` only (files, no further drill-down unless the subdir is large)

**Rule — when to use Directory Index vs File Index:**
- Directory has **> 3 files or subdirs** → use `## Directory Index` (list subdirs, not individual files)
- Directory has **≤ 3 files or subdirs** → use `## File Index` (list files directly)
- Mixed (root-level files + subdirs in the same directory) → use both sections

## Input formats

**Incremental** — entries from `notes/pending-map-update.md`:
```
- `apps/api/services/auth.py` — added register() async function...
```

**Full rebuild** — entries from `notes/project-structure.json`:
```json
{ "path": "apps/api/services/auth.py", "type": "python", "symbols": ["register", "login"] }
```

## Steps

### 1. Collect file entries

**Incremental:** read `notes/pending-map-update.md`. Each `- \`path\` — description` line is one entry. Reuse the description from the file — do not re-read the source file unless the description is missing.

**Full rebuild:** read `notes/project-structure.json`. For each entry, read the actual source file, focus on `entry.symbols`, and write a description yourself.

Skip: test files, `__init__.py` with no content, config stubs.

### 2. Determine affected CLAUDE.md files

For each changed file path, two CLAUDE.md files may need updating:
- The **sub-directory CLAUDE.md** for the file's parent directory (file-level entry)
- The **parent's parent CLAUDE.md** if the subdirectory is new (directory-level entry)

### 3. Update each CLAUDE.md

**If the file exists:**
- Read it fully.
- Locate the relevant section (`## File Index` or `## Directory Index`).
  - If it exists: update entries for files in this batch. Preserve all other entries and all content outside the section exactly as-is.
  - If it does not exist: append the section at the very end.

**If the file does not exist:**
- Create it with only the relevant section(s). No rules or conventions — those belong in the parent CLAUDE.md.

### 4. Format

**File Index:**
```markdown
## File Index
- `auth.py`  — Login and registration logic, bcrypt, uniqueness checks
- `token.py` — Creates and decodes HS256 access and refresh JWTs
```

**Directory Index:**
```markdown
## Directory Index
- `services/` — business logic: auth, token issuance (see services/CLAUDE.md)
- `core/`     — config, DB session, auth dependency, exceptions (see core/CLAUDE.md)
```

Rules:
- **File Index:** filename only (no directory prefix). Max 12 words. State what it does, not what it contains.
- **Directory Index:** directory name with trailing `/`. One-line purpose summary. Add `(see subdir/CLAUDE.md)` if that file exists.
- Name key dependencies or consumers if obvious.

### 6. Report

List which CLAUDE.md files were created or updated and how many entries changed. Nothing else.
