const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZKVotingSimple", function () {
  let voting;
  let owner;
  let voter1;
  let voter2;
  let mockVerifier;

  function mockProof(proposalId, nullifierHash, commitment) {
    return {
      pA: [1, 2],
      pB: [[1, 2], [3, 4]],
      pC: [1, 2],
      pubSignals: [String(proposalId), String(nullifierHash), String(commitment)],
    };
  }

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    mockVerifier = await MockVerifier.deploy();
    await mockVerifier.waitForDeployment();

    const ZKVotingSimple = await ethers.getContractFactory("ZKVotingSimple");
    voting = await ZKVotingSimple.deploy(await mockVerifier.getAddress());
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set CHOICE_COUNT to 3", async function () {
      expect(await voting.CHOICE_COUNT()).to.equal(3);
    });

    it("should make deployer eligible by default", async function () {
      expect(await voting.allowedUsers(owner.address)).to.equal(true);
    });
  });

  describe("Voter Management", function () {
    it("should allow chair to add a voter", async function () {
      await voting.connect(owner).addVoter(voter1.address);
      expect(await voting.allowedUsers(voter1.address)).to.equal(true);
    });

    it("should allow chair to remove a voter", async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).removeVoter(voter1.address);
      expect(await voting.allowedUsers(voter1.address)).to.equal(false);
    });

    it("should reject non-chair adding a voter", async function () {
      await expect(
        voting.connect(voter1).addVoter(voter2.address)
      ).to.be.revertedWith("Only chair");
    });

    it("should reject removing chair", async function () {
      await expect(
        voting.connect(owner).removeVoter(owner.address)
      ).to.be.revertedWith("Cannot remove chair");
    });
  });

  describe("Proposal Creation", function () {
    it("should allow chair to create a proposal", async function () {
      const tx = await voting.connect(owner).createProposal("Fund new initiative");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "ProposalCreated");
      expect(event).to.exist;
      const [id, proposer, description] = event.args;
      expect(id).to.equal(0);
      expect(proposer).to.equal(owner.address);
      expect(description).to.equal("Fund new initiative");
    });

    it("should increment proposalCount", async function () {
      await voting.connect(owner).createProposal("Motion 1");
      await voting.connect(owner).createProposal("Motion 2");
      expect(await voting.proposalCount()).to.equal(2);
    });

    it("should set state to Created on new proposal", async function () {
      await voting.connect(owner).createProposal("Fund new initiative");
      const prop = await voting.getProposal(0);
      expect(prop[2]).to.equal(0); // state: Created
    });
  });

  describe("Opening Voting", function () {
    it("should allow chair to open voting", async function () {
      await voting.connect(owner).createProposal("Motion 1");
      const ONE_WEEK = 7 * 24 * 3600;
      await voting.connect(owner).openVoting(0, ONE_WEEK);
      const prop = await voting.getProposal(0);
      expect(prop[2]).to.equal(1); // state: Voting
    });

    it("should reject non-chair opening voting", async function () {
      await voting.connect(owner).createProposal("Motion 1");
      await expect(
        voting.connect(voter1).openVoting(0, 3600)
      ).to.be.revertedWith("Only chair");
    });
  });

  describe("Casting Votes", function () {
    const PROPOSAL_ID = 0;
    const ONE_WEEK = 7 * 24 * 3600;

    beforeEach(async function () {
      await voting.connect(owner).createProposal("Fund new initiative");
      await voting.connect(owner).openVoting(PROPOSAL_ID, ONE_WEEK);
    });

    async function castVote(voter, choice) {
      const nhBytes32 = ethers.ZeroHash;
      const proof = mockProof(PROPOSAL_ID, 1111, 2222);
      return voting.connect(voter).castVote(
        PROPOSAL_ID, choice, nhBytes32,
        proof.pA, proof.pB, proof.pC,
        proof.pubSignals
      );
    }

    it("should allow eligible voter to vote Yes", async function () {
      await castVote(owner, 0);
      const prop = await voting.getProposal(PROPOSAL_ID);
      expect(prop[5]).to.equal(1); // yesVotes
    });

    it("should allow eligible voter to vote No", async function () {
      await castVote(owner, 1);
      const prop = await voting.getProposal(PROPOSAL_ID);
      expect(prop[6]).to.equal(1); // noVotes
    });

    it("should allow eligible voter to Abstain", async function () {
      await castVote(owner, 2);
      const prop = await voting.getProposal(PROPOSAL_ID);
      expect(prop[7]).to.equal(1); // abstainVotes
    });

    it("should reject ineligible voter", async function () {
      await expect(castVote(voter2, 0)).to.be.revertedWith("Not eligible");
    });

    it("should reject double voting", async function () {
      await castVote(owner, 0);
      await expect(castVote(owner, 1)).to.be.revertedWith("Already voted");
    });

    it("should track hasVotedOnProposal correctly", async function () {
      await castVote(owner, 0);
      expect(await voting.hasVotedOnProposal(PROPOSAL_ID, owner.address)).to.equal(true);
    });
  });

  describe("Finalization", function () {
    const PROPOSAL_ID = 0;
    const ONE_HOUR = 3600;

    beforeEach(async function () {
      await voting.connect(owner).createProposal("Fund new initiative");
      await voting.connect(owner).openVoting(PROPOSAL_ID, ONE_HOUR);
    });

    async function castVoteAndFinalize(choice, advanceTime) {
      const nhBytes32 = ethers.ZeroHash;
      const proof = mockProof(PROPOSAL_ID, 1111, 2222);
      await voting.castVote(PROPOSAL_ID, choice, nhBytes32, proof.pA, proof.pB, proof.pC, proof.pubSignals);
      if (advanceTime) {
        await time.increase(Number(ONE_HOUR) + 1);
      }
      await voting.connect(owner).finalizeProposal(PROPOSAL_ID);
    }

    it("should pass when yes > no", async function () {
      await castVoteAndFinalize(0, true);
      const prop = await voting.getProposal(PROPOSAL_ID);
      expect(prop[2]).to.equal(2); // Passed
    });

    it("should fail when no >= yes", async function () {
      await castVoteAndFinalize(1, true);
      const prop = await voting.getProposal(PROPOSAL_ID);
      expect(prop[2]).to.equal(3); // Failed
    });

    it("should reject finalizing before voting ends", async function () {
      await expect(
        voting.connect(owner).finalizeProposal(PROPOSAL_ID)
      ).to.be.revertedWith("Voting still open");
    });

    it("should reject non-chair finalizing", async function () {
      await time.increase(Number(ONE_HOUR) + 1);
      await expect(
        voting.connect(voter1).finalizeProposal(PROPOSAL_ID)
      ).to.be.revertedWith("Only chair");
    });
  });
});
