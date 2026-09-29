# next-factory — CLAUDE.md

## Session Start Protocol

At the beginning of every new conversation in this project:

1. Ask the user **once**: "Found saved session notes. Want me to load them before we start?"
2. If they say yes — invoke the `load-session` command (`.claude/commands/load-session.md`) and follow its instructions. Do not load older sessions unless the user explicitly asks.
3. If the user says no — proceed normally

Ask only once. Never ask again mid-conversation.

---

## Project Overview

A production-close YouTube clone built for studying applied AI and modern full-stack architecture.
The goal is not a toy app — every decision should reflect how a real platform would be built,
starting small and expanding modularly.

## Monorepo Structure

```
next-factory/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # FastAPI backend
├── services/
│   └── worker/       # Celery worker (video processing)
├── notes/            # Architectural decisions, ideas, roadmap
└── docker-compose.yml
```

Never collapse these into a single app. The boundary between `apps/api` and `services/worker`
must stay clean — the worker only consumes jobs from the queue, never handles HTTP.

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router only — no Pages Router |
| Styling | Tailwind CSS + shadcn/ui | No raw CSS files; use Tailwind utilities |
| API | FastAPI (Python 3.11+) | Async endpoints throughout |
| ORM | SQLAlchemy 2.x (async) + Alembic | Never raw SQL except for complex analytics |
| Database | PostgreSQL | Run locally via Docker |
| Cache / Queue broker | Redis | Sessions, rate limiting, Celery broker |
| Video processing | Celery + FFmpeg | All transcoding is async — never block HTTP |
| Video storage | MinIO (local) | S3-compatible; swap to AWS S3 via adapter |
| Auth | JWT (access + refresh tokens) | Custom implementation — no third-party auth SaaS |

## Adapter Pattern

All external services (storage, queue, DB) sit behind an interface — swap via config, never code.
Details and code structure: `apps/api/storage/CLAUDE.md` (loaded automatically when working in that folder).

## Video Processing Pipeline

Upload flow must always be asynchronous:

```
Client → POST /videos/upload → save raw file to MinIO → enqueue Celery job → return 202
                                                                ↓
                                              worker: FFmpeg transcode → HLS chunks
                                                                ↓
                                              store chunks to MinIO → update DB status → notify
```

Videos have a `status` field: `pending → processing → ready | failed`.
The frontend polls or uses WebSocket to reflect status. Never serve a video that is not `ready`.

HLS is mandatory for streaming — no plain MP4 delivery. Output: `playlist.m3u8` + `.ts` segment files.

## Auth Rules

- Access token: short-lived JWT (15 min)
- Refresh token: long-lived (7 days), stored in httpOnly cookie
- Endpoints that mutate data require a valid access token
- Refresh endpoint rotates the refresh token on every use (rotation strategy)
- Never store passwords in plaintext — bcrypt only

## API Conventions

- All routes versioned: `/api/v1/...`
- Response envelope for lists: `{ "items": [...], "total": int, "page": int, "limit": int }`
- Errors: `{ "detail": str, "code": str }` — always include a machine-readable `code`
- Use FastAPI dependency injection for: auth, storage, db session, pagination

## Frontend Conventions

- App Router only; use Server Components by default, Client Components only when needed
- Data fetching: TanStack Query for client-side, `fetch` with `cache` options for server-side
- No inline styles — Tailwind classes only
- shadcn/ui components as the base; extend, don't replace

## High-Load Considerations

These must be respected even in early phases — retrofitting is harder than building right:

- Database queries must use indexed columns for filters/sorts (add migrations for indexes)
- No N+1 queries — use `selectinload` / `joinedload` in SQLAlchemy
- Redis caching for hot reads (video metadata, user profiles)
- Video chunks served directly from MinIO/S3 — never proxied through the API server
- Rate limiting on auth endpoints (Redis-backed)

## Phase 1 Scope

Build only these features first. Do not expand scope until all are production-quality:

1. User registration + login (JWT auth)
2. Upload video → async transcode → HLS → MinIO
3. Stream video (HLS.js player)
4. Delete video (own videos only)
5. Basic video feed (paginated list)
6. User profile page (own videos)

## Notes & Decisions

All architectural decisions, open questions, and future feature ideas go in `notes/`.
Use the naming convention described in `notes/index.md`.
Before starting any non-trivial feature, write a short `notes/decision-*.md` first.

## What NOT to Do

- Do not add features outside Phase 1 scope until explicitly discussed
- Do not use `any` in TypeScript
- Do not call storage, queue, or DB adapters directly from route handlers — always go through a service layer
- Do not put business logic in Celery tasks — tasks orchestrate, services contain logic
- Do not use `docker exec` hacks to initialize state — use Alembic migrations and seed scripts
