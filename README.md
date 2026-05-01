# ZK Voting System

**Rob's Rules parliamentary voting DAO for Fort Worth DAO — live on Ethereum Sepolia.**

[Live Demo](https://zk-voting-system-two.vercel.app) · [Chair Dashboard](https://zk-voting-system-two.vercel.app/chair) · [Verify Proposals](https://zk-voting-system-two.vercel.app/verify)

---

## What It Is

A governance dApp using Robert's Rules of Order for on-chain voting. No ZK required for Phase 1 — pure smart contract parliamentary democracy.

- Chair manages voter eligibility (allowlist)
- Voters create proposals, debate via amendments, vote on-chain
- Fast Track option for chair to bypass seconding
- Configurable voting duration (5min to 7 days)
- Reconsideration support and division calls

---

## Quick Start

### Demo Accounts

| Role | Address |
|---|---|
| Chair + Owner | `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0` |
| Voter 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| Voter 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |

### Demo Flow (15 minutes)

1. Connect chair wallet → create proposal → select **5 minutes** → **Fast Track**
2. Voter 1 and Voter 2 connect → second proposal → cast votes
3. Wait 5 minutes → **Finalize** → proposal passes/fails

---

## Contracts

| Contract | Address (Sepolia) |
|---|---|
| `ZKVotingRobRulesNoZK` (current) | `0x2D74a3a6Da491972D89ea2DbcB8328215bF7CA8f` |

---

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, plain CSS, Inter font, Vercel static export
- **Contract:** Solidity 0.8.19, Hardhat, OpenZeppelin
- **Network:** Ethereum Sepolia testnet
- **Wallet:** MetaMask

---

## Development

```bash
# Install
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Build frontend
cd frontend-app && npm install && npm run build
```

---

## Architecture

```
frontend-app/          Next.js 16 web app (Vercel static export)
├── pages/
│   ├── index.tsx      Voter portal
│   ├── chair.tsx      Chair dashboard
│   └── verify.tsx     Proposal lookup
├── components/
│   └── ChairDashboard.tsx
├── lib/
│   ├── ethereum.ts    Contract interaction
│   └── constants.ts   ABI + addresses
└── styles/
    └── globals.css    Civic design system

contracts/
├── ZKVotingRobRulesNoZK.sol   Current contract (live)
└── ZKVotingRobRulesWithCredentials.sol  Old ZK version (deprecated)
```

---

## ZK Privacy Layer — Phase 2

ZK proof generation is currently non-functional (circom 2.2.3 / snarkjs incompatibility). The `castVote` function in Phase 1 takes plain vote choices directly on-chain.

Phase 2 will add a ZK layer so voter identity and vote choice are never revealed on-chain. Fix requires either:
- **Sindri** (sindri.network) — external zk proving service
- **Circom 2.1.x** — downgrade toolchain to regenerate zkey

See [ROADMAP.md](./ROADMAP.md) for full timeline.

---

## Docs

- [SPEC.md](./SPEC.md) — architecture, contract functions, state machine
- [ROADMAP.md](./ROADMAP.md) — phase plan and contract status
- [WHITEPAPER.md](./WHITEPAPER.md) — problem statement, solution, ZK design
- [DESIGN.md](./DESIGN.md) — visual design language