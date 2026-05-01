# ZK Voting System — Hackathon Demo Pitch (15 min)
## STAR Format

---

## SITUATION (1 min)

Fort Worth DAO has no governance voting system at all.
- Treasury decisions get made in group chats
- No formal process, no record of who voted what
- Anyone can claim majority without proof
- Zero privacy — every position is public

We built the first real governance mechanism for them.

---

## TASK (1 min)

Build a complete on-chain voting system that:
1. Automates Robert's Rules of Order automatically
2. Proves voter eligibility without revealing voter identity
3. Keeps individual votes private while keeping outcomes public
4. Requires no trusted third party — runs on Ethereum

---

## ACTION — What We Built (8 min)

### The Contract Layer

We wrote a Solidity smart contract on Sepolia that enforces Rob's Rules parliamentary procedure:

```
createProposal() → any eligible member makes a motion
secondProposal() → another member seconds (no self-seeding)
submitAmendment() → members propose edits to the motion
approveAmendment() → chair approves each amendment
openVoting() → chair opens the voting window (1-7 days)
castVote() → members cast with Groth16 ZK proof (proves eligibility, prevents double-vote)
callForDivision() → any member can demand a recorded vote
finalizeProposal() → automatic count — passed if yes > no
```

Every state transition is on-chain and enforced by the contract. No moderators needed.

### The Privacy Layer

When you cast a vote, you generate a Groth16 zero-knowledge proof in your browser that proves:
- You are on the voter allowlist (eligibility without identity)
- You have not voted on this proposal before (nullifier hash)
- Your vote is valid

The proof is verified on-chain. The verifier contract is deployed separately and immutable. No server, no trusted setup — it just works in a browser with MetaMask.

### The Stack

```
Static Frontend (Next.js on Vercel)
    ↓
Sepolia Testnet (live contract)
    ↓
Groth16 Verifier Contract (immutable, on-chain)
    ↓
ZK Proof Generation (snarkjs + circomlibjs, browser WASM)
```

---

## RESULT — What You See Today (4 min)

### Live on Sepolia

```
Contract: 0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3
Verifier: 0x02aa9654f33Aa73880460B4f286A430c4D56CAb6
6 on-chain transactions, fully verified on Etherscan
```

### 58 Tests Passing

Deployment, voter management, chair controls, proposal flow, seconding, amendments, voting, division calls, reconsideration, finalization — all verified end-to-end.

### Full Flow Working

Propose → Second → Amend → Open Voting → Cast Vote (ZK proof, browser-generated) → Finalize

### What's Different About This

| Traditional DAO Voting | Our System |
|---|---|
| Off-chain, manual | On-chain, automated |
| Identity exposed | Privacy preserved (ZK) |
| No parliamentary rules | Full Rob's Rules enforced |
| Trust the team | Trust the code |

---

## What's Next (1 min)

- **Mainnet deploy** — move from Sepolia to Ethereum mainnet with real treasury at stake
- **Credential integration** — replace the chair-managed allowlist with ENS domain verification
- **Actual FTW DAO governance** — this is ready to run real proposals with real stakes

---

## Live Demo Script (walk through on Saturday)

1. **Connect wallet** → shows eligibility status
2. **Create proposal** → motion appears in "Created" state
3. **Second proposal** → moves to "Seconded"
4. **Chair opens voting** → 3-day timer starts, vote buttons activate
5. **Cast vote** → ZK proof generates in-browser, tx submits, vote count updates
6. **Finalize** → proposal resolves to Passed or Failed

---

**Contract:** https://sepolia.etherscan.io/address/0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3
**Verifier:** https://sepolia.etherscan.io/address/0x02aa9654f33Aa73880460B4f286A430c4D56CAb6
**Frontend:** https://zk-voting-system-two.vercel.app/
