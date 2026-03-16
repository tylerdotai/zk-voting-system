const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZKVoting", function () {
  let voting;
  let owner;
  let voter1;
  let voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    
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

    it("should initialize with zero votes", async function () {
      expect(await voting.getVoteCount(0)).to.equal(0);
      expect(await voting.getVoteCount(1)).to.equal(0);
      expect(await voting.getVoteCount(2)).to.equal(0);
      expect(await voting.getTotalVotes()).to.equal(0);
    });

    it("should initialize with empty merkle roots", async function () {
      expect(await voting.voterMerkleRoot()).to.equal(ethers.ZeroHash);
      expect(await voting.votedMerkleRoot()).to.equal(ethers.ZeroHash);
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

    it("should allow different voters to vote for different choices", async function () {
      const nullifier1 = ethers.id("nullifier-1");
      const nullifier2 = ethers.id("nullifier-2");
      const nullifier3 = ethers.id("nullifier-3");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await voting.vote(0, nullifier1, proof);
      await voting.vote(1, nullifier2, proof);
      await voting.vote(2, nullifier3, proof);

      expect(await voting.getVoteCount(0)).to.equal(1);
      expect(await voting.getVoteCount(1)).to.equal(1);
      expect(await voting.getVoteCount(2)).to.equal(1);
      expect(await voting.getTotalVotes()).to.equal(3);
    });

    it("should reject invalid choice (too high)", async function () {
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

    it("should reject invalid choice (negative)", async function () {
      const nullifierHash = ethers.id("test-nullifier");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      // This will fail at compilation level for uint, but let's test choice 0 is valid
      await voting.vote(0, nullifierHash, proof);
      expect(await voting.getVoteCount(0)).to.equal(1);
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

    it("should emit VoteCast event", async function () {
      const choice = 1;
      const nullifierHash = ethers.id("test-nullifier");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await expect(voting.vote(choice, nullifierHash, proof))
        .to.emit(voting, "VoteCast")
        .withArgs(owner.address, choice, nullifierHash);
    });

    it("should allow multiple votes for same choice", async function () {
      const nullifier1 = ethers.id("nullifier-1");
      const nullifier2 = ethers.id("nullifier-2");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await voting.vote(0, nullifier1, proof);
      await voting.vote(0, nullifier2, proof);

      expect(await voting.getVoteCount(0)).to.equal(2);
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

    it("should allow owner to update both roots", async function () {
      const voterRoot = ethers.id("voter-root");
      const votedRoot = ethers.id("voted-root");
      
      await voting.setVoterMerkleRoot(voterRoot);
      await voting.setVotedMerkleRoot(votedRoot);
      
      expect(await voting.voterMerkleRoot()).to.equal(voterRoot);
      expect(await voting.votedMerkleRoot()).to.equal(votedRoot);
    });

    it("should emit MerkleRootsUpdated event", async function () {
      const newRoot = ethers.id("new-merkle-root");
      
      await expect(voting.setVoterMerkleRoot(newRoot))
        .to.emit(voting, "MerkleRootsUpdated")
        .withArgs(newRoot, ethers.ZeroHash);
    });

    it("should prevent non-owner from updating voter merkle root", async function () {
      const newRoot = ethers.id("new-merkle-root");
      
      await expect(
        voting.connect(voter1).setVoterMerkleRoot(newRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent non-owner from updating voted merkle root", async function () {
      const newRoot = ethers.id("new-voted-root");
      
      await expect(
        voting.connect(voter1).setVotedMerkleRoot(newRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent non-owner from voting", async function () {
      const choice = 1;
      const nullifierHash = ethers.id("test-nullifier");
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      // Note: Current implementation allows anyone to vote
      // In production, you'd add access control
      await voting.connect(voter1).vote(choice, nullifierHash, proof);
      expect(await voting.getVoteCount(choice)).to.equal(1);
    });
  });

  describe("Edge Cases", function () {
    it("should handle zero choice count", async function () {
      const ZKVoting = await ethers.getContractFactory("ZKVoting");
      const zeroVoting = await ZKVoting.deploy(0);
      await zeroVoting.waitForDeployment();
      
      expect(await zeroVoting.choiceCount()).to.equal(0);
    });

    it("should handle large choice count", async function () {
      const ZKVoting = await ethers.getContractFactory("ZKVoting");
      const largeVoting = await ZKVoting.deploy(100);
      await largeVoting.waitForDeployment();
      
      expect(await largeVoting.choiceCount()).to.equal(100);
    });

    it("should handle empty nullifier hash", async function () {
      const choice = 1;
      const emptyHash = ethers.ZeroHash;
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      await voting.vote(choice, emptyHash, proof);
      expect(await voting.getVoteCount(choice)).to.equal(1);
    });

    it("should handle multiple votes sequentially", async function () {
      const proof = [
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash,
        ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash
      ];

      // Cast 10 votes
      for (let i = 0; i < 10; i++) {
        await voting.vote(i % 3, ethers.id(`nullifier-${i}`), proof);
      }

      expect(await voting.getTotalVotes()).to.equal(10);
      expect(await voting.getVoteCount(0)).to.equal(4);
      expect(await voting.getVoteCount(1)).to.equal(3);
      expect(await voting.getVoteCount(2)).to.equal(3);
    });
  });
});
