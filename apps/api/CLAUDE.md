# next-factory — API & Backend CLAUDE.md

## Tech Stack (Backend)

| Layer | Technology | Notes |
|---|---|---|
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

## High-Load Considerations (Backend)

These must be respected even in early phases — retrofitting is harder than building right:

- Database queries must use indexed columns for filters/sorts (add migrations for indexes)
- No N+1 queries — use `selectinload` / `joinedload` in SQLAlchemy
- Redis caching for hot reads (video metadata, user profiles)
- Video chunks served directly from MinIO/S3 — never proxied through the API server
- Rate limiting on auth endpoints (Redis-backed)

## What NOT to Do (Backend)

- Do not call storage, queue, or DB adapters directly from route handlers — always go through a service layer
- Do not put business logic in Celery tasks — tasks orchestrate, services contain logic
- Do not use `docker exec` hacks to initialize state — use Alembic migrations and seed scripts
