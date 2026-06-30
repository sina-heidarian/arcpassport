# ArcPassport

Builder identity and workspace for Arc.

ArcPassport helps Arc builders connect their wallet, track onchain activity, earn XP, complete quests, import Circle contracts, view Circle wallets, and share a public builder passport.

## Status

MVP in active development.

## Demo Flow

Use `DEMO_NOTES.md` as the live demo runbook.

Recommended v1.0 Beta flow:

1. Open `/` and show the ArcPassport v1.0 Beta highlights.
2. Connect wallet from the Navbar.
3. Open `/dashboard` to show Passport, XP breakdown, Quest XP, Circle data, SBT badge, and public share link.
4. Open `/quests` to show quest progress and claimable states.
5. Open `/integrations` or `/tools` to show Circle Wallets and Circle Contracts.
6. Import a Circle contract only in a prepared demo database.
7. Open `/passport/mint` to show SBT status, ownership, metadata readiness, and mint state.
8. Open `/passport/{wallet}` to show the public builder profile.
9. Open `/leaderboard` to show builder rankings.

## Current Features

- Wallet Connect
- Arc Passport dashboard
- XP and reputation
- XP breakdown
- Arc Testnet Sync Engine
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
- ArcPassportSBT contract registration and mint integration
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
- `GET /api/v1/passport/{wallet}/token-uri`
- `POST /api/v1/sync/{wallet}`
- `GET /api/v1/sync/{wallet}/status`
- `GET /api/v1/passport-nft/status`
- `GET /api/v1/passport-nft/contract-info`
- `GET /api/v1/passport-nft/{wallet}/ownership`
- `POST /api/v1/passport-nft/{wallet}/mint`
- `GET /api/v1/quests/{wallet}`
- `GET /api/v1/leaderboard`
- `GET /api/v1/stats`
- `GET /api/v1/circle/status`
- `GET /api/v1/deployments/{wallet}`

Legacy unversioned routes are temporarily kept as compatibility aliases while the frontend migrates.

Health endpoints:

- `GET /health`
- `GET /health/ready`

## Sync Engine

ArcPassport can synchronize builder activity from Arc Testnet for a wallet.
The sync service collects latest transactions, contract calls, token transfers,
balance data, and any discoverable contract deployments from ArcScan-compatible
Arc Testnet APIs.

Sync results update a lightweight backend cache with:

- last sync timestamp
- latest known block
- latest wallet activity stats
- sync status

Passport XP, reputation, rank, deployment XP, achievements, and quest progress
continue to use the existing scoring logic. If ArcScan or RPC data is
temporarily unavailable, the app falls back to the cached sync snapshot so the
dashboard can keep rendering.

## Circle Integration Status

Circle integration is enabled for safe backend-only reads and mock blueprints.

- Circle API auth status is checked from the backend only.
- Circle Wallets listing is read-only.
- Circle Contracts listing is read-only.
- Circle contract import stores existing contracts in ArcPassport deployment tracking.
- Circle wallet creation, real Circle contract deployment, and Circle mutating APIs are not part of v1.0 Beta.
- `CIRCLE_API_KEY` must stay backend-only and must never be exposed through frontend environment variables.

## Builder Passport NFT

ArcPassport registers the deployed ArcPassportSBT contract on Arc Testnet and
displays its status in the app. The backend provides metadata, eligibility,
ownership checks, and admin-wallet minting. Circle is not used for minting, and
private keys must never be exposed to the frontend.

The deployed ArcPassportSBT contract is configured with:

```env
ARCPASSPORT_SBT_ADDRESS=0x68b28900F0e3cD760F0e34084CB7736E18a7931c
NEXT_PUBLIC_ARCPASSPORT_SBT_ADDRESS=0x68b28900F0e3cD760F0e34084CB7736E18a7931c
```

Current app behavior:

1. Backend checks wallet eligibility.
2. Backend checks whether the wallet already owns an ArcPassportSBT.
3. Backend generates the base64 metadata token URI.
4. Backend signs and submits the mint transaction with `DEPLOYER_PRIVATE_KEY`.
5. Frontend shows waiting, success, transaction hash, and ArcScan link.

The mint endpoint exists, but automated smoke tests intentionally avoid calling
it because it can submit a real Arc Testnet transaction for an eligible wallet.

## Mint Modes

ArcPassport v1 uses Backend/Admin Mint for ArcPassportSBT.

- Current mode: Backend/Admin Mint
- Transaction sender: deployer/admin wallet
- NFT recipient: user wallet
- User-paid direct mint: not available in the deployed v1 contract

The SBT is still owned by the recipient user wallet after minting. The backend
only submits the mint transaction because the deployed contract restricts
minting to the contract owner/admin.

A future v2 contract may add user-paid minting, likely through a new public
mint function or a backend-signed eligibility flow. That would require a new
contract version and redeployment.

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
ARCPASSPORT_SBT_ADDRESS=0x68b28900F0e3cD760F0e34084CB7736E18a7931c
ARC_TESTNET_RPC_URL=
DEPLOYER_PRIVATE_KEY=
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
