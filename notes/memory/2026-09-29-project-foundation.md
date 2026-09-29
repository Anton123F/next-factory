# Session: Project Foundation & Architecture
Date: 2026-09-29

## Summary
User wanted to start a study project to practice applying AI to a real-world app, choosing a YouTube clone as the target. Most of the session was spent on Q&A — discussing tech stack, architecture tradeoffs, and tooling setup. By the end, the full foundation was established: CLAUDE.md written, monorepo structure defined, adapter pattern agreed on, Phase 1 scope locked, and the `/save` memory command created. The session also refined the `/save` command to include a session Summary section, and corrected a mistake where the command was initially placed in `skills/` instead of `commands/`. No code was written yet.

## Decisions

- **Project type**: YouTube clone — production-close study app, not a toy. Every decision must reflect how a real platform would be built.
- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui for frontend; FastAPI (Python) for backend; PostgreSQL + SQLAlchemy (async) + Alembic for DB; Redis for cache/queue broker; Celery + FFmpeg for video processing; MinIO for local video storage.
- **Adapter pattern for storage**: All storage goes through a `StorageService` interface. MinIO is the current implementation. S3 adapter added later behind the same interface — no app code changes, only config (`STORAGE_BACKEND` env var). Same pattern applies to queue backend (Redis → SQS) and DB (local Postgres → RDS).
- **Monorepo structure**: `apps/web`, `apps/api`, `services/worker` — clean boundary between HTTP handlers and async workers from day one.
- **HLS streaming mandatory**: No plain MP4 delivery. FFmpeg outputs `playlist.m3u8` + `.ts` segments. Non-retrofittable decision.
- **Async video pipeline**: Upload → MinIO (raw) → Celery job → FFmpeg transcode → HLS chunks → MinIO → DB status update. HTTP handler never touches FFmpeg.
- **Auth**: Custom JWT (access 15min + refresh 7 days, httpOnly cookie, rotation on every refresh). No third-party auth SaaS — more educational.
- **`notes/` folder**: Flat folder for architectural decisions, ideas, roadmap. Naming: `decision-*.md`, `idea-*.md`, `roadmap-*.md`. Reorganize into subfolders only when navigation becomes painful.
- **`/save` command**: `.claude/commands/save.md` — project-level slash command to save session memory to `notes/memory/`. Must be in `commands/` not `skills/` to be invokable as a `/` command.
- **Session Summary in memory files**: each `notes/memory/` file must include a `## Summary` section describing what the user was trying to do, how the session was spent, and what state the project was left in.

## Rejected Alternatives

- **AWS S3 from the start**: Rejected because it costs money. MinIO gives the same S3-compatible API locally for free. Swap is a config change, not a code change.
- **Third-party auth (Clerk/Auth0)**: Rejected in favor of custom JWT — more educational for a study project.
- **Pages Router**: Rejected — App Router only throughout.
- **Synchronous video processing**: Rejected — blocking HTTP on FFmpeg does not scale.

## Principles Established

- Every external service (storage, queue, DB) must be behind an adapter interface — swap implementations via config, not code changes.
- Business logic lives in service layer, never in route handlers or Celery tasks.
- Tasks orchestrate; services contain logic.
- No N+1 queries — use `selectinload`/`joinedload` from the start.
- Video chunks served directly from MinIO/S3, never proxied through the API server.

## Open Questions

- None currently — Phase 1 scope is locked.
