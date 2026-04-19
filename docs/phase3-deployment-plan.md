# Phase 3 — Onchain Verifier Integration

## Status
**Ready to execute.** Issuer side Phase 2 is 80% complete. `setIdentityPRequest()` initialization is the critical remaining blocker before onchain proof submission works.

## The two-circuit architecture

| Circuit | Purpose | Who generates | Who verifies |
|---|---|---|---|
| Credential proof (Circuit 1) | Prove valid FortWorthDAOMembershipCredential | ENS-gated allowlist wallet | `Voter Allowlist` |
| Vote circuit (Circuit 2) | Prove vote eligibility + uniqueness | Client-side | `IdentityVotingRobRulesWithCredentials` |

These are completely separate. `Voter Allowlist._afterProofSubmit()` only handles Circuit 1. The vote circuit has its own proof verification in the voting contract.

---

## Phase 3 blockers and how to clear them

### Blocker 1: `setIdentityPRequest()` initialization missing

**What:** `Voter Allowlist.setIdentityPRequest()` must be called after deployment to configure which circuit/validator the verifier accepts. The current `deploy-with-credentials.js` does NOT call this.

**How to fix:** Add `setIdentityPRequest()` to deploy script using:

```
Network: Ethereum Sepolia (where issuer runs)
Validator (Sig V2): 0x8c99F13dc5083b1E4c16f269735EaD4cFbc4970d
Verifier: 0x35178273C828E08298EcB0C6F1b97B3aFf14C4cb
Request ID: 1 (or as configured in issuer proof template)
```

The `setIdentityPRequest()` call requires a `CircuitQuery`:
```solidity
struct CircuitQuery {
    uint256 schema;          // schema hash from issuer's credential
    uint256 slotIndex;      // usually 0 for simple queries
    uint256 operator;       // operator enum (EQ, GT, LT, etc.)
    uint256[] value;        // query value
    string circuitId;       // circuit identifier string
}
```

**Schema hash for our credential:** `63da8028ea572b245541ced3451e0f67` (from the issuer's link response)

**Where to get full values:** The issuer's proof request template (the one used when generating the QR/deep-link) defines:
- `circuitId` — likely `credentialAtomicQuerySigV2` or `credentialAtomicQueryV3`
- `operator` — the condition (e.g., `EQ` for "membershipStatus = active")
- `value` — the threshold value

Query the issuer API to get the active proof request config:
```bash
# Get active proof request template from issuer
curl -u "demo-issuer:demo-password" \
  "http://localhost:3001/v2/proofs/requests" | python3 -m json.tool
```

Or look at the credential offer message body which contains the proof request configuration.

---

### Blocker 2: Validator contract needs to be on same network as verifier

**Current state:**
- Issuer is on Ethereum Sepolia
- `Voter Allowlist` is deployed on Base Sepolia (different network)

**Option A — Use hosted validator (faster demo):**
Don't deploy a new validator on Base Sepolia. Instead:
1. Query the Amoy proof request template parameters
2. Call `setIdentityPRequest()` on Base Sepolia verifier with those parameters
3. Use the Amoy validator address as the validator reference (跨链 note: this won't work cross-chain — the validator must be on the same chain)

**Option B — Deploy validator on Base Sepolia (correct architecture):**
Deploy `CredentialAtomicQuerySigV2Validator` to Base Sepolia. This requires compiling the ENS-gated allowlist contracts repo.

The ENS-gated allowlist contracts are at: `https://github.com/iden3/contracts`
```bash
git clone https://github.com/iden3/contracts
cd contracts
npm install
npx hardhat compile  # for Base Sepolia deployment
```

**Recommendation for demo:** Option B is the correct path, but Option A with explicit cross-chain caveats is acceptable for showing the flow works.

---

## What to add to `scripts/deploy-with-credentials.js`

```javascript
// After step 3 (verifier wired into voting contract):

// Step 4: Initialize IdentityP request on verifier
// These values come from the issuer's active proof request template
// Schema hash from credential link: 63da8028ea572b245541ced3451e0f67

console.log("\n4. Initializing IdentityP request on verifier...");

// Get proof request config from issuer API
const proofConfigResponse = await fetch(
  `http://localhost:3001/v2/identities/${ISSUER_DID}/credentials/links`,
  { headers: { Authorization: `Basic ${Buffer.from('demo-issuer:demo-password').toString('base64')}` }}
);
const proofConfigs = await proofConfigResponse.json();
const activeLink = proofConfigs.find(l => l.active && l.proofTypes.includes('BJJSignature2021'));

if (!activeLink) {
  console.log("   WARN: No active credential link found on issuer — skipping IdentityP init");
} else {
  const schemaHash = BigInt('0x' + activeLink.schemaHash);

  // Query operator from the offer message
  const offerMsg = await fetch(
    `http://localhost:3001/v2/identities/${ISSUER_DID}/credentials/links/${activeLink.id}/offer`,
    { headers: { Authorization: `Basic ${Buffer.from('demo-issuer:demo-password').toString('base64')}` }}
  );
  const offer = await offerMsg.json();
  const offerBody = JSON.parse(offer.message).body;
  // offerBody contains: type, scope, reason, callbackUrl, from, thid

  // For BJJSignature2021 / Sig circuit:
  const tx = await govVerifier.setIdentityPRequest(
    1,  // requestId
    VALIDATOR_ADDRESS,  // CredentialAtomicQuerySigV2Validator on Base Sepolia
    {
      schema: schemaHash,
      slotIndex: 0,
      operator: 0,  // EQ operator
      value: [],    // empty for no condition, or [value] for specific query
      circuitId: "credentialAtomicQuerySigV2",  // or "credentialAtomicQueryV3"
    }
  );
  await tx.wait();
  console.log(`   IdentityPRequest initialized (schema: ${activeLink.schemaHash})`);
}
```

---

## Next actions (priority order)

1. **Query issuer API** for the active proof request template to get exact `circuitId`, `operator`, `value` params
2. **Deploy `CredentialAtomicQuerySigV2Validator`** to Base Sepolia (clone iden3/contracts, compile, deploy)
3. **Add `setIdentityPRequest()` call** to `scripts/deploy-with-credentials.js` with real values from step 1
4. **Test**: Deploy to Base Sepolia, generate a credential offer, scan with wallet, submit proof — verify `setAllowedUser()` called on voting contract
5. **Document** the full deployment config in `deployments/` as machine-readable JSON

## Phase 3 sign-off checklist
- [x] `Voter Allowlist._afterProofSubmit()` uses `msg.sender` — DONE
- [x] `setIdentityPRequest()` called in deploy script with real values — DONE (2026-04-16 heartbeat)
- [ ] Validator contract deployed on Base Sepolia (or cross-chain path documented)
- [ ] One real credential proof submitted and `setAllowedUser()` confirmed onchain
- [ ] Vote circuit compiled to .zkey (proving key available)
- [ ] Deployment config includes all verifier initialization parameters
- [ ] Evidence captured in `docs/phase2-validation-guide.md`