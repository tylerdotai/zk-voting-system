# Research References — ZK Voting System

## Architecture Foundation

### Rob's Rules Parliamentary Process
**URL:** https://robsrulesdao.com/white-paper/
**Key insight:** Parliamentary democracy model — proposals go through: Proposal → Discussion → Amendment → Vote → Decision. Prevents "A or B only" false binaries. Structured debate before voting.

**Relevance:** Our contract implements exactly this flow:
- `createProposal` (proposal)
- `secondProposal` (discussion phase opens)
- `submitAmendment` + `approveAmendment` (amendment phase)
- `openVoting` → `voteOnMotion` → `finalizeProposal` (vote + decision)

---

## Blockchain Voting — Institutional Validation

### Chainlink: Blockchain Voting for Elections
**URL:** https://chain.link/education-hub/blockchain-voting-for-elections
**Published:** December 3, 2025

**Key findings:**
- 2024 US election failures: Milwaukee 30k ballots reprocessed, Maricopa bomb threats, printer failures → real demand for blockchain solutions
- Romania: first EU country to use blockchain for national elections (real-time vote data transparency)
- South Korea: 10M+ user blockchain voting system launched 2021, $1.1M R&D allocated 2022
- New York: Blockchain for Election Integrity Act reintroduced April 2025
- West Virginia: tested blockchain voting for overseas military personnel

**Direct quote:** *"Blockchain voting could reduce vulnerabilities by enabling remote and tamper-resistant vote submission with real-time verification."*

**Chainlink role:** Cross-chain data bridging, off-chain identity verification, privacy-preserving data exchange.

---

### StateScoop: New York Blockchain Election Legislation
**URL:** https://statescoop.com/new-york-blockchain-election-results-voting/
**Date:** 2025

**Key findings:**
- NYC Council passed resolution requiring NYC government to report on blockchain voting by December 2026
- New York is actively studying blockchain for election integrity
- Legislative momentum — this is not theoretical, it's moving through government

---

## What This Means for Fort Worth DAO Grant

**Grant deliverable:** "Functional Demo of voter signup/registering and 3 identities voting on a ballot with realtime SSE updates void of paper, and offline backup capabilities"

**Our implementation addresses the exact problems cited:**
| Problem | Our Solution |
|---|---|
| Paper ballot dependency | On-chain voting, no paper |
| 30k ballot reprocess failures | Immutable vote ledger |
| Bomb threats targeting physical polling | Remote voting via wallet |
| Lack of transparency | All votes public on Sepolia |
| Device security concerns | PWA offline-capable, localStorage backup |
| Real-time verification needed | Live vote counts on index.html |

**ZK layer (future):** Post-quantum ML-DSA signatures + zk-SNARK vote privacy will place us ahead of current mainstream implementations.

---

## Industry Standards Referenced

1. **ENS (Ethereum Name Service)** — identity resolution for voter allowlist
2. **Snapshot** — off-chain vote aggregation (future integration point)
3. **Gitcoin Passport** — sybil resistance (future alternative to allowlist)
4. **EIP-1271** — signature verification standard for ENS-based auth
5. **W3C DIDs** — eventual migration path for decentralized identity (post-Polygon ID pivot)