## Feature
Login page (JWT + Google OAuth, code-switchable) with a protected home page greeting the authenticated user by name.

## Files to Create

### Backend
- `apps/api/models/user.py` — User SQLAlchemy model: id (UUID), username (unique, indexed), hashed_password, created_at
- `apps/api/services/token.py` — TokenService: create_access_token, create_refresh_token, decode_access_token using python-jose; reads SECRET_KEY and expiry values from Settings
- `apps/api/services/auth.py` — AuthService: jwt_login (bcrypt verify password + call TokenService), google_login stub (raises NotImplementedError until OAuth credentials configured)
- `apps/api/api/v1/auth.py` — auth router: POST /login/jwt (returns access token + sets httpOnly refresh cookie), POST /login/google (initiates OAuth redirect), GET /google/callback (501 stub)
- `apps/api/core/dependencies.py` — get_current_user FastAPI dependency: decodes Bearer access token, loads User from DB; raises HTTP 401 on invalid/expired token
- `apps/api/alembic.ini` — Alembic config: sqlalchemy.url points to DATABASE_URL from environment
- `apps/api/alembic/env.py` — Alembic async env: imports Base from core/database.py and User from models/user.py so target_metadata includes the users table
- `apps/api/alembic/versions/001_create_users_table.py` — initial migration: creates users table with index on username column

### Frontend
- `apps/web/app/(auth)/login/page.tsx` — login route; imports and renders JwtLoginForm by default; developer switches to GoogleLoginButton import to activate OAuth mode — no other change required
- `apps/web/app/(auth)/login/_components/JwtLoginForm.tsx` — Client Component: username + password fields, idle/loading/error/success states, calls POST /api/v1/auth/login/jwt via lib/auth.ts, redirects to / on success
- `apps/web/app/(auth)/login/_components/GoogleLoginButton.tsx` — Client Component: "Sign in with Google" button with idle/loading/error states, navigates to GET /api/v1/auth/login/google on click (inactive by default)
- `apps/web/middleware.ts` — Edge middleware: reads access_token cookie, decodes JWT locally, redirects to /login if absent or signature invalid; matcher excludes /login and /api/* paths
- `apps/web/lib/auth.ts` — postJwtLogin(username, password) fetch helper; COOKIE_ACCESS_TOKEN and COOKIE_REFRESH_TOKEN key constants
- `apps/web/components/providers/QueryProvider.tsx` — Client Component wrapping QueryClient + QueryClientProvider for TanStack Query

## Files to Modify

- `apps/api/api/v1/router.py` — include auth_router with prefix="/auth" and tags=["auth"]
- `apps/api/models/__init__.py` — import User from models.user so Base.metadata is populated before Alembic env.py runs
- `apps/web/app/layout.tsx` — wrap {children} with QueryProvider
- `apps/web/app/page.tsx` — replace default Next.js content; Server Component reads access_token cookie via next/headers cookies(), decodes JWT to extract username, renders "Hello, {username}" heading; calls redirect('/login') if token absent or invalid

## Files to Read

- `apps/api/core/config.py` — Settings class: SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, DATABASE_URL, REDIS_URL — import the settings singleton in token.py and auth.py
- `apps/api/core/database.py` — Base declarative base and get_db dependency — User model extends Base; alembic/env.py imports engine and Base from here
- `apps/api/api/v1/router.py` — existing router structure before adding the auth include
- `apps/web/app/layout.tsx` — current imports and RootLayout structure before wrapping with QueryProvider

## Notes

1. **Mode switching:** `app/(auth)/login/page.tsx` holds a single import. Change `JwtLoginForm` → `GoogleLoginButton` (and its API endpoint constant) to switch modes. No feature flags, no env vars, no other files touched.

2. **Token cookies:** Access token stored as a regular (non-httpOnly) cookie (`access_token`) so the Edge middleware can read it. Refresh token stored as httpOnly cookie (`refresh_token`). Both set by the API via `Set-Cookie` on login. Never expose refresh token to client JS.

3. **Home page auth:** `app/page.tsx` is a Server Component. It calls `cookies()` from `next/headers` to read the access token, decodes it with `jose` (Edge-compatible), extracts `sub` (username), and renders the greeting. On any failure it calls `redirect('/login')` — no loading spinner needed since this is server-rendered.

4. **Middleware JWT decode:** Use `jose` (not `jsonwebtoken`) in middleware.ts — `jsonwebtoken` is Node.js only and will not run on the Edge runtime. `jose` is already Edge-compatible.

5. **Rate limiting on JWT login:** The POST /login/jwt handler must check Redis for failed attempts per username. Increment on failure, block after 5 attempts within 15 minutes (HTTP 429). Use REDIS_URL from Settings. Add `redis[asyncio]` to pyproject.toml if missing.

6. **Username index:** The Alembic migration must include `CREATE INDEX ix_users_username ON users (username)` — all auth lookups filter by username.

7. **Google OAuth stub:** `GoogleLoginButton` and the `/login/google` endpoint are wired but non-functional until a GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are added to Settings and the OAuth library is configured. The stub ensures the alternate mode compiles and the route exists.

8. **No registration:** This plan does not create a register endpoint. Seed test users directly via a seed script or Alembic data migration — do not use docker exec.

9. **shadcn/ui components:** Use `<Input>`, `<Button>`, `<Card>`, `<CardContent>` from shadcn/ui for both login form and home page. Install required shadcn components before implementing if not already present.
