# Project Map
_Generated from scripts/scan_project.py — re-run when structure changes._

## apps/api/

- apps/api/main.py — FastAPI entry point, CORS, global error handlers, mounts v1 router
- apps/api/alembic/env.py — Async Alembic migration runner, targets Base.metadata
- apps/api/alembic/versions/001_create_users_table.py — Creates users table with username index
- apps/api/alembic/versions/002_add_email_to_users.py — Adds unique indexed email column to users
- apps/api/api/v1/auth.py — JWT login/register endpoints with Redis rate limiting
- apps/api/api/v1/router.py — v1 router, mounts auth sub-router, exposes ping/hello
- apps/api/core/config.py — Pydantic settings for DB, Redis, MinIO, JWT, CORS
- apps/api/core/database.py — Async SQLAlchemy engine, session factory, get_db dependency
- apps/api/core/dependencies.py — get_current_user dependency, validates Bearer JWT token
- apps/api/core/exceptions.py — Typed AppError hierarchy: conflict, username/email taken
- apps/api/models/user.py — User ORM model, UUID PK, indexed username and email
- apps/api/services/auth.py — JWT login and registration logic, bcrypt, uniqueness checks
- apps/api/services/token.py — Creates and decodes HS256 access and refresh JWTs

## apps/web/

- apps/web/proxy.ts — Next.js middleware, guards all routes, redirects unauthenticated users
- apps/web/app/layout.tsx — Root layout, Geist fonts, wraps children in QueryProvider
- apps/web/app/page.tsx — Home page, server-validates JWT cookie, displays username
- apps/web/app/(auth)/login/page.tsx — Login page, renders JwtLoginForm centered
- apps/web/app/(auth)/login/_components/JwtLoginForm.tsx — Client form, posts JWT login, redirects home
- apps/web/app/(auth)/login/_components/GoogleLoginButton.tsx — Google OAuth redirect button, currently stub
- apps/web/app/(auth)/register/page.tsx — Register page, redirects already-authenticated users
- apps/web/app/(auth)/register/_components/RegisterForm.tsx — Client register form, field validation and strength meter
- apps/web/components/providers/QueryProvider.tsx — TanStack QueryClient provider for client components
- apps/web/lib/auth.ts — Fetch helpers for JWT login and register API calls
