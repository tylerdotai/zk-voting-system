# Hackathon Demo Script — ZK Voting System
## 15-Minute Rob's Rules Parliamentary Voting Demo

---

## Pre-Demo Setup (do this before the room fills)

### Open these before you start:
1. **Etherscan** — https://sepolia.etherscan.io/address/0xb3254AB74e5103F7374eEcDb57078eB10388CaC3
2. **Chair Dashboard** — `rob-rules.html` (or deployed URL once ready)
3. **Voter Portal** — `index.html` (second tab)
4. **MetaMask** — switch to Chair account

### MetaMask Accounts (pre-created):
| | Account | Address |
|--|---------|---------|
| Chair | Account 1 | `0x6A8C...54e0` |
| Member 1 | Account 2 | (you created — paste it here) |
| Member 2 | Account 3 | (you created — paste it here) |

---

## The Script — Read This Out Loud

### SEGMENT 1 — "What are we building?" (2 min)

**[0:00] Open Etherscan, show the contract address**

> "This is a smart contract on Ethereum. It's a voting system built on Rob's Rules of Order — the same parliamentary process used by the US Senate, your local HOA, and most democratic organizations. The difference is this runs entirely onchain. No database. No server. Every vote is permanent and publicly verifiable."

**[0:45] Switch to chair dashboard, connect wallet**

> "I connect my wallet as the chair. The contract checks my address against a voter allowlist. Only whitelisted wallets can participate."

**[1:30] Show the voter management section**

> "I can add or remove voters from here. In a real DAO, this would be the secretary role — managing who gets to vote."

---

### SEGMENT 2 — Create and Second (3 min)

**[1:45] Create a proposal**

> "Under Rob's Rules, any member can make a motion. I'll propose one: should Fort Worth DAO allocate 0.5 ETH to sponsor the next HackFW event?"

Type this in the proposal field:
```
Should Fort Worth DAO allocate 0.5 ETH to sponsor the next HackFW event?
```
Click Create → confirm MetaMask

> "Proposal created. It's in the 'Created' state. Under Rob's Rules, a motion must be seconded before it can move forward."

**[2:30] Switch to Member 1 account in MetaMask, refresh page**

> "Now I'll switch to a member's wallet and second this motion. Remember — in our system, any eligible member can second. Not just the chair."

Click Second → confirm MetaMask

> "The proposal is now 'Seconded.' The motion is alive. We can now amend it, debate it, and eventually vote on it."

---

### SEGMENT 3 — Amendments (3 min)

**[3:15] Switch to Member 1, go to voter portal, select the proposal**

> "Once a motion is seconded, any member can submit an amendment. This is where Rob's Rules gets interesting — proposals aren't binary yes/no. Members can modify the motion before it goes to a vote."

Type in the amendment field:
```
Change amount to 0.25 ETH and restrict spending to food and beverage only.
```
Click Submit Amendment → confirm MetaMask

**[4:00] Switch back to Chair account, refresh, approve the amendment**

> "The chair reviews amendments and decides which to approve. I'll approve this one — it makes the proposal more specific and actionable."

Click Approve on the amendment.

> "The amendment is now 'Approved.' It will be attached to the motion when it goes to a vote."

---

### SEGMENT 4 — Open Voting (2 min)

**[4:30] Chair opens voting**

> "The chair opens the voting period. In a real meeting this would be days. For the demo, I'll set it to 5 minutes so we can get a result today."

Click "Open Voting — Custom" → enter `1` minute → confirm MetaMask

> "Voting is now open. You can see the timer counting down. While voting is open, any member can cast their vote."

---

### SEGMENT 5 — Cast Votes (3 min)

**[5:00] Member 1 votes YES**

> "Member 1 votes yes. I switch to their wallet, refresh the page, and click YES."

**[5:30] Member 2 votes YES**

> "Member 2 also votes yes. Two yes votes, zero no votes. The proposal is clearly passing — but let's show one more Rob's Rules feature."

**[6:00] Call for Division**

> "Any member can call for a division. This forces a recorded count rather than a voice vote. It ensures we have an official record of exactly how each person voted."

Click "Call for Division" → confirm MetaMask

> "The division call count went up. This is now a recorded vote."

---

### SEGMENT 6 — Reconsideration (3 min)

**[6:30] Member 1 requests reconsideration**

> "Here's something most digital voting systems don't have: reconsideration. A member who has voted — and only a member who has voted — can request that the vote be reopened. This is in Roberts Rules. Let's request reconsideration."

Click "Request Reconsideration" → confirm MetaMask

> "See the 'Reconsideration Requested' badge. Now the chair has a choice — confirm the reconsideration and reopen, or let it stand."

**[7:00] Chair reopens voting**

> "As chair, I'll confirm the reconsideration. This resets the vote counts and gives everyone a fresh opportunity to vote. Some members may have changed their minds."

Click "Reopen Voting" → confirm MetaMask

> "Votes reset to zero. Now Members 1 and 2 can vote again — or change their vote."

**[7:30] Member 1 votes NO this time (to show independence)**

> "Member 1 changes their vote to NO. Member 2 sticks with YES."

---

### SEGMENT 7 — Finalize and Prove (3 min)

**[8:00] Wait for voting to close, then Chair finalizes**

> "While we wait for the voting window to close, the contract is doing something important — it's collecting all votes onchain. No one can alter or delete them."

**[8:30] Chair clicks Finalize**

> "The chair finalizes. This locks the vote and produces the final result."

**[8:45] Show the result on screen**

> "Proposal passed. Two yes, one no. But the real proof is onchain."

**[9:15] Open Etherscan, filter for `ProposalFinalized` events**

> "Every vote, every state change, every amendment — permanently recorded on Ethereum. You can verify this yourself. The contract address is on screen. No database to hack. No server to take down. Just math."

---

## The Closing Line

> "This is what onchain governance looks like. Not a poll. Not a survey. A real parliamentary process where every action is onchain, every vote is permanent, and any member can call a division, request reconsideration, or amend a motion — the same way Robert's Rules has worked for democratic organizations for 150 years."

---

## Demo End State

| | |
|---|---|
| Proposals | 4 created (3 from before + 1 new) |
| Latest | Should show in Passed/Failed state |
| Votes | Visible in UI |
| TX hashes | All visible in Etherscan |
| Event | `ProposalFinalized` onchain |

---

## Copy-Paste Copy

**Proposal:**
```
Should Fort Worth DAO allocate 0.5 ETH to sponsor the next HackFW event?
```

**Amendment:**
```
Change amount to 0.25 ETH and restrict spending to food and beverage only.
```

---

## If You Get Stuck

| Situation | Fix |
|---|---|
| Page doesn't update after MetaMask action | Refresh the page |
| Member can't vote | Switch to Chair → add them to voter allowlist |
| TX pending too long | Speed up in MetaMask |
| Proposal count shows 0 | Refresh — may be caching stale state |
| Wrong network warning | Click the auto-switch prompt or manually switch to Sepolia |

---

## Timing Cheat Sheet

```
0:00 — Open Etherscan, show contract
1:45 — Create proposal (Chair)
2:30 — Second proposal (Member 1)
3:15 — Submit amendment (Member 1)
4:00 — Approve amendment (Chair)
4:30 — Open voting (Chair)
5:00 — Member 1 votes YES
5:30 — Member 2 votes YES
6:00 — Call for Division (Member 1)
6:30 — Request Reconsideration (Member 1)
7:00 — Reopen Voting (Chair)
7:30 — Member 1 votes NO (changed)
8:30 — Finalize (Chair)
9:15 — Show onchain proof (Etherscan)
10:00 — Closing line
```

Total spoken: ~10 minutes. 5 minutes buffer for Q&A or technical issues.