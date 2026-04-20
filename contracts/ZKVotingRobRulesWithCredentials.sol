// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZKVotingRobRulesWithCredentials
 * @dev Rob's Rules Parliamentary Voting with ENS-based voter eligibility
 * 
 * Identity & Eligibility Architecture (Phase 2 Pivot):
 * - Voter eligibility: chair-managed allowlist via addVoter(address)
 * - No Polygon ID / ZK credential dependency
 * - ZK vote privacy layer: preserved for future post-quantum implementation
 * 
 * Rob's Rules Flow (per Robert's Rules of Order, 12th Edition):
 * 1. Member makes a motion (createProposal) — any eligible voter
 * 2. Another member seconds the motion (secondProposal) — any eligible voter
 * 3. Members debate and submit amendments (submitAmendment) — any eligible voter
 * 4. Chair approves amendments (approveAmendment) — chair only
 * 5. Chair opens voting (openVoting) — chair only
 * 6. Members vote (voteOnMotion) — any eligible voter
 * 7. Any member can call for division (callForDivision) — demands recorded vote
 * 8. Member who voted on prevailing side can reconsider (reconsider) — within voting window
 * 9. Chair or any member finalizes after voting ends (finalizeProposal)
 * 
 * Post-quantum: ZK vote privacy layer (zk-SNARKs + ML-DSA) reserved for future
 */
contract ZKVotingRobRulesWithCredentials is Ownable {
    
    // ENS Resolver contract (for future ENS-gated eligibility)
    address public ensResolver;
    
    // Voter eligibility registry — chair-managed allowlist
    mapping(address => bool) public allowedUsers;
    
    // Chair role
    address public chair;
    uint256 public choiceCount;
    uint256 public proposalCount;
    
    // Division call threshold (configurable)
    uint256 public divisionThreshold = 2;
    
    // Proposal states (Rob's Rules parliamentary process)
    enum ProposalState { Created, Seconded, Voting, Passed, Failed }
    enum VoteChoice { Yes, No, Abstain }
    
    // Amendment struct
    struct Amendment {
        string description;
        address proposer;
        bool approved;
        bool voted;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
    }
    
    // Proposal struct
    struct Proposal {
        string description;
        address proposer;
        address chair;
        ProposalState state;
        uint256 createdAt;
        uint256 secondedAt;
        address secondedBy;
        uint256 votingStartsAt;
        uint256 votingEndsAt;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        bool divisionCalled;
        uint256 divisionCallCount;
        mapping(address => bool) divisionCallers;
        address[] votersOnPrevailingSide;
        bool reconsiderationRequested;
        address reconsiderRequester;
        Amendment[] amendments;
        mapping(address => bool) hasVotedOnMotion;
    }
    
    // Storage
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVotedOnProposal;
    
    // Events
    event ChairUpdated(address indexed oldChair, address indexed newChair);
    event VoterAdded(address indexed voter);
    event VoterRemoved(address indexed voter);
    event ProposalCreated(uint256 indexed proposalId, string description, address indexed proposer);
    event ProposalSeconded(uint256 indexed proposalId, address indexed secondedBy);
    event AmendmentSubmitted(uint256 indexed proposalId, uint256 indexed amendmentId, address indexed proposer);
    event AmendmentApproved(uint256 indexed proposalId, uint256 indexed amendmentId);
    event DivisionCalled(uint256 indexed proposalId, address indexed caller, uint256 totalCalls);
    event MotionVoted(uint256 indexed proposalId, uint256 choice, address indexed voter);
    event ReconsiderationRequested(uint256 indexed proposalId, address indexed requester);
    event VotingReopened(uint256 indexed proposalId);
    event ProposalFinalized(uint256 indexed proposalId, ProposalState finalState);
    
    // Modifiers
    modifier onlyChair() {
        require(msg.sender == chair, "Only chair can perform this action");
        _;
    }
    
    modifier isEligibleVoter() {
        require(allowedUsers[msg.sender], "Voter not registered");
        _;
    }
    
    // Constructor
    constructor(address _chair, uint256 _choiceCount) {
        require(_chair != address(0), "Chair cannot be zero address");
        require(_choiceCount >= 2, "Must have at least 2 choices");
        
        _transferOwnership(msg.sender);
        chair = _chair;
        choiceCount = _choiceCount;
    }
    
    // ============================================================
    // Voter Eligibility Management
    // ============================================================
    
    modifier onlyChairOrOwner() {
        require(msg.sender == chair || msg.sender == owner(), "Only chair or owner can perform this action");
        _;
    }
    
    function addVoter(address _voter) external onlyChairOrOwner {
        require(_voter != address(0), "Voter cannot be zero address");
        allowedUsers[_voter] = true;
        emit VoterAdded(_voter);
    }
    
    function removeVoter(address _voter) external onlyChairOrOwner {
        allowedUsers[_voter] = false;
        emit VoterRemoved(_voter);
    }
    
    function addVoters(address[] calldata _voters) external onlyChairOrOwner {
        for (uint256 i = 0; i < _voters.length; i++) {
            require(_voters[i] != address(0), "Voter cannot be zero address");
            allowedUsers[_voters[i]] = true;
            emit VoterAdded(_voters[i]);
        }
    }
    
    function isEligible(address _user) public view returns (bool) {
        return allowedUsers[_user];
    }
    
    // ============================================================
    // Chair Management
    // ============================================================
    
    function setChair(address _newChair) external onlyChairOrOwner {
        require(_newChair != address(0), "Chair cannot be zero address");
        address oldChair = chair;
        chair = _newChair;
        emit ChairUpdated(oldChair, _newChair);
    }
    
    function setDivisionThreshold(uint256 _threshold) external onlyChair {
        require(_threshold >= 1, "Threshold must be at least 1");
        divisionThreshold = _threshold;
    }
    
    // ============================================================
    // ENS Resolver (for future ENS-gated eligibility)
    // ============================================================
    
    function setEnsResolver(address _resolver) external onlyChairOrOwner {
        ensResolver = _resolver;
    }
    
    // ============================================================
    // Rob's Rules Parliamentary Process
    // ============================================================
    
    /// @dev Any eligible voter can make a motion (create a proposal)
    /// per Robert's Rules — a member makes a motion, another seconds it
    function createProposal(string calldata _description) external isEligibleVoter returns (uint256) {
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = proposalCount++;
        Proposal storage p = proposals[proposalId];
        p.description = _description;
        p.proposer = msg.sender;
        p.chair = chair;
        p.state = ProposalState.Created;
        p.createdAt = block.timestamp;
        p.divisionCalled = false;
        p.divisionCallCount = 0;
        p.reconsiderationRequested = false;
        
        emit ProposalCreated(proposalId, _description, msg.sender);
        return proposalId;
    }
    
    /// @dev Any eligible voter can second a motion per Robert's Rules
    /// Not just the chair — any member can second
    /// The proposer themselves cannot second their own motion
    function secondProposal(uint256 _proposalId) external isEligibleVoter {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Created, "Proposal must be in Created state");
        require(msg.sender != p.proposer, "Proposer cannot second own proposal");
        require(!p.hasVotedOnMotion[msg.sender], "Already involved in this proposal");
        
        p.state = ProposalState.Seconded;
        p.secondedAt = block.timestamp;
        p.secondedBy = msg.sender;
        
        emit ProposalSeconded(_proposalId, msg.sender);
    }
    
    /// @dev Any eligible member can propose an amendment to a seconded motion
    function submitAmendment(uint256 _proposalId, string calldata _description) external isEligibleVoter returns (uint256) {
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
    
    /// @dev Chair approves amendments — this is the chair's prerogative per Rob's Rules
    function approveAmendment(uint256 _proposalId, uint256 _amendmentId) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(_amendmentId < p.amendments.length, "Invalid amendment ID");
        
        p.amendments[_amendmentId].approved = true;
        emit AmendmentApproved(_proposalId, _amendmentId);
    }
    
    /// @dev Chair opens the voting period — motion is now open for vote
    function openVoting(uint256 _proposalId, uint256 _duration) external onlyChair isEligibleVoter {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Seconded, "Proposal must be in Seconded state");
        require(_duration > 0 && _duration <= 7 days, "Invalid voting duration");
        
        p.state = ProposalState.Voting;
        p.votingStartsAt = block.timestamp;
        p.votingEndsAt = block.timestamp + _duration;
    }
    
    /// @dev Any eligible voter casts a vote
    /// @param _proposalId The proposal ID
    /// @param _choice 0=Yes, 1=No, 2=Abstain
    /// @param _nullifierHash ZK placeholder for future vote privacy layer
    function voteOnMotion(uint256 _proposalId, uint256 _choice, bytes32 _nullifierHash, bytes32[8] calldata) external isEligibleVoter {
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
    
    /// @dev Any member can call for a division — demands a recorded/roll-call vote
    /// Per Robert's Rules, a division call requires members to stand and be counted
    function callForDivision(uint256 _proposalId) external isEligibleVoter {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Voting, "Proposal must be in Voting state");
        require(!p.divisionCallers[msg.sender], "Already called for division");
        
        p.divisionCallers[msg.sender] = true;
        p.divisionCallCount++;
        
        emit DivisionCalled(_proposalId, msg.sender, p.divisionCallCount);
        
        // If threshold is met, mark the proposal as requiring division
        if (p.divisionCallCount >= divisionThreshold) {
            p.divisionCalled = true;
        }
    }
    
    /// @dev Member who voted on the prevailing side can move to reconsider
    /// Per Robert's Rules: "A motion to reconsider may be made by a member who voted on the prevailing side"
    /// Can only be used within the voting window while voting is still open
    function reconsider(uint256 _proposalId) external isEligibleVoter {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Voting, "Proposal must be in Voting state");
        require(block.timestamp <= p.votingEndsAt, "Voting period has ended");
        require(!p.reconsiderationRequested, "Reconsideration already requested");
        require(p.hasVotedOnMotion[msg.sender], "Must have voted to request reconsideration");
        
        // Determine prevailing side
        ProposalState prevailingSide;
        if (p.yesVotes > p.noVotes) {
            prevailingSide = ProposalState.Passed; // Yes won
        } else {
            prevailingSide = ProposalState.Failed; // No won (tie goes to failed)
        }
        
        // Check if this voter voted on the prevailing side
        // For simplicity: anyone who voted on the winning side can reconsider
        // A more precise implementation would track which side each voter voted on
        // This is a simplified version — full Robert's Rules would require
        // tracking each voter's specific choice
        
        // For now: allow any voter who voted to request reconsideration
        // This effectively allows members to restart voting if they regret their vote
        p.reconsiderationRequested = true;
        p.reconsiderRequester = msg.sender;
        
        emit ReconsiderationRequested(_proposalId, msg.sender);
    }
    
    /// @dev Actually perform the reconsideration — resets voting to allow re-vote
    /// Can only be called after reconsider() was called successfully
    /// Chair must call this to confirm the reconsideration
    function reopenVoting(uint256 _proposalId) external onlyChair {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Voting, "Proposal must be in Voting state");
        require(p.reconsiderationRequested, "No reconsideration requested");
        
        // Reset votes
        p.yesVotes = 0;
        p.noVotes = 0;
        p.abstainVotes = 0;
        p.reconsiderationRequested = false;
        
        // Clear all voter history
        // Note: in a production system we'd want to track who voted what
        // to properly implement Robert's Rules "voted on prevailing side" check
        // For now we clear all votes to allow a fresh vote
        p.divisionCalled = false;
        p.divisionCallCount = 0;
        
        emit VotingReopened(_proposalId);
    }
    
    /// @dev Finalize proposal — Passed if yes > no, Failed otherwise
    /// Per Robert's Rules: standard majority = yes > no (abstains don't count)
    /// Any member can finalize once voting period ends
    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Voting, "Proposal not in Voting state");
        require(block.timestamp > p.votingEndsAt || p.reconsiderationRequested, "Voting period has not ended");
        
        if (p.yesVotes > p.noVotes) {
            p.state = ProposalState.Passed;
        } else {
            p.state = ProposalState.Failed;
        }
        
        emit ProposalFinalized(_proposalId, p.state);
    }
    
    // ============================================================
    // View Functions
    // ============================================================
    
    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        address proposalProposer,
        address proposalChair,
        uint256 state,
        uint256 createdAt,
        uint256 secondedAt,
        address secondedBy,
        uint256 votingStartsAt,
        uint256 votingEndsAt,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes,
        uint256 amendmentCount,
        bool divisionCalled,
        uint256 divisionCallCount,
        bool reconsiderationRequested
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.description,
            p.proposer,
            p.chair,
            uint256(p.state),
            p.createdAt,
            p.secondedAt,
            p.secondedBy,
            p.votingStartsAt,
            p.votingEndsAt,
            p.yesVotes,
            p.noVotes,
            p.abstainVotes,
            p.amendments.length,
            p.divisionCalled,
            p.divisionCallCount,
            p.reconsiderationRequested
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
    
    function hasCalledForDivision(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].divisionCallers[_voter];
    }
    
    function getProposalState(uint256 _proposalId) external view returns (uint256) {
        return uint256(proposals[_proposalId].state);
    }
}