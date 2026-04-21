const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.getContractAt(
    "ZKVotingRobRules",
    "0x198041e195b9e8c34B5371edF67Ec84DFa68bb74"
  );

  const proposals = [
    "Should FW DAO fund the community hackathon with 5 ETH?",
    "Adopt Robert's Rules of Order as our official voting procedure",
    "Allocate 10% of treasury to local developer grants"
  ];

  console.log("Creating demo proposals on new verified contract...\n");

  for (let i = 0; i < proposals.length; i++) {
    const tx = await contract.createProposal(proposals[i]);
    const receipt = await tx.wait();
    const log = receipt.logs[0];
    // ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)
    const proposalId = log.args[0];
    console.log(`[${i+1}] "${proposals[i]}"`);
    console.log(`    → Proposal #${proposalId} created | tx: ${receipt.hash}\n`);
  }

  console.log("All 3 demo proposals created on verified contract!");
}

main().catch(console.error);
