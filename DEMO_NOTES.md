# ArcPassport v1.0 Beta Demo Notes

ArcPassport is a builder identity and workspace for Arc. It connects wallet activity, XP, quests, Circle developer infrastructure, contract imports, a soulbound Builder Passport, public profiles, and leaderboard progress into one demoable builder journey.

## Main Demo Flow

1. Open `/`
   - Show the clean landing page.
   - Point out ArcPassport v1.0 Beta highlights: Builder XP, Quest Progress, Circle Integration, and Soulbound Passport.

2. Wallet Connect
   - Connect a wallet from the top-right Navbar.
   - Explain that the dashboard auto-loads from the connected wallet.

3. Dashboard
   - Open `/dashboard`.
   - Show Passport overview, XP breakdown, Quest XP, Circle Wallets, Circle Contracts, SBT badge, public share card, and recent activity.

4. Quests
   - Open `/quests`.
   - Show Completed, Claimable, In Progress, and Locked quest states.
   - Claim XP only during a demo if the wallet and environment are intended for live transactions or state changes.

5. Circle Wallets
   - Open `/integrations` or `/tools`.
   - Show real read-only Circle Wallets loaded from the backend.
   - Confirm Circle API keys are backend-only.

6. Circle Contracts
   - Show real read-only Circle Contracts.
   - Explain that listing is read-only and does not deploy anything.

7. Contract Import
   - Import a Circle contract only if using a demo wallet/database where state changes are acceptable.
   - Show that imported contracts appear as Builder Contracts and count toward deployment progress without duplicates.

8. SBT Mint
   - Open `/passport/mint`.
   - Show contract status, contract info, ownership, metadata readiness, and eligibility.
   - For an already minted wallet, show Token ID and ArcScan link.
   - Only mint during a demo if the wallet is eligible, unminted, funded, and intentionally prepared for a real Arc Testnet transaction.

9. Public Passport
   - Open `/passport/{wallet}`.
   - Show the shareable builder identity page, XP breakdown, SBT badge, achievements, contracts, and activity.

10. Leaderboard
    - Open `/leaderboard`.
    - Show ranking by total builder progress and the public passport links.

## Demo Safety Notes

- Do not expose private keys, Circle API keys, or backend secrets.
- Smoke tests intentionally avoid the SBT mint endpoint because it can send a real Arc Testnet transaction.
- Circle Wallets and Circle Contracts listing are read-only.
- Real Circle wallet creation and real Circle contract deployment are not part of v1.0 Beta.
