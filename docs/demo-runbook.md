# Demo Runbook — ZK Voting System
## Fort Worth DAO · 15-Minute Demo

---

## Setup (Before the Demo — 5 min)

### MetaMask Accounts Needed: 3

| Account | Role | Address |
|---------|------|---------|
| 1 | Chair (Tyler) | `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0` |
| 2 | Member 1 | Generate new → add via chair |
| 3 | Member 2 | Generate new → add via chair |

### Pre-Demo Checklist

- [ ] MetaMask has 3 accounts (1 chair + 2 members)
- [ ] Contract is deployed at `0xb3254AB74e5103F7374eEcDb57078eB10388CaC3` on Sepolia
- [ ] Sepolia ETH on all 3 accounts (use Alchemy faucet if needed)
- [ ] `rob-rules.html` open in browser (chair view)
- [ ] `index.html` open in second tab (member view)
- [ ] Wrong network = switch to Sepolia

### Demo Data

Use this exact proposal text so you can copy-paste without thinking:

**Proposal:** *"Should Fort Worth DAO allocate 0.5 ETH to sponsor the next HackFW event?"*
**Amendment:** *"Change amount to 0.25 ETH and restrict to food/beverage only."*

---

## Demo Script — 15 Minutes

### Part 1 — Setup + Identity (2 min)

**[0:00-1:00] Show the contract on Etherscan**
> "This is our voting contract on Ethereum Sepolia. It's a real blockchain — votes are immutable, permanent, and verifiable by anyone. No database to hack."

```
Etherscan: https://sepolia.etherscan.io/address/0xb3254AB74e5103F7374eEcDb57078eB10388CaC3
```

**[1:00-2:00] Connect Chair wallet**
> "I connect my wallet as the chair. My address is whitelisted — I have full control over the voting process."

- Open `rob-rules.html` → Connect Wallet
- Show voter eligibility check: "Eligible ✓"

---

### Part 2 — Create a Proposal (3 min)

**[2:00-3:30] Chair creates proposal**
> "Every member can propose a motion. I'll create one: should we allocate 0.5 ETH to sponsor HackFW?"

- `rob-rules.html` → Proposal Title: *"Should Fort Worth DAO allocate 0.5 ETH to sponsor the next HackFW event?"*
- Click Create → MetaMask confirm
- Show: Proposal #3 appears in Created state

**[3:30-5:00] Member seconds the proposal**
> "Under Rob's Rules, any member can second a motion. Let me switch to Member 2's wallet and second this proposal."

- MetaMask → switch to Account 2
- Refresh page (contract state updates)
- Show: "Second" button is enabled (not just chair can second!)
- Click Second → MetaMask confirm
- Show: Proposal moves to Seconded state

---

### Part 3 — Amendments (3 min)

**[5:00-6:30] Member submits amendment**
> "Once seconded, any member can propose an amendment — this is core Rob's Rules. Member 2 will tighten the proposal."

- `index.html` (Member view) → Proposal #3
- Amendment field: *"Change amount to 0.25 ETH and restrict to food/beverage only."*
- Submit amendment

**[6:30-8:00] Chair approves amendment**
> "The chair approves or rejects amendments. I approve this one."

- Switch to Account 1 (Chair)
- Proposal #3 → Amendments → Approve
- Show: Amendment now listed as Approved

---

### Part 4 — Voting (4 min)

**[8:00-9:30] Chair opens voting**
> "Chair opens the voting period. I've set it to end in 5 minutes so we can finalize today. In a real meeting this would be days."

- Proposal #3 → Set Voting Duration: 5 minutes
- Open Voting

**[9:30-11:00] Members cast votes**
> "Now Member 1 and Member 2 vote. I'll switch wallets and show both."

- Switch to Account 2 (Member 1) → Vote YES
- Switch to Account 3 (Member 2) → Vote YES

**[11:00-12:00] Call for Division (show member right)**
> "Any member who doubts the result can call for a division — a recorded count. This is Rob's Rules in action."

- Account 2 → "Call for Division" button
- Show: Division count increments

---

### Part 5 — Finalize + Results (3 min)

**[12:00-13:30] Reconsider + Reopen (show member right)**
> "A member who voted can also request reconsideration while voting is open — this forces the chair to decide whether to reopen. Let's request reconsideration."

- Account 2 → "Request Reconsideration"
- Show: "Reconsideration Requested" badge
- Switch to Chair → "Reopen Voting" button appears
- Chair reopens → votes reset to 0

**[13:30-15:00] Finalize and show onchain proof**
> "Now let's finalize properly. The chair closes voting and we get our result — onchain, permanent, verifiable."

- Chair → Finalize
- Show: Proposal #3 → Passed
- Show Etherscan: ProposalFinalized event with vote counts
> "Every vote, every state change — permanently recorded. No database. No server. Just math."

---

## Key Talking Points (Memorize These)

| Moment | Line |
|--------|------|
| Why blockchain | "Votes are immutable, permanent, onchain. No database to corrupt or delete." |
| Why Rob's Rules | "Real parliamentary process — motions, seconds, amendments, divisions. Not just a yes/no poll." |
| Member rights | "Any member can propose, second, amend, call a division, or request reconsideration." |
| ENS-gated | "Only whitelisted wallets can participate. Chair controls the allowlist." |
| Offline-capable | "It's a PWA — works offline with cached assets. Blockchain sync when back online." |
| Why Sepolia | "Testnet today, mainnet when the DAO is ready to vote on real treasury." |

---

## If Something Goes Wrong

| Problem | Fix |
|---------|-----|
| MetaMask account switch doesn't update UI | Refresh page after switching |
| Proposal doesn't move to next state | Check MetaMask is on Sepolia |
| TX pending too long | Speed up in MetaMask, or check Sepolia congestion |
| Member can't vote | Verify they're added to voter allowlist |
| Contract says 0 proposals | Refresh — frontend may be caching stale state |

---

## Demo End State

After the demo, Proposal #3 should be:
- **State:** Passed (or Reopened if you did the reconsider step)
- **Votes:** 2 YES, 0 NO, 0 Abstain (if finalized normally)
- **Amendments:** 1 approved
- **Onchain:** All events verifiable on Etherscan

---

## Quick Reference

```
Contract:    0xb3254AB74e5103F7374eEcDb57078eB10388CaC3
Chair:       0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0
Network:     Ethereum Sepolia (chain 11155111)
Explorer:    https://sepolia.etherscan.io/address/0xb3254AB74e5103F7374eEcDb57078eB10388CaC3
Frontend:    rob-rules.html (chair) + index.html (member)
```
