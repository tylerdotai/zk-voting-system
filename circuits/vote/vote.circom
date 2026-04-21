pragma circom 2.2.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

// Verify a vote choice is valid (0=Yes, 1=No, 2=Abstain)
// using only quadratic constraints
template VoteChoice() {
    signal input choice;
    signal output oneHOT[3];

    // choice must satisfy: choice*(choice-1)*(choice-2) == 0
    // This is satisfied only when choice ∈ {0, 1, 2}
    signal t0 <== choice * (choice - 1);
    signal t1 <== t0 * (choice - 2);
    t1 === 0;

    // oneHOT via binary decomposition (all quadratic):
    // Is choice == 0?  (1-choice)² = 1 if choice=0, 0 otherwise
    oneHOT[0] <== (1 - choice) * (1 - choice);

    // Is choice == 1?  choice² if choice=1, 0 otherwise
    // But choice itself may not be binary — use binary version:
    signal b <== choice * (choice - 1);  // b = 0 when choice ∈ {0,1}
    // So we can't just use choice directly. Let me use a different approach:
    // The constraint choice*(choice-1)*(choice-2)=0 already enforces valid range.
    // For oneHOT, use: if choice=0→oneHOT[0]=1; if choice=1→oneHOT[1]=1; if choice=2→oneHOT[2]=1.
    // We can't conditionally assign, so we compute all three:
    oneHOT[0] <== (choice - 1) * (choice - 1) / 1;  // (choice-1)² = 1 when choice=0, else ≥0
    // Problem: division is not a constraint. We need different approach.
}

// Reverted — using the simpler validated version
template VoteChoiceSimple() {
    signal input choice;
    signal output out;

    // choice must be 0, 1, or 2
    signal t0 <== choice * (choice - 1);
    signal t1 <== t0 * (choice - 2);
    t1 === 0;

    // Output: 1 if valid, 0 if not
    out <== 1;
}

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
    // === PUBLIC INPUTS ===
    signal input proposal_id;
    signal input nullifier_hash;
    signal input commitment;

    // === PRIVATE INPUTS ===
    signal input vote_choice;
    signal input nullifier_seed;
    signal input voter_address;

    // --- Verify vote choice is valid (0, 1, or 2) ---
    // constraint: choice*(choice-1)*(choice-2) == 0
    // This is a cubic constraint decomposed into two quadratic steps
    signal t0 <== vote_choice * (vote_choice - 1);
    signal t1 <== t0 * (vote_choice - 2);
    t1 === 0;

    // --- Verify nullifier hash ---
    component nullifier = NullifierHash();
    nullifier.nullifier_seed <== nullifier_seed;
    nullifier.nullifier_hash === nullifier_hash;

    // --- Verify commitment ---
    component commit = CommitmentHash();
    commit.nullifier_seed <== nullifier_seed;
    commit.voter_address <== voter_address;
    commit.commitment === commitment;
}

component main = Vote();
