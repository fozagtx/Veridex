# Veridex PRD

RWA track. BUIDL CTC 2026 Fall. Settlement on Creditcoin CC3.

## Problem Statement

Several lenders fund the same trade-finance deal. Bots and middlemen can see a pending deposit and jump the repayment line. The wallet that paid in first can end up last.

## Solution

Deposits land on Ethereum Sepolia. Veridex proves the deposit on Creditcoin with USC (`0x0FD2`) and locks rank from the source-chain block order. Who relays first does not change the line.

## User Stories

1. As a lender, I want to connect a wallet in place, so I can enter the app without leaving the page.
2. As a connected lender, I want to land on the dashboard, so I can prepare a deposit.
3. As a lender, I want to switch to Sepolia, so the deposit is on the source chain Veridex trusts.
4. As a lender, I want to enter an amount and prepare a deposit, so nothing is signed until I confirm in my wallet.
5. As a lender, I want my place in line to come from the confirmed Sepolia slot, so a faster relay cannot take it.
6. As a later lender, I want to see I am junior, so I know I am repaid after earlier funders.
7. As a borrower or operator, I want one locked order per deal, so repayment is not discretionary.
8. As a visitor, I want a plain walkthrough of connect, facility, deposit, and locked rank, so I understand the product before I connect.
9. As a visitor, I want to inspect an example proof, so I can see what “checked on Creditcoin” means.
10. As a reviewer, I want honest empty states, so the app never claims a live facility or queue that is not there.

## Implementation Decisions

- Next.js app: landing, dashboard, proof inspector.
- Wallet: ConnectKit + wagmi. Connect opens the modal. On connect, route to `/dashboard`.
- Dashboard: one card. Wallet first. Flow, facility stack, and queue as diagrams. No hex vault boxes.
- Source deposits: Ethereum Sepolia. Vault and chain key live in shared config.
- Settlement: `VeridexClearinghouse` on Creditcoin CC3 testnet (`0x2133358Da6CeD8dD5E318A2342e5e0C237A0a09b`).
- USC: the clearinghouse calls the native verifier at `0x0FD2` with the Merkle proof and continuity proof, then records `seniorityKey` from block height and tx index.
- Replay: the same proof cannot be processed twice.
- Trust: only the configured Sepolia vault and chain key (`11155111`).
- Copy: user language on the site. Merkle, precompile, and relay detail stay in this PRD and the README architecture.
- Deploy: Render Blueprint. Frontend typecheck excludes the Hardhat project.

## Testing Decisions

- Test what a user can see and do, not internal file layout.
- Must hold: connect stays on the page; connected wallet reaches the dashboard; prepare does not send a tx; empty facility and queue stay empty; a valid USC proof can become rank; a duplicate proof is rejected; a later Sepolia slot cannot become senior to an earlier one.
- Local signal: `npm run build` for the app, `npm run build` in `contracts/` for the clearinghouse.

## Out of Scope

- Live Sepolia USDC transfers and mainnet.
- A real open facility or live queue in the UI.
- A production WalletConnect project ID (placeholder in config).
- Borrowing, interest, or repayment execution.
- Tokenization of the invoice itself.

## Further Notes

Track: RWA. USC is required: without `0x0FD2`, rank cannot be proven. Demo path: landing → connect → dashboard card → proof inspector.
