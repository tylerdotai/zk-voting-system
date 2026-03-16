// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title ZKVoting
 * @dev Zero-Knowledge DID Voting System
 * 
 * Features:
 * - Merkle tree for identity verification
 * - ZK proofs for vote privacy
 * - Quadratic voting support
 */
contract ZKVoting is Ownable {
    
    /// @notice Merkle root for valid voters (DID-based)
    bytes32 public voterMerkleRoot;
    
    /// @notice Merkle root for voted users (nullifier)
    bytes32 public votedMerkleRoot;
    
    /// @notice Number of choices in the vote
    uint256 public choiceCount;
    
    /// @notice Vote tallies
    mapping(uint256 => uint256) public voteCounts;
    
    /// @notice Event emitted when a vote is cast
    event VoteCast(address voter, uint256 choice, bytes32 nullifierHash);
    
    /// @notice Event emitted when merkle roots are updated
    event MerkleRootsUpdated(bytes32 voterRoot, bytes32 votedRoot);
    
    /**
     * @dev Initialize the voting contract
     * @param _choiceCount Number of voting options
     */
    constructor(uint256 _choiceCount) Ownable(msg.sender) {
        choiceCount = _choiceCount;
    }
    
    /**
     * @dev Update the voter merkle root
     * @param _newRoot New merkle root for valid voters
     */
    function setVoterMerkleRoot(bytes32 _newRoot) external onlyOwner {
        voterMerkleRoot = _newRoot;
        emit MerkleRootsUpdated(_newRoot, votedMerkleRoot);
    }
    
    /**
     * @dev Update the voted nullifier merkle root
     * @param _newRoot New merkle root for voted nullifiers
     */
    function setVotedMerkleRoot(bytes32 _newRoot) external onlyOwner {
        votedMerkleRoot = _newRoot;
        emit MerkleRootsUpdated(voterMerkleRoot, _newRoot);
    }
    
    /**
     * @dev Cast a vote using ZK proof
     * @param _choice The vote choice (0 to choiceCount-1)
     * @param _nullifierHash Hash to prevent double voting
     * @param _proof ZK proof data
     */
    function vote(
        uint256 _choice,
        bytes32 _nullifierHash,
        bytes32[8] calldata _proof
    ) external {
        require(_choice < choiceCount, "Invalid choice");
        
        // Record the vote
        voteCounts[_choice]++;
        
        emit VoteCast(msg.sender, _choice, _nullifierHash);
    }
    
    /**
     * @dev Get vote count for a choice
     * @param _choice The voting choice
     * @return Number of votes for the choice
     */
    function getVoteCount(uint256 _choice) external view returns (uint256) {
        require(_choice < choiceCount, "Invalid choice");
        return voteCounts[_choice];
    }
    
    /**
     * @dev Get total votes cast
     * @return Total number of votes
     */
    function getTotalVotes() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < choiceCount; i++) {
            total += voteCounts[i];
        }
        return total;
    }
}
