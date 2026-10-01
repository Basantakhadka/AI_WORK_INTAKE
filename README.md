# AI-Assisted Work Intake System

A monorepo containing the operations UI and API for an AI-assisted work
intake system: work items come in, get analysed by an LLM behind a provider
abstraction, and move through a small review workflow.

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

## Testing

```bash
cd apps/backend
npm test
```

30 Jest unit tests across 5 suites, colocated with the code they cover
(`*.spec.ts` next to each source file). They specifically target the
scenarios called out as important:

- **Duplicate `externalId`** — `work-items.repository.spec.ts` simulates the
  Postgres unique-violation (`23505`) that two near-simultaneous requests
  would race into, and asserts it turns into a `409 Conflict` with the
  existing item's id, not a duplicate row.
- **Invalid workflow transitions** — `workflow.service.spec.ts` exhaustively
  checks every allowed and disallowed `from -> to` pair (e.g. `RECEIVED ->
  COMPLETED`, `COMPLETED -> ANALYSING` are rejected).
- **Failed/invalid AI responses don't corrupt the work item** —
  `work-items.service.spec.ts` asserts that when the provider throws,
  `saveAnalysis` is never called (no partial AI fields persisted) and the
  item lands in `FAILED` with a safe error message instead.
- Bonus coverage: `ai-analysis.schema.spec.ts` (zod validation of the LLM
  response shape) and `normalize-ai-error.spec.ts` (timeouts/ZodErrors/raw
  SDK errors all map to safe, bounded messages).

No frontend automated tests are included; given the scope, effort went into
backend correctness (the part handling money-adjacent workflow state and
untrusted LLM output) over UI test scaffolding.

## Assumptions

Several requirements were intentionally underspecified; these are the calls
made and why:

- **Create and analyse are separate steps.** `POST /work-items` never
  triggers AI analysis itself — an operator (or a follow-up call) explicitly
  triggers `POST /:id/analyse`. This matches plain REST semantics (creating
  a resource shouldn't have a side effect as expensive/unreliable as an LLM
  call) and lets the frontend show a clear "not yet analysed" state.
- **No authentication.** The assessment scope is a single internal
  operations tool; auth is treated as infrastructure the real deployment
  would sit behind (see Production Considerations) rather than part of this
  exercise.
- **`category` is a free-form string, not an enum.** The example payload
  shows `DOCUMENT_REQUEST`, but categories are inherently open-ended
  business taxonomy that will evolve; only `priority` (a fixed 3-value
  scale) and `status` (the actual state machine) are modeled as enums.
- **`COMPLETED` and `FAILED` are not further reachable from most states** —
  the transition table only allows `RECEIVED -> ANALYSING -> (READY_FOR_REVIEW
  | FAILED) -> COMPLETED`, with `FAILED -> ANALYSING` reserved for `retry`.
  There is no "reopen a completed item" or delete endpoint; that was judged
  out of scope.
- **Analysis runs synchronously in the request.** `POST /:id/analyse` blocks
  until the LLM call resolves (or the 15s timeout fires) rather than
  queuing a background job. Acceptable for this scope; called out
  explicitly as a production gap below.

## Technical Decisions

1. **Duplicate detection via DB constraint, not app-level check-then-insert.**
   A `find-then-create` guard in application code would still race under two
   near-simultaneous requests with the same `externalId` (the exact scenario
   the assessment calls out). Instead, `external_id` has a real unique
   constraint, `WorkItemsRepository.create` just inserts, and on a `23505`
   violation it looks up the row that won the race and returns a `409` with
   its id. The database is the single source of truth for uniqueness; the
   catch block only exists to turn a low-level driver error into a clean API
   response.
2. **The AI vendor is fully hidden behind an `AIProvider` interface, and its
   output is treated as untrusted input.** `WorkItemsService` depends only on
   `AIService` -> `AIProvider`; `MockAIProvider` and `OpenAIProvider` are
   interchangeable via `AI_PROVIDER=mock|openai`. Whatever a real LLM
   returns is parsed as JSON and validated against a `zod` schema before it
   touches the database — a timeout, malformed JSON, an unexpected field
   shape, or a total provider outage all normalize to the same outcome: the
   item moves to `FAILED` with a short, safe error message and an
   incremented `aiAttempts`, never a half-written analysis.
3. **Every status change writes an immutable history row in the same
   transaction as the status update.** `transition()` and
   `markAIAsFailed()` both run inside one DB transaction that updates
   `work_items.status` and inserts into `work_item_status_history`
   (`from_status`, `to_status`, `reason`). This trades one extra write per
   transition for a full audit trail — useful both for debugging *why* an
   item failed AI analysis and as the natural foundation for anything a
   production build might add later (SLA timers, per-transition metrics).

## Production Considerations

What would change if this went to production, roughly in the order it would
actually get tackled:

- **Background processing.** `POST /:id/analyse` should enqueue a job
  (e.g. BullMQ/SQS) and return `202 Accepted` immediately instead of holding
  the HTTP connection open for the LLM round-trip; the frontend would poll
  or subscribe (SSE/WebSocket) for completion. This also makes retry/backoff
  and rate-limiting the AI provider much easier to reason about.
- **AuthN/AuthZ.** Put the API behind the org's SSO/OIDC provider and add
  role-based access — e.g. only certain roles can mark an item `COMPLETED`
  or trigger a `retry` — plus an actual "who did this" actor on each status
  history row instead of just `reason`.
- **Observability.** Structured logs with a request/correlation id, metrics
  (AI call latency and failure rate by provider, queue depth, transition
  counts by status), and tracing around the AI call boundary specifically,
  since that's the slowest and least reliable part of the system.
- **LLM reliability & cost.** Retry-with-backoff and a circuit breaker
  around the provider call, caching identical analyses, tracking token
  usage/cost per request, and routing low-priority items to a cheaper model
  with escalation to a stronger one only when needed.
- **Scalability.** API instances are already stateless and horizontally
  scalable; the real bottleneck is AI throughput, not HTTP traffic — moving
  analysis to a worker pool (per the background-processing point) lets the
  two scale independently.
- **Security.** Secrets in a vault/secret manager instead of `.env` files,
  rate-limiting on the public intake endpoint, a real CORS allow-list
  instead of the current permissive default, and input size limits on
  `description`.
- **Database design.** Migration review as a CI gate, an archival/pruning
  strategy for `work_item_status_history` once it grows large, and read
  replicas for `GET /work-items` if list traffic grows independently of
  writes.



## Database dump file

`prod_local-{odin_assignment}-dump.sql` (repo root) is a plain-SQL `pg_dump`
(PostgreSQL 16) of the local database. It contains the schema (`migrations`,
`work_items`, `work_item_status_history`) plus the sample data, so you can
restore a ready-to-use database without running migrations.

Restore into an empty database (the file name contains braces, so quote it):

```bash
# Against the Docker Compose postgres service
docker compose up -d postgres
docker compose exec -T postgres psql -U postgres -d work_intake \
  < 'prod_local-{odin_assignment}-dump.sql'

# Or against a local PostgreSQL
createdb work_intake
psql -d work_intake -f 'prod_local-{odin_assignment}-dump.sql'
```

If you restore the dump, skip `npm run migration:run` — the `migrations`
table is already populated.
