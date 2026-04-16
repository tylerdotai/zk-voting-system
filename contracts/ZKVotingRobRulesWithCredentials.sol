// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GovVerifier.sol";

/**
 * @title ZKVotingRobRulesWithCredentials
 * @dev Rob's Rules Parliamentary Voting with Polygon ID Credential Verification
 * 
 * Flow:
 * 1. User proves credential via Polygon ID → GovVerifier.submitZKPResponse()
 * 2. GovVerifier._afterProofSubmit() → ZKVotingRobRulesWithCredentials.verifyCredential(user)
 * 3. All parliamentary actions require allowedUsers[user] == true
 */
contract ZKVotingRobRulesWithCredentials is Ownable {
    
    // Address of the GovVerifier contract
    GovVerifier public govVerifier;
    
    // Track users who have verified their credentials (via GovVerifier)
    mapping(address => bool) public allowedUsers;
    
    // Chair role
    address public chair;
    uint256 public choiceCount;
    uint256 public proposalCount;
    
    // Proposal states
    enum ProposalState { Created, Seconded, Voting, Passed, Failed }
    enum VoteChoice { Yes, No, Abstain }
    
    // Structs
    struct Amendment {
        string description;
        address proposer;
        bool approved;
        bool voted;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
    }
    
    struct Proposal {
        string description;
        address chair;
        ProposalState state;
        uint256 createdAt;
        uint256 secondedAt;
        uint256 votingStartsAt;
        uint256 votingEndsAt;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        Amendment[] amendments;
        mapping(address => bool) hasVotedOnMotion;
        mapping(address => bool) hasSeconded;
    }
    
    // Storage
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVotedOnProposal;
    
    // Events
    event ChairUpdated(address indexed oldChair, address indexed newChair);
    event CredentialVerified(address indexed user);
    event ProposalCreated(uint256 indexed proposalId, string description, address indexed chair);
    event ProposalSeconded(uint256 indexed proposalId);
    event AmendmentSubmitted(uint256 indexed proposalId, uint256 indexed amendmentId, address indexed proposer);
    event AmendmentApproved(uint256 indexed proposalId, uint256 indexed amendmentId);
    event MotionVoted(uint256 indexed proposalId, uint256 choice, address indexed voter);
    event ProposalFinalized(uint256 indexed proposalId, ProposalState finalState);
    
    // Modifiers
    modifier onlyChair() {
        require(msg.sender == chair, "Only chair can perform this action");
        _;
    }

    modifier onlyGovVerifier() {
        require(msg.sender == address(govVerifier), "Only GovVerifier can perform this action");
        _;
    }
    
    modifier requiresCredential() {
        require(allowedUsers[msg.sender], "Credential not verified");
        _;
    }
    
    // Constructor
    constructor(address _govVerifier, address _chair, uint256 _choiceCount) {
        require(_govVerifier != address(0), "GovVerifier cannot be zero");
        require(_chair != address(0), "Chair cannot be zero address");
        require(_choiceCount >= 2, "Must have at least 2 choices");
        
        _transferOwnership(msg.sender);
        govVerifier = GovVerifier(_govVerifier);
        chair = _chair;
        choiceCount = _choiceCount;
    }
    
    // Credential Management
    function setAllowedUser(address _user) external onlyGovVerifier {
        // Called by GovVerifier after ZKP proof is verified
        allowedUsers[_user] = true;
        emit CredentialVerified(_user);
    }
    
    function isCredentialVerified(address _user) public view returns (bool) {
        return allowedUsers[_user];
    }
    
    // Chair Management
    function setChair(address _newChair) external onlyOwner {
        require(_newChair != address(0), "Chair cannot be zero address");
        address oldChair = chair;
        chair = _newChair;
        emit ChairUpdated(oldChair, _newChair);
    }
    
    // Proposal Lifecycle
    function createProposal(string calldata _description) external onlyChair requiresCredential returns (uint256) {
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = proposalCount++;
        Proposal storage p = proposals[proposalId];
        p.description = _description;
        p.chair = chair;
        p.state = ProposalState.Created;
        p.createdAt = block.timestamp;
        
        emit ProposalCreated(proposalId, _description, chair);
        return proposalId;
    }
    
    function secondProposal(uint256 _proposalId) external onlyChair requiresCredential {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Created, "Proposal must be in Created state");
        
        p.state = ProposalState.Seconded;
        p.secondedAt = block.timestamp;
        
        emit ProposalSeconded(_proposalId);
    }
    
    function submitAmendment(uint256 _proposalId, string calldata _description) external requiresCredential returns (uint256) {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Seconded, "Proposal must be in Seconded state");
        require(bytes(_description).length > 0, "Amendment description cannot be empty");
        
        p.amendments.push(Amendment({
            description: _description,
            proposer: msg.sender,
            approved: false,
            voted: false,
            yesVotes: 0,
            noVotes: 0,
            abstainVotes: 0
        }));
        uint256 amendmentId = p.amendments.length - 1;
        
        emit AmendmentSubmitted(_proposalId, amendmentId, msg.sender);
        return amendmentId;
    }
    
    function approveAmendment(uint256 _proposalId, uint256 _amendmentId) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(_amendmentId < p.amendments.length, "Invalid amendment ID");
        
        p.amendments[_amendmentId].approved = true;
        emit AmendmentApproved(_proposalId, _amendmentId);
    }
    
    function openVoting(uint256 _proposalId, uint256 _duration) external onlyChair requiresCredential {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Seconded, "Proposal must be in Seconded state");
        require(_duration > 0 && _duration <= 7 days, "Invalid voting duration");
        
        p.state = ProposalState.Voting;
        p.votingStartsAt = block.timestamp;
        p.votingEndsAt = block.timestamp + _duration;
    }
    
    // Voting
    function voteOnMotion(uint256 _proposalId, uint256 _choice, bytes32 _nullifierHash, bytes32[8] calldata) external requiresCredential {
        Proposal storage p = proposals[_proposalId];
        
        require(p.state == ProposalState.Voting, "Proposal not in Voting state");
        require(block.timestamp <= p.votingEndsAt, "Voting period has ended");
        require(_choice < choiceCount, "Invalid choice");
        require(!p.hasVotedOnMotion[msg.sender], "Already voted");
        
        p.hasVotedOnMotion[msg.sender] = true;
        
        if (_choice == 0) {
            p.yesVotes++;
        } else if (_choice == 1) {
            p.noVotes++;
        } else {
            p.abstainVotes++;
        }
        
        emit MotionVoted(_proposalId, _choice, msg.sender);
    }
    
    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Voting, "Proposal not in Voting state");
        require(block.timestamp > p.votingEndsAt, "Voting period has not ended");
        
        if (p.yesVotes > p.noVotes) {
            p.state = ProposalState.Passed;
        } else {
            p.state = ProposalState.Failed;
        }
        
        emit ProposalFinalized(_proposalId, p.state);
    }
    
    // View Functions
    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        address proposalChair,
        uint256 state,
        uint256 createdAt,
        uint256 secondedAt,
        uint256 votingStartsAt,
        uint256 votingEndsAt,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes,
        uint256 amendmentCount
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.description,
            p.chair,
            uint256(p.state),
            p.createdAt,
            p.secondedAt,
            p.votingStartsAt,
            p.votingEndsAt,
            p.yesVotes,
            p.noVotes,
            p.abstainVotes,
            p.amendments.length
        );
    }
    
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVotedOnMotion[_voter];
    }
    
    function getAmendment(uint256 _proposalId, uint256 _amendmentId) external view returns (
        string memory description,
        address proposer,
        bool approved,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes
    ) {
        require(_amendmentId < proposals[_proposalId].amendments.length, "Invalid amendment ID");
        Amendment storage a = proposals[_proposalId].amendments[_amendmentId];
        return (
            a.description,
            a.proposer,
            a.approved,
            a.yesVotes,
            a.noVotes,
            a.abstainVotes
        );
    }
}
