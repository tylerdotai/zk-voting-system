# Schema Reference (Phase 2)

## Canonical credential
- Name: `FortWorthDAOMembershipCredential`
- Version: `1.0.0`
- File: `schemas/v1-fort-worth-dao-member.json`

## Required fields
- `membershipId` (string)
- `membershipStatus` (enum: `active|suspended|revoked`)
- `jurisdiction` (string)
- `memberSince` (integer timestamp/date)
- `votingEligible` (boolean)

## Optional fields
- `membershipTier` (string)
- `committee` (string)
- `expirationDate` (integer timestamp)

## Demo proof strategy
For first working demo, gate on one query only:
- `votingEligible == true`

Keep `membershipStatus` and `jurisdiction` in credential for credibility, but do not require them in v1 proof gate.
