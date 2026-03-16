const hre = require("hardhat");

async function main() {
  console.log("Deploying ZK Voting Contract...");
  
  const choiceCount = process.env.CHOICE_COUNT || 3;
  
  const ZKVoting = await hre.ethers.getContractFactory("ZKVoting");
  const voting = await ZKVoting.deploy(choiceCount);
  
  await voting.waitForDeployment();
  const address = await voting.getAddress();
  
  console.log(`ZKVoting deployed to: ${address}`);
  console.log(`Choice count: ${choiceCount}`);
  
  // Save deployment address
  const fs = require("fs");
  const config = `
DEPLOYED_CONTRACT_ADDRESS=${address}
CHAIN_ID=${hre.network.config.chainId || 31337}
  `;
  fs.writeFileSync(".env", config);
  
  console.log("\nDeployment complete! Address saved to .env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
