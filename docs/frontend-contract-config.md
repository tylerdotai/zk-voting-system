# Frontend Contract Config

## Purpose
Provide a deterministic frontend-readable contract config artifact after deployment.

## Output files
The credential deployment script should emit:
- `deployments/<network>-credentials.json`
- `deployments/<network>-frontend.json`

## Frontend config shape
```json
{
  "network": "baseSepolia",
  "chainId": 84532,
  "votingAddress": "0x...",
  "govVerifierAddress": "0x...",
  "chair": "0x...",
  "generatedAt": "2026-04-16T00:00:00.000Z",
  "notes": [
    "Interim config only. Proof verification is not fully wired until Phase 3 validator + setZKPRequest initialization work is complete."
  ]
}
```

## Why this exists
- avoids scraping ad-hoc text output
- gives frontend code one deterministic file to read
- keeps deploy artifacts aligned with the active network

## Current limitation
The addresses are deploy-real, but proof verification remains incomplete until validator deployment and request initialization are added.
