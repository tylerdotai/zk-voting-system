# MetaMask Test Accounts Setup

## Goal
Test the full 3-voter Rob's Rules flow using MetaMask's multi-account feature — no additional tools needed.

---

## Step 1 — Create 3 MetaMask Accounts

**Account 1 (Chair — you):** Already set up
- Address: `0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0`
- This is the chair and contract owner

**Account 2 (Member 1):**
1. MetaMask → top-right circle → "Add account or hardware wallet"
2. Select "Create a new account"
3. Name it: **Member 1**
4. Copy the new address

**Account 3 (Member 2):**
1. Repeat steps 1-4 above
2. Name it: **Member 2**
3. Copy the new address

**Save your new addresses here:**
```
Member 1:  0x____________________________
Member 2:  0x____________________________
```

---

## Step 2 — Fund the New Accounts

All accounts need Sepolia ETH to send transactions.

**Using Alchemy Faucet:**
1. Go to https://www.alchemy.com/faucet/ethereum/sepolia
2. Paste Member 1 address → Request 0.5 ETH
3. Repeat for Member 2

**Or from your chair account (if you have extra Sepolia ETH):**
1. MetaMask → Account 1 → Send → paste Member 1 address → send 0.05 ETH

---

## Step 3 — Add Members to Voter Allowlist

Only chair can do this.

1. Open `rob-rules.html` → Connect Wallet (Account 1 = chair)
2. Scroll to "Voter Management" section
3. Paste Member 1 address → Click Add Voter
4. MetaMask confirm → wait for TX
5. Repeat for Member 2

**Verify:** Member 1 and Member 2 addresses should show "Registered ✓"

---

## Step 4 — Switch Between Accounts

To switch which account is active in the dApp:

1. Click the MetaMask fox icon
2. Click the colored circle (top-right of popup)
3. Select the account you want
4. **Refresh the webpage** — the dApp reads the active MetaMask account on page load

**Important:** Every time you switch accounts, refresh `rob-rules.html` or `index.html` to see the correct permissions.

---

## Account Permissions Summary

| Account | Role | Can Do |
|---------|------|--------|
| Account 1 (Chair) | Chair | Create proposals, second, approve amendments, open voting, finalize, add/remove voters |
| Account 2 (Member 1) | Member | Create proposals, second, amend, vote, call for division, request reconsideration |
| Account 3 (Member 2) | Member | Create proposals, second, amend, vote, call for division, request reconsideration |

---

## Testing Tip

Keep a text file open during demo prep:
```
Account 1 (Chair):  0x6A8C66fBAA1fE05947CfBD54b2fCF67ca3c254e0
Account 2 (Member 1): 0x____________________________
Account 3 (Member 2): 0x____________________________
```

This makes it easy to copy-paste addresses for the voter allowlist step.
