<p align="center">
  <img src="public/logo.png" alt="Veridex logo" width="96" height="96" />
</p>

# Veridex

Veridex stops bots from jumping ahead in the repayment line for cross-chain
trade finance. When several lenders fund the same deal, Veridex proves who
paid in first and locks that order with the block itself, so no bot or
middleman can reorder it afterwards.

## What Is Built

- Landing page at `/` with an animated four-step walkthrough
- Wallet-gated dashboard at `/dashboard` (ConnectKit modal, wagmi, Sepolia
  network switch)
- Proof inspector at `/proofs/tx-892a-c4e`
- Hardhat contract project in `contracts/`
- `VeridexClearinghouse` deployed on Creditcoin CC3 testnet at
  `0x890d6Fdc4aB8B55bA228Fb991257ad2Bac673761`, using the Creditcoin `0x0FD2`
  precompile interface

The dashboard shows honest empty states until a facility opens or a deposit
confirms. The proof inspector is a labeled example walkthrough. Nothing in
the UI claims a real Sepolia USDC transfer or Creditcoin proof submission
unless performed with real wallet and deployment configuration.

## Architecture

Four pieces, one direction:

```text
Wallet (ConnectKit)
  -> Sepolia source vault        deposit confirms, its slot in the block is fixed
  -> Merkle inclusion proof      the block's math yields one exact position
  -> CC3 clearinghouse (0x0FD2)  proof verified on-chain, rank recorded
```

1. **Frontend (Next.js).** Landing page and dashboard. Wallets connect through
   ConnectKit and wagmi. The dashboard prepares deposits on Sepolia and shows
   the queue. Nothing is signed until the user confirms in their wallet.
2. **Source chain (Ethereum Sepolia).** Deposits go to the source vault. The
   position of a deposit inside its block decides who is first in line.
3. **Proof.** A Merkle inclusion proof ties the deposit to one exact slot in a
   finalized block. After finality the slot cannot change, so the order cannot
   be bought or relayed differently later.
4. **Settlement (Creditcoin CC3).** The `VeridexClearinghouse` contract checks
   the proof through the Creditcoin `0x0FD2` precompile and records the rank.
   The clearinghouse only trusts the configured source vault and chain key.

All shared values (RPC URLs, chain IDs, vault, clearinghouse address, chain
key) live in `veridex.config.ts` so the frontend and the contracts stay in
sync.

## Repository Layout

```text
app/                         Next.js app routes
components/                  Shared UI and wallet client components
contracts/                   Hardhat project
contracts/contracts/         Solidity source
contracts/scripts/           Hardhat scripts
veridex.config.ts            All non-secret config (RPC URLs, chains, addresses)
```

## Frontend

Install and run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Configuration:

All non-secret config lives in `veridex.config.ts` at the repo root: RPC
URLs, chain IDs, the source vault, the deployed clearinghouse address, and
the WalletConnect Cloud project ID. Set a real WalletConnect Cloud project
ID there for QR/mobile wallet connections in ConnectKit. No env files are
used anywhere; the deploy key is passed inline at deploy time.

## Contracts

Install and compile:

```bash
cd contracts
npm install
npm run build
```

Run a local Hardhat node:

```bash
npx hardhat node
```

Deploy to a local node (deploy parameters come from `veridex.config.ts`):

```bash
npm run deploy:local
```

With Hardhat's default local account, the first local deployment address is:

```text
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

For a real Creditcoin CC3 deployment, pass a funded testnet key inline as
shown below. RPC URLs, chain keys, and vault addresses come from
`veridex.config.ts`. Do not use demo keys for public deployments.

Deploy to Creditcoin CC3 testnet by passing a funded key inline. Nothing is
written to disk:

```bash
cd contracts
DEPLOYER_PRIVATE_KEY=0xYourFundedKey npm run deploy:testnet
```

To keep the key out of shell history, use a hidden prompt instead:

```bash
cd contracts
read -s "DEPLOYER_PRIVATE_KEY?Private key: " && export DEPLOYER_PRIVATE_KEY && npm run deploy:testnet
```

## Verification

```bash
npm run build
cd contracts && npm run build
```
