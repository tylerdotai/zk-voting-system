<!-- START — Standard README for zk-voting-system -->
<a id="readme-top"></a>

<div align="center">

# ZK Voting System

**Onchain Rob's Rules parliamentary voting with ENS-gated voter eligibility.**

Built for the Fort Worth DAO HackFW hackathon. Deployed on Ethereum Sepolia.

[![Build Status][build-shield]][build-url]
[![License: MIT][license-shield]][license-url]
[![Sepolia][network-shield]][network-url]

</div>

---

## Live Demo

**Voter Portal:** [zk-voting.vercel.app](https://zk-voting.vercel.app) — `frontend/index.html`  
**Chair Dashboard:** [zk-voting.vercel.app/rob-rules.html](https://zk-voting.vercel.app/rob-rules.html)

> Connect to Sepolia testnet in MetaMask to interact. The chair address (`0x6A8C...`) holds admin rights on the live contract.

---

## What It Does

ZK Voting System implements full **Robert's Rules of Order** parliamentary procedure onchain:

```
Created → Seconded → Amendments → Voting → Passed / Failed
```

- **Chair** creates and manages proposals, opens voting periods
- **Eligible voters** submit amendments, cast votes (Yes / No / Abstain)
- **Anyone** can finalize when the voting window expires
- All actions are immutable and publicly verifiable on Sepolia

### Architecture

```
Wallet Connect
      ↓
ENS Domain Resolution (future) → Voter Allowlist (present)
      ↓
ZKVotingRobRulesWithCredentials.sol (Sepolia)
      ↓
Onchain state: proposals, amendments, votes, results
```

### Identity Layer

Voter eligibility is managed via an allowlist controlled by the chair. A future ENS integration will let voters prove eligibility via their ENS domain without manual chair approval.

Zero-knowledge vote privacy (zk-SNARKs + ML-DSA post-quantum signatures) is documented in the architecture and reserved for a future layer.

---

## Smart Contracts

| Contract | Network | Address |
|----------|---------|---------|
| `ZKVotingRobRulesWithCredentials.sol` | Sepolia | [`0xb3254AB74e5103F7374eEcDb57078eB10388CaC3`][etherscan] |

**Stack:** Solidity ^0.8.26 · Hardhat · Ethers.js v5 · OpenZeppelin

All contract calls require a Sepolia RPC endpoint. The frontend connects via `window.ethereum` (MetaMask).

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/tylerdotai/zk-voting-system.git
cd zk-voting-system
npm install

# 2. Compile contracts
npx hardhat compile

# 3. Run tests
npx hardhat test
```

### Local Frontend

```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080/rob-rules.html
```

### Connect to Live Contract

1. Install MetaMask
2. Switch to **Sepolia testnet**
3. Fund your address at [sepoliafaucet.com](https://www.sepoliafaucet.com)
4. Request chair to add your address to the voter allowlist

---

## Features

### Rob's Rules Parliamentary Flow

| Stage | Action | Who |
|-------|--------|-----|
| Create | `createProposal(description)` | Any eligible voter |
| Second | `secondProposal(proposalId)` | Chair only |
| Amend | `submitAmendment(proposalId, text)` | Any eligible voter |
| Approve | `approveAmendment(proposalId, id)` | Chair only |
| Open Voting | `openVoting(proposalId, duration)` | Chair only |
| Vote | `voteOnMotion(proposalId, choice)` | Any eligible voter |
| Finalize | `finalizeProposal(proposalId)` | Anyone |

### Voter Eligibility

- Chair-managed allowlist via `addVoter(address)` / `removeVoter(address)`
- `isEligible(address)` — public view function
- ENS resolver slot reserved for future domain-gated eligibility

### PWA

- Installable on mobile and desktop
- Service worker caches static assets
- Works offline for viewing proposal state

---

## Project Structure

```
zk-voting-system/
├── contracts/
│   ├── ZKVotingRobRulesWithCredentials.sol   # Main voting contract
│   ├── GovVerifier.sol                        # Identity verifier (reference)
│   └── .sol files                             # Additional contracts
├── frontend/
│   ├── index.html          # Voter portal
│   ├── rob-rules.html      # Chair dashboard
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── scripts/
│   └── deploy-with-credentials.js  # Hardhat deploy script
├── test/
│   └── ZKVotingRobRulesWithCredentials.test.js
├── docs/
│   ├── research-references.md
│   ├── verifier-architecture.md
│   └── phase3-*.md
├── SPEC.md                 # System specification
├── WHITEPAPER.md           # Full system whitepaper
├── ACCEPTANCE_GATES.md    # Phase validation gates
└── README.md
```

---

## Development

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Deploy to Sepolia

```bash
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export PRIVATE_KEY="your_deployer_private_key"
npx hardhat run scripts/deploy-with-credentials.js --network sepolia
```

### Update Frontend Contract Address

After deploying, update `CONTRACT_ADDRESS` in:
- `frontend/index.html`
- `frontend/rob-rules.html`

---

## Whitepaper

The full system design, architecture decisions, grant context, and phase plan are documented in [WHITEPAPER.md](./WHITEPAPER.md).

---

## License

MIT — see [LICENSE](./LICENSE)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[build-shield]: https://img.shields.io/github/actions/workflow/status/tylerdotai/zk-voting-system/test.yml?branch=main&label=build
[build-url]: https://github.com/tylerdotai/zk-voting-system/actions
[license-shield]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/tylerdotai/zk-voting-system/blob/main/LICENSE
[network-shield]: https://img.shields.io/badge/network-Sepolia-3C3C3D?logo=ethereum
[network-url]: https://sepolia.etherscan.io
[etherscan]: https://sepolia.etherscan.io/address/0xb3254AB74e5103F7374eEcDb57078eB10388CaC3