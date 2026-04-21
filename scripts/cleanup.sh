#!/bin/bash
# Cleanup script for zk-voting-system
# Removes test artifacts, debug scripts, and outdated credential infrastructure
# Run from project root

set -e

echo "=== ZK Voting System — Repo Cleanup ==="
echo ""
echo "This will DELETE the following (backed up to /tmp/zk-voting-backup/):"
echo ""
echo "  ROOT SCRIPTS:    bn128_diag.js, bn128_diag.mjs, gen_witness.js, gen_proof.mjs, sse-server.js"
echo "  CONFIG FILES:    .env, contracts.json, proof.json, railway-sse.json, vercel.json"
echo "  COVERAGE:        coverage/, coverage.json"
echo "  CREDENTIAL INFRA: schemas/, deployments/, docs/"
echo "  OLD CONTRACTS:   BN128*, EcMul*, Pairing*, ZKVerifier*, GovVerifier*, Groth16Verifier.sol"
echo "  OLD CONTRACTS:   ZKVoting.sol, ZKVotingWithCredentials.sol"
echo "  TEST ARTIFACTS:  contracts_ZKVerifier_sol_*.abi, contracts_ZKVerifier_sol_*.bin"
echo ""
echo "Press ENTER to proceed, Ctrl+C to abort..."
read

# Backup
echo ">>> Backing up..."
mkdir -p /tmp/zk-voting-backup
cp -r schemas deployments docs bn128_diag.js bn128_diag.mjs gen_witness.js \
  railway-sse.json vercel.json .env contracts.json proof.json \
  contracts_ZKVerifier_sol_*.abi contracts_ZKVerifier_sol_*.bin \
  coverage coverage.json \
  /tmp/zk-voting-backup/ 2>/dev/null || true

# Remove root scripts
echo ">>> Removing root scripts..."
rm -f bn128_diag.js bn128_diag.mjs gen_witness.js gen_proof.mjs sse-server.js

# Remove config files
echo ">>> Removing config files..."
rm -f .env contracts.json proof.json railway-sse.json vercel.json
rm -f contracts_ZKVerifier_sol_Groth16Verifier.abi contracts_ZKVerifier_sol_Groth16Verifier.bin

# Remove coverage
echo ">>> Removing coverage..."
rm -rf coverage coverage.json

# Remove credential infrastructure
echo ">>> Removing credential infrastructure..."
rm -rf schemas deployments docs

# Remove old contracts
echo ">>> Removing old contracts..."
rm -f contracts/BN128PrecompileTest.sol \
      contracts/BN128Test.sol \
      contracts/EcMulTest.sol \
      contracts/MinimalBN128Test.sol \
      contracts/PairingTest.sol \
      contracts/ZKVerifier.sol \
      contracts/ZKVerifierTest.sol \
      contracts/ZKVoting.sol \
      contracts/ZKVotingWithCredentials.sol \
      contracts/GovVerifier.sol \
      contracts/Groth16VerifierFixed.sol \
      contracts/Groth16Verifier.sol

echo ""
echo "=== Cleanup complete ==="
echo ""
echo "Remaining structure:"
find . -maxdepth 3 -type f | grep -v node_modules | grep -v ".git/" | grep -v cache/solidity | sort