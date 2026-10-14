# Pending Map Update

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
