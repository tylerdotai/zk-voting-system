const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

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
  
  // Save deployment info as structured JSON
  const deploymentsDir = path.join(process.cwd(), "deployments");
  ensureDir(deploymentsDir);

  const deploymentInfo = {
    generatedAt: new Date().toISOString(),
    network: hre.network.name,
    deployer: deployer.address,
    env: {
      baseSepoliaRpcUrlConfigured: Boolean(process.env.BASE_SEPOLIA_RPC_URL),
      sepoliaRpcUrlConfigured: Boolean(process.env.SEPOLIA_RPC_URL),
      privateKeyConfigured: Boolean(process.env.PRIVATE_KEY),
    },
    contracts: {
      voting: {
        name: "ZKVotingRobRulesWithCredentials",
        address: votingAddress,
      },
      govVerifier: {
        name: "GovVerifier",
        address: govVerifierAddress,
      },
    },
    frontend: {
      NEXT_PUBLIC_VOTING_ADDRESS: votingAddress,
      NEXT_PUBLIC_GOV_VERIFIER_ADDRESS: govVerifierAddress,
    },
    notes: [
      "Current deploy flow is still interim and does not initialize a Polygon ID validator or setZKPRequest.",
      "Phase 3 must correct deploy ordering and verifier initialization before proof submission can work onchain."
    ]
  };

  fs.writeFileSync(path.join(deploymentsDir, `${hre.network.name}-credentials.json`), JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync("contracts.json", JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`\nZKVotingRobRulesWithCredentials: ${votingAddress}`);
  console.log(`GovVerifier:                       ${govVerifierAddress}`);
  console.log(`Chair (you):                        ${deployer.address}`);
  console.log(`\nDeployment info saved to contracts.json and deployments/${hre.network.name}-credentials.json`);
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
