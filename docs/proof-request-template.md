# Proof Request Template (Phase 2)

## Purpose
Reference shape for the first live proof request used by `verify.html`.

## v1 query intent
- Trusted issuer DID only
- Credential type: `FortWorthDAOMembershipCredential`
- Claim gate: `votingEligible == true`

## Example (conceptual)
```json
{
  "id": "fwdao-proof-v1",
  "reason": "Verify voting eligibility",
  "scope": [
    {
      "id": 1,
      "circuitId": "credentialAtomicQuerySigV2",
      "query": {
        "allowedIssuers": ["did:polygonid:..."],
        "type": "FortWorthDAOMembershipCredential",
        "context": "https://example.com/schemas/v1-fort-worth-dao-member.json",
        "credentialSubject": {
          "votingEligible": {
            "$eq": true
          }
        }
      }
    }
  ]
}
```

## Notes
- Treat this as a starting template only. Save one real wallet-accepted payload in this file before phase sign-off.
- Keep first proof minimal. Add compound constraints only after live flow is stable.
