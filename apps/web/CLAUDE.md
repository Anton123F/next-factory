# next-factory — Frontend & Web UI CLAUDE.md

## Tech Stack (Frontend)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router only — no Pages Router |
| Styling | Tailwind CSS + shadcn/ui | No raw CSS files; use Tailwind utilities |

## Frontend Conventions

- App Router only; use Server Components by default, Client Components only when needed
- Data fetching: TanStack Query for client-side, `fetch` with `cache` options for server-side
- No inline styles — Tailwind classes only
- shadcn/ui components as the base; extend, don't replace

## Auth Integration

- Access token: short-lived JWT (15 min)
- Refresh token: long-lived (7 days), stored in httpOnly cookie
- Store access token in memory; refresh token managed by browser's cookie handling
- Redirect to login on 401 responses

## What NOT to Do (Frontend)

- Do not add features outside Phase 1 scope until explicitly discussed
- Do not use `any` in TypeScript
- Do not use raw CSS files — Tailwind utilities only
- Do not replace shadcn/ui components; extend them instead

## File Index
- `proxy.ts` — Next.js middleware, guards all routes, redirects unauthenticated users

## Directory Index
- `app/`        — root layout, home page, route tree (see app/CLAUDE.md)
- `app/(auth)/` — login and registration routes (see app/(auth)/CLAUDE.md)
- `components/` — shared UI components (see components/CLAUDE.md)
- `lib/`        — API fetch helpers (see lib/CLAUDE.md)
