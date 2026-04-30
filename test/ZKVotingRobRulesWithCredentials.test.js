const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZKVotingRobRulesWithCredentials", function () {
  let contract;
  let mockVerifier;
  let chair;
  let member1;
  let member2;
  let member3;

  // Mock proof — MockVerifier is a no-op so any proof passes
  function mockProof(proposalId, nullifierHash, commitment) {
    return {
      pA: [1, 2],
      pB: [[1, 2], [3, 4]],
      pC: [1, 2],
      pubSignals: [String(proposalId), String(nullifierHash || 1111), String(commitment || 2222)],
    };
  }

  beforeEach(async function () {
    [chair, member1, member2, member3] = await ethers.getSigners();

    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    mockVerifier = await MockVerifier.deploy();
    await mockVerifier.waitForDeployment();

    const ZKVotingRobRules = await ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
    contract = await ZKVotingRobRules.deploy(
      await mockVerifier.getAddress(),
      chair.address,
      3
    );
    await contract.waitForDeployment();


    // Chair is not auto-added as eligible — add them first
    await contract.connect(chair).addVoter(chair.address);
  });

  describe("Deployment", function () {
    it("should set the correct chair", async function () {
      expect(await contract.chair()).to.equal(chair.address);
    });

    it("should initialize proposalCount to 0", async function () {
      expect(await contract.proposalCount()).to.equal(0);
    });
  });

  describe("Voter Management", function () {
    it("should allow chair to add a voter", async function () {
      await contract.connect(chair).addVoter(member1.address);
      expect(await contract.isEligible(member1.address)).to.equal(true);
    });

    it("should allow chair to remove a voter", async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).removeVoter(member1.address);
      expect(await contract.isEligible(member1.address)).to.equal(false);
    });

    it("should reject non-chair adding a voter", async function () {
      await expect(
        contract.connect(member1).addVoter(member2.address)
      ).to.be.reverted;
    });

    it("should reject non-chair removing a voter", async function () {
      await expect(
        contract.connect(member1).removeVoter(member2.address)
      ).to.be.reverted;
    });
  });

  describe("Proposal Lifecycle", function () {
    it("should allow chair to create a proposal", async function () {
      const tx = await contract.connect(chair).createProposal("Test motion");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "ProposalCreated");
      expect(event).to.exist;
      // event args: (proposalId, description, proposer)
      const [id, description, proposer] = event.args;
      expect(id).to.equal(0);
      expect(description).to.equal("Test motion");
      expect(proposer).to.equal(chair.address);
    });

    it("should track proposal count", async function () {
      await contract.connect(chair).createProposal("Motion 1");
      await contract.connect(chair).createProposal("Motion 2");
      expect(await contract.proposalCount()).to.equal(2);
    });

    it("should set state to Created on new proposal", async function () {
      await contract.connect(chair).createProposal("Test motion");
      const prop = await contract.getProposal(0);
      expect(prop[3]).to.equal(0); // state: Created (enum starts at 0)
    });
  });

  describe("Seconding (Rob's Rules)", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).addVoter(member2.address);
      await contract.connect(chair).createProposal("Test motion");
    });

    it("should allow a second eligible voter to second a proposal", async function () {
      await contract.connect(member1).secondProposal(0);
      const prop = await contract.getProposal(0);
      expect(prop[3]).to.equal(1); // state: Seconded
    });

    it("should not allow proposer to second own proposal", async function () {
      await expect(
        contract.connect(chair).secondProposal(0)
      ).to.be.reverted;
    });

    it("should not allow non-eligible to second", async function () {
      await expect(
        contract.connect(member3).secondProposal(0)
      ).to.be.reverted;
    });
  });

  describe("Opening Voting", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).createProposal("Test motion");
      await contract.connect(member1).secondProposal(0);
    });

    it("should allow chair to open voting after seconding", async function () {
      const ONE_WEEK = 7 * 24 * 3600;
      await contract.connect(chair).openVoting(0, ONE_WEEK);
      const prop = await contract.getProposal(0);
      expect(prop[3]).to.equal(2); // state: Voting
    });

    it("should reject opening before seconding", async function () {
      await contract.connect(chair).createProposal("Unseconded motion");
      await expect(
        contract.connect(chair).openVoting(1, 3600)
      ).to.be.reverted;
    });

    it("should reject non-chair opening voting", async function () {
      await expect(
        contract.connect(member1).openVoting(0, 3600)
      ).to.be.reverted;
    });
  });

  describe("Casting Votes", function () {
    const PROPOSAL_ID = 0;
    const ONE_WEEK = 7 * 24 * 3600;

    beforeEach(async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).addVoter(member2.address);
      await contract.connect(chair).createProposal("Test motion");
      await contract.connect(member1).secondProposal(0);
      await contract.connect(chair).openVoting(PROPOSAL_ID, ONE_WEEK);
    });

    async function castVote(voter, choice) {
      const nhBytes32 = ethers.ZeroHash;
      const proof = mockProof(PROPOSAL_ID);
      return contract.connect(voter).castVote(
        PROPOSAL_ID, choice, nhBytes32,
        proof.pA, proof.pB, proof.pC,
        proof.pubSignals
      );
    }

    it("should allow eligible voter to vote Yes", async function () {
      await castVote(member1, 0);
      const prop = await contract.getProposal(PROPOSAL_ID);
      expect(prop[9]).to.equal(1); // yesVotes
    });

    it("should allow eligible voter to vote No", async function () {
      await castVote(member1, 1);
      const prop = await contract.getProposal(PROPOSAL_ID);
      expect(prop[10]).to.equal(1); // noVotes
    });

    it("should allow eligible voter to Abstain", async function () {
      await castVote(member1, 2);
      const prop = await contract.getProposal(PROPOSAL_ID);
      expect(prop[11]).to.equal(1); // abstainVotes
    });

    it("should reject double voting", async function () {
      await castVote(member1, 0);
      await expect(castVote(member1, 1)).to.be.reverted;
    });

    it("should track hasVoted correctly", async function () {
      await castVote(member1, 0);
      expect(await contract.hasVoted(PROPOSAL_ID, member1.address)).to.equal(true);
    });

    it("should reject ineligible voter", async function () {
      await expect(castVote(member3, 0)).to.be.reverted;
    });
  });

  describe("Finalizing Proposals", function () {
    const PROPOSAL_ID = 0;
    const ONE_HOUR = 3600;

    beforeEach(async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).createProposal("Test motion");
      await contract.connect(member1).secondProposal(0);
      await contract.connect(chair).openVoting(PROPOSAL_ID, ONE_HOUR);
    });

    it("should pass when yes > no", async function () {
      const nhBytes32 = ethers.ZeroHash;
      const proof = mockProof(PROPOSAL_ID);
      await contract.connect(member1).castVote(PROPOSAL_ID, 0, nhBytes32, proof.pA, proof.pB, proof.pC, proof.pubSignals);
      await time.increase(Number(ONE_HOUR) + 1);
      await contract.connect(chair).finalizeProposal(PROPOSAL_ID);
      const prop = await contract.getProposal(PROPOSAL_ID);
      expect(prop[3]).to.equal(3); // state: Passed
    });

    it("should reject finalizing before voting ends", async function () {
      await expect(
        contract.connect(chair).finalizeProposal(PROPOSAL_ID)
      ).to.be.reverted;
    });
  });

  describe("Amendments", function () {
    const PROPOSAL_ID = 0;

    beforeEach(async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).createProposal("Main motion");
      await contract.connect(member1).secondProposal(PROPOSAL_ID);
    });

    it("should allow eligible voter to submit amendment", async function () {
      const tx = await contract.connect(member1).submitAmendment(PROPOSAL_ID, "Friendly amendment");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AmendmentSubmitted");
      expect(event).to.exist;
    });

    it("should allow chair to approve amendment", async function () {
      await contract.connect(member1).submitAmendment(PROPOSAL_ID, "Friendly amendment");
      await contract.connect(chair).approveAmendment(PROPOSAL_ID, 0);
      const amendment = await contract.getAmendment(PROPOSAL_ID, 0);
      expect(amendment[2]).to.equal(true); // approved
    });
  });

  describe("Call for Division", function () {
    const ONE_WEEK = 7 * 24 * 3600;


    beforeEach(async function () {
      await contract.connect(chair).addVoter(member1.address);
      await contract.connect(chair).createProposal("Test motion");
      await contract.connect(member1).secondProposal(0);
      await contract.connect(chair).openVoting(0, ONE_WEEK);
    });

    it("should allow any member to call for division", async function () {
      // Call for division should not revert
      await expect(contract.connect(member1).callForDivision(0)).to.not.be.reverted;
    });
  });
});
