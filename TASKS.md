# TASKS.md — ZK Voting System

Status: Active  
Priority legend: P0 critical, P1 important, P2 useful

---

## P0 — Ship It (Must done before May 1st demo)

- [ ] **Vercel deploy** — get public URL for 60-person Fort Worth DAO demo
- [ ] **3-voter end-to-end test** — add 2 test voters, complete full Rob's Rules flow: create → second → amend → open voting → vote → finalize
- [ ] **Demo rehearsal** — run full flow from clean state, fix failures
- [ ] **README update** — reflect current ENS-gated Sepolia reality

---

## P1 — Demo Hardening

- [ ] Add transaction hash display (credibility for audience)
- [ ] Add loading / pending tx / success / error states to both HTML pages
- [ ] Wrong network detection + switch to Sepolia prompt
- [ ] Empty state / no-permission states for proposal list

---

## P2 — Nice-to-Haves (after May 1st)

- [ ] SSE real-time vote count updates (future)
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
