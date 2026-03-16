# ZK DID Voting System

Zero-Knowledge Decentralized Identity voting system for Fort Worth DAO.

## Overview

A secure, privacy-preserving voting system that uses:
- **DID (Decentralized Identity)** — Self-sovereign identity for voters
- **Zero-Knowledge Proofs** — Proved eligibility without revealing identity
- **Blockchain** — Immutable vote recording

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Voter     │────▶│  ZK Proof   │────▶│  Smart      │
│  (DID)      │     │  Generator  │     │  Contract   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Identity   │     │  Vote       │
                    │  Registry   │     │  Tally       │
                    └─────────────┘     └─────────────┘
```

## Tech Stack

- **Smart Contracts**: Solidity (Hardhat)
- **ZK Circuits**: Circom
- **DID**: Ceramic Network / Polygon ID
- **Frontend**: React / Next.js
- **Backend**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+
- Hardhat
- Circom 2.0+

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

## Project Structure

```
contracts/          # Solidity smart contracts
circuits/           # ZK-SNARK circuits
scripts/            # Deployment scripts
test/               # Contract tests
frontend/           # React frontend
```

## License

MIT
