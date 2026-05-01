const hre = require("hardhat");

async function main() {
  const [deployer, voter1, voter2] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const RobRulesVoting = await hre.ethers.getContractFactory("RobRulesVoting");
  const robRulesVoting = await RobRulesVoting.deploy(deployer.address, 3);
  const receipt = await robRulesVoting.deploymentTransaction().wait();
  const addr = await robRulesVoting.getAddress();
  console.log("Deployed to:", addr);
  console.log("TX:", receipt.hash);

  // Add voters
  await (await robRulesVoting.addVoter(voter1.address)).wait();
  console.log("Added voter1:", voter1.address);
  await (await robRulesVoting.addVoter(voter2.address)).wait();
  console.log("Added voter2:", voter2.address);
  
  console.log("\n=== NEW CONTRACT (chair can finalize anytime) ===");
  console.log("Address:", addr);
  console.log("Chair:", deployer.address);
  console.log("Voter1:", voter1.address);
  console.log("Voter2:", voter2.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
