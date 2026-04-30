# ZK Voting System — Whitepaper

**Version:** 1.0  
**Author:** Tyler Delano + Dexter  
**Status:** Live on Sepolia testnet  
**Chain:** Ethereum Sepolia  
**Identity:** Chair-managed voter allowlist (no ENS, no Polygon ID)

---

## 1. Executive Summary

ZK Voting System is a privacy-preserving governance dApp for DAOs, civic groups, and member communities.

It combines four things into one working system:

1. **Real onchain voting** on Ethereum Sepolia
2. **Chair-managed voter eligibility** — no third-party identity provider required
3. **Rob's Rules parliamentary flow** — Created → Seconded → Amendments → Voting → Passed/Failed
4. **Next.js PWA** — installable, offline-capable, real-world ready

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
- chair-managed allowlist handles eligibility today (no ENS, no Polygon ID)
- smart contracts handle proposal and vote integrity
- snarkjs Groth16 proofs handle vote privacy (commitment scheme)
- the dApp provides immutable, auditable governance actions
- the Next.js PWA handles real-world access from phone or desktop

---

## 4. System Goals

### Primary Goals

- Verify voter eligibility via chair-managed allowlist (no third-party dependency)
- Support structured governance flows (Rob's Rules, not just yes/no ballots)
- Run on Ethereum Sepolia (Base mainnet-ready architecture)
- Ship as a Next.js PWA with mobile-capable frontend
- Make every critical governance action traceable and immutable onchain
- Produce a working live demo of full ZK proof → verification → vote flow

### Demo Constraints

- No third-party identity provider required
- Offline-capable PWA with blockchain sync (service worker)
- Post-quantum ready architecture (ZK vote privacy layer built in via Groth16)

---

## 5. Architecture

### Core Components

#### A. Identity Layer
Voter eligibility is chair-managed via `addVoter(address)` on the governance contract. The chair controls who can participate — no external resolver, no credential issuer required.

#### B. Smart Contract Layer
`ZKVotingRobRulesWithCredentials.sol` handles all governance state: proposals, amendments, voting periods, vote tallying, and finalization. `Groth16VerifierV2` validates ZK proofs onchain.

#### C. Application Layer
Next.js 16 PWA with three views:
- **Voter Portal** (`/`) — proposal browsing, vote registration, vote casting with ZK proof
- **Chair Dashboard** (`/chair`) — proposal creation, amendment approval, voting period management
- **Proof Verifier** (`/verify`) — standalone ZK proof verification

#### D. ZK Proof Layer
Client-side WASM (browser) computes Poseidon hashes and generates Groth16 proofs via `snarkjs` + `circomlibjs` (npm packages). Proof verified onchain by `Groth16VerifierV2`.

#### E. PWA Layer
Installable on mobile and desktop. Service worker caches static assets for offline viewing. Works without internet for proposal state inspection.

### Data Flow

```
User connects wallet
       ↓
isEligible(address) → allowlist check
       ↓
If eligible → browser generates Groth16 proof (WASM, no server)
       ↓
Frontend submits vote transaction with proof
       ↓
Groth16Verifier validates proof onchain
       ↓
Contract records vote → all clients poll for updates
```

---

## 6. ZK Proof Technical Details

**Circuit:** `circuits/vote/vote.circom` (Circom 2.0)

**Public inputs:** `[proposal_id, nullifier_hash, commitment]`

**Private inputs:** `[vote_choice, nullifier_seed, voter_address]`

**Hashing:** Poseidon via `circomlibjs` — same Poseidon config as the contract's `hashFn`

**Proof system:** Groth16 (BN128)

**Trusted setup:** Powers of Tau ceremony (`build/ptau/`), contribution by Flume SaaS Factory

---

## 7. Contract Addresses

| Contract | Sepolia Address |
|---|---|
| `Groth16VerifierV2` | `0x02aa9654f33Aa73880460B4f286A430c4D56CAb6` |
| `ZKVotingRobRulesWithCredentials` | `0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3` |
| Chair (admin) | `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0` |

---

## 8. Live Demo

**URL:** https://zk-voting-system-two.vercel.app

Connect MetaMask to Sepolia, register as a voter (chair adds your address), and experience the full Rob's Rules flow.

---

## 9. Future Work

- Full end-to-end test with 3 distinct voters
- Demo rehearsal before May 1st FW DAO meeting
- Gas optimization for large voter populations
- Multi-chain deployment (Base, mainnet)
