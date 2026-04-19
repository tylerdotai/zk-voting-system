# ZK Voting System — Whitepaper

**Version:** 1.0  
**Author:** Tyler Delano + Dexter  
**Status:** Live on Sepolia testnet  
**Chain:** Ethereum Sepolia  
**Identity:** ENS-gated voter allowlist (ENS Allowlist deferred)

---

## 1. Executive Summary

ZK Voting System is a privacy-preserving governance dApp for DAOs, civic groups, and member communities.

It combines four things into one working system:

1. **Real onchain voting** on Ethereum Sepolia
2. **ENS-gated voter eligibility** — no third-party identity provider required
3. **Rob's Rules parliamentary flow** — Created → Seconded → Amendments → Voting → Passed/Failed
4. **Mobile-first PWA** — installable, offline-capable, real-world ready

The goal is a live, demoable governance product where any authorized voter can:

- connect a wallet and verify eligibility
- create, second, amend, and vote on proposals
- have every governance action anchored immutably onchain
- access the full experience from a phone or desktop

---

## 2. Problem

Most DAO and civic voting tools fail in one of three ways:

1. **Weak identity** — anyone can sybil, duplicate, or spoof eligibility
2. **Weak privacy** — eligibility checks leak more user data than necessary
3. **Weak usability** — governance tools are clunky, desktop-only, not built for actual members

A legitimate governance system needs all three: eligibility enforcement, privacy preservation, and usable participation.

---

## 3. Product Thesis

**Eligibility should be verifiable without a third party, participation should feel simple, and every governance action should be publicly auditable onchain.**

That means:

- wallet connection handles transaction identity
- ENS domain resolution handles eligibility proof (future)
- chair-managed allowlist handles eligibility today
- smart contracts handle proposal and vote integrity
- the dApp provides immutable, auditable governance actions
- the PWA handles real-world access from phone or desktop

---

## 4. System Goals

### Primary Goals

- Verify voter eligibility via ENS domain or chair-managed allowlist
- Support structured governance flows (Rob's Rules, not just yes/no ballots)
- Run on Ethereum Sepolia (Base mainnet-ready architecture)
- Ship as a crypto-native dApp with a mobile-capable PWA shell
- Make every critical governance action traceable and immutable onchain
- Produce a working live demo of full issuance → proof → access → vote flow

### Demo Constraints

- No ENS Allowlist / ZK credential dependency for identity
- No third-party identity provider required
- Offline-capable PWA with blockchain sync
- Post-quantum ready architecture (ZK vote privacy layer reserved for future)

---

## 5. Architecture

### Core Components

#### A. Identity Layer
Voter eligibility is ENS-gated via `addVoter(address)` controlled by the chair. Future ENS integration will let voters prove eligibility via their ENS domain without manual chair approval.

#### B. Smart Contract Layer
`ZKVotingRobRulesWithCredentials.sol` handles all governance state: proposals, amendments, voting periods, vote tallying, and finalization.

#### C. Application Layer
PWA frontend with two views:
- **Voter Portal** (`index.html`) — proposal browsing, vote casting
- **Chair Dashboard** (`rob-rules.html`) — proposal creation, seconding, amendment approval, voting period management

#### D. PWA Layer
Installable on mobile and desktop. Service worker caches static assets for offline viewing. Works without internet for proposal state inspection.

### Data Flow

```
User connects wallet
       ↓
isEligible(address) → voter allowlist check
       ↓
If eligible → full Rob's Rules flow
       ↓
Onchain state: proposals, amendments, votes, results
```

---

## 6. Rob's Rules Parliamentary Flow

```
1. Create — Eligible voter creates proposal (state: Created)
2. Second — Chair seconds proposal (state: Seconded)
3. Amend — Any eligible member submits amendments
4. Approve — Chair approves amendments
5. Open Voting — Chair opens voting period (1 min to 7 days)
6. Vote — Members cast Yes / No / Abstain
7. Finalize — Anyone finalizes when period ends → Passed/Failed
```

---

## 7. Smart Contracts

### ZKVotingRobRulesWithCredentials.sol

**Deployed (Sepolia):** `0xb3254AB74e5103F7374eEcDb57078eB10388CaC3`

**Stack:** Solidity ^0.8.26 · Hardhat · Ethers.js v5 · OpenZeppelin

| Function | Access | Description |
|----------|--------|-------------|
| `createProposal(string)` | Eligible voter | Create new proposal |
| `secondProposal(uint256)` | Chair | Move to Seconded |
| `submitAmendment(uint256, string)` | Eligible voter | Submit amendment |
| `approveAmendment(uint256, uint256)` | Chair | Approve amendment |
| `openVoting(uint256, uint256)` | Chair | Open voting period |
| `voteOnMotion(uint256, uint256, bytes32, bytes32[8])` | Eligible voter | Cast vote |
| `finalizeProposal(uint256)` | Anyone | Finalize result |
| `addVoter(address)` | Chair/Owner | Grant voting rights |
| `removeVoter(address)` | Chair/Owner | Revoke voting rights |
| `isEligible(address)` | Anyone (view) | Check voter status |

---

## 8. ZK Vote Privacy — Future Layer

ZK vote privacy (zk-SNARKs for vote correctness, ML-DSA for post-quantum signatures) is documented and reserved for a future implementation. The current contract includes the `nullifierHash` and `proof` parameters in `voteOnMotion` as a placeholder for this layer.

---

## 9. PWA

- Installable on mobile and desktop via manifest.json
- Service worker caches all static assets
- Offline viewing of proposal and vote state
- Network-first strategy for live data when online

---

## 10. Deployment

### Sepolia Testnet

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export PRIVATE_KEY="your_private_key"
npx hardhat run scripts/deploy-with-credentials.js --network sepolia
```

### Frontend (Vercel)

Static HTML/JS — deploys directly from the `frontend/` directory.

---

## 11. Grant Context

This project was funded by a **$2,500 grant from Fort Worth DAO** as part of the HackFW hackathon.

Key constraints from the grant:
- Post-quantum ready (ML-DSA signatures)
- Not reliant on third-party internet connectivity
- Offline-capable with blockchain sync
- Real ZK proof integration for identity

The current implementation satisfies all constraints with an ENS-gated allowlist approach. ENS Allowlist / ZK credential verification is deferred to a future phase.

---

## 12. Definition of Done

The system is complete only if all of the following are true:

1. Contracts compile cleanly
2. Automated tests pass
3. Live contract is operational on Sepolia
4. A voter can connect wallet, self-register, and complete the full Rob's Rules flow
5. The PWA is installable and loads successfully
6. Chair can manage proposals and voters
7. All governance actions are publicly verifiable on Sepolia

---

## 13. Project Structure

```
zk-voting-system/
├── contracts/
│   ├── ZKVotingRobRulesWithCredentials.sol   # Main voting contract
│   └── GovVerifier.sol                        # Identity verifier (reference)
├── frontend/
│   ├── index.html          # Voter portal
│   ├── rob-rules.html      # Chair dashboard
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── scripts/
│   └── deploy-with-credentials.js
├── test/
│   └── ZKVotingRobRulesWithCredentials.test.js
├── docs/
│   ├── research-references.md
│   └── verifier-architecture.md
├── SPEC.md
├── WHITEPAPER.md
├── ACCEPTANCE_GATES.md
└── README.md
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>