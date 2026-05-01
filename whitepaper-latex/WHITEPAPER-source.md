# ZK Voting System — Whitepaper

**Version:** 1.0  
**Author:** Tyler Delano + Dexter  
**Status:** Phase 1 live on Sepolia

---

## Problem

On-chain DAO voting reveals everything: who voted, what they voted, and when. This violates parliamentary privacy norms and discourages honest voting on controversial motions. Members may vote strategically or avoid voting entirely to stay anonymous.

Current solutions require either:
- Centralized identity providers (ENS, Proof of Humanity) — excludes many legitimate voters
- Off-chain voting with on-chain settlement — adds complexity and trust assumptions

## Solution: Two-Phase Architecture

### Phase 1: Rob's Rules On-Chain (NOW)

Full parliamentary voting using Robert's Rules of Order. Chair-managed voter allowlist on Sepolia. No ZK, no identity requirements. Pure smart contract governance.

**Why start here:** Get real governance running on-chain before adding complexity. Rob's Rules itself is sophisticated — it handles amendments, reconsiderations, division calls, and quorum rules that most "simple" voting systems skip.

### Phase 2: ZK Privacy Layer (FUTURE)

Replace direct `castVote` with a ZK proof that proves:
1. Voter is on the eligibility allowlist (without revealing which voter)
2. Vote choice is valid (yes/no/abstain)
3. Nullifier is unique (prevents double-voting)

**On-chain result:** Contract only sees "a valid proof was cast for proposal X" — no identity, no vote, no link between voter and vote.

**Circuit:** `vote.circom` — already written, needs circom toolchain fix before zkey regeneration.

---

## Rob's Rules Implementation

### Parliamentary Features

| Feature | Implementation |
|---|---|
| Motion (proposal creation) | `createProposal()` — any eligible voter |
| Seconding requirement | `secondProposal()` — prevents spam, another voter must second |
| Amendments | `submitAmendment()` + `approveAmendment()` — any voter proposes, chair approves |
| Debate period | Voting opens after seconding + amendments resolved |
| Recorded vote (division) | `callForDivision()` — any member can demand recorded tally |
| Reconsideration | `reconsider()` — member who voted on prevailing side can reopen |
| Majority rule | `yes > no` = passed; abstains don't count |

### State Machine

```
Created → Seconded → [Amendments] → Voting → Passed/Failed
                            ↑______________|
                         (reconsideration)
```

### Why Rob's Rules?

Robert's Rules of Order is the standard for deliberative bodies. It handles:
- **Quorum:** Minimum participation requirements
- **Seconding:** Prevents spam motions
- **Amendments:** Allows constructive modification before voting
- **Division:** Recorded vote on demand
- **Reconsideration:** Correct mistakes without full reproposal

Most blockchain voting systems skip all of this. We implement it properly.

---

## ZK Circuit Design

**Circuit:** `vote.circom` (Phase 2)

**Private inputs:**
- `nullifier_hash` — prevents double-voting, reveals nothing about identity
- `commitment` — voter identity commitment from allowlist Merkle tree
- `vote_choice` — 0/1/2 (yes/no/abstain)

**Public inputs:**
- `merkle_root` — allows proof that voter is in allowlist without revealing which
- `proposal_id` — binds vote to specific proposal
- `nullifier_hash_out` — public record of spent nullifier

**Verification:** Groth16 proof verified on-chain by `Groth16VerifierV2`.

---

## Economic Model

**Phase 1:** Free to use. Gas costs paid by voters. Chair pays for proposal creation.

**Phase 2:** ZK proof generation is computationally expensive — mitigations:
- Pre-compute proofs client-side (no server round-trip)
- Use a bouncer/relayer for gasless submission (optional)
- Layer 2 deployment (Base) for lower gas costs

---

## Deployment

**Phase 1 — Live:**
- Contract: `0xF844B2B37f34Dc53b79AAd0bc657C508e628dbad` (Sepolia)
- Frontend: https://zk-voting-system-two.vercel.app
- Chair: `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0`

**ZK Layer:** Phase 2 — requires circom 2.1.x or Sindri to fix broken toolchain.