<!-- START — Standard README for zk-voting-system -->
<a id="readme-top"></a>

<div align="center">

# ZK Voting System

**ENS-gated Rob's Rules parliamentary voting on Ethereum Sepolia.**

Built for the Fort Worth DAO. Fully onchain — votes are immutable and publicly verifiable.

[![Build Status][build-shield]][build-url]
[![License: MIT][license-shield]][license-url]
[![Sepolia][network-shield]][network-url]

</div>

---

## Live Demo

**Contract:** [`0xb3254AB74e5103F7374eEcDb57078eB10388CaC3`][etherscan] on Sepolia

| Page | Purpose | File |
|------|---------|------|
| Chair Dashboard | Create proposals, open/close voting, manage voters | `frontend/rob-rules.html` |
| Voter Portal | View proposals, cast votes, call for division | `frontend/index.html` |
| Registration | Check voter eligibility status | `frontend/verify.html` |

> The chair address (`0x6A8C...`) holds admin rights on the live contract. Connect MetaMask to Sepolia to interact.

---

## What It Does

ZK Voting System implements full **Robert's Rules of Order** parliamentary procedure onchain:

```
Created → Seconded → Amendments → Voting → Passed / Failed
```

- **Any eligible voter** can create proposals, second motions, submit amendments, and vote
- **Chair** manages the voter allowlist, opens/closes voting, and approves amendments
- **Members** can call for a division (recorded count) or request reconsideration
- All state changes are permanent and publicly verifiable on Ethereum

### Architecture

```
Wallet connects → isEligible(address) check → Rob's Rules parliamentary flow → onchain state
```

**Stack:** Solidity · Hardhat · Ethers.js v5 · Vanilla HTML/CSS/JS · PWA

---

## Smart Contract

| | |
|---|---|
| **Network** | Ethereum Sepolia (testnet) |
| **Address** | [`0xb3254AB74e5103F7374eEcDb57078eB10388CaC3`][etherscan] |
| **Standard** | Rob's Rules of Order (12th Edition) |

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/tylerdotai/zk-voting-system.git
cd zk-voting-system
npm install

# Compile contracts
npx hardhat compile

# Run tests (58 tests covering full Rob's Rules flow)
npx hardhat test
```

### Local Frontend

```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080/rob-rules.html (chair) or index.html (voter)
```

### Connect MetaMask to Live Contract

1. Install [MetaMask](https://metamask.io)
2. Switch to **Sepolia testnet**
3. Get Sepolia ETH at [alchemy.com/faucet](https://www.alchemy.com/faucet/ethereum/sepolia)
4. Chair adds your address to the voter allowlist

---

## Features

### Rob's Rules Parliamentary Flow

| Stage | Action | Who |
|-------|--------|-----|
| Create | `createProposal(description)` | Any eligible voter |
| Second | `secondProposal(proposalId)` | Any eligible voter (not proposer) |
| Amend | `submitAmendment(proposalId, text)` | Any eligible voter |
| Approve | `approveAmendment(proposalId, id)` | Chair only |
| Open Voting | `openVoting(proposalId, duration)` | Chair only |
| Call for Division | `callForDivision(proposalId)` | Any voter |
| Vote | `voteOnMotion(proposalId, choice)` | Any eligible voter |
| Request Reconsider | `reconsider(proposalId)` | Voter who cast a vote |
| Reopen Voting | `reopenVoting(proposalId)` | Chair only |
| Finalize | `finalizeProposal(proposalId)` | Anyone |

### Voter Eligibility

- Chair-managed allowlist via `addVoter(address)`
- `isEligible(address)` — public view function
- ENS domain resolution reserved for future self-service eligibility

### PWA

- Installable on mobile and desktop
- Service worker caches static assets for offline viewing
- Works offline — blockchain syncs when back online

---

## Project Structure

```
zk-voting-system/
├── contracts/
│   └── ZKVotingRobRulesWithCredentials.sol   # Main voting contract
├── frontend/
│   ├── index.html          # Voter portal
│   ├── rob-rules.html      # Chair dashboard
│   ├── verify.html         # Voter registration status
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── scripts/
│   └── deploy-with-credentials.js  # Hardhat deploy script
├── test/
│   └── ZKVotingRobRulesWithCredentials.test.js   # 58 passing tests
├── docs/
│   ├── demo-runbook.md     # 15-minute demo script
│   └── test-accounts.md    # MetaMask multi-account setup
├── SPEC.md
├── WHITEPAPER.md
└── README.md
```

---

## Development

```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy to Sepolia
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
export PRIVATE_KEY="your_deployer_private_key"
npx hardhat run scripts/deploy-with-credentials.js --network sepolia
```

---

## Demo Script

The `docs/demo-runbook.md` has a complete 15-minute demo script for showing the system at a DAO meeting:

1. Show contract on Etherscan (2 min)
2. Chair creates proposal → Member seconds (3 min)
3. Member submits amendment → Chair approves (3 min)
4. Chair opens voting → Members vote → Call for Division (4 min)
5. Reconsideration + Reopen → Finalize + Onchain proof (3 min)

---

## Grant Context

Built for the **Fort Worth DAO HackFW hackathon** — $2,500 grant for a ZK DID voting system. Key constraints satisfied:

- ✅ Post-quantum ready (documented, future layer)
- ✅ No third-party dependency (allowlist-based)
- ✅ Offline-capable (PWA service worker)
- ✅ Real onchain governance (Ethereum Sepolia)

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
