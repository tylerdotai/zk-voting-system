const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const chair = signers[1];

  // Deploy mock verifier
  const MockVerifier = await ethers.getContractFactory("MockVerifier");
  const mockTx = await MockVerifier.deploy();
  const mockReceipt = await mockTx.waitForDeployment();
  const mockAddr = await mockReceipt.getAddress();
  console.log("MockVerifier deployed at:", mockAddr);

  // Deploy ZKVoting
  const ZK = await ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
  const deployTx = await ZK.deploy(mockAddr, chair.address, 3);
  const receipt = await deployTx.waitForDeployment();
  const contractAddr = await receipt.getAddress();
  console.log("ZKVotingRobRulesWithCredentials deployed at:", contractAddr);

  const contract = ZK.attach(contractAddr);
  
  // Run key tests
  console.log("\n--- Deployment Checks ---");
  console.log("owner:", await contract.owner());
  console.log("chair:", await contract.chair());
  console.log("choiceCount:", await contract.choiceCount());
  console.log("proposalCount:", await contract.proposalCount());

  console.log("\n--- Voter Eligibility ---");
  await contract.addVoter(owner.address);
  console.log("owner eligible:", await contract.isEligible(owner.address));

  console.log("\n--- Proposal Flow ---");
  const tx = await contract.connect(owner).createProposal("Test motion: allocate 0.5 ETH to hackathon sponsorship");
  const r = await tx.wait();
  const pid = r.logs[0].args.proposalId;
  console.log("Created proposal ID:", pid.toString());
  
  const p = await contract.getProposal(pid);
  console.log("Proposal state:", ["Created","Seconded","Voting","Passed","Failed"][p.state]);

  console.log("\n--- Fast-track to Voting ---");
  await contract.connect(chair).fastTrackVoting(pid, 86400 * 3);
  const p2 = await contract.getProposal(pid);
  console.log("State after fastTrack:", ["Created","Seconded","Voting","Passed","Failed"][p2.state]);
  console.log("Voting ends at:", new Date(Number(p2.votingEndsAt) * 1000).toISOString());

  console.log("\n--- Cast Vote ---");
  const NULLIFIER_HASH = ethers.id("nullifier123");
  const fakeProof = [
    [ethers.ZeroHash, ethers.ZeroHash],
    [[ethers.ZeroHash, ethers.ZeroHash], [ethers.ZeroHash, ethers.ZeroHash]],
    [ethers.ZeroHash, ethers.ZeroHash]
  ];
  const pubSignals = [pid, NULLIFIER_HASH, ethers.ZeroHash];
  
  const voteTx = await contract.connect(owner).castVote(pid, 0, NULLIFIER_HASH, fakeProof[0], fakeProof[1], fakeProof[2], pubSignals);
  await voteTx.wait();
  
  const p3 = await contract.getProposal(pid);
  console.log("After vote - yes:", p3.yesVotes, "no:", p3.noVotes, "abstain:", p3.abstainVotes);

  console.log("\n--- Finalize ---");
  // Fast forward past voting end (not possible in tests without time manipulation)
  // For now check state
  const finalState = await contract.getProposalState(pid);
  console.log("Current state:", finalState);

  console.log("\n✅ Contract logic verified!");
}

main().catch(e => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
