# Stack Diagram — How Everything Connects

## Text Diagram

```
                        ┌─────────────────────────────┐
                        │         BROWSER              │
                        │  Next.js 14 (React/TS)       │
                        │  - shadcn/ui + Tailwind       │
                        │  - TanStack Query             │
                        │  - HLS.js (video player)      │
                        └────────────┬────────────────-─┘
                                     │  HTTP / WebSocket
                                     ▼
                        ┌─────────────────────────────┐
                        │         FastAPI              │
                        │  apps/api                    │
                        │  - versioned routes /api/v1  │
                        │  - JWT auth middleware        │
                        │  - dependency injection       │
                        │  - service layer              │
                        └──┬──────────┬───────────┬────┘
                           │          │           │
               ┌───────────┘          │           └──────────────┐
               ▼                      ▼                          ▼
  ┌────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐
  │    PostgreSQL       │  │        Redis           │  │       MinIO          │
  │  (primary DB)       │  │  - session cache       │  │  (object storage)    │
  │  - users            │  │  - rate limiting       │  │  - raw uploads       │
  │  - videos           │  │  - hot read cache      │  │  - HLS chunks (.ts)  │
  │  - Alembic migs     │  │  - Celery broker       │  │  - playlists (.m3u8) │
  └────────────────────┘  └───────────┬───────────┘  └──────────────────────┘
                                       │ enqueue job              ▲
                                       ▼                          │ store chunks
                        ┌─────────────────────────────┐          │
                        │       Celery Worker          │──────────┘
                        │  services/worker             │
                        │  - picks up video jobs       │
                        │  - runs FFmpeg               │
                        │  - transcodes → HLS          │
                        │  - updates video status in DB│
                        └─────────────────────────────┘


Upload flow:
  Browser
    → POST /api/v1/videos/upload (FastAPI)
    → raw file saved to MinIO
    → job pushed to Redis queue
    → 202 Accepted returned immediately
    → Celery worker picks up job
    → FFmpeg transcodes to HLS (.m3u8 + .ts segments)
    → chunks stored back to MinIO
    → video status updated: pending → processing → ready
    → Browser polls (or WebSocket) until status = ready
    → HLS.js streams directly from MinIO (not through API)

Auth flow:
  Browser
    → POST /api/v1/auth/login
    → FastAPI validates credentials (bcrypt check against PostgreSQL)
    → issues short-lived access token (JWT, 15 min)
    → issues long-lived refresh token (JWT, 7 days) → httpOnly cookie
    → on expiry: POST /api/v1/auth/refresh → rotates refresh token
```

---

## Component Breakdown

### Next.js 14 (Frontend)
**What it is:** A React framework that runs on the server and in the browser. "App Router" means pages are React Server Components by default — they fetch data and render HTML on the server before sending to the browser.

**Why it's here:** Gives us fast initial page loads (server rendering), TypeScript safety, and a clean routing system. Client Components are used only where interactivity is required (video player, upload form, auth state).

---

### Tailwind CSS + shadcn/ui
**What it is:** Tailwind is a utility-first CSS system — you style elements with class names like `flex gap-4 text-sm` instead of writing CSS files. shadcn/ui is a component library built on top of Tailwind that gives ready-made accessible UI primitives (buttons, dialogs, inputs).

**Why it's here:** Eliminates CSS files entirely. Components are consistent, accessible, and easy to customize without fighting a framework's opinionated styles.

---

### TanStack Query
**What it is:** A client-side data-fetching and caching library for React. It manages loading states, error states, background refetching, and cache invalidation.

**Why it's here:** Used for all client-side data fetching (video feed, status polling). Replaces manual `useEffect + fetch + useState` patterns with a clean declarative API. Critical for polling video status (`pending → ready`) without writing a manual timer loop.

---

### HLS.js
**What it is:** A JavaScript library that plays HLS video streams (`.m3u8` playlists + `.ts` segment files) in browsers that don't support HLS natively.

**Why it's here:** We deliver video as HLS — the browser needs something to parse the playlist and request the right segments. HLS.js handles adaptive bitrate, buffering, and segment loading transparently.

---

### FastAPI (Backend API)
**What it is:** A Python web framework for building HTTP APIs. It uses Python type hints to auto-generate validation, serialization, and OpenAPI docs.

**Why it's here:** Handles all HTTP traffic — auth, upload, video metadata, user profiles. Everything is async (non-blocking), so the server can handle many concurrent requests without extra threads. Never touches FFmpeg or does heavy processing — that's the worker's job.

---

### PostgreSQL (Primary Database)
**What it is:** A relational database. Stores structured data in tables with relationships, transactions, and strong consistency guarantees.

**Why it's here:** The source of truth for users and videos. Alembic manages schema migrations so the database evolves safely alongside the code. All queries go through SQLAlchemy ORM — never raw SQL except for complex analytics.

---

### Redis
**What it is:** An in-memory key-value store. Extremely fast reads/writes. Data lives in RAM (optionally persisted to disk).

**Why it's here:** Serves three roles in this project:
1. **Celery broker** — the queue that holds pending video transcoding jobs. FastAPI pushes a job here; the worker pulls from here.
2. **Hot read cache** — frequently accessed data (video metadata, user profiles) is cached here so PostgreSQL isn't hammered on every request.
3. **Rate limiting** — tracks request counts per IP/user on auth endpoints to block brute-force attacks.

---

### MinIO (Object Storage)
**What it is:** An S3-compatible object storage server you can run locally. Stores binary blobs (files) — not structured data.

**Why it's here:** Video files are too large for a database. Raw uploads land here first. After transcoding, HLS chunks (`.ts` files) and playlists (`.m3u8`) are stored here. The browser streams video **directly from MinIO** — the API server is never in the video delivery path, which is essential for performance at scale. In production, MinIO is swapped for AWS S3 via the adapter layer — no code changes needed.

---

### Celery Worker (Video Processing)
**What it is:** A distributed task queue. Workers are separate processes that pick up jobs from a broker (Redis) and execute them asynchronously.

**Why it's here:** Video transcoding with FFmpeg is slow and CPU-heavy — blocking an HTTP request for it would be unacceptable. The API immediately returns `202 Accepted`, and the worker handles transcoding in the background. This keeps the API responsive regardless of how long encoding takes. The worker only orchestrates — business logic lives in the service layer.

---

### FFmpeg
**What it is:** A command-line tool for processing video and audio. Can transcode between formats, split video into segments, and generate HLS playlists.

**Why it's here:** Converts uploaded video files into HLS format — a playlist file (`.m3u8`) pointing to small time-based segments (`.ts` files). HLS is mandatory because it enables adaptive streaming, seeking without full download, and CDN-friendly delivery.

---

### JWT (JSON Web Tokens)
**What it is:** A compact, signed token that encodes a payload (e.g. user ID, expiry). The server can verify it without a database lookup because it's cryptographically signed.

**Why it's here:** Stateless authentication — the API doesn't need to store sessions in a database. Two-token strategy: a short-lived access token (15 min) limits damage if stolen; a long-lived refresh token (7 days) in an httpOnly cookie (invisible to JavaScript) lets the user stay logged in without re-entering credentials. Refresh tokens rotate on every use to detect theft.

---

### Alembic
**What it is:** A database migration tool for SQLAlchemy. Tracks schema changes as versioned scripts that can be applied or rolled back.

**Why it's here:** Without migrations, schema changes require manual SQL or recreating the database. Alembic generates migration files from model changes and applies them in order — safe for production deployments where you can't drop and recreate tables.
