# Monorepo Structure

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
