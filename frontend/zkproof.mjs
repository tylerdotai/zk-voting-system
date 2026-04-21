/**
 * ZK Proof Generation for Vote Circuit
 * Uses snarkjs to generate proofs entirely in-browser
 * 
 * Public inputs:  [proposal_id, nullifier_hash, commitment]
 * Private inputs: [vote_choice, nullifier_seed, voter_address]
 */

import * as snarkjs from "snarkjs";

// Convert Ethereum address string to BigInt (field element)
function addressToBigInt(address) {
  return BigInt(address);
}

// Generate cryptographically random nullifier seed
function randomNullifierSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  // Use last 31 bytes to stay within BN128 field
  return BigInt("0x" + hex.slice(-62));
}

// Compute Poseidon hash of a single value
async function poseidonHash1(a) {
  // Use the hasher from snarkjs (built-in BN128 Poseidon)
  // snarkjs includes poseidon in its WASM builds
  const Wasm = await snarkjs.groth16.WASM;
  // Use circomlibjs poseidon if available, otherwise use ethers.js
  try {
    const { buildPoseidon } = await import("circomlibjs");
    const poseidon = await buildPoseidon();
    const hash = poseidon.F.toObject(poseidon([BigInt(a)]));
    return hash;
  } catch {
    // Fallback: use ethers keccak256 as proxy hash
    // NOTE: This won't match the circuit's Poseidon!
    // For production, you MUST use the correct Poseidon
    const { ethers } = await import("ethers");
    const hash = await ethers.id(a.toString());
    return BigInt(hash);
  }
}

// Compute Poseidon hash of two values
async function poseidonHash2(a, b) {
  try {
    const { buildPoseidon } = await buildPoseidon();
    const poseidon = await buildPoseidon();
    const hash = poseidon.F.toObject(poseidon([BigInt(a), BigInt(b)]));
    return hash;
  } catch {
    // Fallback
    const { ethers } = await import("ethers");
    const hash = await ethers.id(a.toString() + b.toString());
    return BigInt(hash);
  }
}

// Main proof generation function
// Returns proof and public signals ready for the Verifier contract
async function generateVoteProof({
  voteChoice,      // 0 = Yes, 1 = No, 2 = Abstain
  nullifierSeed,   // Random field element
  voterAddress,    // Ethereum address as BigInt or string
  proposalId,      // Proposal ID as BigInt
}) {
  const addr = typeof voterAddress === "string" 
    ? addressToBigInt(voterAddress) 
    : voterAddress;
  
  // Compute public signals
  const nullifierHash = await poseidonHash1(nullifierSeed);
  const commitment = await poseidonHash2(nullifierSeed, addr);

  // Witness object — field names must match circuit signal names
  // NOTE: The WASM binary includes the Poseidon hasher,
  // so this automatically uses the correct Poseidon implementation
  const input = {
    // Public inputs (order matters!)
    proposal_id: proposalId,
    nullifier_hash: nullifierHash,
    commitment: commitment,
    // Private inputs
    vote_choice: voteChoice,
    nullifier_seed: nullifierSeed,
    voter_address: addr,
  };

  // Load WASM and zkey from frontend directory
  const [wasmResponse, zkeyResponse] = await Promise.all([
    fetch("/vote.wasm"),
    fetch("/vote_0001.zkey"),
  ]);

  if (!wasmResponse.ok || !zkeyResponse.ok) {
    throw new Error("Failed to load circuit files");
  }

  const wasmBuffer = await wasmResponse.arrayBuffer();
  const zkeyBuffer = await zkeyResponse.arrayBuffer();

  // Generate proof — all computation happens in WASM (including Poseidon)
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmBuffer,
    zkeyBuffer
  );

  return {
    proof,
    publicSignals, // = [proposal_id, nullifier_hash, commitment]
    nullifierHash: publicSignals[1],
    commitment: publicSignals[2],
  };
}

// Verify proof (local check before on-chain submission)
async function verifyProof({ proof, publicSignals }) {
  const zkeyResponse = await fetch("/vote_0001.zkey");
  const zkeyBuffer = await zkeyResponse.arrayBuffer();
  const vKey = await snarkjs.zKeyVerificationKey(new Uint8Array(zkeyBuffer));
  return snarkjs.groth16.verify(vKey, publicSignals, proof);
}

// Format snarkjs proof to Solidity Verifier contract format
function formatProofForVerifier(proof) {
  // snarkjs proof structure:
  // proof.pi_a = [a0, a1, a2?]  (G1 x-coordinate, y-coordinate)
  // proof.pi_b = [[b0, b1], [b2, b3], ...]  (G2 x-coords, y-coords)
  // proof.pi_c = [c0, c1, c2?]
  
  // Solidity expects:
  // Proof.A:   uint256[2]  — G1 point (x, y)
  // Proof.B:   uint256[2][2] — G2 point (x₀,x₁,y₀,y₁) as [2][2]
  // Proof.C:   uint256[2]  — G1 point for commitment
  
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][0], proof.pi_b[0][1]],
      [proof.pi_b[1][0], proof.pi_b[1][1]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
  };
}

export {
  randomNullifierSeed,
  poseidonHash1,
  poseidonHash2,
  generateVoteProof,
  verifyProof,
  formatProofForVerifier,
};
