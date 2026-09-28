# AI-Assisted Work Intake System

A monorepo containing the operations UI and API for an AI-assisted work
intake system: work items come in, get analysed by an LLM behind a provider
abstraction, and move through a small review workflow.

Reference: [`docs/AI_Assisted_Work_Intake_System_Architecture_and_LLM_Integration_Guide.pdf`](./docs/AI_Assisted_Work_Intake_System_Architecture_and_LLM_Integration_Guide.pdf)

## Stack

| Layer         | Technology                          |
| ------------- | ------------------------------------ |
| Frontend      | React + TypeScript + Vite, Ant Design, TanStack Query |
| Backend       | NestJS + TypeScript                  |
| Database      | PostgreSQL, accessed via TypeORM     |
| AI            | Provider-abstracted (`mock` or `openai`) |
| Local runtime | Docker Compose                       |

## Architecture

```
React + TypeScript (Vite, Ant Design, TanStack Query)
        |
        | REST  /api/v1/work-items
        v
NestJS REST API
  Controller -> Service -> Workflow -> Repository
        |                        |
        v                        v
   PostgreSQL               AIService
                                  |
                             AIProvider (interface)
                              /          \
                    OpenAIProvider    MockAIProvider
```

The backend is a modular monolith on purpose — no queue, no microservices.
The AI vendor is hidden behind `AIProvider` so `WorkItemsService` never talks
to an SDK directly; swap `AI_PROVIDER=mock` for `AI_PROVIDER=openai` (or add
another implementation) without touching business logic.

### Work item workflow

```
RECEIVED --analyse--> ANALYSING --success--> READY_FOR_REVIEW --> COMPLETED
                          |
                          +--failure--> FAILED --retry--> ANALYSING
```

`externalId` has a PostgreSQL unique constraint — that is what actually
prevents duplicates under concurrent requests, not an application-level
check. Every transition is enforced server-side by `WorkflowService`.

## Project structure

```
.
├── apps/
│   ├── backend/                  NestJS API
│   │   └── src/
│   │       ├── config/           typed env configuration
│   │       ├── database/         TypeORM module, data source, migrations
│   │       └── modules/
│   │           ├── ai/           AIProvider interface, mock + OpenAI providers, zod validation
│   │           └── work-items/   controller, service, workflow, repository, DTOs
│   └── frontend/                 React + Vite operations UI
│       └── src/
│           ├── api/              axios client
│           └── features/work-items/
│               ├── components/   table, filters, details drawer, AI card, action buttons
│               ├── hooks/        TanStack Query hooks
│               ├── pages/        WorkItemsPage
│               ├── services/     REST calls
│               └── types/
├── docker-compose.yml
└── .env.example
```

## REST API

| Method | Endpoint                       | Purpose                                  |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/api/v1/work-items`            | Create a work item (rejects duplicate `externalId`) |
| GET    | `/api/v1/work-items`            | List, with `status`, `page`, `limit`     |
| GET    | `/api/v1/work-items/:id`        | Get one work item incl. AI result        |
| POST   | `/api/v1/work-items/:id/analyse`| Run AI analysis (`RECEIVED` only)        |
| POST   | `/api/v1/work-items/:id/retry`  | Retry AI analysis (`FAILED` only)        |
| PATCH  | `/api/v1/work-items/:id/status` | Move to an allowed next status           |

Each app under `apps/` is fully self-contained: its own `package.json`,
its own `node_modules` (never hoisted to the repo root), and its own `.env`.
There is no root install and no root `.env` — the two apps are independent
projects that happen to live in one repo and talk to each other over HTTP.

## Running with Docker (recommended)

Requires Docker and Docker Compose. No `npm install` needed on the host —
everything is installed inside the images.

```bash
# Optional: only needed if you want real OpenAI analysis instead of the
# built-in mock provider.
cp apps/backend/.env.example apps/backend/.env
# then set AI_PROVIDER=openai and OPENAI_API_KEY in that file

docker compose up --build
```

This starts three containers:

- `postgres` — PostgreSQL 16, with a persisted volume.
- `backend` — NestJS API on `http://localhost:3000/api/v1`. Runs
  `typeorm migration:run` on boot before starting the server. Reads
  `apps/backend/.env` if present (for `AI_PROVIDER`/`OPENAI_API_KEY`); the
  database URL is always pointed at the `postgres` service internally.
- `frontend` — the built React app served by nginx on
  `http://localhost:5173`, with `/api` reverse-proxied to the `backend`
  container so the browser never needs CORS or a separate host/port.

If `apps/backend/.env` doesn't exist, `AI_PROVIDER` defaults to `mock`, so
the stack works end-to-end with no API key.

## Running locally (without Docker)

Requires Node.js 18+ and a local/reachable PostgreSQL instance (you can
also just run `docker compose up postgres` for the database alone).

```bash
# Backend
cd apps/backend
npm install
cp .env.example .env
npm run migration:run
npm run start:dev        # http://localhost:3000/api/v1

# Frontend (separate terminal)
cd apps/frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173, proxies /api to :3000
```

The root `package.json` only has thin convenience wrappers
(`npm run dev:backend`, `npm run dev:frontend`, `npm run install:all`, ...)
that shell out to each app with `--prefix` — it installs nothing itself.

## Environment variables

Each app has its own `.env.example` — copy it to `.env` in that same
folder. Never commit a real `.env` file or API key.

`apps/backend/.env`

| Variable        | Description                                |
| --------------- | -------------------------------------------- |
| `DATABASE_URL`  | Postgres connection string                    |
| `PORT`          | Backend HTTP port (default `3000`)            |
| `CORS_ORIGIN`   | Allowed origin for the frontend               |
| `AI_PROVIDER`   | `mock` or `openai`                            |
| `OPENAI_API_KEY`| Required when `AI_PROVIDER=openai`            |
| `OPENAI_MODEL`  | Model name passed to the OpenAI SDK           |

`apps/frontend/.env`

| Variable            | Description                              |
| ------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL` | Base URL the frontend uses to call the API |

## AI integration notes

- Input sent to the model is narrowly scoped: just `title` and
  `description`.
- The model's response is treated as **untrusted input** — it is parsed and
  validated against a `zod` schema (`AIAnalysisSchema`) before anything is
  persisted.
- Any failure (timeout, provider error, malformed JSON, schema mismatch,
  empty response) moves the work item to `FAILED`, increments `aiAttempts`,
  and stores a safe error message — never a partial AI result.
- `retry` is only accepted from `FAILED`; the backend enforces this
  regardless of what the frontend shows.
