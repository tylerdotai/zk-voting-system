# ZK Voting System — SPEC.md

## Overview

Chair-managed allowlist Rob's Rules parliamentary voting DAO running on Ethereum Sepolia.

**Status:** Live demo ready (May 1st FW DAO hackathon)

---

## What It Is

A governance dApp where a chair manages voter eligibility via allowlist. Voters can create proposals, debate via amendments, and vote on-chain using Rob's Rules of Order parliamentary procedure.

**No ZK for Phase 1.** ZK proof privacy is Phase 2 (roadmap). Phase 1 is pure on-chain parliamentary voting.

---

## Architecture

### Smart Contracts

| Contract | Network | Address |
|---|---|---|
| `ZKVotingRobRulesNoZK` | Sepolia | `0x2D74a3a6Da491972D89ea2DbcB8328215bF7CA8f` |
| Chair + Owner | Sepolia | `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0` |

**No Groth16 verifier in use.** ZK layer is Phase 2. All voting is direct on-chain.

### Tech Stack

- **Frontend:** Next.js 16, TypeScript, plain CSS, Inter font, Vercel static export
- **Contract:** Solidity 0.8.19, Hardhat
- **Network:** Ethereum Sepolia testnet
- **Wallet:** MetaMask (browser extension)
- **No third-party identity:** Chair-managed allowlist only

---

## Rob's Rules Flow

```
[Created] → [Seconded] → [Voting] → [Passed / Failed]
              ↓
         Amendments (any voter can submit, chair approves)
```

1. **Created:** Any eligible voter creates a proposal
2. **Seconded:** Another voter seconds (prevents spam motions)
3. **Amendments:** Any eligible voter submits amendments; chair approves
4. **Voting:** Chair opens voting period (configurable duration: 5min–7 days)
5. **Passed/Failed:** After voting ends, anyone can finalize. Passed = yes > no.

### Contract Functions

| Function | Who | Description |
|---|---|---|
| `createProposal(string)` | Eligible voter | Create a new proposal |
| `secondProposal(uint256)` | Eligible voter (not proposer) | Second a proposal |
| `submitAmendment(uint256, string)` | Eligible voter | Submit an amendment |
| `approveAmendment(uint256, uint256)` | Chair | Approve an amendment |
| `fastTrackVoting(uint256, uint256)` | Chair | Bypass seconding, open voting directly |
| `openVoting(uint256, uint256)` | Chair | Open voting (requires seconded) |
| `castVote(uint256, uint256)` | Eligible voter | Vote yes/no/abstain |
| `callForDivision(uint256)` | Eligible voter | Call for recorded vote |
| `reconsider(uint256)` | Voted member | Request reconsideration |
| `reopenVoting(uint256)` | Chair | Reset votes after reconsideration |
| `finalizeProposal(uint256)` | Anyone | Close proposal (yes > no = passed) |

### Vote Choices

- `0` = Yes
- `1` = No
- `2` = Abstain

Abstains don't count toward the majority. Passed = yes votes strictly greater than no votes.

---

## State Machine

```
0: Created    — proposal exists, needs seconding
1: Seconded   — seconded, amendments can be submitted
2: Voting     — voting period active
3: Passed     — finalized, yes > no
4: Failed     — finalized, no >= yes
```

---

## Voter Eligibility

Chair-managed allowlist. No ENS, no Polygon ID, no third-party identity provider.

- `addVoter(address)` — chair or owner adds a voter
- `addVoters(address[])` — batch add
- `isEligible(address)` — check eligibility
- `removeVoter(address)` — chair or owner removes

---

## Test Accounts for Demo

| Role | Address | Private Key |
|---|---|---|
| Chair + Owner | `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0` | Funded Sepolia account |
| Voter 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Hardhat default |
| Voter 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | Hardhat default |

---

## Demo Flow

1. Chair creates proposal → select 5 min duration → Fast Track to open voting immediately
2. Voter 1 and Voter 2 connect wallets → second proposal → cast votes
3. Wait 5 minutes → click Finalize → proposal passes/fails based on vote tally

---

## Future (Phase 2)

- **ZK Privacy Layer:** Replace `castVote(uint256, uint256)` with a ZK proof that proves eligibility and vote choice without revealing identity or vote
- **Sindri or Circom 2.1.x:** Fix broken circom 2.2.3 toolchain for zkey regeneration
- **Multi-chain:** Deploy to Base and Ethereum mainnet
- **Gas optimization:** Batch voter registration, gasless voting via bouncer