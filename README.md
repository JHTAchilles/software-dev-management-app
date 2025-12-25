# CSCI3100 Project: Task Slayer - Kanban-like Software Development Task Manager

A Kanban-style software development manager built as a monorepo:

- **Web UI**: Next.js app (Kanban board + auth UI)
- **Backend API**: FastAPI service (auth, projects, tasks, license keys)

## Key Features

- **User authentication** (signup/login)
- **License key gated signup**
- **Projects and tasks** (CRUD)
- **Kanban workflow** with task states (e.g. Scheduled → In Progress → Completed)
- **Drag-and-drop** interactions in the UI

## Repository Structure

| Path           | What it is                                            |
| -------------- | ----------------------------------------------------- |
| `apps/web`     | Next.js web app (port 3000)                           |
| `apps/docs`    | Next.js docs app (port 3001)                          |
| `apps/backend` | FastAPI backend (port 8000)                           |
| `packages/*`   | Shared configs (`eslint-config`, `typescript-config`) |

## Prerequisites

- Node.js `>=18` and Yarn Classic (`yarn@1.22.x`)
- Python `>=3.13`
- Recommended for backend: `uv` (Python package manager/runner)

## Quick Start (Frontend)

From the repo root:

```bash
yarn install
yarn dev
```

This starts:

- Web UI: http://localhost:3000
- Docs UI: http://localhost:3001

## Quick Start (Backend API)

1. Configure environment variables:

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env` as needed (notably `DATABASE_URL` and `ALLOWED_ORIGINS`).

2. Run the API:

```bash
cd apps/backend
uv run python main.py
```

Backend endpoints:

- API base: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## License Keys (for Signup)

To generate and insert license keys into the backend database:

```bash
cd apps/backend
uv run python generate_license_keys.py 10
```

## Common Commands

From repo root:

- Dev: `yarn dev`
- Build: `yarn build`
- Lint: `yarn lint`
- Typecheck: `yarn check-types`
- Format: `yarn format`

## Testing

Frontend (Jest):

```bash
yarn workspace web test
```

Backend (pytest):

```bash
cd apps/backend
uv sync --extra test
uv run pytest
```

## Contributors

- Wong Ching Kei Achilles
- Chiu Ki Wai
- Niu Chen Yu
- Vuong Tsz Ching
