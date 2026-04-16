# ACCEPTANCE_GATES.md — ZK DID Voting System

Status: Mandatory gates  
Rule: a phase is not complete until every gate in that phase passes

---

## Gate Format

Each gate has:
- **Purpose**
- **Pass criteria**
- **Evidence**
- **Failure meaning**

---

## Phase 1 — Source of Truth Gates

### Gate 1.1 — Core docs exist
**Purpose**  
Ensure the project has a clear planning backbone.

**Pass criteria**
- `WHITEPAPER.md` exists
- `DEVELOPMENT_PAPER.md` exists
- `SKILLS_PLAN.md` exists
- `ROADMAP.md` exists
- `TASKS.md` exists
- `ACCEPTANCE_GATES.md` exists

**Evidence**
- files present in repo

**Failure meaning**
- the build can drift because scope and execution rules are not locked

### Gate 1.2 — Positioning is coherent
**Purpose**  
Ensure the product is framed correctly.

**Pass criteria**
- docs describe the system as a credential-gated governance dApp
- docs explicitly mention immutable onchain governance records
- docs describe the PWA as the delivery shell, not the whole identity of the product

**Evidence**
- matching language across whitepaper and development paper

**Failure meaning**
- product story is muddled and implementation priorities will drift

---

## Phase 2 — Identity Foundation Gates

### Gate 2.1 — Issuer environment boots
**Purpose**  
Prove the issuer stack exists beyond paper.

**Pass criteria**
- Polygon ID issuer services start successfully
- required env vars and configs are documented
- ports/endpoints are known

**Evidence**
- service logs, health check, or issuer UI reachable
- `docs/issuer-setup.md`

**Failure meaning**
- no real credential path exists

### Gate 2.2 — Schema is defined
**Purpose**  
Lock eligibility semantics.

**Pass criteria**
- credential schema exists in repo
- required fields are documented
- schema version is recorded

**Evidence**
- checked-in schema file
- schema section in setup docs

**Failure meaning**
- proof requests have no trustworthy target claim model

### Gate 2.3 — Credential issuance works
**Purpose**  
Prove a user can become eligible.

**Pass criteria**
- at least one test identity receives a credential
- issuance steps are repeatable

**Evidence**
- issuance walkthrough
- proof of issued credential in test path

**Failure meaning**
- the system cannot reach real eligibility

### Gate 2.4 — Proof request is consumable
**Purpose**  
Prove the wallet/app can understand the request.

**Pass criteria**
- proof request payload is generated
- wallet/app accepts the request
- request format is documented

**Evidence**
- QR or deep-link test
- saved proof request example

**Failure meaning**
- the verification UX is dead on arrival

---

## Phase 3 — Onchain Verifier Integration Gates

### Gate 3.1 — Base Sepolia deploy path works
**Purpose**  
Ensure the project is deploying to the intended chain.

**Pass criteria**
- contracts deploy to Base Sepolia successfully
- deploy output is captured in a deterministic file
- frontend can read deployed addresses from config

**Evidence**
- deployment logs
- checked-in or generated address/config artifact

**Failure meaning**
- chain target is not operational

### Gate 3.2 — Unauthorized user is blocked
**Purpose**  
Prove gating is real.

**Pass criteria**
- an unverified wallet cannot perform restricted actions

**Evidence**
- test case and live manual check

**Failure meaning**
- credential gating is fake

### Gate 3.3 — Proof success authorizes user
**Purpose**  
Prove the identity layer changes contract permissions.

**Pass criteria**
- successful proof changes user authorization state onchain
- authorized user is distinguishable from unauthorized user

**Evidence**
- contract read before proof
- contract read after proof
- transaction hash or onchain event

**Failure meaning**
- Polygon ID is not actually integrated with governance permissions

### Gate 3.4 — Dev bypass is isolated
**Purpose**  
Prevent demo shortcuts from contaminating final truth.

**Pass criteria**
- demo or dev bypasses are disabled in final demo mode
- bypass path is clearly separated by config or build mode

**Evidence**
- config review
- manual verification in demo environment

**Failure meaning**
- demo credibility is compromised

---

## Phase 4 — Governance dApp Gates

### Gate 4.1 — Wallet and network UX works
**Purpose**  
Ensure users can enter the dApp correctly.

**Pass criteria**
- wallet connect works
- wrong network is detected
- Base Sepolia switch path is clear

**Evidence**
- manual test walkthrough

**Failure meaning**
- users cannot reliably reach the app state needed to vote

### Gate 4.2 — Verified state is visible
**Purpose**  
Make authorization legible in the UI.

**Pass criteria**
- UI clearly shows verified vs unverified state
- restricted actions reflect current permission state

**Evidence**
- manual UI walkthrough

**Failure meaning**
- users cannot understand why actions succeed or fail

### Gate 4.3 — Proposal lifecycle works
**Purpose**  
Validate the core governance engine.

**Pass criteria**
- verified user can create proposal
- second proposal
- submit amendment
- approve amendment
- open voting
- cast vote
- finalize proposal

**Evidence**
- end-to-end manual run
- transaction hashes for each critical action

**Failure meaning**
- governance is incomplete

### Gate 4.4 — Contract state matches UI
**Purpose**  
Ensure the UI is not lying.

**Pass criteria**
- proposal status, vote counts, and permissions in UI match live contract state

**Evidence**
- manual comparison of UI data to contract reads

**Failure meaning**
- the dApp is untrustworthy even if contracts work

---

## Phase 5 — PWA Shell Gates

### Gate 5.1 — PWA metadata is valid
**Purpose**  
Make the app installable.

**Pass criteria**
- manifest exists and is valid
- icons exist
- service worker registers successfully

**Evidence**
- browser devtools checks
- manual install test

**Failure meaning**
- app is not a real PWA

### Gate 5.2 — Offline shell works
**Purpose**  
Ensure the app is resilient when connectivity drops.

**Pass criteria**
- cached app shell loads offline
- offline state is clearly communicated
- reconnect path recovers cleanly

**Evidence**
- offline browser test
- manual reconnect test

**Failure meaning**
- PWA claim is weak and mobile reliability is poor

### Gate 5.3 — Mobile UX is usable
**Purpose**  
Ensure the app is not desktop-first in disguise.

**Pass criteria**
- all key flows are usable on phone-sized viewport
- tap targets and form controls are practical
- installed mode is visually acceptable

**Evidence**
- mobile viewport test
- real device check if available

**Failure meaning**
- the product is not demoable as a serious mobile governance tool

---

## Phase 6 — Demo Hardening Gates

### Gate 6.1 — Smoke tests exist
**Purpose**  
Create a repeatable pre-demo safety check.

**Pass criteria**
- smoke tests or checklists exist for issuer, proof, contracts, governance, and PWA

**Evidence**
- documented test files or runbooks

**Failure meaning**
- demo prep depends on memory and luck

### Gate 6.2 — Clean-wallet run passes once
**Purpose**  
Prove the flow works from a realistic starting point.

**Pass criteria**
- new or reset wallet can complete full demo path successfully

**Evidence**
- recorded rehearsal notes

**Failure meaning**
- system only works in a dirty or hand-held state

### Gate 6.3 — Clean-wallet run passes twice
**Purpose**  
Prove repeatability.

**Pass criteria**
- full walkthrough succeeds twice in a row without improvisation

**Evidence**
- second rehearsal notes
- fixed script or checklist

**Failure meaning**
- system is still brittle

### Gate 6.4 — Demo operator runbook exists
**Purpose**  
Make the system demoable under stress.

**Pass criteria**
- exact operator steps are documented
- fallback actions are documented
- short version and full version exist

**Evidence**
- `docs/demo-runbook.md`
- `docs/demo-rehearsal.md`

**Failure meaning**
- live presentation risk stays high

---

## Final Release Gate

The project is demo-complete only if all of the following are true:

- issuer works
- credential issuance works
- proof request works
- proof success changes onchain authorization state
- unverified users are blocked
- verified users can complete governance flow
- Base Sepolia deployment is stable
- app is a real installable PWA
- offline shell works
- clean-wallet demo passes twice
- docs reflect the final reality

If one item fails, the system is not complete.
