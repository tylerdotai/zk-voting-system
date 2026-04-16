# Verifier Init Checklist

## Why this exists
The current credential-gated deploy flow is not proof-ready after deployment. This checklist defines what must exist before `submitZKPResponse()` can work.

## Required before live proof submission

### 1. Fix circular dependency
Current contracts create a circular dependency:
- `ZKVotingRobRulesWithCredentials` constructor expects `GovVerifier` address
- `GovVerifier` constructor expects voting contract address

This must be resolved explicitly before final deployment flow is trustworthy.

### 2. Deploy validator contract
A Polygon ID-compatible validator contract must be deployed or referenced.

### 3. Initialize request config
The verifier owner must call `setZKPRequest()` with:
- `requestId`
- `validator`
- `schema`
- `slotIndex`
- `operator`
- `value`
- `circuitId`

### 4. Validate proof input mapping
Do not trust current address extraction logic until one real proof has been inspected.

### 5. Persist verifier init artifact
Deployment should save a machine-readable verifier init artifact so frontend and ops can see:
- which request id is active
- which schema hash is expected
- which circuit is expected
- whether initialization happened yet

## Definition of proof-ready deploy
A deploy is proof-ready only if:
- contracts deployed successfully
- circular dependency resolved cleanly
- validator address known
- `setZKPRequest()` executed successfully
- request config persisted
- one real proof tested against the deployed verifier
