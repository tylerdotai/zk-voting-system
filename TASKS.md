# TASKS.md — ZK DID Voting System

Status: Active task board  
Priority legend: P0 critical, P1 important, P2 useful  
Owner legend: Main, Subagent, Shared

---

## P0 — Foundation and Architecture

- [x] Create whitepaper
- [x] Create development paper
- [x] Create skills plan
- [x] Create roadmap
- [x] Create tasks board
- [x] Create acceptance gates
- [x] Confirm final chain target as Base Sepolia for demo
- [x] Confirm canonical credential name and schema fields
- [x] Confirm demo story: issuer → proof → verify → proposal → vote

---

## P0 — Identity Foundation (Phase 2)

### Research and setup
- [x] Audit official Polygon ID issuer node deployment path
- [x] Document required services, env vars, ports, and secrets
- [x] Decide local vs hosted issuer runtime for demo (start local + public tunnel)
- [x] Create `docs/issuer-setup.md`

### Schema and credential model
- [x] Define Fort Worth DAO Member credential schema (`FortWorthDAOMembershipCredential`)
- [x] Define required fields: `membershipId`, `membershipStatus`, `jurisdiction`, `memberSince`, `votingEligible`
- [x] Decide optional eligibility flags
- [x] Store schema in repo with versioning
- [x] Create example credential payload

### Issuer implementation
- [x] Stand up Polygon ID issuer services
- [x] Verify issuer health endpoints or UI
- [x] Register or load schema into issuer flow
- [ ] Issue first test credential to a test identity
- [x] Document issuance walkthrough step-by-step

### Proof request setup
- [x] Define proof request payload for app verification flow
- [ ] Confirm wallet compatibility with chosen proof request
- [x] Test QR or deep-link request generation end-to-end

---

## P0 — Onchain Verifier Integration (Phase 3)

### Contract audit
- [x] Audit `GovVerifier.sol` against Polygon ID real verifier requirements
- [x] Decide whether to adapt current verifier bridge or replace it
- [x] Document final verifier architecture in `docs/verifier-architecture.md`

### Base Sepolia deployment path
- [x] Add Base Sepolia network config
- [x] Normalize env var names for deploy scripts
- [x] Update deploy scripts for credential-gated contracts
- [x] Add deterministic contract address output file
- [x] Add contract config file for frontend consumption

### Contract implementation
- [x] Resolve circular dependency between voting contract and GovVerifier deployment flow
- [ ] Implement Polygon ID-compatible verifier bridge
- [ ] Wire proof success to `setAllowedUser(address)` or equivalent gate path
- [x] Restrict direct authorization writes to GovVerifier only (remove public bypass on voting contract)
- [ ] Add explicit non-production-only bypass path if needed for local testing
- [ ] Add authorization state read helpers where needed

### Validation
- [ ] Add tests for unauthorized user blocked
- [ ] Add tests for authorized user allowed after proof success
- [ ] Deploy contracts to Base Sepolia
- [ ] Verify proof success updates onchain authorization state

---

## P0 — Governance dApp (Phase 4)

### App structure
- [ ] Decide whether to keep static HTML or move to a structured frontend app
- [ ] Create shared config module for chain, addresses, ABI references
- [ ] Remove hardcoded stale address assumptions

### Wallet and verification UX
- [ ] Implement wallet connect flow for Base Sepolia
- [ ] Add wrong-network detection and switch prompt
- [ ] Show verified vs unverified state clearly
- [ ] Link proof verification success back into voting UI state

### Proposal lifecycle UX
- [ ] Build proposal list from live contract data
- [ ] Build proposal detail view
- [ ] Implement create proposal flow
- [ ] Implement second proposal flow
- [ ] Implement submit amendment flow
- [ ] Implement approve amendment flow
- [ ] Implement open voting flow
- [ ] Implement cast vote flow
- [ ] Implement finalize proposal flow

### Product polish
- [ ] Add loading, pending tx, success, and error states
- [ ] Add empty states and no-permission states
- [ ] Add transaction hash visibility for demo credibility

---

## P0 — PWA Shell (Phase 5)

### Core PWA files
- [ ] Add `manifest.webmanifest`
- [ ] Add app icons
- [ ] Add service worker
- [ ] Register service worker in app shell

### Offline behavior
- [ ] Cache static shell assets
- [ ] Show offline banner or offline mode state
- [ ] Handle reconnect cleanly
- [ ] Ensure cached shell launches without network

### Mobile polish
- [ ] Verify phone-sized layout for all key screens
- [ ] Improve tap targets and form usability
- [ ] Test installed mode on mobile
- [ ] Ensure wallet interaction flow remains usable on mobile

---

## P0 — Demo Hardening (Phase 6)

### Runbooks and scripts
- [ ] Create `docs/demo-runbook.md`
- [ ] Create `docs/demo-rehearsal.md`
- [ ] Create clean-wallet demo checklist
- [ ] Create fallback plan for RPC or wallet hiccups

### Smoke tests
- [ ] Add issuer smoke test
- [ ] Add proof flow smoke test
- [ ] Add contract authorization smoke test
- [ ] Add governance lifecycle smoke test
- [ ] Add PWA install/offline smoke test

### Rehearsal
- [ ] Run full demo once from clean state
- [ ] Fix failures
- [ ] Run full demo second time from clean state
- [ ] Lock final demo script

---

## P1 — Skills Package

- [ ] Create `skills/zk-voting-architect/SKILL.md`
- [ ] Create `skills/polygon-id-ops/SKILL.md`
- [ ] Create `skills/zk-voting-contracts/SKILL.md`
- [ ] Create `skills/zk-voting-pwa/SKILL.md`
- [ ] Create `skills/zk-voting-demo-qa/SKILL.md`

---

## P1 — Documentation and Credibility Assets

- [ ] Tighten whitepaper from draft to v1
- [ ] Tighten development paper from draft to v1
- [ ] Create architecture diagram source file
- [ ] Add demo screenshots once flows are real
- [ ] Add Base and Polygon ID positioning section to README

---

## P2 — Nice-to-Haves After Core Demo

- [ ] Add multiple credential types
- [ ] Add role-based proposal permissions
- [ ] Add richer audit history UI
- [ ] Add admin operator panel for demo management
- [ ] Add Base mainnet deployment checklist

---

## Immediate Next Actions

1. Audit Polygon ID issuer setup
2. Define schema JSON and proof request
3. Lock verifier architecture
4. Add Base Sepolia deployment path

These are the next critical moves. Everything else waits behind them.
