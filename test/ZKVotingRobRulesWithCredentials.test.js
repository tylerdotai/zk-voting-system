const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZKVotingRobRulesWithCredentials", function () {
  let contract;
  let owner;
  let chair;
  let member1;
  let member2;
  let proof;

  beforeEach(async function () {
    [owner, chair, member1, member2] = await ethers.getSigners();
    
    const ZKVotingRobRulesWithCredentials = await ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
    contract = await ZKVotingRobRulesWithCredentials.deploy(
      owner.address, // Use owner as placeholder GovVerifier
      chair.address,
      3 // Yes, No, Abstain
    );
    await contract.waitForDeployment();
    
    proof = [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
             ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash];
  });

  describe("Deployment", function () {
    it("should set the correct chair", async function () {
      expect(await contract.chair()).to.equal(chair.address);
    });

    it("should set the correct choice count", async function () {
      expect(await contract.choiceCount()).to.equal(3);
    });

    it("should initialize with zero proposals", async function () {
      expect(await contract.proposalCount()).to.equal(0);
    });
  });

  describe("Credential Verification", function () {
    it("should allow setting allowed user", async function () {
      await contract.connect(owner).setAllowedUser(member1.address);
      expect(await contract.allowedUsers(member1.address)).to.equal(true);
    });

    it("should emit CredentialVerified event", async function () {
      await expect(contract.connect(owner).setAllowedUser(member1.address))
        .to.emit(contract, "CredentialVerified")
        .withArgs(member1.address);
    });

    it("should return false for unverified users", async function () {
      expect(await contract.allowedUsers(member1.address)).to.equal(false);
    });

    it("should return true for verified users", async function () {
      await contract.connect(owner).setAllowedUser(member1.address);
      expect(await contract.allowedUsers(member1.address)).to.equal(true);
    });
  });

  describe("Chair Management", function () {
    it("should allow owner to change chair", async function () {
      await contract.connect(owner).setChair(member1.address);
      expect(await contract.chair()).to.equal(member1.address);
    });

    it("should emit ChairUpdated event", async function () {
      await expect(contract.connect(owner).setChair(member1.address))
        .to.emit(contract, "ChairUpdated")
        .withArgs(chair.address, member1.address);
    });

    it("should reject non-owner changing chair", async function () {
      await expect(
        contract.connect(member1).setChair(member2.address)
      ).to.be.reverted;
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await contract.connect(owner).setAllowedUser(chair.address);
    });

    it("should allow verified chair to create proposal", async function () {
      await contract.connect(chair).createProposal("Test proposal");
      expect(await contract.proposalCount()).to.equal(1);
    });

    it("should reject non-chair from creating proposal", async function () {
      await contract.connect(owner).setAllowedUser(member1.address);
      await expect(
        contract.connect(member1).createProposal("Unauthorized")
      ).to.be.revertedWith("Only chair can perform this action");
    });
  });

  describe("Voting with Credentials", function () {
    beforeEach(async function () {
      // Verify everyone
      await contract.connect(owner).setAllowedUser(chair.address);
      await contract.connect(owner).setAllowedUser(member1.address);
      await contract.connect(owner).setAllowedUser(member2.address);
      
      // Create and open voting
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 60);
    });

    it("should allow verified member to vote Yes", async function () {
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), proof);
      const proposal = await contract.proposals(0);
      expect(proposal.yesVotes).to.equal(1);
    });

    it("should allow verified member to vote No", async function () {
      await contract.connect(member1).voteOnMotion(0, 1, ethers.id("v1"), proof);
      const proposal = await contract.proposals(0);
      expect(proposal.noVotes).to.equal(1);
    });

    it("should reject double voting", async function () {
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), proof);
      await expect(
        contract.connect(member1).voteOnMotion(0, 1, ethers.id("v1"), proof)
      ).to.be.revertedWith("Already voted");
    });

    it("should pass when yes > no", async function () {
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), proof);
      await contract.connect(member2).voteOnMotion(0, 0, ethers.id("v2"), proof);
      await time.increase(61);
      await contract.finalizeProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(3); // Passed
    });

    it("should fail when no >= yes", async function () {
      await contract.connect(member1).voteOnMotion(0, 1, ethers.id("v1"), proof);
      await contract.connect(member2).voteOnMotion(0, 0, ethers.id("v2"), proof);
      await time.increase(61);
      await contract.finalizeProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(4); // Failed
    });
  });
});
