# ZK Voting System

Prototype blockchain voting demo built for the Fort Worth DAO HackFW bounty. It combines a Solidity voting contract, a browser-based ballot UI, and offline vote backup flows.

## Project Status

Hackathon prototype. The repo demonstrates the product direction well, but the current contract is still a simplified voting implementation rather than a complete zero-knowledge DID system.

## Live Reference

- Bounty: https://dao.fwtx.city/bounties/019a9ccd-485b-79d9-8441-d267fea1ad2b
- Sepolia contract: https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e

## What Is Included

- `contracts/ZKVoting.sol` - Solidity voting contract with choice counts, vote tallying, and owner-managed Merkle root fields
- `frontend/index.html` - static voting interface with MetaMask connect, live tally display, and offline export/import flows
- `test/voting.js` - Hardhat test suite covering deployment, voting paths, and owner-only root updates
- `scripts/deploy.js` - Hardhat deployment script that writes the deployed address into `.env`
- `PROPOSAL.md` - original hackathon proposal and submission context

## Current Capabilities

- Deploy a voting contract with a configurable number of choices
- Cast votes on-chain from the browser via MetaMask
- View live totals from the deployed Sepolia contract
- Store pending votes locally and export/import them as JSON backups
- Run a reasonably complete local test suite for the contract

## Important Limitations

- The contract accepts a `_proof` parameter but does not verify zero-knowledge proofs yet
- DID identity verification is not implemented
- Double-vote prevention is not enforced on-chain today
- Merkle root fields are present, but they are not used during vote validation
- The frontend is a single static HTML file, not a production web app

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart contract | Solidity, OpenZeppelin |
| Dev tooling | Hardhat, hardhat-toolbox, solidity-coverage |
| Frontend | HTML, CSS, JavaScript, Ethers.js |
| Wallet | MetaMask |
| Network | Ethereum Sepolia |
| Local backup | Browser `localStorage` + JSON export/import |

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask
- Sepolia RPC URL and testnet wallet if you want to deploy

### Install

```bash
npm install
```

### Run tests

```bash
npx hardhat test
```

### Start the frontend

You can open `frontend/index.html` directly, or serve it locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/frontend/`.

### Deploy

```bash
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY" \
PRIVATE_KEY="YOUR_PRIVATE_KEY" \
npx hardhat run scripts/deploy.js --network sepolia
```

## Reality Check

If you are evaluating this repo as a zero-knowledge voting system, treat it as an early proof of concept. The interesting product ideas are here - offline ballot backup, wallet-based voting, and future-facing ZK/DID hooks - but the cryptographic enforcement layer is still unfinished.

## License

`package.json` declares MIT, but this repository does not currently include a `LICENSE` file.
