# Project Map
_Generated from scripts/scan_project.py — re-run when structure changes._

## apps/api/

- `apps/api/main.py` — FastAPI app entry point, mounts CORS middleware and v1 router at `/api/v1`
- `apps/api/api/v1/router.py` — placeholder GET routes (`/ping`, `/hello`); expand with feature routers here
- `apps/api/core/config.py` — pydantic-settings `Settings` class; reads `.env` for DB, Redis, MinIO, JWT, CORS
- `apps/api/core/database.py` — async SQLAlchemy engine, `Base` declarative class, `get_db` dependency

## apps/web/

- `apps/web/app/layout.tsx` — root layout; sets Geist fonts and wraps all pages in `<html>/<body>`
- `apps/web/app/page.tsx` — default home page; Next.js scaffolded placeholder, replace with feed
