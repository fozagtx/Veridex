<p align="center">
  <img src="public/logo.png" alt="Veridex logo" width="96" height="96" />
</p>

# Veridex

On-chain lending. Several wallets fund the same loan. Who confirms first gets paid first. A bot cannot cut in.

## What is it?

This is lending. Several wallets put CTC into one on-chain loan. Your pending send sits in a public waiting list. A bot watches, pays a higher fee, confirms first, and sits at the front.

When the borrower pays the loan back, first in line is paid first. If the bot confirmed first, the bot is paid first. You wait, or you lose.

Veridex locks that order on Creditcoin. First confirmed stays first. First confirmed is paid first.

The working parts:

- **Line** — wallets that funded the loan, in confirm order. Required.
- **Payout pot** — CTC the borrower pays back. Required. No pot, nobody gets paid.
- **Clearinghouse** — the contract that keeps the line and pays it out. Required. Lives on Creditcoin.
- **Dashboard** — pay in, pay the loan back, get your money back. Required.

## How it works

```text
  several wallets fund one loan
              |
              v
     pending send is public
              |
              v
     first confirm wins the place
              |
              v
        borrower pays back
              |
              v
     first in line is paid first
```

Stop condition: the pot is empty, or everyone in line has been paid.

You can play both sides. Money does not come back by itself. Step 2 is the payout pot.

```text
Wallet
  -> Pay in (CTC)
  -> Line on Creditcoin
  -> Pay the loan back (same amount, you pretend to be the borrower)
  -> Get my money back (first in line receives CTC)
```

## Why use it?

- The line is confirm order, not fee order.
- A bot cannot jump a confirmed place.
- The line and the payout live on the same chain.
- One wallet can prove the loop in three clicks.

This is the working line. A cut of each loan comes later. Results on testnet depend on CTC in the wallet, a confirmed pay-in, and a confirmed pay-back. Those are not guarantees.

## Live

- App: `/` and `/dashboard`
- Clearinghouse on Creditcoin CC3 testnet: [`0x7d6803Ab43E41963f871cBffFf3F0995d36E0048`](https://creditcoin-testnet.blockscout.com/address/0x7d6803Ab43E41963f871cBffFf3F0995d36E0048)
- Repo: https://github.com/fozagtx/Veridex

## Quick start

Need Node, npm, and a wallet on Creditcoin CC3 testnet with CTC.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

1. **Pay in** — CTC into the pot. You are first in line.
2. **Pay the loan back** — same amount again. You pretend to be the borrower.
3. **Get my money back** — first in line receives CTC.

If someone paid after you, they wait.

## Install

App:

```bash
npm install
npm run dev
```

Contracts:

```bash
cd contracts
npm install
npm run build
```

## Configuration

All non-secret values live in `veridex.config.ts`: RPC URLs, chain IDs, and the clearinghouse address. No env files. The deploy key is passed inline at deploy time. Never paste a key into chat.

## Deploy

Local:

```bash
cd contracts
npx hardhat node
npm run deploy:local
```

Creditcoin CC3 testnet. Pass a funded key inline. Nothing is written to disk:

```bash
cd contracts
DEPLOYER_PRIVATE_KEY=0xYourFundedKey npm run deploy:testnet
```

To keep the key out of shell history:

```bash
cd contracts
read -s "DEPLOYER_PRIVATE_KEY?Private key: " && export DEPLOYER_PRIVATE_KEY && npm run deploy:testnet
```

After a new deploy, put the new address in `veridex.config.ts`.

## Useful commands

```bash
npm run dev
npm run build
npm run typecheck
npm start

cd contracts && npm run build
cd contracts && npm run test
cd contracts && npm run deploy:local
cd contracts && npm run deploy:testnet
```

## Important limits

- Step 2 is required. No pay-back, nobody gets paid.
- You only get paid if you are the next unpaid place and you are that wallet.
- Old clearinghouse addresses are dead. Use `0x7d6803…0048`.

## Layout

```text
app/                  Next.js routes
components/           UI and wallet
contracts/            Hardhat project
veridex.config.ts     Shared non-secret config
```

## Development

```bash
npm install
npm run build
cd contracts && npm run build
```
