# ArcPassport Testing Checklist

## Docker

```bash
docker compose down
docker compose up --build
```

## Backend Checks

With Docker running:

```bash
curl http://localhost:8000/
curl http://localhost:8000/passport/<wallet>
curl http://localhost:8000/leaderboard
curl http://localhost:8000/stats
curl http://localhost:8000/circle/status
```

Or run the backend smoke test script from another PowerShell terminal:

```powershell
.\scripts\smoke_test_backend.ps1
```

`/circle/status` should return `configured: false` unless a backend-only
`CIRCLE_API_KEY` is configured. Do not put Circle API keys in frontend env vars.

## Frontend Checks

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
npm run build
```

If working with Docker:

```bash
docker compose up --build
```
