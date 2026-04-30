# ROADMAP.md — ZK Voting System

**Current phase: Live on Sepolia — Demo Ready (May 1st FW DAO meeting)**

---

## Now — Demo at Fort Worth DAO Meeting (May 1st)

The system is a working chair-managed Rob's Rules parliamentary voting dApp on Sepolia.

**What works today:**
- Groth16VerifierV2 + ZKVotingRobRulesWithCredentials live on Sepolia
- Chair creates proposals, any eligible voter can second
- Amendments, open voting, cast vote with ZK proof, finalize
- Call for division, reconsideration, reopen voting
- Next.js PWA with service worker (offline-capable)
- Civic UI — light theme, Inter font, Fort Worth DAO brand
- Frontend deployed: `https://zk-voting-system-two.vercel.app`
- CI: compile, test, build-frontend, lint — all green

**What needs to happen before May 1st:**
1. 3-voter end-to-end test (local, full Rob's Rules flow)
2. Demo rehearsal

---

## Phase 1 — Ship (May 2026)

**Goal:** First real-world use at Fort Worth DAO meeting.

- [ ] 3-voter end-to-end test (chair + 2 members)
- [ ] Demo rehearsal with full Rob's Rules flow
- [ ] May 1st FW DAO meeting presentation

---

## Phase 2 — Harden (Post-hackathon)

**Goal:** Production-ready governance for real FW DAO votes.

- [ ] Real ZK proof integration for vote privacy
- [ ] Slither security audit on governance contracts
- [ ] Gas optimization for large voter populations
- [ ] Multi-chain support (Mainnet)

---

## History

- **Apr 2026** — Pivoted from Polygon ID to chair-managed allowlist (simpler, faster to ship)
- **Apr 2026** — Grant: Fort Worth DAO — $2,500 for ZK voting system (offline-capable, no 3rd party dependency)
