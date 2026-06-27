# ArcPassport

ArcPassport is a builder identity app for Arc. It turns wallet activity into a persistent builder profile with XP, reputation, deployments, achievements, quests, leaderboard ranking, and public passport pages.

## Architecture

ArcPassport is split into a FastAPI backend and a Next.js frontend.

- `backend/app/main.py` creates the FastAPI app, configures CORS, waits for PostgreSQL, runs safe local additive migrations, and includes routers.
- `backend/app/routers/` contains endpoint definitions.
- `backend/app/services/` contains business logic for passports, deployments, leaderboard, stats, quests, achievements, ArcScan, and Circle blueprints.
- `backend/app/models.py` contains SQLAlchemy models.
- `frontend/app/` contains Next.js routes.
- `frontend/components/` contains reusable UI components.
- `frontend/hooks/` contains frontend data-fetching hooks.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Uvicorn
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Wallet: wagmi, RainbowKit
- Infrastructure: Docker Compose

## Implemented Features

- Wallet connect
- Passport dashboard
- XP and reputation scoring
- Deployment tracking and deployment XP
- Quest engine with one-time XP claims
- Achievements
- Leaderboard
- Public passport profiles
- Faucet helper
- Builder Workspace
- Profile settings
- Activity timeline
- Platform stats
- Mock Builder Passport NFT preparation
- Mock Circle integration blueprints for Contracts, Wallets, and Paymaster
- Circle integration status page

## Local Development

Create environment files from `.env.example` and keep secrets backend-only.

Backend requires:

```env
DATABASE_URL=postgresql://arc:arcpass@db:5432/arcpassport
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=INFO
CIRCLE_BASE_URL=https://api-sandbox.circle.com
CIRCLE_API_KEY=
```

Frontend uses:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
INTERNAL_API_URL=http://backend:8000
```

## Docker

Start the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

Docker health checks are configured for PostgreSQL, backend, and frontend.

## API Overview

Core endpoints:

- `GET /`
- `GET /health`
- `GET /passport/{wallet}`
- `PATCH /passport/{wallet}/profile`
- `POST /passport/{wallet}/mint`
- `POST /checkin/{wallet}`
- `GET /leaderboard`
- `GET /stats`
- `POST /deployment`
- `GET /deployments/{wallet}`
- `GET /quests`
- `GET /quests/{wallet}`
- `POST /quests/{wallet}/claim/{quest_id}`

Circle blueprint endpoints:

- `GET /circle/status`
- `POST /circle/contracts/deploy`
- `GET /circle/wallets/status`
- `POST /circle/wallets/create`
- `GET /circle/paymaster/status`
- `POST /circle/paymaster/estimate`

Circle endpoints are mock/preparation only. They do not call real Circle APIs yet.

## Testing

Run the backend smoke test after Docker is up:

```powershell
.\scripts\smoke_test_backend.ps1
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Roadmap

MVP foundation:

- Stabilize backend routing, services, config, logging, smoke tests, and Docker.
- Keep local migrations additive and non-destructive.
- Add Alembic before production migrations.

V2:

- Real Circle Contracts API integration
- Real Circle Wallets API integration
- Gateway
- CCTP
- Real NFT minting
- AI Builder
- Arc App Kit

Deferred:

- Circle Mint
- CPN
- StableFX
- Enterprise treasury and payment workflows
