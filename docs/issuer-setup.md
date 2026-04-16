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

## Current working path
A real wallet-consumable credential offer flow is now generating successfully.

Working values from current run:
- Public issuer URL: `https://weak-tiger-12.loca.lt`
- Issuer DID: `did:polygonid:polygon:amoy:2qSugB8VLKyAxEDwo8EMsqq9bwmToR2HT4XgBoVXxX`
- Polygon-ID-ready schema URL: `https://raw.githubusercontent.com/tylerdotai/zk-voting-system/phase2/identity-foundation/schemas/polygonid/fort-worth-dao-member.json`
- Imported schema id: `0aaf97ad-3136-4c2e-bba5-571f9bb94b4f`
- Credential link id: `a3d95603-dbab-4e59-b7d7-476177622203`

Commands that worked:
```bash
# create schema import
curl -X POST http://localhost:3001/v2/identities/$IDENT/schemas \
  -H "Authorization: Basic $AUTH" \
  -H 'Content-Type: application/json' \
  -d '{
    "url":"https://raw.githubusercontent.com/tylerdotai/zk-voting-system/phase2/identity-foundation/schemas/polygonid/fort-worth-dao-member.json",
    "schemaType":"FortWorthDAOMembershipCredential",
    "title":"Fort Worth DAO Membership",
    "description":"Polygon ID membership schema for voting eligibility",
    "version":"1.0.0"
  }'

# create credential link
curl -X POST http://localhost:3001/v2/identities/$IDENT/credentials/links \
  -H "Authorization: Basic $AUTH" \
  -H 'Content-Type: application/json' \
  -d '{
    "schemaID":"0aaf97ad-3136-4c2e-bba5-571f9bb94b4f",
    "signatureProof":true,
    "mtProof":false,
    "credentialSubject":{
      "membershipId":"fwdao-0001",
      "membershipStatus":"active",
      "jurisdiction":"Fort Worth, TX",
      "memberSince":20250115,
      "votingEligible":true
    },
    "limitedClaims":1
  }'

# create wallet offer
curl -X POST http://localhost:3001/v2/identities/$IDENT/credentials/links/62672ea0-e7f0-47b5-a2c7-d23fab70734a/offer \
  -H "Authorization: Basic $AUTH"
```

Saved sample payload:
- `docs/credential-offer-sample.json`

Note:
- localtunnel subdomains can die or rotate overnight, so the tunnel had to be re-established and the issuer restarted to regenerate a current live offer payload.

## Current blocker to clear next
The issuer now produces a real Privado wallet link payload. Remaining work is to test this offer with a real wallet scan/accept flow, then capture the issued credential evidence and move on to proof-request generation for verification.

## Gate evidence checklist
- Gate 2.1: service health + reachable UI/API
- Gate 2.2: schema file in repo + version
- Gate 2.3: successful credential issuance evidence
- Gate 2.4: proof request payload that wallet accepts

## Common gotchas
- `ISSUER_SERVER_URL` cannot stay `localhost` for mobile wallet flows.
- If issuer keys are ephemeral and volumes are wiped, DID changes and proof requests break.
- Keep issuer DID consistent in allowed issuers for proof requests.
