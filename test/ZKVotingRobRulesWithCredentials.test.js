const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ZKVotingRobRulesWithCredentials", function () {
  let contract;
  let owner, chair, member1, member2;
  const proof = ethers.randomBytes(32);

  beforeEach(async function () {
    [owner, chair, member1, member2] = await ethers.getSigners();
    
    const ZKVotingRobRulesWithCredentials = await ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
    contract = await ZKVotingRobRulesWithCredentials.deploy(chair.address, 3);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the voting contract", async function () {
      expect(await contract.getAddress()).to.not.be.null;
    });

    it("should set the owner ( Ownable )", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should set the chair", async function () {
      expect(await contract.chair()).to.equal(chair.address);
    });

    it("should set choice count to 3 (Yes, No, Abstain)", async function () {
      expect(await contract.choiceCount()).to.equal(3);
    });

    it("should initialize proposal count to 0", async function () {
      expect(await contract.proposalCount()).to.equal(0);
    });
  });

  describe("Voter Eligibility (ENS-gated pivot)", function () {
    it("should add voter via owner", async function () {
      await contract.connect(owner).addVoter(member1.address);
      expect(await contract.isEligible(member1.address)).to.equal(true);
    });

    it("should remove voter via owner", async function () {
      await contract.connect(owner).addVoter(member1.address);
      await contract.connect(owner).removeVoter(member1.address);
      expect(await contract.isEligible(member1.address)).to.equal(false);
    });

    it("should batch add voters", async function () {
      await contract.connect(owner).addVoters([member1.address, member2.address]);
      expect(await contract.isEligible(member1.address)).to.equal(true);
      expect(await contract.isEligible(member2.address)).to.equal(true);
    });

    it("should reject zero address in addVoter", async function () {
      await expect(
        contract.connect(owner).addVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Voter cannot be zero address");
    });

    it("should emit VoterAdded event", async function () {
      await expect(contract.connect(owner).addVoter(member1.address))
        .to.emit(contract, "VoterAdded")
        .withArgs(member1.address);
    });

    it("should allow chair to add voters", async function () {
      await contract.connect(chair).addVoter(member1.address);
      expect(await contract.isEligible(member1.address)).to.equal(true);
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
    });

    it("should allow verified chair to create proposal", async function () {
      await contract.connect(chair).createProposal("Test proposal");
      expect(await contract.proposalCount()).to.equal(1);
    });

    it("should set proposal state to Created", async function () {
      await contract.connect(chair).createProposal("Test proposal");
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(0);
    });

    it("should reject non-chair from creating proposal", async function () {
      await contract.connect(owner).addVoter(member1.address);
      await expect(
        contract.connect(member1).createProposal("Unauthorized")
      ).to.be.revertedWith("Only chair can perform this action");
    });

    it("should reject empty description", async function () {
      await expect(
        contract.connect(chair).createProposal("")
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("should emit ProposalCreated event", async function () {
      await expect(contract.connect(chair).createProposal("Test proposal"))
        .to.emit(contract, "ProposalCreated")
        .withArgs(0, "Test proposal", chair.address);
    });
  });

  describe("Proposal Seconding", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
      await contract.connect(chair).createProposal("Test proposal");
    });

    it("should allow chair to second proposal", async function () {
      await contract.connect(chair).secondProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(1);
    });

    it("should reject non-chair seconding", async function () {
      await expect(
        contract.connect(member1).secondProposal(0)
      ).to.be.revertedWith("Only chair can perform this action");
    });
  });

  describe("Amendments with Credentials", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
      await contract.connect(owner).addVoter(member1.address);
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
    });

    it("should allow verified member to submit amendment", async function () {
      await contract.connect(member1).submitAmendment(0, "Add clause A");
      const proposal = await contract.getProposal(0);
      expect(proposal.amendmentCount).to.equal(1);
    });

    it("should allow chair to approve amendment", async function () {
      await contract.connect(member1).submitAmendment(0, "Add clause A");
      await contract.connect(chair).approveAmendment(0, 0);
      const amendment = await contract.getAmendment(0, 0);
      expect(amendment.approved).to.equal(true);
    });

    it("should emit AmendmentSubmitted event", async function () {
      await expect(contract.connect(member1).submitAmendment(0, "Add clause A"))
        .to.emit(contract, "AmendmentSubmitted")
        .withArgs(0, 0, member1.address);
    });
  });

  describe("Voting Period", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
    });

    it("should allow chair to open voting", async function () {
      await contract.connect(chair).openVoting(0, 60);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(2);
    });

    it("should reject non-chair opening voting", async function () {
      await expect(
        contract.connect(member1).openVoting(0, 60)
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

  describe("Voting with Credentials", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
      await contract.connect(owner).addVoter(member1.address);
      await contract.connect(owner).addVoter(member2.address);
      await contract.connect(chair).createProposal("Test proposal");
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 60);
    });

    it("should allow verified member to vote Yes", async function () {
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      const proposal = await contract.proposals(0);
      expect(proposal.yesVotes).to.equal(1);
    });

    it("should allow verified member to vote No", async function () {
      await contract.connect(member1).voteOnMotion(0, 1, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      const proposal = await contract.proposals(0);
      expect(proposal.noVotes).to.equal(1);
    });

    it("should allow verified member to vote Abstain", async function () {
      await contract.connect(member1).voteOnMotion(0, 2, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      const proposal = await contract.proposals(0);
      expect(proposal.abstainVotes).to.equal(1);
    });

    it("should reject invalid choice", async function () {
      await expect(
        contract.connect(member1).voteOnMotion(0, 99, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash])
      ).to.be.revertedWith("Invalid choice");
    });

    it("should reject double voting", async function () {
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      await expect(
        contract.connect(member1).voteOnMotion(0, 1, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash])
      ).to.be.revertedWith("Already voted");
    });

    it("should pass when yes > no", async function () {
      await contract.connect(member1).voteOnMotion(0, 0, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      await contract.connect(member2).voteOnMotion(0, 0, ethers.id("v2"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      await time.increase(61);
      await contract.finalizeProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(3);
    });

    it("should fail when no >= yes", async function () {
      await contract.connect(member1).voteOnMotion(0, 1, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      await contract.connect(member2).voteOnMotion(0, 0, ethers.id("v2"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash]);
      await time.increase(61);
      await contract.finalizeProposal(0);
      const proposal = await contract.proposals(0);
      expect(proposal.state).to.equal(4);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
      await contract.connect(chair).createProposal("Test proposal");
    });

    it("should return correct proposal data", async function () {
      const proposal = await contract.getProposal(0);
      expect(proposal.description).to.equal("Test proposal");
      expect(proposal.proposalChair).to.equal(chair.address);
    });

    it("should return hasVoted correctly", async function () {
      expect(await contract.hasVoted(0, member1.address)).to.equal(false);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.connect(chair).addVoter(chair.address);
      await contract.connect(owner).addVoter(member1.address);
    });

    it("should reject creating proposal with empty description", async function () {
      await expect(
        contract.connect(chair).createProposal("")
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("should reject invalid choice in voteOnMotion", async function () {
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 60);
      await expect(
        contract.connect(member1).voteOnMotion(0, 99, ethers.id("v1"), [ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash])
      ).to.be.revertedWith("Invalid choice");
    });

    it("should reject opening voting for wrong state", async function () {
      await contract.connect(chair).secondProposal(0);
      await contract.connect(chair).openVoting(0, 60);
      await expect(
        contract.connect(chair).openVoting(0, 60)
      ).to.be.revertedWith("Proposal must be in Seconded state");
    });
  });
});