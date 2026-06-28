# ArcPassport Smart Contracts

This folder contains the future onchain contract architecture for ArcPassport.

## ArcPassportSBT.sol

`ArcPassportSBT.sol` is a Soulbound Builder Passport NFT contract. It is an
ERC721-style token designed to represent a builder's persistent ArcPassport
identity onchain.

## Purpose

- Represent ArcPassport builder identity onchain.
- Keep the passport non-transferable.
- Allow one Builder Passport per wallet.
- Store token metadata through `tokenURI`.
- Let the ArcPassport backend generate metadata before minting.

## How It Works

The contract uses OpenZeppelin ERC721 building blocks and blocks transfers by
reverting `transferFrom` and `safeTransferFrom`. The owner/admin can mint a
passport to a builder wallet, and the contract tracks `wallet => tokenId` with
`passportOf`.

Burning is allowed for the token holder or owner/admin. The burn flow clears the
wallet mapping, leaving future remint policy to the production mint design.

## Future Deploy Target

Arc Testnet.

## Install Dependencies

From the repository root:

```bash
npm install
```

## Compile

From the repository root:

```bash
npx hardhat compile
```

## Test

From the repository root:

```bash
npx hardhat test
```

## Required Environment Variables

Create a local `.env` file from `.env.example` and set:

```env
ARC_TESTNET_RPC_URL=
DEPLOYER_PRIVATE_KEY=
```

Never commit private keys. Keep `DEPLOYER_PRIVATE_KEY` only in local or secure
deployment environments.

## Future Mint Flow

1. Backend checks passport eligibility.
2. Backend generates Builder Passport metadata.
3. Admin/backend mint flow calls `mintPassport`.
4. Public passport links to the minted token.

## Future Deploy Command

Do not run this until Arc Testnet deployment is ready:

```bash
npm run deploy:arc-testnet
```

## Deployment Steps

Deployment is prepared but should only be run once real Arc Testnet environment
variables are available.

1. Install dependencies:

```bash
npm install
```

2. Compile:

```bash
npx hardhat compile
```

3. Run local contract tests:

```bash
npx hardhat test
```

4. Verify local deployment environment:

```bash
npx hardhat run contracts/scripts/verifyEnv.ts --network arcTestnet
```

Expected output:

```text
PASS ARC_TESTNET_RPC_URL exists
PASS DEPLOYER_PRIVATE_KEY exists
PASS Network reachable - arcTestnet
PASS Chain ID readable - <chain-id>
PASS Deployer address derived - <deployer>
PASS Wallet balance readable - <deployer> balance <amount> ETH
```

5. Deploy when ready:

```bash
npx hardhat run contracts/scripts/deployArcPassportSBT.ts --network arcTestnet
```

Expected output:

```text
ArcPassportSBT deployment prepared
Deployer: 0x...
Network: arcTestnet
Chain ID: <chain-id>
Contract address: 0x...
Transaction hash: 0x...
```

## Status

Not deployed yet. This is preparation only. No frontend mint button is connected
to this contract yet.
