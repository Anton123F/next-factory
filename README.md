# next-factory

A production-close YouTube clone built for studying applied AI and modern full-stack architecture.

## Services

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| API (FastAPI) | http://localhost:8000 |
| MinIO console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## Running the App

### Option A — Docker (production-like)

All services run in containers. Changes require a rebuild.

```bash
cp .env.example .env      # first time only — review values before running
docker compose up --build
```

Subsequent runs:

```bash
docker compose up
```

> **Note:** The current Docker setup runs in production mode — no hot-reload, dev dependencies excluded. Not ideal for active development.

---

### Option B — Native (recommended for development)

Run only infrastructure in Docker; run the API and frontend natively for hot-reload.

**1. Start infrastructure**

```bash
docker compose up db redis minio
```

**2. Start the API**

```bash
cd apps/api
uv sync
uv run uvicorn main:app --reload --port 8000

```

**3. Start the frontend**

```bash
cd apps/web
npm install
npm run dev
```

**4. Start the Celery worker**

```bash
cd services/worker
uv run celery -A worker worker --loglevel=info
```

---

## Useful Commands

```bash
docker compose logs -f api       # tail API logs
docker compose restart worker    # restart Celery worker only
docker compose down -v           # stop and wipe all volumes (destructive)
```
