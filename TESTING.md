# ArcPassport Testing Checklist

For full manual app QA, use [QA_CHECKLIST.md](QA_CHECKLIST.md).

## Docker

```bash
docker compose down
docker compose up --build
```

## Backend Checks

With Docker running:

```bash
curl http://localhost:8000/
curl http://localhost:8000/health
curl http://localhost:8000/health/ready
curl http://localhost:8000/api/v1/passport/<wallet>
curl http://localhost:8000/api/v1/leaderboard
curl http://localhost:8000/api/v1/stats
curl http://localhost:8000/api/v1/circle/status
curl http://localhost:8000/api/v1/passport-nft/status
curl http://localhost:8000/api/v1/passport-nft/contract-info
curl http://localhost:8000/api/v1/passport-nft/<wallet>/ownership
curl http://localhost:8000/api/v1/passport/<wallet>/token-uri
```

Legacy unversioned API paths are temporarily available as compatibility aliases.

Or run the backend smoke test script from another PowerShell terminal:

```powershell
.\scripts\smoke_test_backend.ps1
```

Docker health checks are configured for `db`, `backend`, and `frontend`.
Use `docker compose ps` to inspect service health.

`/circle/status` should return `configured: false` unless a backend-only
`CIRCLE_API_KEY` is configured. Use `CIRCLE_BASE_URL=https://api.circle.com`
for the documented Circle API-key auth check. Do not put Circle API keys in
frontend env vars.
When `CIRCLE_API_KEY` is set in backend env, `/circle/status` performs a safe
non-mutating Circle auth check and returns `auth_checked` and `auth_ok`.
Never expose `CIRCLE_API_KEY` through `NEXT_PUBLIC_*` frontend variables.
`/circle/status` does not return request headers or raw Circle response bodies
by default. Set backend-only `CIRCLE_DEBUG=true` only when temporary auth
debugging is needed; Authorization is still redacted.

```bash
curl http://localhost:8000/api/v1/circle/status
```

Passport NFT smoke checks are read-only. Do not add
`POST /api/v1/passport-nft/<wallet>/mint` to automated smoke tests because it
can send a real Arc Testnet transaction for eligible unminted wallets.

## Frontend Checks

Run frontend quality checks directly:

```bash
cd frontend
npm run lint
npm run build
```

Or run the frontend smoke test script from the repository root:

```powershell
.\scripts\smoke_test_frontend.ps1
```

- Open http://localhost:3000
- Load Passport
- Open `/faucet`
- Open `/tools`
- Open `/passport/<wallet>`
- Test Copy Public Link
- Test Public Passport page
- Test Deploy if wallet is connected

## Before Committing

```bash
git status
git diff
```

If working locally:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

If working with Docker:

```bash
docker compose up --build
```
