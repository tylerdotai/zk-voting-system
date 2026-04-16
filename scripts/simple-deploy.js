const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Account 0:", deployer.address);
  
  const factory = await hre.ethers.getContractFactory("ZKVotingRobRules");
  const contract = await factory.deploy(deployer.address, 3);
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("Contract deployed at:", addr);
  
  const fs = require("fs");
  fs.writeFileSync("/tmp/contract-addr.txt", addr);
}

main().catch(console.error);