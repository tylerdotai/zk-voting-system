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

## Current run evidence (2026-04-16)

### Gate 2.1 evidence snapshot
- Issuer stack boot command succeeded: `make run-all-registry`
- Containers healthy: `issuer-api-1`, `issuer-ui-1`, `issuer-postgres-1`, `issuer-redis-1`, `issuer-notifications-1`, `issuer-pending_publisher-1`
- API check: `curl http://localhost:3001` returned `200`
- UI check: `curl http://localhost:8088` returned `401` (expected due auth)

### Gate 2.2 evidence snapshot
- Schema file created: `schemas/v1-fort-worth-dao-member.json`
- Schema version file created: `schemas/VERSION` (`1.0.0`)
- Supporting docs created:
  - `docs/schema-reference.md`
  - `docs/proof-request-template.md`
- Issuer API schema import validated with `POST /v2/identities/{identifier}/schemas` (201 + schema id)

### Gate 2.3 current status
- Identity creation validated (`POST /v2/identities`)
- Full credential issuance to holder wallet still pending final flow lock (API payload tuning vs UI link issuance path)

### Gate 2.4 current status
- Proof request template created (`docs/proof-request-template.md`)
- Wallet-accepted real payload capture still pending

## Phase 2 sign-off checklist
- [x] Gate 2.1 passed
- [x] Gate 2.2 passed
- [ ] Gate 2.3 passed
- [ ] Gate 2.4 passed
- [x] Evidence captured in docs