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
     * @dev Hook called after proof is successfully submitted.
     * 
     * For Polygon ID credential proofs (Circuit 1), the Ethereum address is
     * msg.sender — the wallet that submitted the submitZKPResponse() transaction.
     * The circuit proof does not contain or reveal the Ethereum address; the binding
     * is implicit because the wallet signs the proof submission transaction.
     *
     * This is NOT the vote circuit — vote.circom outputs (nullifierHash, voterHash)
     * are unrelated to address binding. Vote verification happens separately in
     * ZKVotingRobRulesWithCredentials when the user submits their vote.
     */
    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        // msg.sender is the Ethereum address that submitted the proof.
        // This is the correct binding for Polygon ID credential proofs.
        address user = msg.sender;

        if (votingContract != address(0)) {
            (bool success, ) = votingContract.call(
                abi.encodeWithSignature("setAllowedUser(address)", user)
            );
            if (success) {
                emit CredentialVerified(user);
            }
        }

        emit ProofSubmitted(user, requestId);
    }
}
