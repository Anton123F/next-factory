## Status
[COMPLETE] — all plan items implemented.

## Summary
Implemented the full user registration flow. The backend gains an `email` column on the `users` table (migration 002), a `register()` service that checks username/email uniqueness, hashes the password, flushes the new user, and returns JWT tokens, plus a `POST /api/v1/auth/register` endpoint that returns field-keyed 409 responses on conflict. The frontend gains a `/register` page with server-side auth guard, a four-field `RegisterForm` with per-field blur validation, a password strength indicator, and inline conflict errors mapped from the API response code.

## Newly Created Files
- `apps/api/alembic/versions/002_add_email_to_users.py` — Alembic migration adding the email column (String 255, unique, not null) with constraint and index
- `apps/web/app/(auth)/register/page.tsx` — Server Component; redirects already-authenticated users to `/`, renders RegisterForm centered
- `apps/web/app/(auth)/register/_components/RegisterForm.tsx` — Client Component; four-field form with blur validation, password strength indicator, inline and banner error states, loading spinner

## Newly Created Directories
- `apps/web/app/(auth)/register/` — route directory for the register page
- `apps/web/app/(auth)/register/_components/` — co-located components directory

## Modified Files
- `apps/api/models/user.py` — added `email: Mapped[str]` column (String 255, unique, index)
- `apps/api/services/auth.py` — added `register()` async function with uniqueness checks, bcrypt hash, flush, and token issuance
- `apps/api/api/v1/auth.py` — added `RegisterRequest` model, `JSONResponse` import, and `POST /register` endpoint
- `apps/web/lib/auth.ts` — added `postRegister()` fetch helper with code-carrying error propagation
- `apps/web/proxy.ts` — updated `matcher` regex to exclude `/register` from the auth guard

## Notes & Pitfalls
- Migration 002 adds `email` as NOT NULL — it must be applied to a fresh DB or a DB with no existing rows; existing rows without an email value will cause the migration to fail
- 409 conflict errors are returned as `JSONResponse` (not `raise HTTPException`) so both `detail` and `code` land in the response body; postRegister reads `data?.code` from the body (not a header), which avoids CORS `Access-Control-Expose-Headers` concerns
- `postRegister` encodes the code via `Object.assign(new Error(...), { code })` — RegisterForm uses `(err as Error & { code?: string }).code` to route to the correct field without introducing `any`
- `handleBlur` in RegisterForm reconstructs the fields object from the DOM event value to avoid validating against stale React state when a user types and immediately tabs away

## Not Completed
— none —
