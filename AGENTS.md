# AGENTS.md

Guidance for AI agents working in this repository.

## What this is

A self-hosted crawler for [Kleinanzeigen.de](https://www.kleinanzeigen.de) (German classifieds). Users save searches; a background worker polls Kleinanzeigen every 5 minutes and emails the user when new listings appear. There is a small web UI (behind OAuth) for managing saved searches.

The app runs as **two processes from one Docker image**:

- **`frontend`** — TanStack Start (React 19) server + UI. Manages saved searches (`queries` collection). Entry: `yarn start` → `.output/server/index.mjs`.
- **`worker`** — `lib/worker.ts`. Owns the Bull queues, runs the crawl on a cron, and sends email. Run with `node ./lib/worker.ts`.

Backing services: **Valkey** (Redis-compatible, backs Bull queues + the processed-IDs dedupe set) and **MongoDB** (stores saved searches and Better Auth session/user data).

## Architecture

```
QueryForm (UI) ──server fn──> queriesCollection (MongoDB "queries")
                                      │
                                      ▼
worker.ts ── crawlerQueue (Bull/Valkey, cron */5) ──> processJob.ts
                                      │
                                      ├─ searchLatestResults.ts  (fetch + JSDOM scrape)
                                      ├─ dedupe via PROCESSED_IDS_SET (Valkey set, key = `${email}:${adId}`)
                                      └─ notificationQueue (Bull) ──> nodemailer (Gmail SMTP)
```

- **Frontend code** lives in `src/` (`components/`, `routes/`, `helpers/`).
- **Worker code** lives in `lib/`. The two share `src/helpers/querySchema.ts` and the queue helpers in `lib/`.
- Routes use TanStack Router file-based routing. `src/routeTree.gen.ts` is **generated** — never edit it by hand.
- Server actions are TanStack Start server functions (`"use server"`, `createServerFn`) in `src/helpers/*Action.ts`, gated by `authMiddleware`.

### Scraping (`lib/searchLatestResults.ts`)

Fetches the Kleinanzeigen results page and parses it with JSDOM. This is the most fragile part of the codebase — it depends on Kleinanzeigen's HTML structure (`#srchrslt-adtable`, `article.aditem`, `data-adid`, etc.). Notes when working here:

- Use `.textContent`, not `.innerText` (JSDOM doesn't handle `innerText` well).
- Skip `.badge-hint-pro-small-srp` ("PRO" paid/related ads — not genuine matches).
- Bail out if `#saved-search-empty-result` is present (results shown would be suggestions, not matches).
- A query is either a full Kleinanzeigen URL or a bare keyword (defaults to a Berlin search).

## Environment & secrets

- Env is validated with `@t3-oss/env-core` + Zod: `src/helpers/frontend-env.ts` (frontend) and `lib/worker-env.ts` (worker). Add new env vars there.
- **Secrets are Docker secrets, not env values.** Vars ending in `_FILE` (e.g. `AUTH_SECRET_FILE`, `MONGODB_CONNECTION_STRING_FILE`, `GMAIL_PASS_FILE`) hold a *path*; the code reads the file at that path. Secret files live in `./secrets/` (gitignored).
- `.env.example` lists the non-secret vars. Auth is OAuth via a `pocket-id` provider (Better Auth).

## Development

```bash
yarn dev    # docker compose up: frontend (:3000), worker (--watch), valkey, mongodb
```

`yarn dev` is the only supported way to run locally — it brings up all four services via `compose.yaml` + `compose.dev.yaml`. Bull/Valkey and MongoDB are required for the app to function.

## Checks — run before finishing any change

CI (`.github/workflows`) runs these four as a matrix; `release-it` runs them too. Match it locally:

```bash
yarn tsc                  # typecheck (noEmit, checkJs is on)
yarn eslint .
yarn prettier . --check   # formatting; use `yarn prettier . --write` to fix
yarn vite build           # must build cleanly
```

There is **no test suite** — verification is the four checks above plus, where relevant, manual exercise via `yarn dev`.

## Conventions

- TypeScript ESM throughout (`"type": "module"`). Use **`.ts`/`.tsx` extensions in relative imports** (`allowImportingTsExtensions` is on) — match the existing import style.
- Strict TS; `checkJs` is enabled, so config `.mjs` files use `// @ts-check`.
- React 19 with the React Compiler (babel plugin) — do not add manual `useMemo`/`useCallback` for the compiler's sake.
- Mantine for UI components, react-hook-form + Zod for forms.
- Prettier (with the oxc plugin) owns formatting; 2-space indent, LF line endings (`.editorconfig`).
- The worker uses `console.error` for operational logging (intentional — keeps logs on stderr).

## Releasing

`yarn release` (release-it): runs the four checks, bumps the version, tags `v*`, and pushes. The `v*.*.*` tag triggers the GitHub Actions workflow that builds and pushes a multi-arch image to `ghcr.io`. Must be on `main` with a clean tree.

## Gotchas

- Don't edit `src/routeTree.gen.ts` (generated) or `tsconfig.tsbuildinfo`.
- Queue/Redis keys are hard-coded UUIDs in `lib/constants.ts` — changing them orphans existing jobs and the dedupe set.
- The worker seeds a baseline crawl with `sendNotifications: false` on startup (and when a query is added) so users aren't emailed about pre-existing listings. Preserve this when touching crawl scheduling.
- Dedupe is keyed per `email:adId`, so the same listing can notify multiple recipients but only once each.
