// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GovVerifier.sol";

/**
 * @title ZKVotingWithCredentials
 * @dev ZK Voting with Polygon ID credential verification
 * 
 * Flow:
 * 1. User proves credential via Polygon ID → GovVerifier.submitZKPResponse()
 * 2. GovVerifier._afterProofSubmit() → setCredentialVerified(user)
 * 3. User calls vote() → only if allowedUsers[user] == true
 */
contract ZKVotingWithCredentials is Ownable {
    
    // Address of the GovVerifier contract
    GovVerifier public govVerifier;
    
    // Track users who have verified their credentials
    mapping(address => bool) public allowedUsers;
    
    // Vote tracking
    mapping(address => bool) public hasVoted;
    uint256 public yesVotes;
    uint256 public noVotes;
    uint256 public abstainVotes;
    
    // Events
    event CredentialVerified(address indexed user);
    event VoteCast(address indexed voter, uint256 choice);
    event VoteFinalized(uint256 yesCount, uint256 noCount, uint256 abstainCount);
    
    /**
     * @dev Constructor
     * @param _govVerifier Address of the GovVerifier contract
     */
    constructor(address _govVerifier) {
        require(_govVerifier != address(0), "GovVerifier cannot be zero");
        govVerifier = GovVerifier(_govVerifier);
    }
    
    /**
     * @dev Set the GovVerifier contract (owner only)
     * @param _govVerifier New GovVerifier address
     */
    function setGovVerifier(address _govVerifier) external onlyOwner {
        require(_govVerifier != address(0), "GovVerifier cannot be zero");
        govVerifier = GovVerifier(_govVerifier);
    }
    
    /**
     * @dev Manually verify a credential (for testing or manual approval)
     * @param _user Address to verify
     */
    function setAllowedUser(address _user) external onlyOwner {
        allowedUsers[_user] = true;
        emit CredentialVerified(_user);
    }
    
    /**
     * @dev Check if user is credential verified via GovVerifier
     * This is called by the GovVerifier after ZKP proof is validated
     * @param _user Address to check
     */
    function isCredentialVerified(address _user) public view returns (bool) {
        return allowedUsers[_user];
    }
    
    /**
     * @dev Cast a vote (requires credential verification)
     * @param _choice 0 = Yes, 1 = No, 2 = Abstain
     */
    function vote(uint256 _choice) external {
        require(allowedUsers[msg.sender], "Credential not verified");
        require(!hasVoted[msg.sender], "Already voted");
        require(_choice < 3, "Invalid choice");
        
        hasVoted[msg.sender] = true;
        
        if (_choice == 0) {
            yesVotes++;
        } else if (_choice == 1) {
            noVotes++;
        } else {
            abstainVotes++;
        }
        
        emit VoteCast(msg.sender, _choice);
    }
    
    /**
     * @dev Get vote counts
     * @return yes, no, abstain counts
     */
    function getVoteCounts() external view returns (uint256, uint256, uint256) {
        return (yesVotes, noVotes, abstainVotes);
    }
    
    /**
     * @dev Get total votes
     */
    function getTotalVotes() external view returns (uint256) {
        return yesVotes + noVotes + abstainVotes;
    }
}
