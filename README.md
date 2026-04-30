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
    Chair-managed allowlist Rob's Rules parliamentary voting on Ethereum Sepolia — fully onchain, publicly verifiable.
    <br />
    <a href="https://zk-voting-system-two.vercel.app">View Live</a>
    ·
    <a href="https://sepolia.etherscan.io/address/0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3">Governance Contract</a>
    ·
    <a href="https://sepolia.etherscan.io/address/0x02aa9654f33Aa73880460B4f286A430c4D56CAb6">Verifier</a>
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
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About The Project

ZK Voting System implements full **Robert's Rules of Order** parliamentary procedure on Ethereum Sepolia. Built for the Fort Worth DAO, every vote is immutable, publicly verifiable, and censorship-resistant — no third-party polling services, no intermediaries.

**Stack:** Solidity · Hardhat · Next.js 16 · snarkjs · circomlibjs · Vercel

### Problem Solved

- DAOs need structured, parliamentary governance — not simple yes/no polls
- Off-chain voting is opaque and manipulable; onchain voting exposes all positions
- No reliable, self-contained governance system existed for small-to-medium DAOs
- This project delivers real parliamentary procedure (proposals → seconded → amendments → voting → passed/failed) entirely onchain

---

## Live Contracts (Sepolia)

| Contract | Address | Explorer |
|----------|---------|----------|
| `Groth16VerifierV2` | [`0x02aa9654f33Aa73880460B4f286A430c4D56CAb6`](https://sepolia.etherscan.io/address/0x02aa9654f33Aa73880460B4f286A430c4D56CAb6) | [Etherscan](https://sepolia.etherscan.io/address/0x02aa9654f33Aa73880460B4f286A430c4D56CAb6) |
| `ZKVotingRobRulesWithCredentials` | [`0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3`](https://sepolia.etherscan.io/address/0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3) | [Etherscan](https://sepolia.etherscan.io/address/0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3) |

**Chair address** (`0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0`) holds admin rights. Connect MetaMask to Sepolia to interact as chair or voter.

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

### Voter Registration

New voters register via the in-app modal — no ENS resolver, no third-party credential required. Click "Register to Vote", sign the transaction, and the chair adds your address to the allowlist. Full voting UI unlocks immediately after confirmation.

### Civic UI

Light civic theme — professional, readable on projection. Fort Worth DAO brand alignment. Designed for 60-person public demo contexts. Deployed as a Next.js static PWA.

---

## Architecture

```
Wallet connects → isEligible(address) check via contract
       ↓
If eligible → browser generates Groth16 proof from vote.wasm + vote_0001.zkey (client-side WASM)
       ↓
Frontend submits vote + proof + public signals
       ↓
Groth16Verifier verifies proof onchain
       ↓
Contract state changes → all connected clients update (polling)
```

**Smart contracts:**
- `ZKVotingRobRulesWithCredentials` — live governance contract (Rob's Rules flow)
- `Groth16VerifierV2` — snarkjs-generated BN128 Groth16 verifier

**ZK stack:**
- Circuit: `circuits/vote/vote.circom`
- Setup: `snarkjs` Groth16 with Powers of Tau (`build/ptau/`, `build/keys/`)
- Browser prover: snarkjs + circomlibjs (npm packages, WASM runs client-side)
- WASM + proving key: served from `frontend-app/public/`
- Hashing: Poseidon via `circomlibjs`

---

## Project Structure

```
zk-voting-system/
├── circuits/
│   └── vote/
│       └── vote.circom     # Groth16 vote circuit
├── contracts/
│   ├── ZKVotingRobRulesWithCredentials.sol   # Live governance contract
│   ├── ZKVotingSimple.sol                    # Simple voting variant
│   ├── verifiers/                            # snarkjs-generated verifier contracts
│   └── test/MockVerifier.sol                 # Dev mock verifier
├── frontend-app/
│   ├── pages/
│   │   ├── index.tsx      # Voter portal
│   │   ├── chair.tsx      # Chair dashboard
│   │   └── verify.tsx     # Standalone proof verifier
│   ├── public/
│   │   ├── vote.wasm      # Browser witness generator
│   │   ├── vote_0001.zkey # Proving key
│   │   └── verification_key.json
│   └── styles/globals.css # Civic design system
├── build/
│   ├── ptau/             # Powers of Tau ceremony artifacts
│   └── keys/             # zkey + verification key
├── scripts/
│   └── build_circuit.sh  # Rebuild circuit, ptau, zkey
├── test/
│   ├── ZKVotingSimple.test.js
│   └── ZKVotingRobRulesWithCredentials.test.js
├── vercel.json           # Vercel deployment config
├── hardhat.config.js
├── SPEC.md
├── ROADMAP.md
├── WHITEPAPER.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MetaMask** browser extension
- **Sepolia ETH** — get free ETH at [alchemy.com/faucet](https://www.alchemy.com/faucet/ethereum/sepolia)

### Installation

```bash
git clone https://github.com/tylerdotai/zk-voting-system.git
cd zk-voting-system
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npm test
```

### Run Frontend Locally

```bash
cd frontend-app
npm install
npm run build
npx vercel dev
# Or serve the static export:
npx serve out -p 3000
```

---

## Usage

### Voter Portal

1. **Connect wallet** — click Connect, approve MetaMask on Sepolia
2. **Check eligibility** — if not registered, voter registration modal appears
3. **Register** — sign the transaction; chair approves; full voting UI unlocks
4. **Create or view proposals** — voter portal shows all active proposals
5. **Vote** — cast Yes/No/Abstain; browser generates Groth16 proof client-side via WASM
6. **Confirm on-chain** — MetaMask tx submitted with ZK proof; tally updates after confirmation

### Chair Dashboard (`/chair`)

1. Connect wallet → dashboard shows current proposals
2. Add voters → enter address, click Add Voter
3. Create proposal → enter description, click Create
4. Open voting → select proposal, set duration, click Open Voting
5. Monitor votes → real-time polling shows all votes as they arrive
6. Finalize → after voting ends, anyone can finalize

---

## Deployment

### Deploy Contract to Sepolia

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export PRIVATE_KEY="your_deployer_private_key"
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy Frontend to Vercel

```bash
npx vercel --prod frontend-app
```

Vercel config (`vercel.json`) builds `frontend-app/` with Next.js static export.

---

## Roadmap

- [x] Rob's Rules parliamentary flow (proposals, amendments, voting, finalization)
- [x] Chair-managed voter allowlist (no third-party dependency)
- [x] Voter registration modal
- [x] Next.js PWA frontend deployed to Vercel
- [x] Groth16 vote proof generation (client-side WASM) and verifier deployment
- [x] Full end-to-end proof submission test on deployed governance contract
- [ ] Full end-to-end test with 3 distinct voters (chair + 2 members)
- [ ] Public demo rehearsal before May 1st

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
