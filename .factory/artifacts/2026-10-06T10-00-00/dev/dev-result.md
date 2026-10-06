## Status
[COMPLETE] — all plan items implemented.

## Summary
Implemented JWT login with a protected home page. The backend provides `/api/v1/auth/login/jwt` with bcrypt verification, rate limiting via Redis, and dual-cookie response (httpOnly refresh + readable access). The frontend has a JwtLoginForm client component, a proxy guard, and a server-rendered home page that decodes the access token to greet the user.

## Newly Created Files
- `apps/api/models/user.py` — User SQLAlchemy model with UUID pk, username (unique/indexed), hashed_password, created_at
- `apps/api/services/token.py` — TokenService: create_access_token, create_refresh_token, decode_access_token using python-jose
- `apps/api/services/auth.py` — AuthService: jwt_login (bcrypt verify + TokenService), google_login stub (raises NotImplementedError)
- `apps/api/api/v1/auth.py` — Auth router: POST /login/jwt with Redis rate limiting, POST /login/google (501), GET /google/callback (501)
- `apps/api/core/dependencies.py` — get_current_user dependency: decodes Bearer token, loads User from DB, raises 401 on failure
- `apps/api/alembic.ini` — Alembic config pointing sqlalchemy.url to DATABASE_URL env var
- `apps/api/alembic/env.py` — Alembic async env importing Base and User so target_metadata is populated
- `apps/api/alembic/versions/001_create_users_table.py` — Initial migration creating users table with ix_users_username index
- `apps/web/app/(auth)/login/page.tsx` — Login route rendering JwtLoginForm
- `apps/web/app/(auth)/login/_components/JwtLoginForm.tsx` — Client Component: username/password form with idle/loading/error/success states
- `apps/web/app/(auth)/login/_components/GoogleLoginButton.tsx` — Client Component: Google sign-in button (inactive by default)
- `apps/web/proxy.ts` — Next.js 16 Proxy (replaces middleware.ts): reads access_token cookie, verifies JWT, redirects to /login if invalid
- `apps/web/lib/auth.ts` — postJwtLogin fetch helper; COOKIE_ACCESS_TOKEN and COOKIE_REFRESH_TOKEN constants
- `apps/web/components/providers/QueryProvider.tsx` — Client Component wrapping QueryClient + QueryClientProvider

## Newly Created Directories
- `apps/web/app/(auth)/` — auth route group
- `apps/web/app/(auth)/login/` — login route segment
- `apps/web/app/(auth)/login/_components/` — co-located login components
- `apps/web/components/providers/` — React providers

## Modified Files
- `apps/api/api/v1/router.py` — added auth_router include with prefix="/auth" and tags=["auth"]
- `apps/api/models/__init__.py` — added `from models.user import User` to populate Base.metadata
- `apps/web/app/layout.tsx` — imported QueryProvider and wrapped {children}
- `apps/web/app/page.tsx` — replaced placeholder; Server Component reads access_token cookie, decodes JWT, renders "Hello, {username}" or redirects to /login

## Notes & Pitfalls
- Next.js 16 renamed `middleware.ts` → `proxy.ts` and the export from `middleware` → `proxy`; plan said `middleware.ts` but `proxy.ts` is required for the app to work
- Proxy uses Node.js runtime in Next.js 16 (no longer Edge-only), so `jose` still used for consistency with page.tsx
- `alembic.ini` uses `%(DATABASE_URL)s` interpolation but `env.py` overrides sqlalchemy.url from `os.environ["DATABASE_URL"]` directly — the ini value is a placeholder
- shadcn/ui and @tanstack/react-query were not pre-installed; initialised with `npx shadcn@latest init --defaults` and `npm install jose @tanstack/react-query`

## Not Completed
— none —
