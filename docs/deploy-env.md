# Deploy Environment Notes

## Canonical env vars
- `PRIVATE_KEY`
- `BASE_SEPOLIA_RPC_URL`
- `SEPOLIA_RPC_URL`

## Intended network usage
- `baseSepolia` is the canonical voting-contract demo network
- `sepolia` remains available for older experiments only

## Current deployment output
Deploy scripts should emit structured JSON artifacts under `deployments/` so frontend and verification work can read deterministic addresses.

## Current limitation
The current credential deploy script still does **not**:
- deploy a Polygon ID validator contract
- initialize `setZKPRequest()`
- correct the placeholder verifier wiring issue

That work remains Phase 3 critical path.
