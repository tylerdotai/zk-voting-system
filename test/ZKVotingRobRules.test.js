const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZKVotingRobRules", function () {
  let contract;
  let owner;
  let chair;
  let member1;
  let member2;
  let member3;
  let proof;

  beforeEach(async function () {
    [owner, chair, member1, member2, member3] = await ethers.getSigners();
    
    const ZKVotingRobRules = await ethers.getContractFactory("ZKVotingRobRules");
    contract = await ZKVotingRobRules.deploy(chair.address, 3);
    await contract.waitForDeployment();
    
    // Default proof array
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

    it("should reject setting chair to zero address", async function () {
      await expect(
        contract.connect(owner).setChair(ethers.ZeroAddress)
      ).to.be.revertedWith("Chair cannot be zero address");
    });
  });

  describe("Proposal Creation", function () {
    it("should allow chair to create a proposal", async function () {
      const tx = await contract.connect(chair).createProposal("Test proposal");
      const receipt = await tx.wait();
      
      expect(await contract.proposalCount()).to.equal(1);
      expect(receipt.logs[0].args.proposalId).to.equal(0);
    });

    it("should set proposal state to Created", async function () {
      await contract.connect(chair).createProposal("Test proposal");
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(0);
    });

    it("should reject non-chair creating proposal", async function () {
      await expect(
        contract.connect(member1).createProposal("Unauthorized")
      ).to.be.revertedWith("Only chair can perform this action");
    });

    it("should reject empty description", async function () {
      await expect(
        contract.connect(chair).createProposal("")
      ).to.be.revertedWith("Description cannot be empty");
    });
  });

  describe("Proposal Seconding", function () {
    beforeEach(async function () {
      await contract.connect(chair).createProposal("Test proposal");
    });

    it("should allow chair to second proposal", async function () {
      await contract.connect(chair).secondProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(1);
    });

    it("should emit ProposalSeconded event", async function () {
      await expect(contract.connect(chair).secondProposal(0))
        .to.emit(contract, "ProposalSeconded")
        .withArgs(0);
    });

    it("should reject non-chair seconding", async function () {
      await expect(
        contract.connect(member1).secondProposal(0)
      ).to.be.revertedWith("Only chair can perform this action");
    });

    it("should reject seconding already seconded proposal", async function () {
      await contract.connect(chair).secondProposal(0);
      await expect(
        contract.connect(chair).secondProposal(0)
      ).to.be.revertedWith("Proposal must be in Created state");
    });
  });

  describe("Amendments", function () {
    beforeEach(async function () {
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
    });

    it("should allow member to submit amendment", async function () {
      const tx = await contract.connect(member1).submitAmendment(0, "Add clause A");
      const receipt = await tx.wait();
      expect(receipt.logs[0].args.proposalId).to.equal(0);
    });

    it("should reject amendment in Created state", async function () {
      await contract.connect(chair).createProposal("Another proposal");
      await expect(
        contract.connect(member1).submitAmendment(1, "Too early")
      ).to.be.revertedWith("Proposal must be in Seconded state");
    });

    it("should allow chair to approve amendment", async function () {
      await contract.connect(member1).submitAmendment(0, "Add clause A");
      await contract.connect(chair).approveAmendment(0, 0);
      const amendment = await contract.getAmendment(0, 0);
      expect(amendment.approved).to.equal(true);
    });

    it("should reject non-chair approving amendment", async function () {
      await contract.connect(member1).submitAmendment(0, "Add clause A");
      await expect(
        contract.connect(member2).approveAmendment(0, 0)
      ).to.be.revertedWith("Only chair can perform this action");
    });
  });

  describe("Voting Period", function () {
    beforeEach(async function () {
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
    });

    it("should allow chair to open voting", async function () {
      await contract.connect(chair).openVoting(0, 3 * 24 * 60 * 60);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(2);
    });

    it("should set voting end time", async function () {
      const duration = 3 * 24 * 60 * 60;
      await contract.connect(chair).openVoting(0, duration);
      const proposal = await contract.proposals(0);
      expect(proposal.votingEndsAt).to.be.gt(proposal.votingStartsAt);
    });

    it("should reject non-chair opening voting", async function () {
      await expect(
        contract.connect(member1).openVoting(0, 3 * 24 * 60 * 60)
      ).to.be.revertedWith("Only chair can perform this action");
    });

    it("should reject zero duration", async function () {
      await expect(
        contract.connect(chair).openVoting(0, 0)
      ).to.be.revertedWith("Invalid voting duration");
    });

    it("should reject duration over 7 days", async function () {
      await expect(
        contract.connect(chair).openVoting(0, 8 * 24 * 60 * 60)
      ).to.be.revertedWith("Invalid voting duration");
    });
  });

  describe("Voting on Motion", function () {
    beforeEach(async function () {
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 3 * 24 * 60 * 60);
    });

    it("should allow voting Yes", async function () {
      const nullifierHash = ethers.id("nullifier");
      await contract.connect(member1).voteOnMotion(0, 0, nullifierHash, proof);
      const proposal = await contract.proposals(0);
      expect(proposal.yesVotes).to.equal(1);
    });

    it("should allow voting No", async function () {
      const nullifierHash = ethers.id("nullifier");
      await contract.connect(member1).voteOnMotion(0, 1, nullifierHash, proof);
      const proposal = await contract.proposals(0);
      expect(proposal.noVotes).to.equal(1);
    });

    it("should allow voting Abstain", async function () {
      const nullifierHash = ethers.id("nullifier");
      await contract.connect(member1).voteOnMotion(0, 2, nullifierHash, proof);
      const proposal = await contract.proposals(0);
      expect(proposal.abstainVotes).to.equal(1);
    });

    it("should reject invalid choice", async function () {
      const nullifierHash = ethers.id("nullifier");
      await expect(
        contract.connect(member1).voteOnMotion(0, 5, nullifierHash, proof)
      ).to.be.revertedWith("Invalid choice");
    });

    it("should reject double voting", async function () {
      const nullifierHash = ethers.id("nullifier");
      await contract.connect(member1).voteOnMotion(0, 0, nullifierHash, proof);
      await expect(
        contract.connect(member1).voteOnMotion(0, 1, nullifierHash, proof)
      ).to.be.revertedWith("Already voted");
    });

    it("should allow different members to vote", async function () {
      const nullifier1 = ethers.id("nullifier-1");
      const nullifier2 = ethers.id("nullifier-2");
      await contract.connect(member1).voteOnMotion(0, 0, nullifier1, proof);
      await contract.connect(member2).voteOnMotion(0, 1, nullifier2, proof);
      const proposal = await contract.proposals(0);
      expect(proposal.yesVotes).to.equal(1);
      expect(proposal.noVotes).to.equal(1);
    });

    it("should emit MotionVoted event", async function () {
      const nullifierHash = ethers.id("nullifier");
      await expect(contract.connect(member1).voteOnMotion(0, 0, nullifierHash, proof))
        .to.emit(contract, "MotionVoted")
        .withArgs(0, 0, member1.address);
    });
  });

  describe("Proposal Finalization", function () {
    beforeEach(async function () {
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 60); // 60 seconds for testing
    });

    it("should pass when yes > no", async function () {
      const nullifier1 = ethers.id("nullifier-1");
      const nullifier2 = ethers.id("nullifier-2");
      const nullifier3 = ethers.id("nullifier-3");
      await contract.connect(member1).voteOnMotion(0, 0, nullifier1, proof); // Yes
      await contract.connect(member2).voteOnMotion(0, 0, nullifier2, proof); // Yes
      await contract.connect(member3).voteOnMotion(0, 1, nullifier3, proof); // No
      await time.increase(61);
      await contract.finalizeProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(3);
    });

    it("should fail when no >= yes", async function () {
      const nullifier1 = ethers.id("nullifier-1");
      const nullifier2 = ethers.id("nullifier-2");
      await contract.connect(member1).voteOnMotion(0, 1, nullifier1, proof); // No
      await contract.connect(member2).voteOnMotion(0, 0, nullifier2, proof); // Yes
      await time.increase(61);
      await contract.finalizeProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(4);
    });

    it("should reject finalizing before voting ends", async function () {
      await expect(
        contract.finalizeProposal(0)
      ).to.be.revertedWith("Voting period has not ended");
    });

    it("should emit ProposalFinalized event", async function () {
      const nullifierHash = ethers.id("nullifier");
      await contract.connect(member1).voteOnMotion(0, 0, nullifierHash, proof);
      await time.increase(61);
      await expect(contract.finalizeProposal(0))
        .to.emit(contract, "ProposalFinalized")
        .withArgs(0, 3);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(chair).createProposal("Test proposal");
    });

    it("should return correct proposal data", async function () {
      const proposal = await contract.getProposal(0);
      expect(proposal.description).to.equal("Test proposal");
      expect(proposal.proposalChair).to.equal(chair.address);
      expect(proposal.state).to.equal(0);
    });

    it("should return hasVoted correctly", async function () {
      expect(await contract.hasVoted(0, member1.address)).to.equal(false);
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 3 * 24 * 60 * 60);
      const nullifierHash = ethers.id("nullifier");
      await contract.connect(member1).voteOnMotion(0, 0, nullifierHash, proof);
      expect(await contract.hasVoted(0, member1.address)).to.equal(true);
    });
  });

  describe("Full Parliamentary Flow", function () {
    it("should complete full Rob's Rules flow", async function () {
      // 1. Chair creates proposal
      await contract.connect(chair).createProposal("Hire a community manager");
      let proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(0);
      
      // 2. Chair seconds proposal
      await contract.connect(chair).secondProposal(0);
      proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(1);
      
      // 3. Members submit amendments
      await contract.connect(member1).submitAmendment(0, "Part-time only");
      await contract.connect(member2).submitAmendment(0, "Remote preferred");
      
      // 4. Chair approves amendment
      await contract.connect(chair).approveAmendment(0, 0);
      
      // 5. Chair opens voting
      await contract.connect(chair).openVoting(0, 3 * 24 * 60 * 60);
      proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(2);
      
      // 6. Members vote
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), proof);
      await contract.connect(member2).voteOnMotion(0, 1, ethers.id("v2"), proof);
      
      proposal = await contract.proposals(0);
      expect(proposal.yesVotes).to.equal(1);
      expect(proposal.noVotes).to.equal(1);
      
      // 7. Finalize
      await time.increase(3 * 24 * 60 * 60 + 1);
      await contract.finalizeProposal(0);
      
      proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(4); // Tied = Failed
    });
  });
});
