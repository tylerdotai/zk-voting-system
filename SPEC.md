# Polygon ID Issuer Node Integration — SPEC

## Overview

Integrate Polygon ID issuer node to enable **credential-gated voting** — users prove residency/membership via ZK proofs without revealing their identity.

## Goal

Complete the ZK DID voting system's credential verification by setting up a real Polygon ID issuer that issues verifiable credentials to eligible voters.

---

## Phase 1: Issuer Node Setup

### Tasks

1. **Set up Polygon ID issuer node via Docker**
   - Clone issuer node repo
   - Configure environment (Ethereum RPC, private key, server URL)
   - Run issuer node container

2. **Create credential schema**
   - Define: "Fort Worth DAO Member" credential
   - Attributes: `memberId`, `jurisdiction`, `memberSince`
   - Schema URL: `https://schema.polygonid.com/fort-worth-dao-member.json`

3. **Configure QR proof request**
   - Define circuit: `credentialAtomicQuerySig`
   - Set allowed issuers
   - Configure expiration

### Verification
- Issuer UI accessible at `http://localhost:3001`
- Credentials can be issued to test wallets

---

## Phase 2: Smart Contract Updates

### Tasks

1. **Update GovVerifier with real configuration**
   - Set `ISSUER_DID` 
   - Set `SCHEMA_HASH`
   - Set `CIRCUIT_ID`

2. **Update ZKVotingRobRulesWithCredentials**
   - Verify proof against correct schema
   - Handle proof validation callbacks

3. **Write integration tests**

### Verification
- Contracts deploy successfully to Sepolia
- `submitZKPResponse()` triggers `setAllowedUser()`

---

## Phase 3: Frontend Integration

### Tasks

1. **Integrate Polygon ID SDK**
   - Install `@0xpolygonid/js-sdk`
   - Configure issuer URL and schema

2. **Build QR code flow**
   - Generate proof request QR on `verify.html`
   - Handle proof response submission

3. **Add credential status indicator**
   - Show "Verified" badge after successful proof

### Verification
- User can scan QR with Polygon ID wallet
- After verification, user can vote on `rob-rules.html`

---

## Phase 4: Deployment

### Tasks

1. **Deploy to Sepolia**
   - Deploy GovVerifier
   - Deploy ZKVotingRobRulesWithCredentials
   - Update frontend addresses

2. **Set up production issuer**
   - Configure domain
   - SSL certificate
   - Monitoring

### Verification
- Live at `zk-voting-system.vercel.app`
- Real users can verify and vote

---

## Out of Scope

- Multi-chain support
- Mobile app
- Post-quantum cryptography
- Mainnet deployment

---

## Dependencies

- Docker + Docker Compose
- Sepolia testnet ETH
- Polygon ID wallet app (for testing)
- Alchemy/Infura API key

---

## Success Criteria

1. Issuer node running and accessible
2. Credentials issuable to wallets
3. Proof verification working on-chain
4. User flow: connect wallet → verify credentials → vote on proposal
5. Full end-to-end tested on Sepolia