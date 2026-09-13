<p align="center">
  <img src="public/logo.png" alt="Veridex logo" width="96" height="96" />
</p>

# Veridex

Veridex is for trade deals where more than one person puts money in. When
the deal pays back, the person who paid first gets paid first. A bot cannot
jump the line.

Today the line can get reordered. The wallet that paid first can end up
last. Veridex locks the order on Creditcoin so that cannot happen.

## How to explain it

**What it is.** Veridex is for trade deals where more than one person puts
money in. When the deal pays back, the person who paid first gets paid
first. A bot cannot jump the line.

**Why that matters.** Today the line can get reordered. The wallet that
paid first can end up last. We lock the order on Creditcoin so that cannot
happen.

**What you show.** I pay in. I am first in line. I pay the deal back. I get
my money back. If someone else had paid after me, they would wait.

**Why Creditcoin.** The clearinghouse lives on Creditcoin. That is where
the line is kept and where payout happens.

**If they ask about USC / proofs.** Creditcoin can also check a deposit
that happened on another chain. Same rule: first confirmed, first paid.

**If they ask what you make.** A cut of each deal, later. This is the
working line.

## What Is Built

- Landing page at `/`
- Dashboard at `/dashboard`: pay in, pay the deal back, get your money back
- Proof inspector at `/proofs/tx-892a-c4e`
- `VeridexClearinghouse` on Creditcoin CC3 testnet:
  [`0x32A69a587488EB9664A7F7E6f6a6a2B33657446A`](https://creditcoin-testnet.blockscout.com/address/0x32A69a587488EB9664A7F7E6f6a6a2B33657446A)

Demo on Creditcoin with CTC: pay in, pay the deal back (same amount), get
your money back. One person can play both sides to prove the line.

## Architecture

Live demo path:

```text
Wallet -> pay in CTC -> line on Creditcoin -> pay the deal back -> first in line gets CTC back
```

Creditcoin can also check a deposit from another chain (USC / `0x0FD2`). Same
rule: first confirmed, first paid. The working loop judges can click is the
CTC path on Creditcoin.

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
