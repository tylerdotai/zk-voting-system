# TASKS.md — ZK Voting System

Status: Active  
Priority legend: P0 critical, P1 important, P2 useful

---

## P0 — Ship It (Must done before May 1st demo)

- [x] **TX hash display** — show transaction hashes for all write actions
- [x] **README update** — reflect current ENS-gated Sepolia reality
- [ ] **3-voter end-to-end test** — local, full Rob's Rules flow: create → second → amend → open voting → vote → finalize
- [ ] **Demo rehearsal** — local, run full flow from clean state, fix failures
- [x] **Wrong-network prompt** — auto-detect + switch to Sepolia
- [ ] **Vercel deploy** — only after all local testing passes

---

## P1 — Demo Hardening (post-local-test)

- [x] Empty state / no-permission states for proposal list
- [x] Chair voter management UI — addVoter + removeVoter wired in dashboard

---

## P2 — Nice-to-Haves (after May 1st)

- [ ] SSE real-time vote count updates
- [ ] ENS domain-gated eligibility (future — reserved slot in contract)
- [ ] ZK vote privacy layer (future — zk-SNARKs + ML-DSA, documented in whitepaper)
- [ ] Mobile app (native wrapper for PWA)

---

## Completed

### Foundation ✅
- [x] ZKVotingRobRulesWithCredentials contract — Rob's Rules parliamentary voting
- [x] 58 tests passing
- [x] Deployed to Sepolia at `0xb3254AB74e5103F7374eEcDb57078eB10388CaC3`
- [x] ENS-gated voter allowlist (no Polygon ID dependency)
- [x] Full Rob's Rules flow: create → second → amend → open voting → vote → finalize
- [x] Member rights: call for division, reconsider, reopen voting
- [x] PWA service worker + manifest
- [x] Docs: WHITEPAPER.md, DEVELOPMENT_PAPER.md, SPEC.md, README.md
- [x] TX hash display + Etherscan links on all write actions
- [x] Chair voter management UI (add voters from dashboard)
- [x] README rewritten — clean, accurate, no stale references
- [x] Repo cleaned — test artifacts, credential infra, dead code removed
