# ROADMAP.md — ZK DID Voting System Execution Pack

Status: Active roadmap  
Source of truth: `WHITEPAPER.md`  
Companion narrative: `DEVELOPMENT_PAPER.md`  
Execution model: main session + subagents + bounded local model support

---

## Mission

Ship a working live demo of a **credential-gated governance dApp** on **Base Sepolia** with:

1. real Polygon ID credential issuance
2. real proof-based authorization
3. real onchain governance actions
4. a usable mobile-first PWA shell

---

## North Star Demo

A clean wallet user can:

1. open the app
2. connect wallet on Base Sepolia
3. receive or hold an eligibility credential
4. complete a Polygon ID proof request
5. become authorized onchain
6. create or participate in a Rob's Rules vote
7. cast a vote and see immutable onchain state update
8. do it from a mobile-installable PWA experience

If that flow fails, we are not done.

---

## Phase Overview

| Phase | Name | Outcome | Owner |
|------|------|---------|-------|
| 1 | Source of truth | Whitepaper, development paper, execution pack | Main |
| 2 | Identity foundation | Issuer node, schema, issuance flow | Main + polygon-id-ops |
| 3 | Onchain verifier integration | Base Sepolia proof-gated contracts working | Main + zk-voting-contracts |
| 4 | Governance dApp | Wallet-aware proposal and vote flows working | Main + zk-voting-contracts |
| 5 | PWA shell | Installable mobile-first app with offline shell | Main + zk-voting-pwa |
| 6 | Demo hardening | Repeatable end-to-end walkthrough and QA harness | Main + zk-voting-demo-qa |

---

## Phase 1 — Source of Truth

### Goal
Lock scope, architecture, positioning, and execution rules.

### Deliverables
- `WHITEPAPER.md`
- `DEVELOPMENT_PAPER.md`
- `SKILLS_PLAN.md`
- `ROADMAP.md`
- `TASKS.md`
- `ACCEPTANCE_GATES.md`

### Exit condition
The project has one clear source of truth and one clear build sequence.

### Status
Complete

---

## Phase 2 — Identity Foundation

### Goal
Stand up real Polygon ID credential infrastructure.

### Deliverables
- issuer node running locally or on stable host
- documented environment setup
- Fort Worth DAO Member schema defined
- proof request template defined
- at least one test credential issued to a test identity

### Workstreams
- research exact Polygon ID issuer deployment path
- choose config layout for local/dev/demo
- define schema JSON and storage location
- configure issuer endpoint and proof request payloads
- write issuance runbook

### Dependencies
- source-of-truth docs complete
- Docker available
- test wallet/app available

### Exit condition
A test user can receive a valid credential from the issuer.

---

## Phase 3 — Onchain Verifier Integration

### Goal
Make real proof success unlock voting permissions on Base Sepolia.

### Deliverables
- Base Sepolia network config normalized
- deployment scripts updated for Base Sepolia
- verifier flow corrected for Polygon ID integration
- credential-gated contracts deployed
- proof success flips authorization state onchain

### Workstreams
- audit current `GovVerifier.sol` against Polygon ID proof semantics
- decide whether to adapt bridge contract or replace verifier flow
- update env/config conventions
- deploy proof-gated contracts to Base Sepolia
- add contract-level and integration-level tests

### Dependencies
- Phase 2 issuer and proof request format defined
- Base Sepolia RPC and funded deployer wallet

### Exit condition
An unverified wallet is blocked, then becomes authorized after completing a real proof.

---

## Phase 4 — Governance dApp

### Goal
Make governance actions usable from the app.

### Deliverables
- wallet connection flow
- chain detection and chain switch prompts
- verified/unverified UX states
- proposal lifecycle UI
- Rob's Rules action flows
- transaction feedback and status handling

### Workstreams
- replace stale contract address assumptions with config-driven addresses
- build proposal list/detail flows
- build create/second/amend/vote/finalize screens
- wire verified user gating into UI state
- add clear error states and transaction states

### Dependencies
- Phase 3 contract addresses and ABIs stable

### Exit condition
A verified user can complete the full governance lifecycle from the frontend.

---

## Phase 5 — PWA Shell

### Goal
Make the governance dApp installable and usable on mobile.

### Deliverables
- web app manifest
- service worker
- cached static shell
- offline and reconnect UX
- install instructions or install prompt
- mobile-first layout polish

### Workstreams
- define PWA asset list
- implement service worker registration
- cache app shell and static assets
- display online/offline state clearly
- test on phone-sized viewport and installed mode

### Dependencies
- frontend structure from Phase 4 stable enough to wrap

### Exit condition
The app installs and launches from a phone home screen and survives a basic offline shell test.

---

## Phase 6 — Demo Hardening

### Goal
Make the whole system repeatable under pressure.

### Deliverables
- seeded demo accounts or demo identity path
- smoke test checklist
- clean-wallet rehearsal script
- operator runbook
- final demo script
- fallback plan for network hiccups

### Workstreams
- create deterministic demo setup
- document exact click path for live walkthrough
- rehearse end-to-end twice from clean state
- patch all brittle UI and env assumptions
- prepare short and long demo variants

### Dependencies
- Phases 2-5 complete enough to exercise full path

### Exit condition
The full live demo works twice in a row without improvisation.

---

## Parallelization Strategy

### Main session owns
- architecture decisions
- doc truth
- cross-phase integration
- final verifier choice
- final demo signoff

### Subagents own
- issuer setup research and runbook
- contract wiring and Base deploy scripts
- PWA shell and offline polish
- smoke tests and acceptance validation

### Ollama supports
- doc summarization
- repetitive scaffolding
- alternatives comparison
- non-critical draft generation

### Ollama does not own
- verifier correctness
- security decisions
- final integration truth

---

## Operating Rules

1. dApp first, PWA shell second
2. real proof flow for final demo, no fake verify shortcuts
3. Base Sepolia is canonical until demo is stable
4. no deploy without local validation
5. no feature is counted complete until it passes its gate
6. all contract addresses and env-dependent values must come from documented config
7. no last-minute architecture pivots unless a gate proves the current path is broken

---

## Weekly Shape

### Week 1
- complete docs and execution pack
- stand up issuer environment
- define schema and proof request

### Week 2
- lock verifier integration path
- deploy proof-gated contracts to Base Sepolia
- verify proof changes contract state

### Week 3
- ship governance dApp flows
- connect verification UX to live contract state
- begin PWA shell work

### Week 4
- finish PWA shell
- run smoke tests
- rehearse full demo
- harden rough edges

---

## Completion Standard

The roadmap is complete only when:
- docs match reality
- code matches docs
- the clean-wallet demo passes
- the same flow works twice
