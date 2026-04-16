# ZK DID Voting System Whitepaper

Version: 0.1-draft  
Author: Tyler Delano + Dexter  
Status: Working source of truth  
Target chain: Base Sepolia for build, Base mainnet-ready architecture  
Identity layer: Polygon ID

---

## 1. Executive Summary

ZK DID Voting System is a privacy-preserving governance **dApp** for DAOs, civic groups, and member communities.

It combines four things into one working system:

1. **Real onchain voting** on an EVM network
2. **Zero-knowledge credential verification** using Polygon ID
3. **Crypto-native dApp trust model** with immutable public state transitions
4. **Mobile-first PWA experience** for real-world participation

The goal is not just a toy ballot. The goal is a live, demoable governance product where a user can:

- receive a verifiable credential from an issuer
- prove eligibility without revealing personal data
- access a governance interface on mobile or desktop
- participate in structured voting flows, including Rob's Rules parliamentary process
- have all critical actions anchored onchain

This whitepaper is the system source of truth for architecture, scope, phases, build rules, checkpoints, and acceptance criteria.

---

## 2. Problem

Most DAO and civic voting tools fail in one of three ways:

1. **Weak identity**: anyone can sybil, duplicate, or spoof eligibility
2. **Weak privacy**: eligibility checks leak more user data than necessary
3. **Weak usability**: governance tools are clunky, desktop-only, and not built for actual members

A legitimate governance system needs all three:

- eligibility enforcement
- privacy preservation
- usable participation

This project exists to prove that a modern voting stack can have all three at once.

---

## 3. Product Thesis

The core thesis is:

**Eligibility should be verifiable, privacy should be preserved, and participation should feel simple.**

That means:

- wallet connection handles transaction identity
- Polygon ID handles membership or residency proof
- smart contracts handle proposal and vote integrity
- the dApp architecture provides immutable, auditable governance actions
- the PWA handles real-world access from phone or desktop

---

## 4. System Goals

### Primary goals

- Verify voter eligibility with real zero-knowledge credential proofs
- Support structured governance flows, not just yes/no ballots
- Run on Base-compatible EVM infrastructure
- Ship as a crypto-native dApp with a mobile-capable PWA shell
- Make every critical governance action traceable and immutable onchain
- Produce a working live demo of full issuance → proof → access → vote flow

### Non-negotiable demo goals

The live demo is complete only when all of the following work:

1. **Issuer flow works**
   - an eligible test user can receive a credential from the issuer
2. **Proof flow works**
   - a user can scan or initiate a Polygon ID proof request and satisfy it
3. **Onchain verification works**
   - proof verification updates contract state and unlocks participation
4. **Governance flow works**
   - verified users can create, second, amend, vote, and finalize according to the supported flow
5. **PWA works**
   - app installs on mobile, loads cleanly, and supports at least partial offline behavior

---

## 5. Scope

### In scope

- Base Sepolia deployment for build and demo
- Base mainnet-ready design
- Polygon ID issuer node integration
- Credential-gated voting
- Rob's Rules parliamentary flow
- PWA shell with installability and offline asset support
- demo operator workflow and validation harness

### Out of scope for initial demo

- native iOS or Android app
- multi-chain deployment at launch
- anonymous tally cryptography beyond the implemented proof gates
- production-grade identity recovery flows
- production-scale issuer operations and admin dashboards

---

## 6. Architecture

### 6.1 Core components

#### A. Issuer layer
Responsible for creating and issuing verifiable credentials.

- Polygon ID issuer node
- credential schema definitions
- issuer admin configuration
- proof request configuration

#### B. Identity proof layer
Responsible for letting users prove claims without revealing the underlying data.

- Polygon ID wallet/app
- Polygon ID SDK integration in frontend
- proof request QR/deep-link flow
- proof packaging and submission

#### C. Smart contract layer
Responsible for governance state and proof-gated permissions.

- `GovVerifier.sol` or equivalent Polygon ID-compatible verifier bridge
- `ZKVotingWithCredentials.sol`
- `ZKVotingRobRulesWithCredentials.sol`
- deployment scripts and network config

#### D. Application layer
Responsible for user interaction.

- mobile-first governance dApp
- proposal creation and review UI
- verification UI
- vote casting UI
- transaction and status feedback
- wallet-aware state and chain-aware UX

#### E. Demo/ops layer
Responsible for repeatable validation.

- deterministic deployment process
- seed test users and credentials
- smoke tests
- end-to-end checklist
- demo script

---

## 7. Chain and Identity Decision

### Base
The system will target **Base Sepolia** during build and demo.

Why:

- EVM-compatible and practical for hackathon shipping
- cheaper and more relevant than Ethereum Sepolia for this use case
- straightforward wallet support
- easy path to Base mainnet later

### Polygon ID
Polygon ID is **not locked to Polygon chain**.

It is an identity and proof system from the Polygon ecosystem, but the proof-gated governance contracts can run on Base as long as the verifier flow is implemented correctly.

**Decision:** Use Polygon ID for identity, Base for voting contracts.

---

## 8. Functional Requirements

### 8.1 Credential issuance
The system must support issuance of an eligibility credential, such as:

- Fort Worth DAO Member
- verified resident
- verified participant

Example fields:

- `memberId`
- `jurisdiction`
- `memberSince`
- optional eligibility flags

### 8.2 Proof verification
The system must support a live proof flow where:

- the user initiates verification in the app
- the app presents a Polygon ID proof request
- the user satisfies the request with a wallet/app
- the verifier contract accepts the proof or a compatible proof result
- the voting contract updates the user's permission state

### 8.3 Governance actions
The credential-gated governance system must support:

- create proposal
- second proposal
- submit amendment
- approve amendment
- open voting
- cast vote
- finalize proposal

### 8.4 PWA behavior
The application must:

- install on mobile home screen
- support responsive mobile layouts
- cache static assets for offline launch
- recover gracefully when offline
- clearly indicate online/offline state

---

## 9. Technical Reality Check

The current repo contains useful groundwork but is not yet complete.

### What already exists

- core voting contracts
- Rob's Rules contract flow
- credential-gated contract variants
- frontend prototypes
- test suite with strong contract coverage

### What is still missing

- production-correct Polygon ID verifier integration
- issuer node deployment and credential schema setup
- Base-targeted deployment flow
- true PWA implementation
- end-to-end proof validation on live network
- demo harness and acceptance gates

### Important architectural note

The project must use **Polygon ID's real proof flow**, not a fake demo-only shortcut.

That means implementation must be validated against:

- actual issuer node behavior
- actual Polygon ID proof request format
- actual onchain or bridged verification semantics
- actual Base network deployment

---

## 10. Build Rules

These rules are mandatory.

### Rule 1: Build against the live demo path
Every feature must make the live demo more real, not more decorative.

### Rule 2: No fake verification in the final demo path
Demo shortcuts can exist in dev mode only. Final demo mode must use real proof flow.

### Rule 3: Base Sepolia is the canonical build network
No bouncing between local-only assumptions and Sepolia assumptions without explicit environment separation.

### Rule 4: Deterministic environments
Contract addresses, env vars, schemas, and proof configs must come from checked-in config or documented setup.

### Rule 5: One command per validation gate
Each phase must end with a small repeatable verification command or checklist.

### Rule 6: dApp first, PWA delivery second
The product must be architected as a real governance dApp. The PWA is the access layer, not the core identity of the system.

### Rule 7: Mobile-first, not desktop-retrofitted
PWA screens are designed for phone first, desktop second.

### Rule 8: Local build before deploy
No deploy unless local compile, tests, lint, and demo smoke path pass.

### Rule 9: Avoid fake completeness
A pretty UI with broken proof flow does not count as progress.

---

## 11. Phases

This project has **6 phases**.

### Phase 1: Whitepaper and system contract
Output:
- this whitepaper
- explicit scope
- acceptance criteria
- architecture decisions

Done when:
- this document is approved and used as source of truth

### Phase 2: Identity foundation
Output:
- Polygon ID issuer node running
- credential schema defined
- proof request config defined
- test credential issuance working

Done when:
- at least one test user receives a valid credential from the issuer

### Phase 3: Onchain verifier integration
Output:
- Base Sepolia deployment path
- proof verification contract flow fixed for Polygon ID
- credential-gated voting contract wired to proof success

Done when:
- a verified user becomes authorized onchain after a real proof flow

### Phase 4: Governance application
Output:
- live proposal UI
- Rob's Rules flow UI
- wallet connection
- transaction feedback and error handling

Done when:
- a verified user can complete the full proposal lifecycle from UI

### Phase 5: PWA shell
Output:
- manifest
- service worker
- installable app
- offline asset caching
- mobile polish

Done when:
- app is installable and loads successfully from mobile home screen

### Phase 6: Demo hardening
Output:
- seeded demo data
- runbook
- smoke tests
- final checklist
- live rehearsal

Done when:
- the full flow works twice in a row without improvisation

---

## 12. Checkpoints

### Checkpoint A: Issuer operational
Pass if:
- issuer service is reachable
- schema is registered
- credential can be issued

### Checkpoint B: Proof operational
Pass if:
- QR or deep-link proof request is generated
- Polygon ID wallet accepts it
- proof result is returned successfully

### Checkpoint C: Contract gate operational
Pass if:
- proof success changes onchain authorization state
- unauthorized user is blocked
- authorized user is allowed

### Checkpoint D: Governance operational
Pass if:
- verified user can create proposal
- second proposal
- submit amendment
- approve amendment
- open voting
- vote
- finalize

### Checkpoint E: PWA operational
Pass if:
- mobile install prompt works or install instructions are valid
- service worker registers
- cached shell loads offline
- app recovers when connection returns

### Checkpoint F: Full demo operational
Pass if:
- new wallet can receive credential
- verify in app
- become authorized onchain
- vote successfully
- results update correctly

---

## 13. Definition of Done

The system is complete only if all of the following are true:

1. **Contracts compile cleanly**
2. **Automated tests pass**
3. **Issuer node is running and documented**
4. **A real credential can be issued**
5. **A real Polygon ID proof can be satisfied**
6. **Proof success unlocks voting permissions on Base Sepolia**
7. **The Rob's Rules flow works from the UI**
8. **The app is installable as a PWA**
9. **The full demo is repeatable from a clean wallet**
10. **A demo runbook exists and matches reality**

If one of those is false, the project is not done.

---

## 14. Skills to Build Around This Project

To speed this project up, build dedicated skills.

### A. `zk-voting-architect`
Use for:
- architecture decisions
- verifier flow design
- chain and proof integration choices

### B. `polygon-id-ops`
Use for:
- issuer node setup
- schema management
- proof request config
- credential issuance runbooks

### C. `zk-voting-contracts`
Use for:
- contract edits
- deployment scripts
- Base network config
- test harness maintenance

### D. `zk-voting-pwa`
Use for:
- service worker
- manifest
- offline cache behavior
- mobile UX

### E. `zk-voting-demo-qa`
Use for:
- smoke tests
- demo rehearsal
- acceptance checklist
- issue triage during final week

These should be narrow and non-overlapping.

---

## 15. Delegation Strategy

Yes, delegation makes sense.

### What should be delegated
- Polygon ID issuer setup and documentation
- contract verifier integration research
- PWA shell implementation
- test harness and demo QA

### What should stay centralized
- final architecture decisions
- whitepaper and acceptance criteria
- cross-phase integration
- final demo signoff

### Recommended split
- **Main session**: architecture, integration decisions, source-of-truth docs
- **Subagents**: bounded implementation tracks
- **Local Ollama**: summarize docs, compare options, generate scaffolds, draft repetitive boilerplate

### Ollama usage rule
Use local Ollama for cheap parallel drafting and summarization, not as the final authority on proof integration correctness.

In plain English:
- yes for note synthesis, doc digestion, rough UI scaffolds
- no for trusting security-critical verifier logic without validation

---

## 16. Validation Matrix

| Area | Validation method |
|------|-------------------|
| Contracts | hardhat compile, hardhat test |
| Deployment | scripted deploy to Base Sepolia |
| Issuer | health check + issuance walkthrough |
| Proof flow | live wallet proof run |
| Authorization | onchain state check before/after proof |
| Governance | scripted proposal lifecycle |
| PWA | Lighthouse + manual mobile install test |
| Full demo | clean-wallet rehearsal |

---

## 17. Immediate Next Steps

After this whitepaper, the project should proceed in this order:

1. lock the whitepaper
2. create project roadmap and task board from phases
3. stand up Polygon ID issuer environment
4. validate Base Sepolia deployment path
5. refactor verifier flow to real Polygon ID integration
6. build PWA shell and mobile-first UX
7. create smoke-test and demo harness

---

## 18. Final Position

This project is worth doing because it demonstrates something that most voting demos fake:

- real eligibility
- real privacy
- real governance flow
- real immutable onchain records
- real mobile usability

That combination is the product.

Not one piece. The whole stack.
