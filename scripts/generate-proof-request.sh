#!/usr/bin/env bash
set -euo pipefail

OUT="${1:-docs/proof-request-sample.json}"
ISSUER_DID="${ISSUER_DID:-did:polygonid:REPLACE_ME}"
SCHEMA_CONTEXT="${SCHEMA_CONTEXT:-https://zk-voting.example/schemas/v1-fort-worth-dao-member.json}"

cat > "$OUT" <<JSON
{
  "id": "fwdao-proof-v1",
  "reason": "Verify voting eligibility",
  "scope": [
    {
      "id": 1,
      "circuitId": "credentialAtomicQuerySigV2",
      "query": {
        "allowedIssuers": ["$ISSUER_DID"],
        "type": "FortWorthDAOMembershipCredential",
        "context": "$SCHEMA_CONTEXT",
        "credentialSubject": {
          "votingEligible": { "$eq": true }
        }
      }
    }
  ]
}
JSON

echo "Wrote $OUT"
