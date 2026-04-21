// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Groth16VerifierV2.sol";

/**
 * @title ZKVotingSimple
 * @dev Minimal ZK voting contract that integrates Groth16 proof verification.
 * 
 * Flow:
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
    address public immutable verifier;
    address public immutable chair;
    
    // Proposal state
    uint256 public proposalCount = 0;
    uint256 public choiceCount = 3;  // 0=Yes, 1=No, 2=Abstain
    
    // Voter management (chair-controlled allowlist)
    mapping(address => bool) public allowedUsers;
    
    // Proposals
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
    mapping(uint256 => Proposal) public proposals;
    
    // Events
    event VoterAdded(address voter);
    event ProposalCreated(uint256 indexed proposalId, address proposer, string description);
    event VotingOpened(uint256 indexed proposalId, uint256 duration);
    event VoteCast(uint256 indexed proposalId, address voter, uint8 choice, bytes32 nullifierHash);
    event ProposalFinalized(uint256 indexed proposalId, uint8 outcome);
    
    constructor(address _verifier) {
        require(_verifier != address(0), "Verifier cannot be zero");
        verifier = _verifier;
        chair = msg.sender;
        allowedUsers[msg.sender] = true;  // Chair is always eligible
    }
    
    modifier onlyChair() {
        require(msg.sender == chair, "Only chair");
        _;
    }
    
    modifier isEligibleVoter() {
        require(allowedUsers[msg.sender], "Not eligible");
        _;
    }
    
    // ─── Voter Management ───────────────────────────────────────────
    function addVoter(address _voter) external onlyChair {
        allowedUsers[_voter] = true;
        emit VoterAdded(_voter);
    }
    
    function removeVoter(address _voter) external onlyChair {
        require(_voter != chair, "Cannot remove chair");
        allowedUsers[_voter] = false;
    }
    
    // ─── Proposal Management ───────────────────────────────────────
    function createProposal(string calldata _description) external onlyChair returns (uint256) {
        uint256 id = proposalCount++;
        Proposal storage p = proposals[id];
        p.description = _description;
        p.proposer = msg.sender;
        p.state = 0;
        emit ProposalCreated(id, msg.sender, _description);
        return id;
    }
    
    function openVoting(uint256 _proposalId, uint256 _duration) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(p.state == 0 || p.state == 1, "Cannot open voting");
        require(p.votingStartsAt == 0, "Already opened");  // Prevent re-opening
        
        p.state = 1;  // Voting
        p.votingStartsAt = block.timestamp;
        p.votingEndsAt = block.timestamp + _duration;
        emit VotingOpened(_proposalId, _duration);
    }
    
    function finalizeProposal(uint256 _proposalId) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(p.state == 1, "Not in voting");
        require(block.timestamp > p.votingEndsAt, "Voting still open");
        
        // Determine outcome
        if (p.yesVotes > p.noVotes) {
            p.state = 2;  // Passed
            emit ProposalFinalized(_proposalId, 2);
        } else {
            p.state = 3;  // Failed
            emit ProposalFinalized(_proposalId, 3);
        }
    }
    
    // ─── Voting ─────────────────────────────────────────────────────
    /**
     * @dev Cast a vote with a Groth16 ZK proof.
     * 
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
        
        // Check proposal is in voting state
        require(p.state == 1, "Proposal not in voting");
        require(block.timestamp <= p.votingEndsAt, "Voting period ended");
        require(_choice < choiceCount, "Invalid choice");
        require(!p.hasVoted[msg.sender], "Already voted");
        
        // Verify the ZK proof
        // The proof commits the voter to their vote choice and nullifier, 
        // proving they know valid (vote_choice, nullifier_seed, voter_address)
        // that hash to the given nullifier_hash for the given proposal_id.
        bool proofOk = Groth16Verifier(verifier).verifyProof(
            _pA, _pB, _pC, _pubSignals
        );
        require(proofOk, "Invalid ZK proof");
        
        // Record the vote
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
    
    function hasVotedOnProposal(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
}