// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./verifiers/ZKPVerifier.sol";
import "./interfaces/ICircuitValidator.sol";

/**
 * @title GovVerifier
 * @dev ZK Proof Verifier for Polygon ID credentials
 * 
 * This contract extends ZKPVerifier to handle Polygon ID credential verification.
 * After a proof is successfully verified, it calls the voting contract to mark
 * the user as credential-verified.
 */
contract GovVerifier is ZKPVerifier {
    uint64 public constant TRANSFER_REQUEST_ID = 1;
    
    // The voting contract to update after verification
    address public votingContract;
    
    // Event for debugging
    event ProofSubmitted(address indexed user, uint64 requestId);
    event CredentialVerified(address indexed user);
    
    constructor(address _votingContract) {
        votingContract = _votingContract;
    }
    
    /**
     * @dev Set the voting contract address
     * @param _contract New voting contract address
     */
    function setVotingContract(address _contract) external onlyOwner {
        votingContract = _contract;
    }
    
    /**
     * @dev Hook called before proof is submitted
     */
    function _beforeProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        // Add any pre-submission checks here
        // For example, check that the user hasn't already verified
    }
    
    /**
     * @dev Hook called after proof is successfully submitted
     * This is where we mark the user as credential-verified
     */
    function _afterProofSubmit(
        uint64,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        // Extract user address from inputs
        // The address is typically at a specific index in the inputs array
        address user = address(uint160(uint256(inputs[inputs.length - 1])));
        
        // Call the voting contract to mark user as verified
        if (votingContract != address(0)) {
            // Try to call verifyCredential on the voting contract
            (bool success, ) = votingContract.call(
                abi.encodeWithSignature("verifyCredential(address)", user)
            );
            if (success) {
                emit CredentialVerified(user);
            }
        }
        
        emit ProofSubmitted(user, TRANSFER_REQUEST_ID);
    }
}
