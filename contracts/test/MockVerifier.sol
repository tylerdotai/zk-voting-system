// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockVerifier {
    function verifyProof(
        uint256[2] memory,
        uint256[2][2] memory,
        uint256[2] memory,
        uint256[3] memory
    ) public pure returns (bool) {
        return true;
    }
}
