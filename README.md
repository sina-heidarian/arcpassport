# ArcPassport

Builder identity and workspace for Arc.

ArcPassport helps Arc builders connect their wallet, track onchain activity, earn XP, complete quests, import Circle contracts, view Circle wallets, and share a public builder passport.

## Status

MVP in active development.

## Current Features

- Wallet Connect
- Arc Passport dashboard
- XP and reputation
- XP breakdown
- Daily check-in
- Quest engine
- Quest XP claiming
- Achievements
- Leaderboard
- Public Passport
- Builder Workspace
- Circle API auth
- Circle Wallets listing
- Circle Contracts listing
- Import Circle contracts into ArcPassport
- Builder Passport NFT mint integration
- Faucet helper
- Docker setup
- Backend and frontend smoke tests

## Tech Stack

Backend:

- FastAPI
- SQLAlchemy
- PostgreSQL
- Docker

Frontend:

- Next.js
- React
- TypeScript
- Tailwind
- RainbowKit
- Wagmi
- Viem

Integrations:

- Arc Testnet
- ArcScan
- Circle Wallets API
- Circle Contracts API

## Architecture

- `frontend/`: Next.js app routes, React components, hooks, wallet connection, and ArcPassport UI.
- `backend/`: FastAPI app, versioned routers, services, SQLAlchemy models, scoring, quests, deployments, and Circle API integration.
- `scripts/`: Smoke test scripts for backend and frontend quality checks.
- `docker-compose.yml`: Local development stack for PostgreSQL, backend, and frontend.

## API

Current API routes are exposed under `/api/v1`.

Examples:

- `GET /api/v1/passport/{wallet}`
- `GET /api/v1/passport/{wallet}/metadata`
- `GET /api/v1/passport/{wallet}/eligibility`
- `GET /api/v1/quests/{wallet}`
- `GET /api/v1/leaderboard`
- `GET /api/v1/stats`
- `GET /api/v1/circle/status`
- `GET /api/v1/deployments/{wallet}`

Legacy unversioned routes are temporarily kept as compatibility aliases while the frontend migrates.

Health endpoints:

- `GET /health`
- `GET /health/ready`

## Builder Passport NFT

ArcPassport integrates with the deployed ArcPassportSBT contract for eligible
wallet minting. The backend provides metadata and eligibility checks; the
frontend submits the mint transaction from the connected wallet. Circle is not
used for minting.

The deployed ArcPassportSBT contract is read by the frontend from:

```env
NEXT_PUBLIC_ARCPASSPORT_SBT_ADDRESS=0x68b28900F0e3cD760F0e34084CB7736E18a7931c
```

Mint flow:

1. User connects a wallet on Arc Testnet.
2. Frontend checks whether the wallet already owns a passport.
3. Frontend checks backend eligibility.
4. Eligible users click `Mint Builder Passport`.
5. Wallet confirms the transaction.
6. App waits for confirmation, shows the transaction hash, and refreshes
   passport, achievements, and quest progress.

Wallet requirements:

- Wallet must be connected.
- Wallet must be on Arc Testnet.
- Wallet must have enough testnet gas for the mint transaction.
- Wallet must not already own an ArcPassportSBT.

## Smart Contracts

- `contracts/ArcPassportSBT.sol`: Soulbound Builder Passport NFT contract.
- Deployed Arc Testnet contract: `0x68b28900F0e3cD760F0e34084CB7736E18a7931c`.

Contract tooling is prepared with Hardhat. Compile from the repository root:

```bash
npx hardhat compile
```

Future redeployments will use `ARC_TESTNET_RPC_URL` and `DEPLOYER_PRIVATE_KEY`
from local environment variables. Never commit private keys.

## Environment Variables

Create local environment files from `.env.example`. Do not commit real secrets.

Backend variables:

```env
DATABASE_URL=postgresql://arc:arcpass@db:5432/arcpassport
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CIRCLE_API_KEY=
CIRCLE_BASE_URL=https://api.circle.com
```

Frontend variables:

```env
INTERNAL_API_URL=http://backend:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ARCPASSPORT_SBT_ADDRESS=0x68b28900F0e3cD760F0e34084CB7736E18a7931c
```

## Local Development

Start the full Docker stack:

```bash
docker compose up --build
```

Local URLs:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

## Testing

Backend smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke_test_backend.ps1
```

Frontend smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke_test_frontend.ps1
```

Manual QA:

- See `QA_CHECKLIST.md`.

## Important Security Notes

- Never commit `.env`.
- Circle API key must stay backend-only.
- Frontend must never receive Circle secrets.
- Do not use `NEXT_PUBLIC_*` variables for private API keys.
- `/circle/status` must not expose Authorization headers or raw secrets.

## Roadmap

- Real Circle wallet creation
- Real Circle contract deploy
- Passport NFT metadata hosting and token profile deep links
- Arc AppKit
- AI Builder
- Advanced reputation engine
