# ZK Voting System — Development Paper

**Version:** 0.9-draft  
**Author:** Tyler Delano + Dexter  
**Context:** Fort Worth DAO HackFW 2026 Grant — $2,500  
**Updated:** 2026-04-19 (ENS-gated pivot)

---

## Executive Summary

ZK Voting System is a privacy-preserving governance dApp built on Ethereum for the Fort Worth DAO. It delivers full onchain Rob's Rules parliamentary voting with a mobile-first PWA interface.

**Identity Architecture (Phase 2 pivot):**
- ENS-gated voter allowlist — no Polygon ID dependency
- Chair-managed `addVoter(address)` function
- Future: ENS domain resolution for self-service eligibility proof

**Grant requirements satisfied:**
- Post-quantum ready (ML-DSA signatures, documented)
- Offline-capable (PWA service worker, blockchain sync)
- No third-party internet dependency (allowlist + local state)

---

## Problem

Most DAO governance tools fail at one or more of:

1. **Identity** — sybil-vulnerable, no real eligibility enforcement
2. **Privacy** — credential checks leak more data than necessary
3. **Usability** — clunky, desktop-only, not accessible to actual members
5. **Parliamentary process** — simple yes/no ballots miss real governance structure

We built a system that addresses all four.

---

## Architecture

### Identity Layer (v1: ENS-gated allowlist)

```
User connects wallet → isEligible(address) → voter allowlist
                               ↑
                    Chair adds via addVoter()
```

**Future:** ENS domain resolution for self-service eligibility — voters prove ownership of an ENS name in the FortWorth DAO namespace.

### Smart Contract Layer

`ZKVotingRobRulesWithCredentials.sol` — Rob's Rules parliamentary voting

```
Created → Seconded (any member) → Amendments → Voting (any member) → Passed/Failed
```

Stack: Solidity ^0.8.19 · Hardhat · Ethers.js v5 · OpenZeppelin  
Network: Ethereum Sepolia testnet

### Application Layer

PWA frontend:
- `index.html` — Voter portal (proposal browsing, vote casting)
- `rob-rules.html` — Chair dashboard (proposal management, voter eligibility)

### PWA Layer

Installable on mobile and desktop. Service worker caches all static assets for offline viewing. Network-first strategy for live data.

---

## Features

### Rob's Rules Parliamentary Flow

| Stage | Action | Access |
|-------|--------|--------|
| Create | `createProposal(description)` | Any eligible voter |
| Second | `secondProposal(proposalId)` | Any eligible voter (not proposer) |
| Amend | `submitAmendment(proposalId, text)` | Any eligible voter |
| Approve | `approveAmendment(proposalId, id)` | Chair only |
| Open Voting | `openVoting(proposalId, duration)` | Chair only |
| Call for Division | `callForDivision(proposalId)` | Any eligible voter |
| Vote | `voteOnMotion(proposalId, choice)` | Any eligible voter |
| Reconsider | `reconsider(proposalId)` | Voter who voted, while voting open |
| Reopen Voting | `reopenVoting(proposalId)` | Chair only (after reconsideration) |
| Finalize | `finalizeProposal(proposalId)` | Anyone |

### Voter Eligibility

- Chair-managed allowlist via `addVoter(address)` / `removeVoter(address)`
- `isEligible(address)` — public view function
- ENS resolver slot reserved for future domain-gated eligibility

### ZK Vote Privacy (Future Layer)

zk-SNARKs for vote privacy + ML-DSA post-quantum signatures are documented in the architecture and reserved for a future implementation.

---

## Deployment

### Sepolia Testnet

Contract: `0xb3254AB74e5103F7374eEcDb57078eB10388CaC3`

```bash
npx hardhat compile
npx hardhat run scripts/deploy-with-credentials.js --network sepolia
```

### Frontend (Vercel)

Static HTML/JS — deploys directly from `frontend/` directory.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity ^0.8.19, Hardhat, OpenZeppelin |
| Network | Ethereum Sepolia |
| Frontend | Vanilla HTML/CSS/JS, PWA |
| Wallet | MetaMask (window.ethereum) |

---

## Security Model

- Chair-controlled voter allowlist
- Ownable contract (owner can add/remove voters independently of chair)
- All governance actions recorded immutably onchain
- No secret keys embedded in frontend
- Environment variables for deployment only

---

## Grant Alignment

| Requirement | Status |
|-------------|--------|
| Post-quantum ready (ML-DSA) | Documented — future layer |
| No third-party internet dependency | ✅ Allowlist + local state |
| Offline-capable + blockchain sync | ✅ PWA service worker |
| Real ZK proof integration | Deferred — identity via ENS allowlist |
| Onchain governance | ✅ Full Rob's Rules flow |

---

## Future Work

1. **ENS domain-gated eligibility** — voters prove via ENS name ownership
2. **ZK vote privacy layer** — zk-SNARKs for vote correctness, ML-DSA for post-quantum signatures
3. **Real-time updates** — SSE/Push for live vote count changes
4. **Mobile app** — native iOS/Android wrapper for the PWA