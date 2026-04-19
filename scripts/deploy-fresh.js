const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer (Chair will be):", deployer.address);
  
  // Deploy fresh
  const ZKVotingRobRules = await hre.ethers.getContractFactory("ZKVotingRobRules");
  const contract = await ZKVotingRobRules.deploy(deployer.address, 3);
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("New contract deployed to:", addr);
  
  // Save to frontend
  const fs = require("fs");
  fs.writeFileSync("contracts.json", `
CONTRACT_ADDRESS=${addr}
DEPLOYER_ADDRESS=${deployer.address}
CHAIN_ID=${hre.network.config.chainId || 31337}
`);
  console.log("Saved to contracts.json");
}

main().catch(console.error);