# Issuer Setup (Phase 2)

## Goal
Boot Polygon ID (Privado ID) issuer services, issue one real test credential, and capture evidence for Phase 2 gates.

## Stack
- Upstream repo: `https://github.com/0xPolygonID/issuer-node`
- Fastest startup mode: prebuilt registry images (`make run-all-registry`)

## Prerequisites
- Docker + Docker Compose
- Node (for localtunnel, if needed)
- Polygon ID wallet app on a test phone
- Base Sepolia RPC for contract side (Phase 3)

## Required env files
- `.env-issuer`
- `.env-ui`
- `resolvers_settings.yaml`

## Minimum config values
- `ISSUER_SERVER_URL` (must be publicly reachable for mobile wallet proof flow)
- `ISSUER_API_AUTH_USER`
- `ISSUER_API_AUTH_PASSWORD`
- `ISSUER_UI_AUTH_USERNAME`
- `ISSUER_UI_AUTH_PASSWORD`
- KMS provider settings (`local` for demo)

## Bring-up procedure
1. Clone issuer-node repo and copy sample env files.
2. Set auth credentials and server URL.
3. Generate issuer DID (`make generate-issuer-did`).
4. If local machine only, expose API publicly with localtunnel/ngrok and update `ISSUER_SERVER_URL`.
5. Start services (`make run-all-registry`).
6. Confirm:
   - UI reachable (usually `:8088`)
   - API reachable (usually `:3001`)

## Credential issuance procedure
1. Create/load schema (see `docs/schema-reference.md`).
2. Create test connection in issuer UI.
3. Scan with Polygon ID wallet.
4. Issue `FortWorthDAOMembershipCredential` with required claims.
5. Save proof evidence (screenshot/logs) for gate 2.3.

## API-first quick checks (already validated)
- Create identity: `POST /v2/identities` with basic auth
- Import schema: `POST /v2/identities/{identifier}/schemas`

Example identity creation payload:
```json
{
  "didMetadata": {
    "method": "polygonid",
    "blockchain": "polygon",
    "network": "amoy",
    "type": "BJJ"
  },
  "displayName": "FW DAO Issuer"
}
```

## Current blocker to clear next
Direct `POST /v2/identities/{identifier}/credentials` issuance still needs final payload tuning against a schema/type pair that the API accepts cleanly for our custom credential. Use wallet link issuance path in UI as fallback for first successful issue.

## Gate evidence checklist
- Gate 2.1: service health + reachable UI/API
- Gate 2.2: schema file in repo + version
- Gate 2.3: successful credential issuance evidence
- Gate 2.4: proof request payload that wallet accepts

## Common gotchas
- `ISSUER_SERVER_URL` cannot stay `localhost` for mobile wallet flows.
- If issuer keys are ephemeral and volumes are wiped, DID changes and proof requests break.
- Keep issuer DID consistent in allowed issuers for proof requests.
