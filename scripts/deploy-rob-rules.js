const hre = require("hardhat");

async function main() {
  console.log("Deploying ZKVotingRobRules Contract...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy with deployer as initial chair
  const ZKVotingRobRules = await hre.ethers.getContractFactory("ZKVotingRobRules");
  const contract = await ZKVotingRobRules.deploy(deployer.address, 3); // 3 choices: Yes, No, Abstain
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`\nZKVotingRobRules deployed to: ${address}`);
  console.log(`Chair: ${deployer.address}`);
  console.log(`Network: ${hre.network.name}`);
  
  // Save deployment address
  const fs = require("fs");
  fs.writeFileSync(".env.deployed", `
ROB_RULES_ADDRESS=${address}
DEPLOYER_ADDRESS=${deployer.address}
CHAIN_ID=${hre.network.config.chainId || 31337}
NETWORK=${hre.network.name}
  `);
  
  console.log("\nDeployment complete! Address saved to .env.deployed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
