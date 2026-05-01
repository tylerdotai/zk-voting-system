const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RobRulesVoting", function () {
  let voting;
  let owner;
  let chair;
  let member1;
  let member2;
  let member3;

  const ONE_HOUR = 3600;

  async function createSecondAndOpen(description = "Test motion", duration = ONE_HOUR) {
    await voting.connect(chair).createProposal(description);
    await voting.connect(member1).secondProposal(0);
    await voting.connect(chair).openVoting(0, duration);
  }

  beforeEach(async function () {
    [owner, chair, member1, member2, member3] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("RobRulesVoting");
    voting = await Factory.connect(owner).deploy(chair.address, 3);
    await voting.waitForDeployment();

    await voting.connect(owner).addVoter(chair.address);
    await voting.connect(owner).addVoter(member1.address);
    await voting.connect(owner).addVoter(member2.address);
    await voting.connect(owner).addVoter(member3.address);
  });

  describe("proposal validation", function () {
    it("rejects invalid proposal ids on view and state-changing calls", async function () {
      await expect(voting.getProposal(99)).to.be.revertedWith("Invalid proposal ID");
      await expect(voting.connect(member1).secondProposal(99)).to.be.revertedWith("Invalid proposal ID");
      await expect(voting.connect(chair).fastTrackVoting(99, ONE_HOUR)).to.be.revertedWith("Invalid proposal ID");
    });
  });

  describe("demo flow safety", function () {
    it("still allows chair to finalize immediately for the live demo", async function () {
      await createSecondAndOpen();
      await voting.connect(member1).castVote(0, 0);
      await voting.connect(chair).finalizeProposal(0);

      const proposal = await voting.getProposal(0);
      expect(proposal[3]).to.equal(3n);
    });
  });

  describe("reconsideration rules", function () {
    it("only allows a voter on the current prevailing side to reconsider", async function () {
      await createSecondAndOpen();
      await voting.connect(member1).castVote(0, 0);
      await voting.connect(member2).castVote(0, 0);
      await voting.connect(member3).castVote(0, 1);

      await expect(voting.connect(member3).reconsider(0)).to.be.revertedWith("Not on prevailing side");
      await expect(voting.connect(member1).reconsider(0))
        .to.emit(voting, "ReconsiderationRequested")
        .withArgs(0, member1.address);
    });

    it("rejects reconsideration when there is no prevailing side", async function () {
      await createSecondAndOpen();
      await voting.connect(member1).castVote(0, 0);
      await voting.connect(member2).castVote(0, 1);

      await expect(voting.connect(member1).reconsider(0)).to.be.revertedWith("No prevailing side");
    });
  });

  describe("reopen voting", function () {
    it("resets vote state so the same voters can vote again", async function () {
      await createSecondAndOpen();
      const original = await voting.getProposal(0);
      const originalEndsAt = original[8];

      await voting.connect(member1).castVote(0, 0);
      await voting.connect(member2).castVote(0, 0);
      await voting.connect(member3).castVote(0, 1);

      await voting.connect(member1).callForDivision(0);
      await voting.connect(member2).callForDivision(0);
      expect(await voting.hasCalledForDivision(0, member1.address)).to.equal(true);

      await voting.connect(member1).reconsider(0);
      await time.increase(30);
      await voting.connect(chair).reopenVoting(0);

      const reopened = await voting.getProposal(0);
      expect(reopened[9]).to.equal(0n);
      expect(reopened[10]).to.equal(0n);
      expect(reopened[11]).to.equal(0n);
      expect(reopened[13]).to.equal(false);
      expect(reopened[14]).to.equal(0n);
      expect(reopened[15]).to.equal(false);
      expect(reopened[8]).to.be.greaterThan(originalEndsAt);

      expect(await voting.hasVoted(0, member1.address)).to.equal(false);
      expect(await voting.hasVoted(0, member2.address)).to.equal(false);
      expect(await voting.hasCalledForDivision(0, member1.address)).to.equal(false);

      await voting.connect(member1).castVote(0, 1);
      await voting.connect(member1).callForDivision(0);
      expect(await voting.hasVoted(0, member1.address)).to.equal(true);
      expect(await voting.hasCalledForDivision(0, member1.address)).to.equal(true);

      const proposal = await voting.getProposal(0);
      expect(proposal[10]).to.equal(1n);
    });
  });

  describe("standard finalize path", function () {
    it("still allows anyone to finalize after the voting window expires", async function () {
      await createSecondAndOpen();
      await voting.connect(member1).castVote(0, 0);
      await time.increase(ONE_HOUR + 1);

      await voting.connect(member2).finalizeProposal(0);
      const proposal = await voting.getProposal(0);
      expect(proposal[3]).to.equal(3n);
    });
  });
});
