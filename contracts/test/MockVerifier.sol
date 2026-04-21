// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockVerifier
 * @dev Mock ZK verifier for testing - always returns true
 */
contract MockVerifier {
    function verifyProof(
        uint256[2] memory /* _pA */,
        uint256[2][2] memory /* _pB */,
        uint256[2] memory /* _pC */,
        uint256[] memory /* _pubSignals */
    ) external pure returns (bool) {
        return true;
    }
}