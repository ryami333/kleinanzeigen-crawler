# kleinanzeigen-crawler

A self-hosted crawler for [Kleinanzeigen.de](https://www.kleinanzeigen.de), Germany's
largest classifieds site. Save the searches you care about, and the crawler will poll
Kleinanzeigen every five minutes and **email you the moment a new matching listing
appears** — so you're first in line for that secondhand bargain instead of refreshing
the page yourself.

A small web UI (behind OAuth login) lets you add, edit, and remove your saved searches.

> **Note:** This is an unofficial project and is not affiliated with or endorsed by
> Kleinanzeigen. It scrapes the public results pages, so it's inherently fragile —
> Kleinanzeigen can change their HTML at any time and break crawling. Please use it
> responsibly and keep the default 5-minute poll interval to avoid hammering their
> servers.

## How it works

The app runs as **two processes from a single Docker image**, backed by two services:

| Component    | Role                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| **frontend** | [TanStack Start](https://tanstack.com/start) (React 19) web UI for managing saved searches. |
| **worker**   | Runs the crawl on a cron (`*/5`), dedupes results, and sends notification emails.           |
| **Valkey**   | Redis-compatible store backing the job queues and the "already-seen" dedupe set.            |
| **MongoDB**  | Stores saved searches plus authentication (user/session) data.                              |

```
 Web UI ──> MongoDB ("queries")
                │
                ▼
 worker ── crawler queue (every 5 min) ──> scrape Kleinanzeigen results
                │
                ├─ dedupe against listings already seen (Valkey set)
                └─ notification queue ──> email (Gmail SMTP)
```

A saved search is either a **full Kleinanzeigen URL** (paste the URL of a search you've
set up on the site) or a **bare keyword** (which defaults to a Berlin-wide search).

To avoid blasting you with emails about listings that already exist, the worker runs a
silent "baseline" crawl when it starts up and whenever you add a new search — only
genuinely new listings discovered after that point trigger an email.

## Requirements

- A host with [Docker](https://docs.docker.com/get-docker/) and Docker Compose.
- A **MongoDB** instance and a **Valkey/Redis** instance (the bundled `compose.yaml`
  provisions both for you).
- A **Gmail account** with an [app password](https://support.google.com/accounts/answer/185833),
  used to send notification emails over SMTP.
- An **OpenID Connect (OAuth) provider** to gate the web UI. This project is built
  against [Pocket ID](https://github.com/pocket-id/pocket-id), but any OIDC-compatible
  provider configured through [Better Auth](https://www.better-auth.com/) should work.

## Configuration

Configuration is split into two parts: plain environment variables (`.env`) and
**Docker secrets** (files under `./secrets/`). Secrets are never passed as env values —
the corresponding `*_FILE` env var holds the _path_ to a file, and the app reads the
file at runtime.

### 1. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

| Variable                      | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| `GMAIL_USER`                  | Gmail address used to send notifications.                                  |
| `NODEMAILER_FROM_ADDRESS`     | "From" address shown on notification emails.                               |
| `NODEMAILER_TO_ADDRESS`       | Address that notifications are sent to.                                    |
| `OAUTH_CLIENT_ID`             | OAuth client ID from your OIDC provider.                                   |
| `OAUTH_ISSUER`                | Issuer URL of your OIDC provider (e.g. `https://auth.example.com`).        |
| `BASE_URL`                    | Public URL the frontend is served from (used for auth redirects).          |
| `VALKEY_HOST`                 | Hostname of the Valkey instance (`valkey` when using the bundled compose). |
| `BETTER_AUTH_TRUSTED_ORIGINS` | _Optional._ Comma-separated extra trusted origins for Better Auth.         |
| `PORT`                        | _Optional._ Frontend port (defaults to `5555`).                            |

### 2. Secrets

Each secret is a file inside `./secrets/` containing just the secret value. Create them:

```bash
mkdir -p secrets
openssl rand -hex 32 > secrets/AUTH_SECRET            # Better Auth signing secret
printf '%s' 'your-gmail-app-password'   > secrets/GMAIL_PASS
printf '%s' 'your-oauth-client-secret'  > secrets/OAUTH_CLIENT_SECRET
printf '%s' 'a-strong-password'         > secrets/MONGODB_ROOT_PASSWORD
# Connection string must match the Mongo root credentials above:
printf '%s' 'mongodb://root:a-strong-password@mongodb:27017' > secrets/MONGODB_CONNECTION_STRING
```

| Secret file                 | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `AUTH_SECRET`               | Better Auth session-signing secret (`openssl rand -hex 32`). |
| `GMAIL_PASS`                | Gmail app password for SMTP.                                 |
| `OAUTH_CLIENT_SECRET`       | OAuth client secret from your OIDC provider.                 |
| `MONGODB_ROOT_PASSWORD`     | Root password for the bundled MongoDB container.             |
| `MONGODB_CONNECTION_STRING` | Full MongoDB connection string the app connects with.        |

## Running it

### With the published image

A multi-arch image is published to the GitHub Container Registry on every release:

```
ghcr.io/ryami333/kleinanzeigen-crawler
```

The bundled `compose.yaml` builds from source by default. To run the published image
instead, replace the `build:` blocks for the `frontend` and `worker` services with
`image: ghcr.io/ryami333/kleinanzeigen-crawler:latest` (pin to a specific `v*.*.*` tag
in production). Then:

```bash
docker compose up -d
```

This starts all four services — `frontend`, `worker`, `valkey`, and `mongodb` — on an
internal Docker network. MongoDB and Valkey data are persisted under `./data/`.

Once it's up, open the frontend (at your `BASE_URL`), log in through your OAuth
provider, and add your first saved search.

### From source / for development

```bash
yarn dev
```

This runs `docker compose` with both `compose.yaml` and `compose.dev.yaml`, bringing up
all four services with the frontend on **http://localhost:3000**, file watching on the
frontend and worker, and Valkey/MongoDB ports exposed to the host. Docker Compose is the
only supported way to run locally — the queues and database are required for the app to
function.

## Project layout

- `src/` — frontend code (TanStack Start UI, routes, server functions, helpers).
- `lib/` — worker code (Bull queues, scraping, email).
- `compose.yaml` / `compose.dev.yaml` — service definitions for production and dev.
- `Dockerfile` — single image used for both the `frontend` and `worker` processes.
- [`AGENTS.md`](AGENTS.md) — deeper architectural notes (primarily for contributors).

## License

See the repository for license details.
