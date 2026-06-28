# ArcPassport Project Scope

This file keeps the project focused while ArcPassport stabilizes. Do not delete working features only because they are V2; use this scope to guide future work.

## MVP Features

- Wallet Connect
- Passport dashboard
- XP / Reputation
- Deployment tracking
- Deployment XP
- Achievements
- Leaderboard
- Public Passport
- Faucet helper
- Builder Workspace / Tools
- Circle API auth
- Circle Wallets listing
- Circle Contracts listing
- Import Circle contracts into ArcPassport
- Basic Passport NFT preparation, since it is already implemented as a mock/prep endpoint

## V2 Features

- Builder profile customization
- Real NFT minting
- Real Circle Contracts API deploy
- Real Circle Wallets API creation
- Gateway
- CCTP
- AI Builder
- Arc App Kit

## Deferred Features

- Circle Mint
- CPN
- StableFX
- Enterprise treasury/payment features

## Foundation Notes

- Keep local database changes additive and non-destructive.
- Alembic should be added before production migrations.
- Circle API keys must stay backend-only and out of frontend code.
- Read-only Circle API integration requires a backend-only `CIRCLE_API_KEY`.
- Circle Contracts API deploy is V2; the current `/circle/contracts/deploy` endpoint is mock/preparation only.
