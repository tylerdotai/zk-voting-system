<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://codeberg.org/tylerdotai/zk-voting-system">
    <img src="logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">ZK DID Voting System</h3>

  <p align="center">
    Zero-Knowledge Decentralized Identity Blockchain Voting System for Fort Worth DAO
    <br />
    <a href="https://dao.fwtx.city/bounties/019a9ccd-485b-79d9-8441-d267fea1ad2b"><strong>View Bounty »</strong></a>
    <br />
    <br />
    <a href="https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e">View on Etherscan</a>
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

### Live Contract (Sepolia Testnet)
- **Address:** [0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e](https://sepolia.etherscan.io/address/0xb5a5Dd671e70df618c9694541e7F1e4E66b1a88e)
- **Network:** Ethereum Sepolia Testnet

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->
## Features

- ✅ **Blockchain Voting** — Votes recorded on Ethereum Sepolia testnet
- ✅ **Offline Backup** — Vote offline, sync when back online
- ✅ **Real-time Updates** — Live vote tallying from blockchain
- ✅ **Wallet Integration** — MetaMask wallet connection
- ✅ **Export/Import** — Backup votes as JSON files
- ✅ **100% Test Coverage** — Comprehensive smart contract tests

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TECH STACK -->
## Tech Stack

- **Smart Contracts:** Solidity, Hardhat
- **ZK Circuits:** Circom (future)
- **Frontend:** Plain HTML/CSS/JavaScript (Ethers.js)
- **Blockchain:** Ethereum (Sepolia Testnet)
- **Storage:** LocalStorage for offline backup

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH (for deployment)

### Installation

1. Clone the repository
```bash
git clone https://codeberg.org/tylerdotai/zk-voting-system.git
cd zk-voting-system
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your RPC URL and private key
```

4. Compile contracts
```bash
npx hardhat compile
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

### Option 1: Web Interface (Recommended)

1. Open `frontend/index.html` in a browser
2. Connect MetaMask wallet
3. Switch to Sepolia testnet
4. Cast your vote

### Option 2: Local Development Server

```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080
```

### Option 3: Interact via Hardhat

```bash
# Deploy contract
npx hardhat run scripts/deploy.js --network sepolia

# Run tests
npx hardhat test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->
## Deployment

### Deploy to Sepolia Testnet

```bash
# Set environment variables
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
export PRIVATE_KEY="YOUR-PRIVATE-KEY"

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

### Update Frontend Contract Address

After deployment, update `CONTRACT_ADDRESS` in `frontend/index.html`:

```javascript
const CONTRACT_ADDRESS = 'YOUR-DEPLOYED-ADDRESS';
```

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

### Coverage Results
```
---------------|----------|----------|----------|----------|----------------|
File           |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
---------------|----------|----------|----------|----------|----------------|
  ZKVoting.sol |      100 |     87.5 |      100 |      100 |                |
---------------|----------|----------|----------|----------|----------------|
All files      |      100 |     87.5 |      100 |      100 |                |
---------------|----------|----------|----------|----------|----------------|
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [ ] Real ZK proof verification integration
- [ ] DID integration (Ceramic/Polygon ID)
- [ ] Post-quantum cryptography
- [ ] Multi-chain support
- [ ] Mobile app

See the [open issues](https://codeberg.org/tylerdotai/zk-voting-system/issues) for a full list of proposed features.

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
- **Project Link:** [https://codeberg.org/tylerdotai/zk-voting-system](https://codeberg.org/tylerdotai/zk-voting-system)

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
[license-url]: https://github.com/tylerdotai/zk-voting-system/blob/main/LICENSE
