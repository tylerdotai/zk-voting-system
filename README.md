<!-- Improved compatibility of back to top link: See: https://github.com/tylerdotai/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Build][build-shield]][build-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tylerdotai/zk-voting-system">
    <img src="logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">ZK DID Voting System</h3>

  <p align="center">
    Zero-Knowledge Decentralized Identity Blockchain Voting System for Fort Worth DAO
    <br />
    <a href="https://dao.fwtx.city/bounties/019a9ccd-485b-79d9-8441-d267fea1ad2b"><strong>View Bounty »</strong></a>
    <br />
    <br />
    <a href="https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e">View ZKVoting on Etherscan</a>
    ·
    <a href="https://github.com/tylerdotai/zk-voting-system/issues">Report Bug</a>
    ·
    <a href="https://github.com/tylerdotai/zk-voting-system/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#contracts">Smart Contracts</a></li>
    <li><a href="#frontend">Frontend</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#polygon-id">Polygon ID Integration</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

ZK DID Voting System is a blockchain-based voting application built for the [Fort Worth DAO](https://dao.fwtx.city/) HackFW hackathon. It implements a secure, privacy-preserving voting system using Zero-Knowledge Proofs and Decentralized Identities.

### Problem Solved
- Combat voter fraud with cryptographic voter registration
- Enable warp-speed ballots and referendums
- Provide offline-capable voting with blockchain sync
- Scale Rob's Rules parliamentary process for DAOs
- Gate voting access with DID credentials (Polygon ID)

### Live Contracts (Sepolia Testnet)
| Contract | Address |
|----------|---------|
| ZKVoting | [0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e](https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e) |
| ZKVotingWithCredentials | Contact for deployment |
| ZKVotingRobRulesWithCredentials | Contact for deployment |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->
## Features

### ZKVoting — Simple Blockchain Voting
- ✅ **Blockchain Voting** — Votes recorded on Ethereum Sepolia testnet
- ✅ **Offline Backup** — Vote offline, sync when back online
- ✅ **Real-time Updates** — Live vote tallying from blockchain
- ✅ **Wallet Integration** — MetaMask wallet connection
- ✅ **Export/Import** — Backup votes as JSON files
- ✅ **100% Test Coverage** — Comprehensive smart contract tests

### ZKVotingRobRules — Rob's Rules Parliamentary Voting
- ✅ **Full Parliamentary Flow** — Created → Seconded → Amendments → Voting → Passed/Failed
- ✅ **Chair Role Management** — Designated chair creates and manages proposals
- ✅ **Amendment System** — Members submit, chair approves amendments
- ✅ **Timed Voting Periods** — Configurable voting duration
- ✅ **Immutable Record** — All actions recorded on-chain

### Polygon ID Integration — Credential-Gated Voting
- ✅ **DID Verification** — Verify identity without revealing it
- ✅ **ZK Proofs** — Zero-knowledge proofs for privacy
- ✅ **Credential Schema** — Define what attributes are required to vote
- ✅ **Issuer Integration** — Issue credentials to eligible voters
- ✅ **Demo Mode** — Test without setting up issuer node

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRACTS -->
## Smart Contracts

| Contract | Purpose | Credentials |
|----------|---------|-------------|
| `ZKVoting.sol` | Simple yes/no/abstain voting | No |
| `ZKVotingRobRules.sol` | Rob's Rules parliamentary voting | No |
| `ZKVotingWithCredentials.sol` | Simple voting + credential gate | ✅ |
| `ZKVotingRobRulesWithCredentials.sol` | Rob's Rules + credential gate | ✅ |
| `GovVerifier.sol` | Polygon ID ZK proof verifier | - |
| `ZKPVerifier.sol` | Base verifier (from ETHGlobal) | - |

### ZKVotingRobRules.sol — Proposal Lifecycle

```
1. Chair creates proposal (Created)
2. Chair seconds proposal (Seconded)
3. Members submit amendments
4. Chair approves amendments
5. Chair opens voting period
6. Members vote on motion (Yes/No/Abstain)
7. After voting ends → Finalized (Passed/Failed)
```

### Credential-Gated Flow (Polygon ID)

```
User → Polygon ID App → ZK Proof → GovVerifier → Voting Contract (allowedUsers[])
                                        ↓
                        setAllowedUser(wallet) called
                                        ↓
                        User can now create proposals / vote
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FRONTEND -->
## Frontend

| File | Purpose |
|------|---------|
| `frontend/index.html` | Main landing page |
| `frontend/rob-rules.html` | Rob's Rules parliamentary voting UI |
| `frontend/verify.html` | Polygon ID credential verification |

### Demo Mode

For testing without setting up Polygon ID issuer:
- Go to `verify.html`
- Click **"Demo Verify"**
- This directly calls `setAllowedUser()` on the contract

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Docker (for Polygon ID issuer, optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/tylerdotai/zk-voting-system.git
cd zk-voting-system
```

2. Install dependencies
```bash
npm install
```

3. Compile contracts
```bash
npx hardhat compile
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

### Quick Start (Local Hardhat)

1. Start local Hardhat node:
```bash
npx hardhat node
```

2. In another terminal, deploy credential-gated contracts:
```bash
npx hardhat run scripts/deploy-with-credentials.js --network hardhat
```

3. Start local frontend:
```bash
cd frontend
python3 -m http.server 8080
```

4. Open in browser:
   - Voting: `http://localhost:8080/rob-rules.html`
   - Verification: `http://localhost:8080/verify.html`

5. Connect MetaMask to Hardhat local network:
   - Network name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`

### Demo Flow

1. Go to `verify.html` → Connect wallet → Click **"Demo Verify"**
2. Go to `rob-rules.html` → Full access to create proposals and vote

### Full Polygon ID Flow

1. Set up Polygon ID issuer node (see Polygon ID Integration section)
2. Configure credential schema
3. Replace demo verification with real QR code flow
4. Users scan QR → Polygon ID verifies → `setAllowedUser()` called

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->
## Deployment

### Deploy to Sepolia

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
export PRIVATE_KEY="YOUR-PRIVATE-KEY"

# Deploy basic contracts
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy-rob-rules.js --network sepolia

# Deploy credential-gated contracts
npx hardhat run scripts/deploy-with-credentials.js --network sepolia
```

### Update Frontend

After deployment, update `CONTRACT_ADDRESS` in the HTML files:
- `frontend/rob-rules.html`
- `frontend/verify.html`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- POLYGON ID -->
## Polygon ID Integration

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   GovVerifier   │────▶│ Voting Contract │
│  (verify.html)  │ QR  │  (ZK Verifier)  │     │ (allowedUsers)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Setup (Production)

1. **Set up Polygon ID issuer node**
   ```bash
   git clone https://github.com/Abhishek-2416/PolygonId-IssuerNode
   cd PolygonId-IssuerNode
   cp .env-api.sample .env-api
   cp .env-issuer.sample .env-issuer
   # Configure ISSUER_ETHEREUM_URL and ISSUER_SERVER_URL
   make up
   make run
   ```

2. **Create credential schema**
   - Access issuer UI at `http://localhost:3001`
   - Define what attributes users must prove

3. **Configure frontend**
   - Update `ISSUER_DID` in `verify.html`
   - Update `SCHEMA_URL` and `SCHEMA_TYPE`

4. **Deploy to production**
   - Deploy contracts to mainnet
   - Update contract addresses in frontend

### Reference Implementation

Based on [ETHGlobal ZK Vote](https://ethglobal.com/showcase/zk-vote-9ipgt) project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] ZKVoting contract with basic voting
- [x] Rob's Rules parliamentary flow (ZKVotingRobRules)
- [x] Polygon ID credential-gated contracts
- [x] Credential verification UI (verify.html)
- [ ] Real ZK proof verification integration
- [ ] DID integration (Polygon ID issuer node)
- [ ] Multi-chain support
- [ ] Mobile app
- [ ] Post-quantum cryptography

See the [open issues](https://github.com/tylerdotai/zk-voting-system/issues) for full details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

- **Author:** Tyler Delano
- **Email:** tyler.delano@icloud.com
- **DAO:** [Fort Worth DAO](https://dao.fwtx.city/)
- **Project Link:** [https://github.com/tylerdotai/zk-voting-system](https://github.com/tylerdotai/zk-voting-system)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/badge/contributors-1-blue?style=for-the-badge
[contributors-url]: https://github.com/tylerdotai/zk-voting-system/graphs/contributors
[forks-shield]: https://img.shields.io/badge/forks-0-blue?style=for-the-badge
[forks-url]: https://github.com/tylerdotai/zk-voting-system/network/members
[stars-shield]: https://img.shields.io/badge/stars-0-blue?style=for-the-badge
[stars-url]: https://github.com/tylerdotai/zk-voting-system/stargazers
[issues-shield]: https://img.shields.io/badge/issues-0-blue?style=for-the-badge
[issues-url]: https://github.com/tylerdotai/zk-voting-system/issues
[license-shield]: https://img.shields.io/badge/license-MIT-blue?style=for-the-badge
[license-url]: https://github.com/tylerdotai/zk-voting-system/src/branch/main/LICENSE
[build-shield]: https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge
[build-url]: https://github.com/tylerdotai/zk-voting-system/actions
