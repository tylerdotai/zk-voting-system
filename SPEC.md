# ZK Voting System — SPEC.md

## Overview

Chair-managed allowlist Rob's Rules parliamentary voting on Ethereum Sepolia.
No ENS, no Polygon ID, no third-party identity provider. ZK vote privacy layer preserved.

---

## Live Contracts

| Contract | Address | Purpose |
|---|---|---|
| **Groth16VerifierV2** | `0x02aa9654f33Aa73880460B4f286A430c4D56CAb6` | Groth16 BN128 proof verifier |
| **ZKVotingRobRulesWithCredentials** | `0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3` | Rob's Rules governance |

## Architecture

```
User connects wallet
       ↓
Contract: isEligible(address) → check voter allowlist
       ↓
If eligible → full Rob's Rules flow (propose, second, amend, vote, finalize)
If not eligible → "Register to Vote" → chair adds address to allowlist
```

---

## Contract: ZKVotingRobRulesWithCredentials

### Voter Eligibility (chair-managed allowlist)

- Chair calls `addVoter(address)` to grant eligibility
- Chair calls `removeVoter(address)` to revoke
- `isEligible(address) → bool` — constant-time public check

### State Machine

```
Created → Seconded → Voting → Passed
                       ↘ Failed
```

### Key Functions

| Function | Access | Purpose |
|---|---|---|
| `createProposal(string)` | Eligible voter | Open a new motion |
| `secondProposal(uint256)` | Eligible voter (not proposer) | Second a motion |
| `submitAmendment(uint256,string)` | Eligible voter | Floor amendment |
| `approveAmendment(uint256,id)` | Chair | Chair accepts amendment |
| `openVoting(uint256,uint256)` | Chair | Start vote period |
| `voteOnMotion(uint256,uint256,uint256[2],uint256[2][2],uint256[2],uint256[3])` | Eligible voter | Cast vote with ZK proof |
| `callForDivision(uint256)` | Any voter | Recorded division call |
| `reconsider(uint256)` | Voter who voted | Request reconsideration |
| `reopenVoting(uint256)` | Chair | Reopen a closed vote |
| `finalizeProposal(uint256)` | Anyone | Close and tally |

### Events

`ProposalCreated`, `ProposalSeconded`, `AmendmentSubmitted`, `AmendmentApproved`, `VotingOpened`, `MotionVoted`, `CallForDivision`, `ReconsiderationRequested`, `VotingReopened`, `ProposalFinalized`, `VoterAdded`, `VoterRemoved`

---

## ZK Proof Flow

1. Voter submits vote choice to frontend
2. Frontend computes Poseidon hashes (nullifier + commitment) via `circomlibjs`
3. Frontend runs `snarkjs.groth16.fullProve()` in browser (WASM, no server)
4. Proof + public signals submitted to `voteOnMotion()`
5. `Groth16Verifier` validates proof on-chain
6. If valid, vote recorded; if not, reverts

**Public signals:** `[proposal_id, nullifier_hash, commitment]`
**Private inputs:** `[vote_choice, nullifier_seed, voter_address]`

---

## Frontend (Next.js)

- `/` — Voter portal
- `/chair` — Chair dashboard
- `/verify` — Standalone proof verifier
- snarkjs + circomlibjs via npm
- WASM + zkey served from `frontend-app/public/`
- Service worker for offline capability
