# Verifier Architecture Notes

Status: Phase 3 groundwork  
Target chain: Base Sepolia for voting contracts  
Identity issuer/state layer: Polygon ID / Privado ID issuer on Polygon Amoy for current demo path

## Current reality

The current verifier path in the repo is not demo-ready yet.

### What exists
- `GovVerifier.sol`
- `ZKPVerifier.sol`
- `ZKVotingRobRulesWithCredentials.sol`
- `scripts/deploy-with-credentials.js`

### What is broken or incomplete
1. `setZKPRequest()` is never called after deployment
2. no validator contract is deployed or wired in the deploy script
3. `GovVerifier._afterProofSubmit()` assumes the wallet address is `inputs[inputs.length - 1]`
4. `deploy-with-credentials.js` deploys the voting contract with a placeholder verifier address and never fixes it
5. `hardhat.config.js` has no Base Sepolia network config

If left as-is, proof submission will fail even if the issuer side works.

---

## Contract findings

### 1. Request initialization is mandatory
`ZKPVerifier.submitZKPResponse()` requires:
- `requestValidators[requestId] != address(0)`
- `requestQueries[requestId].schema != 0`

That means the owner must call:
- `setZKPRequest(requestId, validator, query)`

Without that, every proof submission reverts.

### 2. Validator is missing from deploy flow
The deploy script currently deploys:
- voting contract
- `GovVerifier`

But it does **not** deploy or configure any actual Polygon ID validator contract.

So even after deployment, `submitZKPResponse()` has nothing usable to call.

### 3. Address extraction is unsafe
`GovVerifier._afterProofSubmit()` currently does:
```solidity
address user = address(uint160(uint256(inputs[inputs.length - 1])));
```

That is a guess, not a verified mapping for the chosen Polygon ID circuit.

For Phase 3, the proof input layout must be validated against the actual circuit and validator in use before authorization state is changed onchain.

### 4. Deploy script wiring is wrong
`deploy-with-credentials.js` deploys `ZKVotingRobRulesWithCredentials` first using the deployer address as a placeholder verifier address:
```js
const votingContract = await ZKVotingRobRulesWithCredentials.deploy(
  deployer.address,
  deployer.address,
  3
);
```

Then it deploys `GovVerifier`, but never updates the voting contract's verifier reference.

That means the contract graph is wrong from the start.

### 5. There is a real circular dependency
The current constructor design creates a circular dependency:
- voting contract wants verifier address at deploy time
- verifier wants voting contract address at deploy time

That means the deploy path cannot be made clean without one of these changes:
1. add a post-deploy setter on one side
2. deploy a minimal proxy/placeholder and rebind later
3. refactor constructor dependencies so only one side needs the other at deployment time

This is not a minor script bug. It is an architecture-level deploy constraint.

---

## Recommended Phase 3 architecture

## Decision
Adapt the current bridge architecture, but repair it properly.

### Recommended flow
1. Deploy Polygon ID-compatible validator contract
2. Deploy `GovVerifier`
3. Deploy `ZKVotingRobRulesWithCredentials` with the real `GovVerifier` address
4. Initialize `GovVerifier` with:
   - validator contract
   - request id
   - query schema hash
   - slot/operator/value settings
   - circuit id
5. Validate proof input mapping with a real proof before enabling authorization writes

### Why keep the bridge
Keeping `GovVerifier` as the bridge is fine for the demo because it gives one narrow responsibility:
- accept validated proof
- mark user as allowed in voting contract

The bridge is acceptable if initialization and input mapping are made explicit.

---

## Required Phase 3 implementation changes

### A. Hardhat network config
Add Base Sepolia to `hardhat.config.js`:
- `BASE_SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- chain id `84532`

### B. Deterministic deploy output
Replace ad-hoc `contracts.json` text blob with structured JSON config for:
- network
- voting contract address
- verifier address
- validator address
- request id
- schema metadata

### C. Deploy sequence fix
Correct order should be:
1. deploy validator
2. deploy `GovVerifier`
3. deploy voting contract with real verifier address
4. optionally set voting contract in verifier if still needed
5. call `setZKPRequest()`
6. persist deployment config

### D. Authorization write hardening
The voting contract previously exposed a public `setAllowedUser(address)` path, which meant anyone could mark any wallet as verified without a real proof.

That is now hardened so only the configured `GovVerifier` contract can call `setAllowedUser(address)`.

This closes the most obvious fake-proof bypass before real validator wiring is finished.

### E. Query initialization
The deploy script must explicitly configure:
- `requestId = 1`
- `schema`
- `slotIndex`
- `operator`
- `value`
- `circuitId`

These values must match the live proof request design.

### F. Input mapping validation
Before trusting `_afterProofSubmit()`, run one real proof and compare:
- raw proof inputs
- expected user identifier field
- how address/session mapping should actually work

If address is not directly available in proof inputs, use a safer binding strategy.

### D. Query initialization
The deploy script must explicitly configure:
- `requestId = 1`
- `schema`
- `slotIndex`
- `operator`
- `value`
- `circuitId`

These values must match the live proof request design.

### E. Input mapping validation
Before trusting `_afterProofSubmit()`, run one real proof and compare:
- raw proof inputs
- expected user identifier field
- how address/session mapping should actually work

If address is not directly available in proof inputs, use a safer binding strategy.

---

## Base Sepolia plan

### Voting layer
- deploy voting contracts to Base Sepolia
- keep frontend wallet/network flow pointed to Base Sepolia

### Identity layer
- issuer remains on Polygon ID-compatible stack
- current demo issuer/state path remains Polygon Amoy-backed
- the contract gate on Base only needs proof verification compatibility and explicit configuration

This split is acceptable for the demo, but it must be documented clearly.

---

## Phase 3 priority checklist

1. add Base Sepolia network config
2. identify validator contract required for chosen Polygon ID circuit
3. rewrite deploy script with correct order
4. initialize `setZKPRequest()` explicitly
5. verify proof input mapping with one real proof
6. only then wire successful proof to `setAllowedUser(address)`

---

## Bottom line

The issuer side is now far enough along that the main technical risk has shifted.

The Phase 3 risk is no longer "can we run Polygon ID tooling?"
It is now:

**can the onchain verifier path be initialized correctly and tied to the real proof format without making fake assumptions?**

That is the next serious engineering problem to solve.
