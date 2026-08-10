# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

TRIB/HIVE is a single Next.js 15 application (not a monorepo). It serves three main sections:
- **Homepage** (`/`) — TRIB organization info
- **Handbook / HIVE** (`/handbook/*`) — Climate adaptation case study library with AI search, chat, brief builder
- **Roadmap** (`/roadmap/*`) — 2035 Vision roadmap

### Running the dev server

```bash
npm run dev
```

The app uses `DATA_PROVIDER` env var (default: `json`) to switch between data backends. With `DATA_PROVIDER=json` (the default), the app works fully with bundled static JSON data — no database or API keys needed. Copy `.env.example` to `.env.local` for local development.

### Lint

```bash
ESLINT_USE_FLAT_CONFIG=false npm run lint
```

Note: The project requires an `.eslintrc.json` file with `{"extends": "next/core-web-vitals"}` to be present for lint to run non-interactively. There are pre-existing lint errors (missing `@typescript-eslint` rule definitions) that do not affect compilation or runtime.

### Build

```bash
npx next build --no-lint
```

Note: The production build (`npm run build`) fails due to pre-existing lint errors and a `<Html>` import issue in the 404 page. However, TypeScript compilation and type checking both pass successfully. The dev server works without issues.

### Key gotchas

- **Node.js 22.x required** — the CI config specifies Node 22.
- **No Docker, no external services needed for dev** — the JSON data provider is the default and ships with the repo.
- **AI features degrade gracefully** — without `OPENAI_API_KEY`, semantic search falls back to keyword search, and chat returns mock responses.
- **`next lint` is interactive without config** — always ensure `.eslintrc.json` exists before running lint.
- **`output: "standalone"` in next.config.ts** — this is for Azure deployment; doesn't affect dev mode.
