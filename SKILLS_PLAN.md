# Skills Plan — ZK DID Voting System

## Core project skills

### 1. zk-voting-architect
Owns:
- architecture decisions
- whitepaper alignment
- phase planning
- verifier integration choices
- chain and identity boundary decisions

### 2. polygon-id-ops
Owns:
- issuer node setup
- schema definitions
- proof request configuration
- issuance testing
- operator runbooks

### 3. zk-voting-contracts
Owns:
- contract edits
- Base Sepolia deployment
- verifier bridge wiring
- test harness updates
- env and config normalization

### 4. zk-voting-pwa
Owns:
- manifest
- service worker
- mobile-first UX
- wallet-aware dApp UI
- offline shell behavior

### 5. zk-voting-demo-qa
Owns:
- smoke tests
- clean-wallet rehearsals
- failure checklists
- acceptance gate validation
- final demo runbook

## Build rules

1. Whitepaper is the source of truth
2. Development paper is the presentation companion
3. dApp first, PWA shell second
4. Real proof flow required for final demo
5. Base Sepolia is the canonical build network
6. No deploy without local validation
7. No feature counts unless it passes a checkpoint

## Recommended execution model

- Main session: architecture, docs, integration, signoff
- Subagents: issuer, contracts, PWA, QA
- Ollama: summarization, scaffolds, option comparison
- Never trust Ollama alone for security-critical or verifier logic
