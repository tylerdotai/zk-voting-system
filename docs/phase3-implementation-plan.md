# Phase 3 Implementation Plan
Status: Active | Branch: `phase2/identity-foundation` ( Phase 3 groundwork )
Generated: 2026-04-16

## Why this document exists

Gate 2.3/2.4 (issuer wallet flow) requires Tyler's Polygon ID wallet to accept a credential offer — I cannot do that from here. Per HEARTBEAT.md, when wallet-side testing is blocked, useful Phase 3 prep work takes priority.

This document captures the concrete Phase 3 implementation steps that are now fully actionable given the issuer-side work already completed.

---

## The Two-Circuit Architecture

There are two completely separate ZK circuits in this system. Conflating them is the root cause of the current verifier design problem.

### Circuit 1: Credential Proof (Polygon ID query circuit)
- **Purpose:** Prove a wallet holds a valid `FortWorthDAOMembershipCredential`
- **What it proves:** The credential exists, is not revoked, and satisfies query conditions (status, jurisdiction, etc.)
- **Inputs:** DID, credential data, Merkle proof of inclusion in issuer's state
- **Output:** A proof that the credential is valid for a given request ID
- **Who generates it:** Polygon ID / Privado ID wallet app
- **Who verifies it:** `GovVerifier` (via `ZKPVerifier.submitZKPResponse()`)
- **Binding to address:** The sender of the `submitZKPResponse()` transaction IS the Ethereum address — no extraction from circuit outputs needed

### Circuit 2: Vote Circuit (`vote.circom`)
- **Purpose:** Prove a vote is valid (eligible voter, not double-spent)
- **Inputs:** `voterIdentity` (Poseidon hash of DID), `nullifier`, `voterMerkleRoot`, vote choice, Merkle path
- **Outputs:** `nullifierHash`, `voterHash`
- **Who generates it:** Client-side proof generation using the credential
- **Who verifies it:** `ZKVotingRobRulesWithCredentials` directly (not via GovVerifier)

### The critical insight

`GovVerifier._afterProofSubmit()` processes Circuit 1 (credential proof).
It does NOT process the vote circuit.

The `_afterProofSubmit()` address extraction (`inputs[inputs.length - 1]`) is wrong for BOTH circuits:
- For Circuit 1: `msg.sender` is the address — no extraction needed
- For Circuit 2: The address is not in circuit outputs at all

---

## What Phase 3 actually needs

### Step 1: Fix `_afterProofSubmit()` for Circuit 1

For the credential proof (Polygon ID query), the Ethereum address is `msg.sender` — the wallet that submitted the proof transaction. No circuit output extraction is needed.

```solidity
function _afterProofSubmit(
    uint64 requestId,
    uint256[] memory inputs,
    ICircuitValidator validator
) internal override {
    address user = msg.sender; // address is tx.origin for proof submission

    if (votingContract != address(0)) {
        (bool success, ) = votingContract.call(
            abi.encodeWithSignature("setAllowedUser(address)", user)
        );
        if (success) {
            emit CredentialVerified(user);
        }
    }
}
```

This is the correct binding strategy for the credential proof phase. The vote circuit binding is a separate concern (handled by the voting contract directly when the vote is submitted).

### Step 2: Add `setZKPRequest()` initialization to deploy script

The verifier MUST be initialized before it can accept proofs. The deploy script currently skips this entirely.

The `setZKPRequest()` parameters must match the proof request the wallet will generate. These come from the Polygon ID issuer's proof template configuration.

Required parameters:
```javascript
// These values come from the issuer's proof request template
const CIRCUIT_ID = "credentialAtomicQueryV3"; // or the actual circuit in use
const SCHEMA_HASH = "...";                    // from issuer's schema
const REQUEST_ID = 1;
const SLOT_INDEX = 0;
const OPERATOR = ICircuitValidator.Operator.EQ; // or appropriate operator
const VALUE = "...";                            // query value from proof request
```

The concrete values for these parameters must come from the Polygon ID issuer's proof request configuration (the same configuration used to generate the QR/deep-link proof request in Phase 2 Gate 2.4).

To find these values:
1. Query the issuer API for the active proof request template
2. The template defines which circuit, schema, and query conditions are required
3. Use those exact values in `setZKPRequest()`

### Step 3: Validator contract selection

The `ZKPVerifier` requires an `ICircuitValidator` to verify proofs. There are two paths:

**Path A — On-chain validator (recommended for full decentralization):**
Deploy the Polygon ID state validator contract. This is the on-chain counterpart that verifies the ZK proof against the credential state tree.
- Polygon ID validator repo: `https://github.com/0xPolygonID/contracts`
- Contract: `CredentialAtomicQueryValidator` (or equivalent for the query circuit version in use)

**Path B — Light integration (faster demo path):**
Use the Privado ID / Polygon ID provided validator service endpoint and structure `submitZKPResponse()` calls to match the expected input format. The on-chain verification is still performed by `ZKPVerifier`, but the proof generation uses the hosted/wallet-side tooling.

For the demo, Path B is acceptable if:
- The issuer's proof request is configured with a known circuit ID and schema
- The deploy script initializes the verifier with those parameters
- One real proof is tested end-to-end before demo

### Step 4: Two-phase authorization design

The system should implement two distinct phases, each using the appropriate circuit:

**Phase 1 — Credential gate (GovVerifier):**
1. User scans QR/deep-link proof request from issuer
2. User's Polygon ID wallet generates credential proof
3. User submits `submitZKPResponse()` to `GovVerifier`
4. `GovVerifier._afterProofSubmit()` calls `votingContract.setAllowedUser(user)`
5. User is now authorized to submit votes

**Phase 2 — Vote submission (ZKVotingRobRulesWithCredentials):**
1. User generates vote circuit proof client-side
2. User submits vote with proof to `ZKVotingRobRulesWithCredentials`
3. Contract verifies the vote proof (nullifier not spent, voter in Merkle tree, valid choice)
4. Vote is recorded

The vote circuit does NOT need to re-verify the credential — that was done in Phase 1.

### Step 5: Credential → Ethereum address binding at issuance time

The most robust binding strategy is at credential issuance time: the credential should include the user's Ethereum address as a claim, and the credential proof circuit should be configured to reveal it (via a query that selectively reveals the address field).

For a quick demo, the simpler approach is:
- The credential proof reveals the DID or a derived identifier
- The `_afterProofSubmit()` uses `msg.sender` as the binding (the wallet that submitted the proof)
- This implicitly binds the credential to the Ethereum address that holds the private key

This is acceptable for the demo since the proof is submitted from the same wallet that holds the credential.

---

## Updated deploy script spec

The `scripts/deploy-with-credentials.js` needs these additions:

```javascript
// After step 3 (verifier wired):
console.log("\n4. Initializing ZKP request on verifier...");

// Fetch proof request config from issuer (or use hardcoded values from issuer's proof template)
// These must match the proof request the wallet will generate
const proofRequestConfig = await fetchProofRequestConfig();
const validatorAddress = await deployValidator(); // or use existing

const tx = await govVerifier.setZKPRequest(
  REQUEST_ID,                         // requestId
  validatorAddress,                   // validator contract
  {
    schema: proofRequestConfig.schemaHash,
    operator: proofRequestConfig.operator,
    slotIndex: proofRequestConfig.slotIndex,
    value: proofRequestConfig.value,
    circuitId: proofRequestConfig.circuitId,
  }
);
await tx.wait();
console.log(`   ZKPRequest initialized for requestId ${REQUEST_ID}`);
```

---

## Outstanding questions for Tyler

1. Which Polygon ID circuit version is the issuer currently configured to use for proof requests? ( credentialAtomicQueryV3? QueryBased? )
2. Is the Polygon ID validator contract deployed on Base Sepolia, or should we use the hosted verifier path?
3. Does the credential schema include an Ethereum address field, or should we rely on `msg.sender` binding?
4. Has the vote circuit been compiled to .zkey (proving key) yet, or is that still pending?

---

## What counts as done for Phase 3

Phase 3 is complete when:
- [ ] `GovVerifier._afterProofSubmit()` uses `msg.sender` for address binding
- [ ] `setZKPRequest()` is called in the deploy script with real values
- [ ] A validator contract is deployed or a hosted validator path is documented
- [ ] One real credential proof has been submitted and `setAllowedUser()` confirmed
- [ ] The vote circuit is compiled and the proving key is available
- [ ] Deployment config includes all verifier initialization parameters
- [ ] Evidence captured in `docs/phase2-validation-guide.md`

---

## Bottom line

The issuer side work (Phase 2) is 80% done and waiting on wallet interaction. Phase 3 is now the critical path. The most immediately actionable items are:

1. Fix `_afterProofSubmit()` to use `msg.sender` (5-line Solidity change)
2. Query the issuer's active proof request template to get `setZKPRequest()` parameter values
3. Add `setZKPRequest()` call to `deploy-with-credentials.js`
4. Determine validator deployment strategy
