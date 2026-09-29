# Session: Initial Scaffold
Date: 2026-09-29

## Summary
Session was spent clarifying four tooling decisions before writing any code, then scaffolding the full monorepo skeleton. Work was roughly 30% Q&A on decisions, 70% scaffolding. Project was left with all folders and config files created but no containers running yet — next step is `cp .env.example .env && docker compose up --build`.

## Decisions
- **Monorepo tooling**: plain folders, no Turborepo/Nx — *Reason: three apps in different languages with no shared code; workspace managers add overhead with zero benefit here*
- **Python dependency manager**: `uv` for both `apps/api` and `services/worker` — *Reason: 10-100x faster than pip, handles venvs + lockfiles, modern standard for new Python projects*
- **Docker strategy**: single `docker-compose.yml` at project root, separate `Dockerfile` per app — *Reason: all 6 services must share one Docker network for service discovery; separate compose files would require manual network bridging*
- **Next.js bootstrap**: `create-next-app` with TypeScript, Tailwind, App Router, no src dir — *Reason: fastest correct starting point; strip boilerplate after*

## Rejected Alternatives
- **Turborepo/Nx**: rejected because apps are different runtimes with no shared packages — no coordinated build problem to solve
- **Poetry**: rejected in favor of uv — heavier, slower, no meaningful advantage for this project
- **Separate docker-compose per app**: rejected — inter-service communication requires a shared network; separate files make that painful
- **Skipping decision doc**: user explicitly wanted it written before scaffolding

## Principles Established
- 6 total processes: 3 "your code" (web port 3000, api port 8000, worker no port) + 3 infrastructure (postgres 5432, redis 6379, minio 9000/9001)
- Worker Dockerfile includes FFmpeg — it's the only container that needs it
- `#todo` stub left in `services/worker/tasks/video.py` for FFmpeg HLS implementation

## Open Questions
- MinIO bucket creation on first run — needs an init script or the API must handle bucket-not-found on startup
