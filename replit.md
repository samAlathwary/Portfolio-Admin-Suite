# Easy Way — Monorepo

## Overview

A unified Replit pnpm monorepo that combines the public Easy Way marketing site
and the protected Easy Way Admin dashboard onto a single domain, backed by one
shared Express API and one PostgreSQL database.

- `/` — public marketing portfolio (English/Arabic, theme switcher, animated
  partners showcase). Reads partners from the API.
- `/admin/` — Clerk-protected admin dashboard (sign-in, dashboard, partners CRUD,
  services CRUD).
- `/api/` — shared Express 5 API for partners, services, dashboard summary, and
  Clerk frontend-API proxy.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API framework**: Express 5
- **Auth**: Clerk (`@clerk/express` server, `@clerk/react` + `@clerk/themes`
  on the admin)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec) — generates TanStack Query React
  hooks and Zod schemas
- **Frontend**: React 19 + Vite 7 + Tailwind v4, shadcn/ui, framer-motion, wouter
- **Build**: esbuild (server CJS bundle), Vite (web)

## Artifacts

- `artifacts/portfolio` (`@workspace/portfolio`) — Vite app served at `/`
- `artifacts/admin` (`@workspace/admin`) — Vite app served at `/admin/`
- `artifacts/api-server` (`@workspace/api-server`) — Express API at `/api`
- `artifacts/mockup-sandbox` — design preview sandbox

## Shared libraries

- `lib/api-spec` — OpenAPI 3.1 spec (`openapi.yaml`), source of truth for the API
- `lib/api-client-react` — generated TanStack Query hooks (consumed by both
  portfolio and admin)
- `lib/api-zod` — generated Zod request/response schemas (used by the server)
- `lib/db` — Drizzle schema and connection (`partners`, `services`)

## Domain model

- **partners** — `id`, `name`, `logoUrl`, `websiteUrl`, `description`, `industry`,
  `featured`, `displayOrder`, timestamps
- **services** — `id`, `title`, `description`, `icon`, `active`, `displayOrder`,
  timestamps

Read endpoints (`GET /partners`, `GET /services`, `GET /dashboard/summary`) are
public. Mutating endpoints require a Clerk session (enforced by `requireAuth`
middleware).

## Auth

The admin uses Clerk in path-routing mode with `BASE_URL=/admin/`. Clerk's
frontend API is proxied through the shared API server at `/api/__clerk` so
deployment works on `.replit.app` and custom domains without DNS configuration.
Auth providers, app branding, and OAuth credentials are managed from the Auth
pane in the workspace toolbar.

## Key commands

- `pnpm install` — install all workspace deps
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and
  Zod schemas after changing `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run push` — sync DB schema (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/portfolio run dev` — run portfolio
- `pnpm --filter @workspace/admin run dev` — run admin
