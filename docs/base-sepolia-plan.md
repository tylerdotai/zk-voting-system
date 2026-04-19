# Base Sepolia Plan

## Goal
Make Base Sepolia the canonical voting-contract network for the demo.

## Required env vars
- `BASE_SEPOLIA_RPC_URL`
- `PRIVATE_KEY`

## Chain settings
- Network name: `baseSepolia`
- Chain ID: `84532`

## Why this matters
- voting contracts should target Base Sepolia for the live demo path
- frontend wallet UX should point to Base Sepolia
- issuer/identity infrastructure can remain Polygon-ID-backed while the voting contracts live on Base

## Next implementation steps
1. update deploy scripts to support `--network baseSepolia`
2. emit structured deploy output instead of ad-hoc text file
3. persist voting/verifier/validator addresses for frontend use
4. document required env vars in repo setup docs

## Current status
- Hardhat config updated for Base Sepolia
- deploy script refactor still pending
