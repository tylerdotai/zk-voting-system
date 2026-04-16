# Phase 2 Validation Guide

## Gate 2.1 — Issuer environment boots
Pass when:
- Issuer services are healthy
- UI/API are reachable

Evidence:
- service logs snippet
- health check output
- reachable URL notes

## Gate 2.2 — Schema is defined
Pass when:
- `schemas/v1-fort-worth-dao-member.json` exists
- required fields are present
- schema version recorded

Evidence:
- file path + schema version

## Gate 2.3 — Credential issuance works
Pass when:
- one clean test identity receives credential successfully
- issuance is repeatable

Evidence:
- wallet screenshot and/or API response log
- documented issuance steps in `docs/issuer-setup.md`

## Gate 2.4 — Proof request is consumable
Pass when:
- generated proof request is accepted by wallet
- proof flow starts cleanly

Evidence:
- saved real payload in `docs/proof-request-template.md`
- short test result notes

---

## Current status (2026-04-16)

### Gate 2.1 — PASSED
- All 6 issuer containers healthy (issuer-api, issuer-ui, issuer-postgres, issuer-redis, issuer-notifications, issuer-pending_publisher)
- API reachable at :3001, UI at :8088
- Public tunnel live at https://zk-voting-issuer.loca.lt (refreshed this morning)
- `.env-issuer` updated with new tunnel URL

### Gate 2.2 — PASSED
- Schema: `schemas/v1-fort-worth-dao-member.json` (Polygon ID format)
- Schema hash: `63da8028ea572b245541ced3451e0f67`
- Schema type: `FortWorthDAOMembershipCredential`
- Fields: membershipId, membershipStatus, jurisdiction, memberSince, votingEligible, membershipTier, committee

### Gate 2.3 — 80% done, needs Tyler's action
- 3 credential links already created (fwdao-0001, fwdao-0002, fwdao-0003)
- Deep links generated and active
- Problem: `POST /v2/identities/{id}/credentials/links` gives "at least one proof type should be enabled" — seems to require `BJJSignature2021` specifically, not the array syntax
- Also: trying to create a 4th link for same DID fails with schema validation error (might be linked to the same schema already being imported)
- Tyler action needed: open the Polygon ID wallet app, scan one of the deep links, accept the credential offer

### Gate 2.4 — Template done, waiting on wallet
- Proof request template documented in `docs/proof-request-template.md`
- Real offer payloads available from the existing links
- Wallet must actually scan and start proof generation

### Phase 3 readiness (overnight heartbeat findings)
- GovVerifier._afterProofSubmit() already uses `msg.sender` (fixed before this session)
- All 127 tests still passing
- `setZKPRequest()` in deploy script still missing — this is the next real blocker
- Phase 3 verifier-init-checklist: `docs/verifier-init-checklist.md`

## Known blockers
1. Wallet-side credential accept (Tyler action required — open Polygon ID wallet, scan deep link)
2. `setZKPRequest()` initialization in deploy script (requires validator contract + proof request config)
3. Validator contract deployment to Base Sepolia

## Overnight heartbeat actions taken
- Re-established localtunnel public URL: `https://zk-voting-issuer.loca.lt`
- Updated `.env-issuer` with new tunnel URL
- Confirmed credential offer deep links are still active
- Verified 3 existing links still valid and offerable