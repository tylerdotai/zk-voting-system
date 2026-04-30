/**
 * ZK Proof Generation for Vote Circuit
 * Uses snarkjs to generate proofs entirely in-browser
 *
 * Public inputs:  [proposal_id, nullifier_hash, commitment]
 * Private inputs: [vote_choice, nullifier_seed, voter_address]
 */

import * as snarkjs from "https://cdn.jsdelivr.net/npm/snarkjs/+esm";
import { buildPoseidon } from "https://cdn.jsdelivr.net/npm/circomlibjs/+esm";

// Cached poseidon instance (built once)
let _poseidon = null;

async function getPoseidon() {
  if (!_poseidon) {
    _poseidon = await buildPoseidon();
  }
  return _poseidon;
}

// Convert Ethereum address string to BigInt (field element)
function addressToBigInt(address) {
  return BigInt(address);
}

// Generate cryptographically random nullifier seed
function randomNullifierSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  // Use last 62 hex chars to stay within BN128 scalar field
  return BigInt("0x" + hex.slice(-62));
}

// Compute Poseidon hash of a single value
// Uses circomlibjs buildPoseidon() — matches the WASM's built-in Poseidon
async function poseidonHash1(a) {
  const poseidon = await getPoseidon();
  const hash = poseidon.F.toObject(poseidon([BigInt(a)]));
  return hash;
}

// Compute Poseidon hash of two values
async function poseidonHash2(a, b) {
  const poseidon = await getPoseidon();
  const hash = poseidon.F.toObject(poseidon([BigInt(a), BigInt(b)]));
  return hash;
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

  // Compute public signals — MUST match the circuit's signal ordering
  // The circuit template Vote has public inputs: proposal_id, nullifier_hash, commitment
  const nullifierHash = await poseidonHash1(nullifierSeed);
  const commitment = await poseidonHash2(nullifierSeed, addr);

  // Witness object — field names must match circuit signal names
  // NOTE: The WASM binary includes the Poseidon hasher from poseidon.circom,
  // so the witness computation inside WASM uses the same Poseidon that
  // circomlibjs.buildPoseidon() produces. We pre-compute public signals
  // here so they can be passed as inputs to fullProve for verification.
  const input = {
    // Public inputs (order matters for snarkjs)
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

  // Generate proof — all computation happens in WASM (including Poseidon for witness)
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    new Uint8Array(wasmBuffer),
    new Uint8Array(zkeyBuffer)
  );

  return {
    proof,
    publicSignals, // = [proposal_id, nullifier_hash, commitment]
    nullifierHash: publicSignals[1],
    commitment: publicSignals[2],
  };
}

// Verify proof locally before on-chain submission
async function verifyProof({ proof, publicSignals }) {
  const zkeyResponse = await fetch("/vote_0001.zkey");
  const zkeyBuffer = await zkeyResponse.arrayBuffer();
  const vKey = await snarkjs.zKeyVerificationKey(new Uint8Array(zkeyBuffer));
  return snarkjs.groth16.verify(vKey, publicSignals, proof);
}

/**
 * Format snarkjs proof to Solidity Verifier contract format.
 *
 * Solidity verifier signature:
 *   function verifyProof(
 *     uint[2] calldata _pA,
 *     uint[2][2] calldata _pB,
 *     uint[2] calldata _pC,
 *     uint[] calldata _pubSignals
 *   ) public view returns (bool)
 *
 * snarkjs proof structure:
 *   proof.pi_a = [a0, a1, a2?]
 *   proof.pi_b = [[b0, b1], [b2, b3]]
 *   proof.pi_c = [c0, c1, c2?]
 *
 * Where G1 points are [x, y] and G2 points are [[x0, x1], [y0, y1]]
 * with x1,y1 being the imaginary component (the "high" 128-bit words).
 */
/**
 * Format snarkjs proof to Solidity Verifier contract format.
 *
 * CRITICAL: The BN128 precompile expects G2 points in Fq2 coordinate order [x1, x2]
 * but snarkjs stores them as [x0, x1]. We must SWAP the coordinate pairs:
 *
 * snarkjs pi_b: [[b0, b1], [b2, b3]] where:
 *   b0,b1 = x = b0 + b1*i
 *   b2,b3 = y = b2 + b3*i
 *
 * Solidity needs: [[x2, x1], [y2, y1]] for the BN128 pairing precompile (0x08).
 * This is the "Fq2 swap" — swapping the high/low words of each Fq2 coordinate.
 */
function formatProofForVerifier(proof) {
  return {
    // G1 points stay the same
    a: [proof.pi_a[0], proof.pi_a[1]],
    // G2 points need Fq2 coordinate swap: [[x2,x1],[y2,y1]]
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],  // [x2, x1] — SWAPPED
      [proof.pi_b[1][1], proof.pi_b[1][0]],  // [y2, y1] — SWAPPED
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