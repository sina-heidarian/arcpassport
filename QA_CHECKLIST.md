# ArcPassport Manual QA Checklist

Use this checklist before continuing feature work or before a commit that changes app behavior.

## Demo Order

- [ ] Open `/` and show ArcPassport v1.0 Beta highlights
- [ ] Connect wallet from the Navbar
- [ ] Open `/dashboard` and show Passport, XP breakdown, Quest XP, Circle data, SBT badge, and public share link
- [ ] Open `/quests` and show quest progress
- [ ] Open `/integrations` or `/tools` and show Circle Wallets and Circle Contracts
- [ ] Import a Circle contract only in a prepared demo database
- [ ] Open `/passport/mint` and show SBT status, ownership, metadata readiness, and mint state
- [ ] Open `/passport/{wallet}` and show the public Passport
- [ ] Open `/leaderboard` and show builder rankings

## A. Landing Page

- [ ] Opens `/`
- [ ] Navbar is visible
- [ ] Wallet button is visible at the top-right
- [ ] Dashboard clutter is not shown before wallet connect
- [ ] CTA buttons work

## B. Wallet / Dashboard

- [ ] Connect wallet
- [ ] Passport auto-loads
- [ ] XP breakdown is visible
- [ ] Quest XP is visible
- [ ] Circle Wallets are visible
- [ ] Circle Contracts are visible
- [ ] Public Passport link works

## C. Workspace

- [ ] Opens `/tools`
- [ ] Daily Check-in is visible
- [ ] Deploy card is visible
- [ ] Mint Passport card is visible
- [ ] Circle Builder Infrastructure section is visible
- [ ] Disabled state works when wallet is disconnected

## D. Quests

- [ ] Opens `/quests`
- [ ] Completed quests render cleanly
- [ ] Claimable quests show Claim XP
- [ ] Locked quests are gray
- [ ] Claim XP does not double count

## E. Leaderboard

- [ ] Opens `/leaderboard`
- [ ] Ranking loads
- [ ] View public passport works

## F. Integrations

- [ ] Circle auth status shows `auth_ok: true`
- [ ] Circle wallets load
- [ ] Circle contracts load
- [ ] Import contract does not duplicate

## G. Public Passport

- [ ] Opens `/passport/{wallet}`
- [ ] Does not require wallet connection
- [ ] Shows XP breakdown
- [ ] Shows achievements
- [ ] Shows contracts
- [ ] Share button works

## H. Passport NFT

- [ ] Opens `/passport/mint`
- [ ] Contract status loads
- [ ] Contract info loads
- [ ] Ownership check loads
- [ ] Mint Mode shows Backend/Admin Mint
- [ ] User-paid mint is shown as unavailable for the deployed contract
- [ ] Already minted wallet shows Token ID
- [ ] SBT ownership badge shows recipient wallet
- [ ] Full `token_uri` is hidden by default
- [ ] Metadata toggle works if implemented
- [ ] Mint button is disabled if already minted
- [ ] Mint button is only enabled if eligible and not minted

## I. Backend Smoke Test

- [ ] Run backend smoke test:

```powershell
.\scripts\smoke_test_backend.ps1
```

## J. Frontend Smoke Test

- [ ] Run frontend smoke test:

```powershell
.\scripts\smoke_test_frontend.ps1
```
