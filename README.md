# ZK DID Voting System

Zero-Knowledge Decentralized Identity voting system for Fort Worth DAO.

## Overview

A secure, privacy-preserving voting system that uses:
- **DID (Decentralized Identity)** — Self-sovereign identity for voters
- **Zero-Knowledge Proofs** — Proved eligibility without revealing identity (future)
- **Blockchain** — Immutable vote recording

## Demo Features (MVP)

✅ **Voter Registration** — Synthetic identity dataset (3 demo voters)  
✅ **Secure Voting** — Each voter can only vote once  
✅ **Realtime Updates** — SSE-style live vote tallying  
✅ **Offline Backup** — LocalStorage persists votes  
✅ **Blockchain Ready** — Smart contract for production deployment

## Quick Demo

### Option 1: Open in Browser
Simply open `frontend/index.html` in any browser to see the working demo.

### Option 2: Run Local Server
```bash
cd frontend
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Voter     │────▶│  Identity   │────▶│  Smart      │
│  (DID)      │     │  Registry   │     │  Contract   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Frontend  │     │  Vote       │
                    │  (HTML/JS) │     │  Tally      │
                    └─────────────┘     └─────────────┘
```

## Project Structure

```
├── frontend/
│   └── index.html      # Working voting demo
├── contracts/
│   └── ZKVoting.sol    # Smart contract
├── circuits/
│   └── vote.circom     # ZK circuit (future)
├── scripts/
│   └── deploy.js       # Deployment script
├── test/
│   └── voting.js       # Contract tests
├── hardhat.config.js   # Hardhat config
└── README.md
```

## Getting Started (Development)

### Prerequisites

- Node.js 18+
- Hardhat
- Circom 2.0+ (for ZK circuits)

### Install

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Sepolia

```bash
SEPOLIA_RPC_URL=your_rpc PRIVATE_KEY=your_key npx hardhat run scripts/deploy.js
```

## Demo Walkthrough

1. **Select Voter** — Choose from 3 synthetic identities (Alice, Bob, Charlie)
2. **Cast Vote** — Click Yes, No, or Abstain
3. **Watch Live Results** — Vote counts update in real-time
4. **Try Double Voting** — Attempting to vote again shows "Already voted"

## Future Enhancements

- [ ] Real ZK proof verification
- [ ] Actual DID integration (Ceramic/Polygon ID)
- [ ] Post-quantum cryptography
- [ ] Multi-chain support
- [ ] Offline sync protocol

## License

MIT
