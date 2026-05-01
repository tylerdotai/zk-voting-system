# ROADMAP.md — ZK Voting System

**Current phase: Live on Sepolia — Demo Ready (May 1st FW DAO hackathon)**

---

## Phase 1 — ✅ LIVE: Rob's Rules DAO (No ZK)

**Status:** Deployed and working on Sepolia

A full parliamentary voting system using Rob's Rules of Order. No ZK required — direct on-chain voting. Chair-managed voter allowlist.

- ✅ Solidity contract deployed (`RobRulesVoting`)
- ✅ Next.js frontend deployed (Vercel)
- ✅ Rob's Rules flow: create → second → amend → vote → finalize
- ✅ Duration selector (5min to 7 days)
- ✅ Fast Track for chair to bypass seconding
- ✅ Reconsideration support
- ✅ Division calls for recorded votes

**Contract:** `0xF844B2B37f34Dc53b79AAd0bc657C508e628dbad` (Sepolia)

---

## Phase 2 — ZK Privacy Layer (Future)

Replace direct on-chain voting with zero-knowledge proofs so voter identity and vote choice are never revealed on-chain.

**Requirements:**
- Fix circom 2.2.3 / snarkjs toolchain incompatibility
- Use **Sindri** (sindri.network) for zk generation OR downgrade to **circom 2.1.x**
- Regenerate `vote_0001.zkey` with fixed toolchain
- Deploy new `ZKVotingRobRules` contract with ZK verification in `castVote`

**ZK Flow (target):**
1. Voter generates a ZK proof locally (proves: eligible + vote choice + nullifier)
2. Proof submitted to contract → verifier checks proof validity
3. On-chain: only records that a valid proof was cast, not who voted or what they voted

**Why it's Phase 2:** The circom 2.2.3 WASM ABI breaks snarkjs's signal indexing. All proof generation fails with "Too many values for input signal nullifier_hash." This is a toolchain issue, not a code issue. Fix requires either external zk service (Sindri) or circom downgrade.

---

## Phase 3 — Production Hardening (Future)

- Deploy to Ethereum mainnet
- Deploy to Base (Layer 2 for lower gas)
- Gasless voting via bouncer/relayer
- Multisig chair (3-of-5 for chair actions)
- IPFS-based proposal metadata (off-chain proposal content with on-chain hash commitment)

---

## Phase 4 — Ecosystem (Future)

- Snapshot.org integration for off-chain signaling before on-chain votes
- Discourse plugin for governance forum integration
- Mobile companion app
- Token-gated proposals (balance > X ETH can create proposals)

---

## Contracts

| Name | Address | Status |
|---|---|---|
| `RobRulesVoting` | `0xF844B2B37f34Dc53b79AAd0bc657C508e628dbad` | ✅ Live — current |
| `ZKVotingRobRulesWithCredentials` | `0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3` | Old ZK contract (deprecated, not in use) |
| `Groth16VerifierV2` | `0x02aa9654f33Aa73880460B4f286A430c4D56CAb6` | Old ZK verifier (Phase 2 use only) |