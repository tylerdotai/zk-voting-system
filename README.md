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
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#contracts">Smart Contracts</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#testing">Testing</a></li>
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

### Live Contracts (Sepolia Testnet)
| Contract | Address |
|----------|---------|
| ZKVoting | [0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e](https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e) |
| ZKVotingRobRules | Contact for deployment |

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

<p align="right">(<a href="#readme-top">back to top)</p>

<!-- TECH STACK -->
## Tech Stack

- **Smart Contracts:** Solidity 0.8.19, Hardhat, OpenZeppelin
- **ZK Circuits:** Circom (future)
- **Frontend:** Plain HTML/CSS/JavaScript (Ethers.js v5)
- **Blockchain:** Ethereum (Sepolia Testnet), Local Hardhat
- **Storage:** LocalStorage for offline backup

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRACTS -->
## Smart Contracts

### ZKVoting.sol
Simple yes/no/abstain voting with offline backup support.

### ZKVotingRobRules.sol
Full Rob's Rules of Order parliamentary process on-chain:

```
Proposal Lifecycle:
1. Chair creates proposal (Created)
2. Chair seconds proposal (Seconded)
3. Members submit amendments
4. Chair approves amendments
5. Chair opens voting period
6. Members vote on motion (Yes/No/Abstain)
7. After voting ends → Finalized (Passed/Failed)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension

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

### ZKVoting — Simple Voting

1. Start local frontend:
```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080
```

2. Connect MetaMask and switch to Sepolia testnet

3. Cast your vote

### ZKVotingRobRules — Rob's Rules Parliamentary Voting

1. Start local Hardhat node:
```bash
npx hardhat node
```

2. Deploy RobRules contract (in another terminal):
```bash
npx hardhat run scripts/deploy-rob-rules.js --network hardhat
```

3. Start local frontend:
```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080/rob-rules.html
```

4. Connect MetaMask to Hardhat local network:
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`

5. As Chair, create proposals and manage the parliamentary process

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->
## Deployment

### Deploy ZKVoting to Sepolia

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
export PRIVATE_KEY="YOUR-PRIVATE-KEY"

npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy ZKVotingRobRules to Sepolia

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
export PRIVATE_KEY="YOUR-PRIVATE-KEY"

npx hardhat run scripts/deploy-rob-rules.js --network sepolia
```

### Update Frontend Contract Address

After deployment, update the `CONTRACT_ADDRESS` in the frontend HTML file.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TESTING -->
## Testing

### Run Unit Tests
```bash
npx hardhat test
```

### Run with Coverage
```bash
npx hardhat coverage
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] ZKVoting contract with basic voting
- [x] Rob's Rules parliamentary flow (ZKVotingRobRules)
- [ ] Real ZK proof verification integration
- [ ] DID integration (Polygon ID)
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
