<a id="readme-top"></a>

<br />
<div align="center">
  <img src="logo.png" alt="ZK Voting System Logo" width="140" height="140">

  <h3 align="center">ZK Voting System</h3>

  <p align="center">
    Rob's Rules parliamentary voting for the Fort Worth DAO hackathon demo.
    <br />
    Phase 1 is live on Sepolia with direct on-chain voting.
    <br />
    ZK privacy is planned for Phase 2.
    <br />
    <a href="https://zk-voting-system-two.vercel.app"><strong>Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://zk-voting-system-two.vercel.app/chair">Chair Dashboard</a>
    ·
    <a href="https://zk-voting-system-two.vercel.app/verify">Verify Proposal</a>
    ·
    <a href="https://sepolia.etherscan.io/address/0x0e51e42d9a18bae5790b0e2298e85f067d30e70c">Sepolia Contract</a>
  </p>
</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Hackathon Scope](#hackathon-scope)
- [Built With](#built-with)
- [Current Live Contract](#current-live-contract)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Demo Wallets](#demo-wallets)
- [Roadmap](#roadmap)
- [Project Structure](#project-structure)
- [Docs](#docs)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## About The Project

Most on-chain voting systems are too primitive for real governance.
They let wallets vote yes or no, but ignore how real deliberative bodies actually work.

This project implements a practical parliamentary workflow based on **Robert's Rules of Order**:

- any eligible member can create a motion
- another member can second it
- members can submit amendments
- the chair can open voting with a defined time window
- members vote **yes / no / abstain**
- the proposal is finalized on-chain with a clear result

For the hackathon, we shipped **Phase 1** as a clean, reliable on-chain DAO voting flow on **Ethereum Sepolia**.
The **ZK privacy layer** remains part of the long-term vision, but is intentionally deferred to Phase 2 due to toolchain instability.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Hackathon Scope

This repo is the Fort Worth DAO hackathon demo build.

### What is live now

- Rob's Rules DAO flow on Sepolia
- chair-managed voter allowlist
- voter portal
- chair dashboard
- proposal verification page
- configurable voting durations for demos
- fast-track voting for chair-led demo flow

### What is not in Phase 1

- no active Groth16 proof verification in the live flow
- no live ZK proof generation in the browser
- no private vote submission yet

### Why

The circom 2.2.3 and snarkjs toolchain broke reliable proof generation during the build sprint.
Instead of shipping a flaky demo, we locked in the governance system first and moved privacy to Phase 2.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Built With

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [Ethers.js](https://ethers.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Vercel](https://vercel.com/)
- [MetaMask](https://metamask.io/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Current Live Contract

### Active contract

- **Contract:** `ZKVotingRobRulesNoZK`
- **Network:** Ethereum Sepolia
- **Address:** `0x0e51E42d9a18Bae5790B0e2298E85f067d30E70c`
- **Chair / Owner:** `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0`

### Status

This is the contract the frontend should point to.
It supports:

- `createProposal(string)`
- `secondProposal(uint256)`
- `submitAmendment(uint256, string)`
- `openVoting(uint256, uint256)`
- `fastTrackVoting(uint256, uint256)`
- `castVote(uint256, uint256)`
- `reconsider(uint256)`
- `reopenVoting(uint256)`
- `finalizeProposal(uint256)`

### Deprecated contracts

These remain deployed but are **not** the current demo path:

- `ZKVotingRobRulesWithCredentials` at `0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3`
- `Groth16VerifierV2` at `0x02aa9654f33Aa73880460B4f286A430c4D56CAb6`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MetaMask
- Sepolia RPC access

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/tylerdotai/zk-voting-system.git
   cd zk-voting-system
   ```

2. Install root dependencies
   ```bash
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd frontend-app
   npm install
   ```

4. Add environment variables in the repo root
   ```bash
   cp .env.example .env
   ```

5. Build the frontend
   ```bash
   cd frontend-app
   npm run build
   ```

### Useful Commands

```bash
# contracts
npx hardhat compile
npx hardhat test

# frontend
cd frontend-app
npm run dev
npm run build
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Usage

### Demo Flow

1. Connect the **chair** wallet
2. Create a proposal
3. Choose a short voting duration, usually **5 minutes** for demo
4. Either:
   - use **Fast Track** immediately, or
   - have another voter **second** first, then open voting
5. Connect voter wallets and cast votes
6. Finalize the proposal on-chain
7. Verify the result on Sepolia / proposal lookup page

### Recommended Demo Script

- create proposal
- second proposal from another wallet
- cast 3 votes
- show yes/no/abstain counts
- finalize
- verify on-chain result

### Example Test Proposals

- Allocate 5 ETH from the community treasury to fund Q2 developer grants
- Approve 10,000 USDC for DFW community growth initiatives
- Ratify a governance process change extending voting windows to 72 hours
- Fund a hackathon sponsorship package for the next Fort Worth builder event
- Form a working group to evaluate Layer 2 governance deployment

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Demo Wallets

| Role | Address |
| --- | --- |
| Chair + Owner | `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0` |
| Voter 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| Voter 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |

These are the wallets currently expected in the demo flow.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Roadmap

### Phase 1 — live now

- Rob's Rules proposal flow
- on-chain yes/no/abstain voting
- chair dashboard
- proposal verification page
- short-duration demo voting

### Phase 2 — planned

- ZK privacy layer for anonymous voting
- repaired circom proving pipeline
- Groth16 or equivalent proof path restored
- private eligibility proofs
- private vote casting with nullifier protection

See [`ROADMAP.md`](./ROADMAP.md) for the expanded plan.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Project Structure

```text
frontend-app/
├── components/
│   ├── ChairDashboard.tsx
│   ├── ProposalCard.tsx
│   └── WalletConnect.tsx
├── lib/
│   ├── constants.ts
│   └── ethereum.ts
├── pages/
│   ├── index.tsx
│   ├── chair.tsx
│   ├── verify.tsx
│   └── _app.tsx
└── styles/
    └── globals.css

contracts/
├── ZKVotingRobRulesNoZK.sol
├── ZKVotingRobRulesWithCredentials.sol
└── Groth16VerifierV2.sol

.github/workflows/
├── ci.yml
├── deploy.yml
└── lint.yml
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Docs

- [`SPEC.md`](./SPEC.md) — contract functions, architecture, state machine
- [`ROADMAP.md`](./ROADMAP.md) — phase plan and contract status
- [`WHITEPAPER.md`](./WHITEPAPER.md) — full project rationale and future ZK vision
- [`DESIGN.md`](./DESIGN.md) — visual system and brand direction

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contact

**Tyler Delano**
- GitHub: [@tylerdotai](https://github.com/tylerdotai)
- X: `@tylerdotai`

Project Link: [https://github.com/tylerdotai/zk-voting-system](https://github.com/tylerdotai/zk-voting-system)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Acknowledgments

- [Best README Template](https://github.com/othneildrew/Best-README-Template)
- Fort Worth DAO
- Hackathon judges and reviewers
- OpenZeppelin
- Hardhat
- Next.js
- The broader Ethereum governance and tooling ecosystem

<p align="right">(<a href="#readme-top">back to top</a>)</p>
