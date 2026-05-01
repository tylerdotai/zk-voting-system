// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Groth16Verifier } from "./Groth16VerifierV2.sol";

/**
 * @title ZKVotingSimple
 * @notice Minimal ZK voting contract that integrates Groth16 proof verification.
 * @author Tyler Delano / FW DAO
 *
 * @dev Flow:
 * 1. Chair adds voters via addVoter()
 * 2. Chair creates a proposal (createProposal)
 * 3. Chair opens voting (openVoting)
 * 4. Eligible voters call castVote() with ZK proof
 * 5. Chair finalizes after voting ends (finalizeProposal)
 *
 * ZK Circuit (vote.circom):
 * - Public input: proposal_id
 * - Private inputs: vote_choice, nullifier_seed, voter_address
 * - Public outputs: nullifier_hash_out, commitment_out
 *
 * The proof proves the voter knows valid (vote_choice, nullifier_seed, voter_address)
 * that compute to the given nullifier_hash and commitment, for the given proposal_id.
 */
contract ZKVotingSimple {

    // Immutables (set at construction)
    /** @notice The Groth16 verifier contract address */
    address public immutable VERIFIER;
    /** @notice The chair address (creator) */
    address public immutable CHAIR;

    // Proposal state
    /** @notice Total number of proposals created */
    uint256 public proposalCount = 0;
    /** @notice Number of vote choices (always 3: Yes, No, Abstain) */
    uint256 public constant CHOICE_COUNT = 3;

    // Voter management (chair-controlled allowlist)
    /** @notice Maps address to eligibility status */
    mapping(address => bool) public allowedUsers;

    // Proposals
    /** @notice Proposal data structure */
    struct Proposal {
        string description;
        address proposer;
        uint8 state;  // 0=Created, 1=Voting, 2=Passed, 3=Failed
        uint256 votingStartsAt;
        uint256 votingEndsAt;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        mapping(address => bool) hasVoted;
    }
    /** @notice Maps proposal ID to Proposal data */
    mapping(uint256 => Proposal) public proposals;

    // Events
    /** @notice Emitted when a voter is added to the allowlist */
    event VoterAdded(address indexed voter);
    /** @notice Emitted when a new proposal is created */
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    /** @notice Emitted when voting opens for a proposal */
    event VotingOpened(uint256 indexed proposalId, uint256 duration);
    /** @notice Emitted when a vote is cast */
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 choice, bytes32 nullifierHash);
    /** @notice Emitted when a proposal is finalized */
    event ProposalFinalized(uint256 indexed proposalId, uint8 outcome);

    /**
     * @notice Constructor
     * @param _verifier Address of the Groth16 verifier contract
     */
    constructor(address _verifier) {
        require(_verifier != address(0), "Verifier cannot be zero");
        VERIFIER = _verifier;
        CHAIR = msg.sender;
        allowedUsers[msg.sender] = true;
    }

    modifier onlyChair() {
        require(msg.sender == CHAIR, "Only chair");
        _;
    }

    modifier isEligibleVoter() {
        require(allowedUsers[msg.sender], "Not eligible");
        _;
    }

    // ─── Voter Management ───────────────────────────────────────────

    /**
     * @notice Add an address to the voter allowlist
     * @param _voter Address to add
     */
    function addVoter(address _voter) external onlyChair {
        allowedUsers[_voter] = true;
        emit VoterAdded(_voter);
    }

    /**
     * @notice Remove an address from the voter allowlist
     * @param _voter Address to remove
     */
    function removeVoter(address _voter) external onlyChair {
        require(_voter != CHAIR, "Cannot remove chair");
        allowedUsers[_voter] = false;
    }

    // ─── Proposal Management ───────────────────────────────────────

    /**
     * @notice Create a new proposal
     * @param _description Description of the proposal
     * @return proposalId The ID of the newly created proposal
     */
    function createProposal(string calldata _description) external onlyChair returns (uint256 proposalId) {
        proposalId = proposalCount++;
        Proposal storage p = proposals[proposalId];
        p.description = _description;
        p.proposer = msg.sender;
        p.state = 0;
        emit ProposalCreated(proposalId, msg.sender, _description);
    }

    /**
     * @notice Open the voting period for a proposal
     * @param _proposalId ID of the proposal
     * @param _duration Duration in seconds for the voting period
     */
    function openVoting(uint256 _proposalId, uint256 _duration) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(p.state == 0 || p.state == 1, "Cannot open voting");
        require(p.votingStartsAt == 0, "Already opened");
        p.state = 1;
        p.votingStartsAt = block.timestamp;
        p.votingEndsAt = block.timestamp + _duration;
        emit VotingOpened(_proposalId, _duration);
    }

    /**
     * @notice Finalize a proposal after the voting period ends
     * @param _proposalId ID of the proposal
     */
    function finalizeProposal(uint256 _proposalId) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(p.state == 1, "Not in voting");
        require(block.timestamp > p.votingEndsAt, "Voting still open");
        if (p.yesVotes > p.noVotes) {
            p.state = 2;
            emit ProposalFinalized(_proposalId, 2);
        } else {
            p.state = 3;
            emit ProposalFinalized(_proposalId, 3);
        }
    }

    // ─── Voting ─────────────────────────────────────────────────────

    /**
     * @notice Cast a vote with a Groth16 ZK proof
     * @param _proposalId The proposal ID
     * @param _choice 0=Yes, 1=No, 2=Abstain
     * @param _nullifierHash The nullifier hash from the ZK proof (for privacy)
     * @param _pA G1 point A from snarkjs proof
     * @param _pB G2 point B from snarkjs proof (Fq2 swapped for BN128 precompile)
     * @param _pC G1 point C from snarkjs proof
     * @param _pubSignals Public signals: [proposal_id, nullifier_hash, commitment]
     */
    function castVote(
        uint256 _proposalId,
        uint256 _choice,
        bytes32 _nullifierHash,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[3] calldata _pubSignals
    ) external isEligibleVoter {
        Proposal storage p = proposals[_proposalId];
        require(p.state == 1, "Proposal not in voting");
        require(block.timestamp <= p.votingEndsAt, "Voting period ended");
        require(_choice < CHOICE_COUNT, "Invalid choice");
        require(!p.hasVoted[msg.sender], "Already voted");
        bool proofOk = Groth16Verifier(VERIFIER).verifyProof(_pA, _pB, _pC, _pubSignals);
        require(proofOk, "Invalid ZK proof");
        p.hasVoted[msg.sender] = true;
        if (_choice == 0) {
            p.yesVotes++;
        } else if (_choice == 1) {
            p.noVotes++;
        } else {
            p.abstainVotes++;
        }
        emit VoteCast(_proposalId, msg.sender, uint8(_choice), _nullifierHash);
    }

    // ─── Views ──────────────────────────────────────────────────────

    /**
     * @notice Get the full proposal data
     * @param _proposalId ID of the proposal
     * @return description The proposal description
     * @return proposer The address that created the proposal
     * @return state Current proposal state
     * @return votingStartsAt Timestamp when voting started
     * @return votingEndsAt Timestamp when voting ends
     * @return yesVotes Count of yes votes
     * @return noVotes Count of no votes
     * @return abstainVotes Count of abstain votes
     */
    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        address proposer,
        uint8 state,
        uint256 votingStartsAt,
        uint256 votingEndsAt,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.description,
            p.proposer,
            p.state,
            p.votingStartsAt,
            p.votingEndsAt,
            p.yesVotes,
            p.noVotes,
            p.abstainVotes
        );
    }

    /**
     * @notice Check whether an address has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _voter Address to check
     * @return Whether the address has voted
     */
    function hasVotedOnProposal(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
}
