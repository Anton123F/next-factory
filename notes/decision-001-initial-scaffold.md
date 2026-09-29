# Decision 001 — Initial Scaffold

## Context

First-time setup of the monorepo. Four decisions needed before writing any code.

---

## 1. Monorepo tooling — plain folders, no workspace manager

**Decision:** No Turborepo, Nx, or any monorepo orchestration tool.

**Why:** The three apps (Next.js, FastAPI, Celery worker) are different languages and runtimes — they share no code and have no coordinated build steps. Workspace managers solve cross-package dependency and build orchestration problems we don't have. Plain folders with independent toolchains per app is simpler and has zero overhead.

---

## 2. Python dependency management — uv

**Decision:** `uv` for both `apps/api` and `services/worker`.

**Why:** uv is 10-100x faster than pip, manages virtual environments, generates lockfiles (`uv.lock`), and uses `pyproject.toml` as the standard config. Poetry is the mature alternative but slower and heavier. uv is now the de-facto standard for new Python projects.

Each Python app has its own isolated `pyproject.toml` + `.venv` — they are not shared.

---

## 3. Docker strategy — one root docker-compose.yml, separate Dockerfiles

**Decision:** Single `docker-compose.yml` at the project root. Each app has its own `Dockerfile`.

**Why:** All 6 services must communicate on the same Docker network (API talks to Postgres, Redis, MinIO; worker talks to Redis, Postgres, MinIO; web talks to API). Separate compose files would require manual network bridging. One compose file, one network, clean service discovery by container name.

The split is: `docker-compose.yml` orchestrates, `Dockerfile` per app builds.

**Services:**
| Container | Role | Port |
|---|---|---|
| `web` | Next.js frontend | 3000 |
| `api` | FastAPI backend | 8000 |
| `worker` | Celery video processor | — |
| `db` | PostgreSQL | 5432 |
| `redis` | Queue + cache | 6379 |
| `minio` | Object storage | 9000 / 9001 |

---

## 4. Next.js bootstrap — create-next-app, then customize

**Decision:** Bootstrap with `create-next-app` using TypeScript, Tailwind, App Router. Strip unused boilerplate after.

**Why:** Faster than hand-rolling the Next.js config. We know exactly what to remove.
