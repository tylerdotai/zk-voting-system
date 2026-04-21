# ZK Voting System — SPEC.md

## Overview

ENS-gated Rob's Rules parliamentary voting on Ethereum Sepolia. 
No ENS Allowlist / ZK credential dependency. ZK vote privacy layer preserved for post-quantum future.

---

## Architecture

```
User connects wallet
       ↓
Contract: isEligible(address) → check voter allowlist
       ↓
If eligible → full Rob's Rules flow (propose, second, amend, vote, finalize)
If not eligible → "Register Now" button → calls addVoter(address)
```

---

## Contract: ZKVotingRobRulesWithCredentials

**Deployed (Sepolia):** `0x198041e195b9e8C34B5371edF67Ec84DFa68bb74`

### Voter Eligibility (ENS-gated, no ENS Allowlist)

| Function | Access | Description |
|---|---|---|
| `addVoter(address _voter)` | Chair or Owner | Grant voting rights |
| `removeVoter(address _voter)` | Chair or Owner | Revoke voting rights |
| `addVoters(address[] _voters)` | Chair or Owner | Batch add |
| `isEligible(address _user)` | Anyone (view) | Check voter status |
| `setEnsResolver(address _resolver)` | Chair or Owner | Future ENS integration |

### Rob's Rules Parliamentary Flow

1. **Create** → Chair creates proposal (eligible voter required)
2. **Second** → Chair seconds to move to Seconded state
3. **Amend** → Any eligible member can propose amendments
4. **Open Voting** → Chair opens voting period (max 7 days)
5. **Vote** → Members vote Yes/No/Abstain
6. **Finalize** → Anyone can finalize after voting ends → Passed/Failed

### ZK Architecture Preserved (future)

- `nullifierHash` in `voteOnMotion` — placeholder for ZK vote privacy
- `ensResolver` field — future ENS-based eligibility without allowlist
- Post-quantum signature scheme: ML-DSA (lattice-based) planned

---

## Frontend Pages

| Page | Purpose |
|---|---|
| `index.html` | PWA offline-capable voting shell |
| `rob-rules.html` | Full Rob's Rules parliamentary UI |
| `verify.html` | (legacy, unused without ENS Allowlist) |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker for offline caching |

### Voter Flow (rob-rules.html)

1. Connect wallet → shows address
2. `checkVoterEligibility()` polls contract → shows registered status
3. If not registered → "Register Now" button enabled
4. Click "Register" → `contract.addVoter(walletAddress)` → eligible
5. Full voting UI unlocked (create, second, amend, vote)

---

## Out of Scope (for now)

- ENS Allowlist / ZK credential verification
- On-chain ZK proof validation
- Multi-chain support
- Mobile app
- Mainnet deployment

---

## In Scope

- ENS domain resolution for voter eligibility (future)
- ZK vote privacy layer (post-quantum, future)
- Offline-capable PWA
- Real-time SSE updates (future)

---

## Success Criteria

1. Voter can connect wallet → see eligibility → self-register
2. Chair can add/remove voters from allowlist
3. Full Rob's Rules parliamentary flow works on-chain
4. PWA works offline with service worker
5. ZK vote privacy architecture documented for future implementation

---

## Grant Reference

Zero Knowledge DID Blockchain Voting System — $2,500 grant
Client: Fort Worth DAO
Key constraints: post-quantum ready, not reliant on 3rd party / internet, offline backup