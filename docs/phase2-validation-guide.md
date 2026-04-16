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
- Public tunnel established and re-established after tunnel process death. Current live URL: `https://weak-tiger-12.loca.lt`
- Issuer restarted after tunnel rotation so offer payloads now reference the current live callback URL
- Custom Polygon-ID-ready schema imported successfully from repo-hosted raw GitHub URL
- Credential link created successfully (`POST /v2/identities/{identifier}/credentials/links`)
- Wallet offer generated successfully (`POST /v2/identities/{identifier}/credentials/links/{id}/offer`)
- Remaining step: holder wallet must accept the offer and receive the credential

### Gate 2.4 current status
- Proof request template created (`docs/proof-request-template.md`)
- Real wallet-consumable credential offer payload captured in `docs/credential-offer-sample.json` and refreshed after tunnel rotation
- Wallet-accepted verification proof payload still pending
- While blocked on holder-wallet interaction, Phase 3 groundwork continued with Base Sepolia planning (`docs/base-sepolia-plan.md`) and Hardhat network config updates

## Phase 2 sign-off checklist
- [x] Gate 2.1 passed
- [x] Gate 2.2 passed
- [ ] Gate 2.3 passed (issuer credential offer generated; wallet accept pending Tyler action)
- [ ] Gate 2.4 passed (proof request template created; wallet verification pending)
- [x] Evidence captured in docs

## Overnight heartbeat findings (2026-04-16)

### Issuer tunnel still alive
- Public URL `https://weak-tiger-12.loca.lt` still responding
- Issuer API reachable at root (RapiDoc API docs page confirmed)
- All 6 containers healthy
- No localtunnel process running — tunnel URL is stale but still answering (likely cached by localtunnel service)
- **Action needed:** Re-establish fresh localtunnel and update `ISSUER_SERVER_URL` in `.env-issuer` before any new credential offers, or the offer payloads will have a mismatched callback URL

### Phase 3 critical finding
- GovVerifier._afterProofSubmit() had incorrect address extraction (`inputs[inputs.length - 1]`)
- Fixed: now uses `msg.sender` which is correct for Polygon ID credential proofs (the circuit does not output the Ethereum address; binding is implicit via tx origin)
- vote.circom is a separate circuit (nullifierHash/voterHash outputs) — does NOT go through GovVerifier
- See docs/phase3-implementation-plan.md for full two-circuit architecture documentation

### Tests
- All 127 tests still passing after GovVerifier.sol fix