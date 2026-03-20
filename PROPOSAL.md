# ZK DID Voting System - HackFW Proposal

## Project Overview

**Project Name:** ZK DID Voting System  
**Organization:** Fort Worth DAO  
**Bounty:** Zero Knowledge DID Blockchain Voting System ($2,500)  
**Repository:** https://github.com/tylerdotai/zk-voting-system

---

## Problem Statement

Combat voter fraud with atomic, post-quantum cryptography voter registration, voting, and ballot examples. Use and extend all existing identity primitives used by local, state, federal voting operations.

---

## Solution

A fully functional blockchain voting system with the following capabilities:

### Core Features Implemented

1. **Blockchain-Based Voting**
   - Smart contract deployed on Ethereum Sepolia testnet
   - Address: `0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e`
   - Immutable vote recording on-chain

2. **Offline Capable**
   - Votes can be cast without internet connection
   - LocalStorage persistence
   - Export/Import backup functionality
   - Sync when back online

3. **Real-Time Updates**
   - Live vote tallying from blockchain
   - Server-Sent Events style updates

4. **Wallet Integration**
   - MetaMask connection
   - Sepolia testnet support

### Technical Implementation

- **Smart Contract:** Solidity with OpenZeppelin
- **Testing:** 22 tests, 100% line coverage, 87.5% branch coverage
- **Frontend:** Vanilla HTML/JS with Ethers.js
- **Deployment:** Hardhat

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

- Real ZK proof verification
- DID integration (Ceramic/Polygon ID)
- Post-quantum cryptography
- Multi-chain support
- Mobile application

---

## Submission

- **Repository:** https://github.com/tylerdotai/zk-voting-system
- **Live Contract:** https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e
- **Demo Video:** [To be added]
- **Author:** Tyler Delano

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
