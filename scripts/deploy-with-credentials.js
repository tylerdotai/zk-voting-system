const hre = require("hardhat");

async function main() {
  console.log("Deploying Credential-Gated Voting Contracts...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy ZKVotingRobRulesWithCredentials first
  console.log("\n1. Deploying ZKVotingRobRulesWithCredentials...");
  const ZKVotingRobRulesWithCredentials = await hre.ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
  const votingContract = await ZKVotingRobRulesWithCredentials.deploy(
    deployer.address, // govVerifier (placeholder - will be updated)
    deployer.address, // initial chair
    3 // choiceCount (Yes, No, Abstain)
  );
  await votingContract.waitForDeployment();
  const votingAddress = await votingContract.getAddress();
  console.log(`   ZKVotingRobRulesWithCredentials: ${votingAddress}`);
  
  // Deploy GovVerifier with the voting contract address
  console.log("\n2. Deploying GovVerifier...");
  const GovVerifier = await hre.ethers.getContractFactory("GovVerifier");
  const govVerifier = await GovVerifier.deploy(votingAddress);
  await govVerifier.waitForDeployment();
  const govVerifierAddress = await govVerifier.getAddress();
  console.log(`   GovVerifier: ${govVerifierAddress}`);
  
  // Note: In this architecture, GovVerifier calls votingContract.setAllowedUser(user)
  // after ZKP proof is verified. No need to update voting contract with GovVerifier address.
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = `
# Credential-Gated Voting Deployment
# Deployed at: ${new Date().toISOString()}
# Network: ${hre.network.name}
# Deployer: ${deployer.address}

ZKVOTING_WITH_CREDS_ADDRESS=${votingAddress}
GOV_VERIFIER_ADDRESS=${govVerifierAddress}
VOTING_CHAIR=${deployer.address}

# For frontend
NEXT_PUBLIC_VOTING_ADDRESS=${votingAddress}
NEXT_PUBLIC_GOV_VERIFIER_ADDRESS=${govVerifierAddress}

# Flow:
# 1. User connects wallet
# 2. Frontend generates QR with proof request (Polygon ID)
# 3. User scans QR → Polygon ID app generates ZK proof
# 4. Proof submitted to GovVerifier.submitZKPResponse()
# 5. GovVerifier._afterProofSubmit() → votingContract.setAllowedUser(user)
# 6. User now allowed → can create proposals / vote
`;
  fs.writeFileSync("contracts.json", deploymentInfo);
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`\nZKVotingRobRulesWithCredentials: ${votingAddress}`);
  console.log(`GovVerifier:                       ${govVerifierAddress}`);
  console.log(`Chair (you):                        ${deployer.address}`);
  console.log(`\nDeployment info saved to contracts.json`);
  console.log("\nNext steps:");
  console.log("1. Set up Polygon ID issuer node");
  console.log("2. Configure credential schema");
  console.log("3. Build frontend QR code flow");
  console.log("4. Update frontend with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
