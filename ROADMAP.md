# ROADMAP.md — ZK Voting System

**Current phase: Live on Sepolia — Demo Ready (May 1st FW DAO meeting)**

---

## Now — Demo at Fort Worth DAO Meeting (May 1st)

The system is a working ENS-gated Rob's Rules parliamentary voting dApp on Sepolia.

**What works today:**
- Groth16VerifierV2 + ZKVotingSimple live on Sepolia
- Chair creates proposals, any eligible voter can second
- Amendments, open voting, cast vote, finalize
- Call for division, reconsideration, reopen voting
- PWA with offline-capable service worker (✅ verified)
- Mobile-first projection-ready UI
- README updated with full hackathon demo script

**What needs to happen before May 1st:**
1. 3-voter end-to-end test (local, full Rob's Rules flow)
2. Vercel deploy → public URL for 60-person room
3. Demo rehearsal

---

## Phase 1 — Ship (May 2026)

**Goal:** First real-world use at Fort Worth DAO meeting.

- [ ] 3-voter end-to-end test
- [ ] Demo rehearsal
- [ ] Fix any failures found in rehearsal
- [x] README polished with hackathon demo script
- [x] Repo cleaned — test artifacts, credential infra, dead code removed

**Definition of done:** 60 people can show up, connect wallets, and vote on a real proposal.

---

## Phase 2 — Harden (May–June 2026)

**Goal:** Production-grade for regular DAO use.

- [ ] SSE real-time vote count updates (no page refresh)
- [ ] Mobile app polish — native wrapper or improved PWA
- [ ] Transaction hash + success/error UX for all actions
- [ ] Wrong network detection + auto-switch to Sepolia
- [ ] Proposal history + audit trail UI
- [ ] Admin panel for chair (add/remove voters, view all proposals)

**Definition of done:** DAO can run weekly votes without manual intervention.

---

## Phase 3 — Elevate (Mid 2026)

**Goal:** Scale credibility + eventual mainnet.

- [ ] ZK vote privacy layer (zk-SNARKs for vote correctness, ML-DSA for post-quantum)
- [ ] ENS domain-gated eligibility (self-service, no chair allowlist)
- [ ] Deploy to Ethereum mainnet (or L2 for gas costs)
- [ ] Fort Worth DAO branding as reference customer

**Definition of done:** ZK voting system is a product other DAOs will pay for.

---

## What Got Us Here

- **Pivot from Polygon ID** (Apr 2026) — ENS-gated allowlist, simpler, faster to ship
- **Grant:** Fort Worth DAO — $2,500 for ZK DID voting system (post-quantum ready, offline-capable, no 3rd party dependency)
- **Stack:** Solidity · Hardhat · Ethers.js v6 · Vanilla HTML/CSS/JS · PWA
- **Network:** Ethereum Sepolia (mainnet when ready)
