const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Hardhat account #0 address:", deployer.address);
  
  const contract = await hre.ethers.getContractAt(
    "ZKVotingRobRules",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  
  const chair = await contract.chair();
  console.log("Contract chair:", chair);
  console.log("Are they equal?", deployer.address.toLowerCase() === chair.toLowerCase());
  
  const count = await contract.proposalCount();
  console.log("Proposal count:", count.toString());
}

main().catch(console.error);
