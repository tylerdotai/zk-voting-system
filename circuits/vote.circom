/*
 * Vote Verification Circuit
 * Inputs:
 * - voterIdentity: Hash of voter's DID
 * - nullifier: Random value to prevent double voting
 * - voterMerkleRoot: Root of valid voters tree
 * - voteChoice: The voting choice
 *
 * Outputs:
 * - nullifierHash: Hash of nullifier for double-spend check
 * - voterHash: Hash to verify voter eligibility
 */
pragma circom 2.0.0;

include "circomlib/poseidon.circom";
include "circomlib/bitify.circom";
include "circomlib/switcher.circom";

template VoteVerifier() {
    signal input voterIdentity;
    signal input nullifier;
    signal input voterMerkleRoot;
    signal input voteChoice;
    signal input voteOptionIndex;

    signal output nullifierHash;
    signal output voterHash;

    component poseidonVoter = Poseidon(2);
    poseidonVoter.inputs[0] <== voterIdentity;
    poseidonVoter.inputs[1] <== nullifier;
    nullifierHash <== poseidonVoter.out;

    component poseidonIdentity = Poseidon(1);
    poseidonIdentity.inputs[0] <== voterIdentity;
    voterHash <== poseidonIdentity.out;

    voteOptionIndex * (voteOptionIndex - 1) === 0;
}

component main {public [voterMerkleRoot, voteChoice]} = VoteVerifier();
