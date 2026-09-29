# /save — Save Session Memory

When the user invokes `/save`, do the following:

## Step 1 — Extract from the current conversation

Review the entire conversation and extract only what is worth remembering long-term:

- **Decisions made** — what was chosen and why (e.g. "chose MinIO over S3 because we want free local dev with an easy swap path later")
- **Rejected alternatives** — what was considered but discarded and the reason
- **Architecture principles** — rules or patterns agreed on (e.g. "adapter pattern for all external services")
- **Scope boundaries** — what is explicitly out of scope and why
- **Open questions** — things not yet decided but flagged for later

Do NOT save: code snippets, file contents, step-by-step instructions, or anything already in CLAUDE.md.
Only save reasoning and context that would be lost if the conversation were deleted.

## Step 2 — Write the memory file

Determine today's date. Save the file to:

```
notes/memory/YYYY-MM-DD-<short-slug>.md
```

Where `<short-slug>` is 2-4 words describing the session topic (e.g. `2026-09-29-storage-adapter-decision`).

File format:

```markdown
# Session: <topic>
Date: YYYY-MM-DD

## Summary
2-4 sentences describing: what the user was trying to accomplish, how the conversation
was spent (e.g. mostly Q&A, mostly building, mostly debugging), and what state the
project was left in at the end of the session.

## Decisions
- **<decision title>**: <what was decided> — *Reason: <why>*

## Rejected Alternatives
- **<option>**: rejected because <reason>

## Principles Established
- <principle>

## Open Questions
- <question>
```

Only include sections that have content. Skip empty sections.

## Step 3 — Confirm to the user

Tell the user: what file was saved and how many items were captured. One sentence.
