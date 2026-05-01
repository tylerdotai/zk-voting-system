const hre = require("hardhat");

async function main() {
  // Use the second hardhat pre-funded account as deployer for Sepolia
  // First account (index 0): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (has Sepolia ETH)
  const [deployer, voter2, voter3] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  
  const NoZK = await hre.ethers.getContractFactory("ZKVotingRobRulesNoZK");
  const nozk = await NoZK.deploy(deployer.address, 3);
  const receipt = await nozk.deploymentTransaction().wait();
  
  const addr = await nozk.getAddress();
  console.log("\nZKVotingRobRulesNoZK deployed to:", addr);
  console.log("TX:", receipt.hash);
  
  // Add voters for multi-voter demo
  console.log("\nAdding test voters...");
  await (await nozk.addVoter(voter2.address)).wait();
  console.log("Added voter2:", voter2.address);
  await (await nozk.addVoter(voter3.address)).wait();
  console.log("Added voter3:", voter3.address);
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Contract:", addr);
  console.log("Chair:", deployer.address);
  console.log("Voter2:", voter2.address);
  console.log("Voter3:", voter3.address);
  console.log("=======================");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
