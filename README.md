<!-- START — ZK Voting System README -->
<a id="readme-top"></a>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Build][build-shield]][build-url]
[![Sepolia][network-shield]][network-url]

</div>

<div align="center">
  <a href="https://github.com/tylerdotai/zk-voting-system">
    <img src="logo.png" alt="ZK Voting System" width="80" height="80">
  </a>

  <h3>ZK Voting System</h3>

  <p>
    ENS-gated Rob's Rules parliamentary voting on Ethereum Sepolia — fully onchain, publicly verifiable.
    <br />
    <a href="https://zk-voting-system-hbphydl46-tylerdotais-projects.vercel.app/">View Live</a>
    ·
    <a href="https://sepolia.etherscan.io/address/0x198041e195b9e8c34B5371edF67Ec84DFa68bb74">Contract</a>
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
    <li><a href="#live-contracts">Live Contracts</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#demo-script">Demo Script</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About The Project

ZK Voting System implements full **Robert's Rules of Order** parliamentary procedure on Ethereum Sepolia. Built for the Fort Worth DAO, every vote is immutable, publicly verifiable, andcensorship-resistant — no third-party polling services, no intermediaries.

**Stack:** Solidity · Hardhat · Ethers.js v5 · Vanilla HTML/CSS/JS · PWA · SSE real-time updates

### Problem Solved

- DAOs need structured, parliamentary governance — not simple yes/no polls
- Off-chain voting is opaque and manipulable; onchain voting exposes all positions
- No reliable, self-contained governance system existed for small-to-medium DAOs
- This project delivers real parliamentary procedure (proposals → seconded → amendments → voting → passed/failed) entirely onchain

---

## Live Contracts (Sepolia)

| Contract | Address | Explorer |
|----------|---------|----------|
| `ZKVotingRobRulesWithCredentials` | [`0x198041e195b9e8c34B5371edF67Ec84DFa68bb74`](https://sepolia.etherscan.io/address/0x198041e195b9e8c34B5371edF67Ec84DFa68bb74) | [Etherscan](https://sepolia.etherscan.io/address/0x198041e195b9e8c34B5371edF67Ec84DFa68bb74) |

**Chair address** (`0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0`) holds admin rights on the live contract. Connect MetaMask to Sepolia to interact.

---

## Features

### Rob's Rules Parliamentary Flow

| Stage | Action | Access |
|-------|--------|--------|
| Create | `createProposal(description)` | Any eligible voter |
| Second | `secondProposal(proposalId)` | Any eligible voter (not proposer) |
| Amend | `submitAmendment(proposalId, text)` | Any eligible voter |
| Approve | `approveAmendment(proposalId, id)` | Chair only |
| Open Voting | `openVoting(proposalId, duration)` | Chair only |
| Call for Division | `callForDivision(proposalId)` | Any voter (recorded count) |
| Vote | `voteOnMotion(proposalId, choice)` | Any eligible voter |
| Request Reconsideration | `reconsider(proposalId)` | Voter who cast a vote |
| Reopen Voting | `reopenVoting(proposalId)` | Chair only |
| Finalize | `finalizeProposal(proposalId)` | Anyone |

### Voter Registration Modal

New voters go through an in-app registration modal — no ENS resolver, no third-party credential required. Click "Register to Vote", sign the transaction, and the chair adds your address to the allowlist. Full voting UI unlocks immediately after confirmation.

### Real-Time SSE Updates

A Node.js SSE server polls the Sepolia contract via `eth_getLogs` every 3 seconds and pushes live events (`MotionVoted`, `ProposalCreated`, `ProposalFinalized`, `VoterAdded`, `VotingReopened`, `AmendmentApproved`) to all connected browser clients. Both the Chair Dashboard and Voter Portal update in real time without page refresh.

### PWA — Offline Capable

- Service worker (`sw.js`) caches all static assets
- Installable on mobile and desktop
- Blockchain syncs automatically when back online

### Civic UI Redesign

Amber/charcoal theme — professional, civic aesthetic. JetBrains Mono + IBM Plex Mono typography. Designed for public-sector presentation contexts.

---

## Architecture

```
Wallet connects → isEligible(address) check
       ↓
If eligible → full Rob's Rules parliamentary flow
If not eligible → Registration Modal → Chair adds to allowlist
       ↓
Contract state changes → SSE broadcast → All connected clients update live
```

**Smart contract:** `ZKVotingRobRulesWithCredentials` (Ownable) — owner can add/remove voters and update chair
**ZK architecture preserved** — `nullifierHash` in `voteOnMotion` is a placeholder for future ZK vote privacy (post-quantum ready)

---

## Project Structure

```
zk-voting-system/
├── contracts/
│   └── ZKVotingRobRulesWithCredentials.sol   # Main voting contract
├── frontend/
│   ├── index.html          # Voter portal + registration modal + SSE
│   ├── rob-rules.html      # Chair dashboard + SSE
│   ├── verify.html         # Standalone voter status checker
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker (offline caching)
│   └── logo.png            # Project logo
├── scripts/
│   └── deploy-with-credentials.js  # Hardhat deploy script
├── test/
│   └── ZKVotingRobRulesWithCredentials.test.js   # 65 passing tests
├── sse-server.js           # Node.js SSE server (polls Alchemy, broadcasts events)
├── contracts.json          # Deployed contract addresses
├── vercel.json             # Vercel deployment config (frontend + CSP headers)
├── hardhat.config.js
├── docs/
│   ├── demo-runbook.md     # 15-minute live demo script
│   └── test-accounts.md    # MetaMask multi-account setup
├── SPEC.md
├── WHITEPAPER.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MetaMask** browser extension
- **Sepolia ETH** — get free ETH at [alchemy.com/faucet](https://www.alchemy.com/faucet/ethereum/sepolia)
- **Alchemy API key** (for SSE server) — free tier at [alchemy.com](https://www.alchemy.com)

### Installation

```bash
# Clone
git clone https://github.com/tylerdotai/zk-voting-system.git
cd zk-voting-system

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
# → 65 passing tests covering full Rob's Rules parliamentary flow
```

### Run Frontend Locally

```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080/rob-rules.html (Chair Dashboard)
# or http://localhost:8080/index.html (Voter Portal)
```

### Run SSE Server Locally

```bash
export ALCHEMY_API_KEY="your_alchemy_key"
export PORT=3004
node sse-server.js
# SSE available at http://localhost:3004/events
```

---

## Usage

### Live Demo (Vercel)

**Voter Portal:** [https://zk-voting-system-hbphydl46-tylerdotais-projects.vercel.app/](https://zk-voting-system-hbphydl46-tylerdotais-projects.vercel.app/)  
**Chair Dashboard:** [https://zk-voting-system-hbphydl46-tylerdotais-projects.vercel.app/rob-rules.html](https://zk-voting-system-hbphydl46-tylerdotais-projects.vercel.app/rob-rules.html)

1. **Connect wallet** — click Connect, approve MetaMask on Sepolia
2. **Check eligibility** — if not registered, the voter registration modal appears automatically
3. **Register** — sign the transaction; chair approves; full voting UI unlocks
4. **Create or view proposals** — voter portal shows all active proposals
5. **Vote** — cast Yes/No/Abstain; see results update in real time via SSE

### Chair Workflow (rob-rules.html)

1. Connect wallet → dashboard shows current proposals
2. Add voters → enter address, click Add Voter
3. Create proposal → enter description, click Create
4. Open voting → select proposal, set duration, click Open Voting
5. Monitor → real-time SSE shows all votes as they arrive
6. Finalize → after voting ends, anyone can finalize

---

## Deployment

### Deploy Contract to Sepolia

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export PRIVATE_KEY="your_deployer_private_key"
npx hardhat run scripts/deploy-with-credentials.js --network sepolia
```

### Deploy Frontend to Vercel

```bash
npx vercel --prod
```

Vercel config (`vercel.json`) serves `frontend/` as static output with security headers (CSP, X-Frame-Options).

---

## Demo Script

`docs/demo-runbook.md` has a complete 15-minute demo script for a DAO meeting:

1. Show contract on Etherscan (2 min)
2. Chair creates proposal → Member seconds (3 min)
3. Member submits amendment → Chair approves (3 min)
4. Chair opens voting → Members vote → Call for Division (4 min)
5. Reconsideration + Reopen → Finalize + Onchain proof (3 min)

---

## Roadmap

- [x] Rob's Rules parliamentary flow (proposals, amendments, voting, finalization)
- [x] Chair-managed voter allowlist (no third-party dependency)
- [x] Voter registration modal
- [x] Real-time SSE event broadcasting
- [x] PWA with offline service worker
- [x] Civic UI redesign (amber/charcoal theme)
- [ ] ENS domain resolution for voter eligibility
- [ ] ZK vote privacy layer (nullifierHash implementation)
- [ ] Post-quantum signature scheme (ML-DSA lattice-based)
- [ ] Mainnet deployment

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Contact

- **Tyler Delano** — [@tylerdotai](https://x.com/tylerdotai) · [tyler.delano@icloud.com](mailto:tyler.delano@icloud.com)
- **Project Link:** [https://github.com/tylerdotai/zk-voting-system](https://github.com/tylerdotai/zk-voting-system)

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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
[build-shield]: https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge
[build-url]: https://github.com/tylerdotai/zk-voting-system/actions
[network-shield]: https://img.shields.io/badge/network-Sepolia-3C3C3D?logo=ethereum
[network-url]: https://sepolia.etherscan.io
