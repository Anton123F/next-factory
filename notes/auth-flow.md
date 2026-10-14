# Auth Flow — Step by Step

Same style as `stack-diagram.md`. Each box shows **what layer acts** and **which method is called**.

---

## 1. User Opens a Protected Page

```
  USER opens any protected page (e.g. "/" feed, "/profile")
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — Server Component             │
  │  checks: is there an access_token?      │
  │  (reads from cookie or request header)  │
  └──────────────┬──────────────────────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
  NO token              HAS token
       │                    │
       ▼                    ▼
  redirect()           attach header
  → /login             Authorization: Bearer <token>
                            │
                            ▼
                       [go to section 4 — API call]
```

---

## 2. Registration Flow

```
  USER visits /register, fills form, clicks "Register"
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — Client Component             │
  │  <RegisterForm />                       │
  │  TanStack Query: useMutation()          │
  │  → POST /api/v1/auth/register           │
  │    body: { email, username, password }  │
  └──────────────────┬──────────────────────┘
                     │  HTTP POST
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — auth_router                  │
  │  POST /api/v1/auth/register             │
  │  → calls: UserService.create_user()     │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  UserService.create_user()              │
  │  1. bcrypt.hash(password)               │
  │  2. UserRepository.get_by_email()       │
  │     → SELECT from PostgreSQL            │
  │     → if exists: raise 409 Conflict     │
  │  3. UserRepository.create(user_data)    │
  │     → INSERT INTO users                 │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
              201 Created
         { id, email, username }
                     │
                     ▼
         browser → redirect to /login
```

---

## 3. Login Flow

```
  USER visits /login, fills form, clicks "Login"
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — Client Component             │
  │  <LoginForm />                          │
  │  TanStack Query: useMutation()          │
  │  → POST /api/v1/auth/login              │
  │    body: { email, password }            │
  └──────────────────┬──────────────────────┘
                     │  HTTP POST
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — auth_router                  │
  │  POST /api/v1/auth/login                │
  │  → calls: AuthService.login()           │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  AuthService.login()                    │
  │  1. UserRepository.get_by_email()       │
  │     → SELECT FROM users WHERE email=?   │
  │     → if not found: raise 401           │
  │  2. bcrypt.verify(password, stored_hash)│
  │     → if mismatch: raise 401            │
  │  3. TokenService.create_access_token()  │
  │     → JWT { user_id, exp: +15min }      │
  │  4. TokenService.create_refresh_token() │
  │     → JWT { user_id, exp: +7days }      │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — response                     │
  │  body:   { access_token, token_type }   │
  │  cookie: refresh_token (httpOnly, Secure│
  │           SameSite=Strict)              │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — client stores access_token   │
  │  in React state / TanStack Query cache  │
  │  (NOT localStorage — lives in memory)   │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
               redirect → /
```

---

## 4. Authenticated API Call (e.g. fetch video feed)

```
  USER is on "/" feed page, access_token is in memory
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — Client Component             │
  │  TanStack Query: useQuery()             │
  │  → GET /api/v1/videos                   │
  │    header: Authorization: Bearer <token>│
  └──────────────────┬──────────────────────┘
                     │  HTTP GET
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — video_router                 │
  │  GET /api/v1/videos                     │
  │  dependency: get_current_user()         │
  │  → TokenService.decode_access_token()   │
  │     → if invalid/expired: raise 401     │
  │  → UserRepository.get_by_id(user_id)    │
  │     → SELECT FROM users WHERE id=?      │
  └──────────────────┬──────────────────────┘
                     │  user is verified
                     ▼
  ┌─────────────────────────────────────────┐
  │  VideoService.get_feed()                │
  │  1. Redis.get("feed:page:{n}")          │
  │     → cache hit? return immediately     │
  │     → cache miss? continue              │
  │  2. VideoRepository.list_published()    │
  │     → SELECT FROM videos                │
  │        WHERE status = 'ready'           │
  │        ORDER BY created_at DESC         │
  │        LIMIT/OFFSET (pagination)        │
  │  3. Redis.set("feed:page:{n}", result)  │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
         { items: [...], total, page, limit }
```

---

## 5. Token Refresh Flow (access token expired)

```
  USER makes any authenticated request
  → FastAPI returns 401 Unauthorized
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — axios/fetch interceptor      │
  │  catches 401 response                   │
  │  → POST /api/v1/auth/refresh            │
  │    (refresh_token sent automatically    │
  │     via httpOnly cookie — no JS needed) │
  └──────────────────┬──────────────────────┘
                     │  HTTP POST
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — auth_router                  │
  │  POST /api/v1/auth/refresh              │
  │  → AuthService.refresh()               │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  AuthService.refresh()                  │
  │  1. read refresh_token from cookie      │
  │  2. TokenService.decode_refresh_token() │
  │     → if invalid/expired: raise 401     │
  │        → browser redirect to /login     │
  │  3. UserRepository.get_by_id(user_id)   │
  │     → if user deleted/banned: raise 401 │
  │  4. TokenService.create_access_token()  │
  │     → new JWT { user_id, exp: +15min }  │
  │  5. TokenService.create_refresh_token() │
  │     → NEW refresh token (rotation!)     │
  │     → old token is now invalid          │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — response                     │
  │  body:   { access_token }               │
  │  cookie: refresh_token (new, rotated)   │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
         interceptor retries original request
         with new access_token → success
```

---

## 6. Logout Flow

```
  USER clicks "Logout"
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — Client Component             │
  │  → POST /api/v1/auth/logout             │
  │    header: Authorization: Bearer <token>│
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  FastAPI — auth_router                  │
  │  POST /api/v1/auth/logout               │
  │  → clears httpOnly cookie               │
  │    (Set-Cookie: refresh_token="";       │
  │     Max-Age=0)                          │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │  Next.js — client                       │
  │  → clears access_token from memory      │
  │  → TanStack Query: queryClient.clear()  │
  │  → redirect to /login                   │
  └─────────────────────────────────────────┘
```

---

## Service / Method Map (quick reference)

| Step | Layer | Method |
|---|---|---|
| Register | UserService | `create_user(email, username, password)` |
| Hash password | — | `bcrypt.hash(password, rounds=12)` |
| Check email unique | UserRepository | `get_by_email(email)` → PostgreSQL |
| Login credential check | AuthService | `login(email, password)` |
| Verify password | — | `bcrypt.verify(plain, hashed)` |
| Issue access token | TokenService | `create_access_token(user_id)` → JWT 15min |
| Issue refresh token | TokenService | `create_refresh_token(user_id)` → JWT 7d |
| Auth guard on endpoint | FastAPI dep | `get_current_user()` → decode JWT |
| Decode token | TokenService | `decode_access_token(token)` |
| Refresh rotation | AuthService | `refresh()` → invalidates old, issues new pair |
| Cache feed | VideoService | `Redis.get/set("feed:page:{n}")` |
| Logout | auth_router | clear httpOnly cookie + client clears memory |
