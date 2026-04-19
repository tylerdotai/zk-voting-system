const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * gov-verifier-integration.test.js
 * 
 * Tests Phase 3 credential gate logic for ZKVotingRobRulesWithCredentials + GovVerifier.
 * 
 * Credential flow:
 *  1. User submits ZKP via GovVerifier.submitZKPResponse()
 *  2. GovVerifier._afterProofSubmit() → setAllowedUser(user) on voting contract
 *  3. Voting contract marks user as allowedUsers[user] = true
 *  4. User can now call requiresCredential-gated functions
 * 
 * Key assertions:
 *  A. Only the stored GovVerifier address can call setAllowedUser (EOA calls rejected)
 *  B. Unverified users are blocked from all credential-gated actions
 *  C. setZKPRequest must be initialized before submitZKPResponse accepts proofs
 *  D. After verification, users can engage in the governance flow
 */

describe("GovVerifier Credential Gate Integration", function () {
  let govVerifier;
  let votingContract;
  let owner;
  let user;
  let attacker;

  beforeEach(async function () {
    [owner, user, attacker] = await ethers.getSigners();

    // Deploy GovVerifier first (needs voting address for constructor)
    const GovVerifier = await ethers.getContractFactory("GovVerifier");
    govVerifier = await GovVerifier.deploy(ethers.ZeroAddress);
    await govVerifier.waitForDeployment();
    const govAddr = await govVerifier.getAddress();

    // Deploy voting with real GovVerifier address
    const ZKVoting = await ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
    votingContract = await ZKVoting.deploy(govAddr, owner.address, 3);
    await votingContract.waitForDeployment();

    // Wire voting into GovVerifier
    await govVerifier.setVotingContract(await votingContract.getAddress());
  });

  // =====================================================================
  // A. setAllowedUser is protected — only GovVerifier contract can call it
  // =====================================================================

  describe("A. setAllowedUser authorization", function () {
    it("only GovVerifier contract address can call setAllowedUser", async function () {
      const govStored = await votingContract.govVerifier();
      const govAddr = await govVerifier.getAddress();
      expect(govStored).to.equal(govAddr);

      // An EOA (attacker) cannot call it
      await expect(
        votingContract.connect(attacker).setAllowedUser(user.address)
      ).to.be.revertedWith("Only GovVerifier can perform this action");
    });

    it("owner (EOA) cannot bypass GovVerifier via setAllowedUser", async function () {
      await expect(
        votingContract.connect(owner).setAllowedUser(user.address)
      ).to.be.revertedWith("Only GovVerifier can perform this action");
    });

    it("attacker cannot grant themselves credential", async function () {
      await expect(
        votingContract.connect(attacker).setAllowedUser(attacker.address)
      ).to.be.revertedWith("Only GovVerifier can perform this action");
    });
  });

  // =====================================================================
  // B. Unverified users are blocked from all credential-gated actions
  // =====================================================================

  describe("B. Unverified user is blocked", function () {
    beforeEach(async function () {
      // Only owner/chair is verified (via testSetAllowedUser — owner-only bypass)
      await votingContract.connect(owner).testSetAllowedUser(owner.address);
    });

    it("user cannot createProposal (onlyChair + requiresCredential)", async function () {
      await expect(
        votingContract.connect(user).createProposal("Unauthorized")
      ).to.be.reverted;
    });

    it("user cannot submitAmendment (requiresCredential)", async function () {
      await votingContract.connect(owner).createProposal("Test");
      await votingContract.connect(owner).secondProposal(0);
      await expect(
        votingContract.connect(user).submitAmendment(0, "Unauthorized amendment")
      ).to.be.reverted;
    });

    it("user cannot vote (requiresCredential)", async function () {
      await votingContract.connect(owner).createProposal("Test");
      await votingContract.connect(owner).secondProposal(0);
      await votingContract.connect(owner).openVoting(0, 60);
      const proof = Array(8).fill(ethers.ZeroHash);
      await expect(
        votingContract.connect(user).voteOnMotion(0, 0, ethers.id("v1"), proof)
      ).to.be.reverted;
    });
  });

  // =====================================================================
  // C. setZKPRequest must be initialized before proof submission works
  // =====================================================================

  describe("C. Verifier initialization required", function () {
    it("submitZKPResponse reverts when no request is initialized", async function () {
      const fakeProof = Array(8).fill(ethers.ZeroHash);
      await expect(
        govVerifier.submitZKPResponse(1, fakeProof, [0, 0], [[0, 0], [0, 0]], [0, 0])
      ).to.be.reverted;
    });
  });

  // =====================================================================
  // D. After verification, users can engage in governance
  // Uses testSetAllowedUser (owner-only test bypass — not in production)
  // =====================================================================

  describe("D. Authorized user governance flow", function () {
    beforeEach(async function () {
      await votingContract.connect(owner).testSetAllowedUser(owner.address);
    });

    it("user becomes allowed after testSetAllowedUser", async function () {
      await votingContract.connect(owner).testSetAllowedUser(user.address);
      expect(await votingContract.allowedUsers(user.address)).to.equal(true);
    });

    it("verified user can submit amendment (not chair, but verified)", async function () {
      await votingContract.connect(owner).testSetAllowedUser(user.address);
      await votingContract.connect(owner).createProposal("Test");
      await votingContract.connect(owner).secondProposal(0);
      await votingContract.connect(user).submitAmendment(0, "User's amendment");
      const proposal = await votingContract.getProposal(0);
      expect(proposal.amendmentCount).to.equal(1);
    });

    it("verified user can vote", async function () {
      await votingContract.connect(owner).testSetAllowedUser(user.address);
      await votingContract.connect(owner).createProposal("Test");
      await votingContract.connect(owner).secondProposal(0);
      await votingContract.connect(owner).openVoting(0, 60);
      const proof = Array(8).fill(ethers.ZeroHash);
      await votingContract.connect(user).voteOnMotion(0, 0, ethers.id("v1"), proof);
      const proposal = await votingContract.proposals(0);
      expect(proposal.yesVotes).to.equal(1);
    });

    it("non-chair verified user cannot createProposal (onlyChair guard)", async function () {
      await votingContract.connect(owner).testSetAllowedUser(user.address);
      await expect(
        votingContract.connect(user).createProposal("Not chair")
      ).to.be.revertedWith("Only chair can perform this action");
    });

    it("verified chair can createProposal", async function () {
      // owner is chair AND verified
      await votingContract.connect(owner).createProposal("Chair's proposal");
      expect(await votingContract.proposalCount()).to.equal(1);
    });
  });
});