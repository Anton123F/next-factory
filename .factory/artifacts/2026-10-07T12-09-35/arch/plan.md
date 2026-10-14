## Feature
User registration flow — `/register` page with username, email, password, confirm password; issues JWT tokens on success and redirects to feed.

## Files to Create

- apps/api/alembic/versions/002_add_email_to_users.py — Alembic migration: adds `email` column (String 255, unique, not null) to `users` table with a unique constraint and index
- apps/web/app/(auth)/register/page.tsx — Server Component page for `/register`; reads `access_token` cookie and redirects to `/` if already authenticated; renders `RegisterForm` centered
- apps/web/app/(auth)/register/_components/RegisterForm.tsx — Client Component: four fields (Username, Email, Password, Confirm Password); client-side validation on blur per design spec; password strength indicator (weak/fair/strong) computed as user types; inline field errors; banner for generic server errors; loading state disables all fields and shows spinner on submit button; on success redirects to `/`

## Files to Modify

- apps/api/models/user.py — Add `email: Mapped[str]` column (String 255, unique=True, index=True); developer must not drop or alter existing columns
- apps/api/services/auth.py — Add `register(username, email, password, db)` async function: check uniqueness of both username and email (raise ValueError with field-keyed message on conflict), hash password with bcrypt, insert User, flush (do not commit — let caller manage transaction), issue and return (access_token, refresh_token) via existing `create_access_token` / `create_refresh_token`
- apps/api/api/v1/auth.py — Add `RegisterRequest` Pydantic model (username, email, password) and `POST /register` endpoint: calls `register()`, catches ValueError to return 409 with `{ "detail": "...", "code": "username_taken" | "email_taken" }`, on success sets same two cookies as login endpoint and returns `{ "access_token": ..., "token_type": "bearer" }`
- apps/web/lib/auth.ts — Add `postRegister(username, email, password)` fetch helper targeting `POST /api/v1/auth/register`; same error-propagation pattern as `postJwtLogin`; export it
- apps/web/proxy.ts — Update `matcher` regex to also exclude `/register` from the auth guard (add `register` to the negative lookahead beside `login`)

## Files to Read

- apps/api/services/token.py — developer needs `create_access_token` and `create_refresh_token` exact signatures before writing the register service
- apps/web/app/page.tsx — developer needs to see the cookie-read + redirect pattern used in a Server Component before implementing it in `register/page.tsx`

## Notes

- The `email` column must be `NOT NULL` in the migration; existing rows in dev will need a default or the migration should be applied to a fresh DB — document this in a comment in the migration file
- `register()` service must flush (not commit) so the router's dependency-injected session commits on response; matches the pattern used implicitly in `jwt_login`
- The 409 conflict errors must use distinct `code` values (`username_taken` vs `email_taken`) so the frontend can map them to the correct field's inline error
- Password strength in the frontend is UI-only — do not add strength enforcement on the backend; only the 8-char minimum is enforced
- Trim username and email before calling `postRegister` (per design spec) — do this in `RegisterForm`, not in the fetch helper
- The `/register` route must be excluded from the middleware auth guard in `proxy.ts`; currently only `login` is excluded — missing this would redirect all unauthenticated users away from the registration page
- The authenticated-redirect (already logged in → `/`) must happen inside `register/page.tsx` as a Server Component redirect, same pattern as `apps/web/app/page.tsx`, not in the middleware
- No rate limiting on `/register` in Phase 1 — the endpoint is acceptable as-is; do not add it speculatively
- Do not add email verification — explicitly out of Phase 1 scope per CLAUDE.md
