const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZKVoting", function () {
  let voting;
  let owner;
  let voter;

  beforeEach(async function () {
    [owner, voter] = await ethers.getSigners();
    
    const ZKVoting = await ethers.getContractFactory("ZKVoting");
    voting = await ZKVoting.deploy(3); // 3 choices
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct choice count", async function () {
      expect(await voting.choiceCount()).to.equal(3);
    });

    it("should set the owner correctly", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });
  });

  describe("Voting", function () {
    it("should allow casting a vote", async function () {
      const choice = 1;
      const nullifierHash = ethers.id("test-nullifier");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await voting.vote(choice, nullifierHash, proof);
      
      expect(await voting.getVoteCount(choice)).to.equal(1);
    });

    it("should reject invalid choices", async function () {
      const invalidChoice = 5;
      const nullifierHash = ethers.id("test-nullifier");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await expect(
        voting.vote(invalidChoice, nullifierHash, proof)
      ).to.be.revertedWith("Invalid choice");
    });

    it("should track total votes correctly", async function () {
      const nullifier1 = ethers.id("nullifier-1");
      const nullifier2 = ethers.id("nullifier-2");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await voting.vote(0, nullifier1, proof);
      await voting.vote(1, nullifier2, proof);

      expect(await voting.getTotalVotes()).to.equal(2);
    });
  });

  describe("Merkle Roots", function () {
    it("should allow owner to update voter merkle root", async function () {
      const newRoot = ethers.id("new-merkle-root");
      
      await voting.setVoterMerkleRoot(newRoot);
      
      expect(await voting.voterMerkleRoot()).to.equal(newRoot);
    });

    it("should allow owner to update voted merkle root", async function () {
      const newRoot = ethers.id("new-voted-root");
      
      await voting.setVotedMerkleRoot(newRoot);
      
      expect(await voting.votedMerkleRoot()).to.equal(newRoot);
    });

    it("should prevent non-owner from updating merkle roots", async function () {
      const newRoot = ethers.id("new-merkle-root");
      
      await expect(
        voting.connect(voter).setVoterMerkleRoot(newRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
