# ZK DID Voting System - HackFW Proposal

## Project Overview

**Project Name:** ZK DID Voting System
**Organization:** Fort Worth DAO / Hacker Fund
**Bounty:** Zero Knowledge DID Blockchain Voting System ($2,500)
**Author:** Tyler Delano — [@tylerdotai](https://x.com/tylerdotai)
**Repository:** https://github.com/tylerdotai/zk-voting-system

---

## Problem Statement

Combat voter fraud with atomic, post-quantum cryptography voter registration, voting, and ballot examples. Use and extend all existing identity primitives used by local, state, federal voting operations.

---

## Solution

A fully functional blockchain voting system with the following capabilities:

### Core Features Implemented

### Live Contracts (Sepolia)

| Contract | Address |
|---|---|
| **Groth16VerifierV2** (verifier) | [`0x198041e195b9e8C34B5371edF67Ec84DFa68bb74`](https://sepolia.etherscan.io/address/0x198041e195b9e8C34B5371edF67Ec84DFa68bb74) |
| **ZKVotingSimple** (demo voting) | [`0xdA9B09bA4B059A84F98Ce27dF45de09F434A4F12`](https://sepolia.etherscan.io/address/0xdA9B09bA4B059A84F98Ce27dF45de09F434A4F12) |

### Technical Implementation

- **Smart Contract:** Solidity with OpenZeppelin
- **ZK Credential Verification** — Groth16 proof-verified voter eligibility (no third-party dependency)
- **Offline Capable** — PWA with service worker, blockchain sync when online

---

## Demo Video

[Link to demo video - to be added]

---

## Technical Specifications

### Contract Functions
- `vote(uint256 _choice, bytes32 _nullifierHash, bytes32[8] calldata _proof)` - Cast a vote
- `getVoteCount(uint256 _choice)` - Get vote count for a choice
- `getTotalVotes()` - Get total votes cast

### Testing Results
```
---------------|----------|----------|----------|----------|----------------|
File           |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
---------------|----------|----------|----------|----------|----------------|
  ZKVoting.sol |      100 |     87.5 |      100 |      100 |                |
---------------|----------|----------|----------|----------|----------------|
```

---

## Use Case

**Warp speed ballots and referendums for policy and efficient democratic process**

Our implementation enables:
- Instant ballot creation and deployment
- Real-time vote tallying
- No paper-based voting
- Accessible from any device with a wallet

---

## Future Enhancements

- DID integration (Ceramic/ENS)
- Post-quantum cryptography (ML-DSA)
- Multi-chain support
- Mobile application

---

## Submission

### Submission

- **Repository:** https://github.com/tylerdotai/zk-voting-system
- **Live Contract:** https://sepolia.etherscan.io/address/0xdA9B09bA4B059A84F98Ce27dF45de09F434A4F12
- **Demo Video:** [Link to be added]

---

## How to Run

1. Open `frontend/index.html` in browser
2. Connect MetaMask (switch to Sepolia)
3. Cast vote
4. View results in real-time

For offline mode:
1. Disconnect internet
2. Vote (saves locally)
3. Export backup
4. When online, import and sync
