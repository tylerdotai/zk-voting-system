const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovVerifier", function () {
  let govVerifier;
  let owner;
  let votingContract;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy a mock voting contract first
    const MockVoting = await ethers.getContractFactory("ZKVotingWithCredentials");
    votingContract = await MockVoting.deploy(owner.address);
    await votingContract.waitForDeployment();
    
    // Deploy GovVerifier with the voting contract address
    const GovVerifier = await ethers.getContractFactory("GovVerifier");
    govVerifier = await GovVerifier.deploy(votingContract.getAddress());
    await govVerifier.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the voting contract", async function () {
      expect(await govVerifier.votingContract()).to.equal(await votingContract.getAddress());
    });

    it("should set the owner", async function () {
      expect(await govVerifier.owner()).to.equal(owner.address);
    });

    it("should set TRANSFER_REQUEST_ID to 1", async function () {
      expect(await govVerifier.TRANSFER_REQUEST_ID()).to.equal(1);
    });
  });

  describe("Voting Contract Management", function () {
    it("should allow owner to set voting contract", async function () {
      await govVerifier.connect(owner).setVotingContract(user.address);
      expect(await govVerifier.votingContract()).to.equal(user.address);
    });

    it("should reject non-owner setting voting contract", async function () {
      await expect(
        govVerifier.connect(user).setVotingContract(user.address)
      ).to.be.reverted;
    });
  });

  describe("Credential Verification Flow", function () {
    it("should be able to call setAllowedUser on the voting contract", async function () {
      // Simulate what happens after ZKP verification
      // In a real scenario, GovVerifier would call votingContract.setAllowedUser(user)
      // Here we test that the connection works
      const tx = await votingContract.connect(owner).setAllowedUser(user.address);
      await tx.wait();
      
      expect(await votingContract.allowedUsers(user.address)).to.equal(true);
    });
  });
});
