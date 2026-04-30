const { ethers } = require("hardhat");

async function main() {
  // Use the hardhat config network (sepolia from .env)
  const [wallet] = (await ethers.getSigners());
  console.log("Using wallet:", wallet.address);
  
  const contract = await ethers.getContractAt(
    "ZKVotingRobRulesWithCredentials",
    "0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3",
    wallet
  );
  
  const chair = await contract.chair();
  console.log("Chair:", chair);
  console.log("Wallet is chair?", chair.toLowerCase() === wallet.address.toLowerCase());
  
  // Get proposal 0 state
  const p = await contract.getProposal(0);
  console.log("\nProposal 0 state:", ["Created","Seconded","Voting","Passed","Failed"][p.state]);
  console.log("Voting ends:", new Date(Number(p.votingEndsAt) * 1000).toISOString());
  console.log("Yes:", p.yesVotes.toString(), "No:", p.noVotes.toString(), "Abstain:", p.abstainVotes.toString());
  
  // Finalize if still in voting
  if (p.state === 2) {
    const now = Math.floor(Date.now() / 1000);
    console.log("\nFinalizing proposal 0 (now:", now, "vs ends:", p.votingEndsAt.toString(), ")...");
    try {
      const tx = await contract.finalizeProposal(0);
      await tx.wait();
      const p2 = await contract.getProposal(0);
      console.log("Proposal 0 finalized to:", ["Created","Seconded","Voting","Passed","Failed"][p2.state]);
    } catch(e) {
      console.log("Finalize error:", e.message);
    }
  }
  
  // Create new demo proposal
  console.log("\nCreating new demo proposal...");
  const desc = "HackFW Demo: Should Fort Worth DAO allocate 1 ETH to sponsor the next community hackathon?";
  const tx2 = await contract.createProposal(desc);
  const r = await tx2.wait();
  const newPid = r.logs[0].args.proposalId;
  console.log("Created proposal ID:", newPid.toString());
  
  // Fast-track to voting
  console.log("\nFast-tracking to voting (3 days)...");
  const fastTx = await contract.fastTrackVoting(newPid, 60 * 60 * 24 * 3);
  await fastTx.wait();
  const p3 = await contract.getProposal(newPid);
  console.log("Proposal state:", ["Created","Seconded","Voting","Passed","Failed"][p3.state]);
  console.log("Voting ends:", new Date(Number(p3.votingEndsAt) * 1000).toISOString());
  console.log("\n✅ Demo proposal ready!");
  console.log("Contract: https://sepolia.etherscan.io/address/0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3");
  console.log("Frontend: https://zk-voting-system-two.vercel.app/");
}

main().catch(e => console.error("Error:", e.message));
