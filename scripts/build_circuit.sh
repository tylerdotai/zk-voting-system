#!/bin/bash
# Build script for ZK voting circuit
# Run: ./scripts/build_circuit.sh

set -e
cd "$(dirname "$0")/.."

echo "=== Step 1: Compile Circom circuit ==="
circom circuits/vote/vote.circom \
  --r1cs --wasm --sym \
  --output circuits/vote/ \
  -l node_modules

echo "=== Step 2: Generate .r1cs info ==="
npx snarkjs r1cs info circuits/vote/vote.r1cs

echo "=== Step 3: Trusted setup (Powers of Tau) ==="
npx snarkjs powersoftau new bn128 17 build/ptau/pot17_0000.ptau -v

echo "=== Step 4: First contribution ==="
npx snarkjs powersoftau contribute build/ptau/pot17_0000.ptau \
  build/ptau/pot17_0001.ptau \
  --name="Flume SaaS Factory" \
  --entropy="$(date +%s%N | sha256sum | head -c 64)"

echo "=== Step 5: Prepare phase 2 ==="
npx snarkjs powersoftau prepare phase2 build/ptau/pot17_0001.ptau \
  build/ptau/pot17_final.ptau -v

echo "=== Step 6: Groth16 setup ==="
npx snarkjs groth16 setup circuits/vote/vote.r1cs \
  build/ptau/pot17_final.ptau build/keys/0000.zkey

echo "=== Step 7: Contribution ==="
npx snarkjs zkey contribute build/keys/0000.zkey \
  build/keys/0001.zkey \
  --name="Flume SaaS Factory" \
  --entropy="$(date +%s%N | sha256sum | head -c 64)"

echo "=== Step 8: Export verification key + Solidity verifier ==="
npx snarkjs zkey export verificationkey build/keys/0001.zkey \
  build/keys/verification_key.json
npx snarkjs zkey export solidityverifier build/keys/0001.zkey \
  build/keys/Verifier.sol

echo "=== Step 9: Copy WASM + zkey to frontend ==="
cp circuits/vote/vote_js/vote.wasm frontend/vote.wasm
cp build/keys/0001.zkey frontend/vote_0001.zkey
cp build/keys/Verifier.sol contracts/ZKVerifier.sol

echo "=== DONE ==="
echo "Files generated:"
echo "  - circuits/vote/vote.r1cs       (circuit constraints)"
echo "  - circuits/vote/vote_js/        (WASM witness generator)"
echo "  - build/keys/0001.zkey         (proving key)"
echo "  - build/keys/Verifier.sol       (Solidity verifier)"
echo "  - frontend/vote.wasm           (for browser proof generation)"
echo "  - frontend/vote_0001.zkey     (for browser proof generation)"
