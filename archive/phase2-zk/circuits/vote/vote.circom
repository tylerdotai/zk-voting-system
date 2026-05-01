pragma circom 2.2.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template NullifierHash() {
    signal input nullifier_seed;
    signal output nullifier_hash;

    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== nullifier_seed;
    nullifier_hash <== poseidon.out;
}

template CommitmentHash() {
    signal input nullifier_seed;
    signal input voter_address;
    signal output commitment;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== nullifier_seed;
    poseidon.inputs[1] <== voter_address;
    commitment <== poseidon.out;
}

template Vote() {
    // Public input
    signal input proposal_id;

    // Private inputs
    signal input vote_choice;
    signal input nullifier_seed;
    signal input voter_address;

    // Public outputs (computed by circuit, revealed to verifier)
    signal output nullifier_hash_out;
    signal output commitment_out;

    // Vote choice must be 0, 1, or 2
    signal t0 <== vote_choice * (vote_choice - 1);
    signal t1 <== t0 * (vote_choice - 2);
    t1 === 0;

    // Compute nullifier hash via Poseidon
    component nullifier = NullifierHash();
    nullifier.nullifier_seed <== nullifier_seed;
    nullifier_hash_out <== nullifier.nullifier_hash;

    // Compute commitment via Poseidon
    component commit = CommitmentHash();
    commit.nullifier_seed <== nullifier_seed;
    commit.voter_address <== voter_address;
    commitment_out <== commit.commitment;
}

component main {public [proposal_id]} = Vote();
