const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZKVotingWithCredentials", function () {
  let contract;
  let owner;
  let voter1;
  let voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    
    const ZKVotingWithCredentials = await ethers.getContractFactory("ZKVotingWithCredentials");
    contract = await ZKVotingWithCredentials.deploy(owner.address); // Use owner as placeholder GovVerifier
    await contract.waitForDeployment();
  });

  describe("View Functions", function () {
    it("should return isCredentialVerified correctly", async function () {
      expect(await contract.isCredentialVerified(voter1.address)).to.equal(false);
      await contract.connect(owner).setAllowedUser(voter1.address);
      expect(await contract.isCredentialVerified(voter1.address)).to.equal(true);
    });
  });

  describe("GovVerifier Management", function () {
    it("should allow owner to set GovVerifier", async function () {
      await contract.connect(owner).setGovVerifier(voter1.address);
      // Just verify it doesn't revert
    });

    it("should reject setting GovVerifier to zero address", async function () {
      await expect(
        contract.connect(owner).setGovVerifier(ethers.ZeroAddress)
      ).to.be.revertedWith("GovVerifier cannot be zero");
    });
  });

  describe("Deployment", function () {
    it("should set the owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should initialize with zero votes", async function () {
      const [yes, no, abstain] = await contract.getVoteCounts();
      expect(yes).to.equal(0);
      expect(no).to.equal(0);
      expect(abstain).to.equal(0);
    });
  });

  describe("Credential Verification", function () {
    it("should allow owner to manually verify a voter", async function () {
      await contract.connect(owner).setAllowedUser(voter1.address);
      expect(await contract.allowedUsers(voter1.address)).to.equal(true);
    });

    it("should allow anyone to call setAllowedUser (simulating GovVerifier)", async function () {
      // In the real system, GovVerifier calls this after ZK proof verification
      await contract.connect(voter2).setAllowedUser(voter1.address);
      expect(await contract.allowedUsers(voter1.address)).to.equal(true);
    });

    it("should emit CredentialVerified event", async function () {
      await expect(contract.connect(owner).setAllowedUser(voter1.address))
        .to.emit(contract, "CredentialVerified")
        .withArgs(voter1.address);
    });

    it("should return false for unverified users", async function () {
      expect(await contract.allowedUsers(voter1.address)).to.equal(false);
    });

    it("should return true for verified users", async function () {
      await contract.connect(owner).setAllowedUser(voter1.address);
      expect(await contract.allowedUsers(voter1.address)).to.equal(true);
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await contract.connect(owner).setAllowedUser(voter1.address);
      await contract.connect(owner).setAllowedUser(voter2.address);
    });

    it("should allow verified user to vote Yes", async function () {
      await contract.connect(voter1).vote(0);
      const [yes, no, abstain] = await contract.getVoteCounts();
      expect(yes).to.equal(1);
      expect(no).to.equal(0);
      expect(abstain).to.equal(0);
    });

    it("should allow verified user to vote No", async function () {
      await contract.connect(voter1).vote(1);
      const [yes, no, abstain] = await contract.getVoteCounts();
      expect(yes).to.equal(0);
      expect(no).to.equal(1);
      expect(abstain).to.equal(0);
    });

    it("should allow verified user to vote Abstain", async function () {
      await contract.connect(voter1).vote(2);
      const [yes, no, abstain] = await contract.getVoteCounts();
      expect(yes).to.equal(0);
      expect(no).to.equal(0);
      expect(abstain).to.equal(1);
    });

    it("should reject double voting", async function () {
      await contract.connect(voter1).vote(0);
      await expect(
        contract.connect(voter1).vote(1)
      ).to.be.revertedWith("Already voted");
    });

    it("should reject invalid choice", async function () {
      await expect(
        contract.connect(voter1).vote(5)
      ).to.be.revertedWith("Invalid choice");
    });

    it("should emit VoteCast event", async function () {
      await expect(contract.connect(voter1).vote(0))
        .to.emit(contract, "VoteCast")
        .withArgs(voter1.address, 0);
    });

    it("should track total votes correctly", async function () {
      await contract.connect(voter1).vote(0);
      await contract.connect(voter2).vote(1);
      expect(await contract.getTotalVotes()).to.equal(2);
    });
  });

  describe("Unverified User Restrictions", function () {
    it("should reject unverified user from voting", async function () {
      // Neither voter1 nor voter2 are verified in this block
      await expect(
        contract.connect(voter1).vote(0)
      ).to.be.revertedWith("Credential not verified");
    });
  });

  describe("Multiple Voters", function () {
    it("should handle multiple yes votes", async function () {
      // Verify and vote with voter1 and voter2
      await contract.connect(owner).setAllowedUser(voter1.address);
      await contract.connect(owner).setAllowedUser(voter2.address);
      
      await contract.connect(voter1).vote(0);
      await contract.connect(voter2).vote(0);
      
      const [yes, no, abstain] = await contract.getVoteCounts();
      expect(yes).to.equal(2);
    });

    it("should handle mixed votes", async function () {
      await contract.connect(owner).setAllowedUser(voter1.address);
      await contract.connect(owner).setAllowedUser(voter2.address);
      
      await contract.connect(voter1).vote(0);
      await contract.connect(voter2).vote(1);
      
      const [yes, no, abstain] = await contract.getVoteCounts();
      expect(yes).to.equal(1);
      expect(no).to.equal(1);
    });
  });
});
