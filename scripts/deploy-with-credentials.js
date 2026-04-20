const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function main() {
  console.log("Deploying ENS-Gated Rob's Rules Voting Contracts...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy ZKVotingRobRulesWithCredentials
  console.log("\n1. Deploying ZKVotingRobRulesWithCredentials...");
  const ZKVotingRobRulesWithCredentials = await hre.ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
  const votingContract = await ZKVotingRobRulesWithCredentials.deploy(
    deployer.address,  // initial chair
    3                  // choiceCount (Yes, No, Abstain)
  );
  await votingContract.waitForDeployment();
  const votingAddress = await votingContract.getAddress();
  console.log(`   ZKVotingRobRulesWithCredentials: ${votingAddress}`);
  
  // Add deployer as first eligible voter
  console.log("\n2. Adding deployer as first eligible voter...");
  const addVoterTx = await votingContract.addVoter(deployer.address);
  await addVoterTx.wait();
  console.log(`   Voter added: ${deployer.address}`);
  
  // Verify deployer is eligible
  const isEligible = await votingContract.isEligible(deployer.address);
  console.log(`   Deployer eligible: ${isEligible}`);
  
  // Save deployment info
  const deploymentsDir = path.join(process.cwd(), "deployments");
  ensureDir(deploymentsDir);

  const frontendConfig = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || null,
    votingAddress,
    chair: deployer.address,
    generatedAt: new Date().toISOString(),
    notes: [
      "ENS-gated voting — chair manages voter allowlist via addVoter/removeVoter.",
      "No ENS Allowlist / ZK credential dependency.",
      "ZK vote privacy layer can be layered in later (post-quantum ready)."
    ]
  };

  const deploymentInfo = {
    generatedAt: frontendConfig.generatedAt,
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      voting: {
        name: "ZKVotingRobRulesWithCredentials",
        address: votingAddress,
      },
    },
    frontend: frontendConfig,
    notes: [
      "ENS-gated Rob's Rules voting — no ZK credential dependency.",
      "Chair manages voter registry via addVoter/removeVoter/addVoters.",
      "ZKVotingRobRulesWithCredentials (Ownable) — owner can add/remove voters and update chair."
    ]
  };

  fs.writeFileSync(path.join(deploymentsDir, `${hre.network.name}-credentials.json`), JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync(path.join(deploymentsDir, `${hre.network.name}-frontend.json`), JSON.stringify(frontendConfig, null, 2));
  fs.writeFileSync("contracts.json", JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`\nZKVotingRobRulesWithCredentials: ${votingAddress}`);
  console.log(`Chair (you):                        ${deployer.address}`);
  console.log(`Voting Rights:                     deployer = eligible voter`);
  console.log("\nKey functions:");
  console.log("- addVoter(address)     → grant voting rights (owner)");
  console.log("- removeVoter(address)  → revoke voting rights (owner)");
  console.log("- addVoters(address[])  → batch grant (owner)");
  console.log("- isEligible(address)   → check voter status");
  console.log("\nAll Rob's Rules actions (createProposal, second, amend, vote)");
  console.log("require isEligibleVoter — no ENS Allowlist needed.");
  
  console.log("\nNext steps:");
  console.log("1. Update frontend to use wallet connection + addVoter flow");
  console.log("2. Update SPEC.md and README with new architecture");
  console.log("3. Add ENS resolution for voter eligibility (optional future)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });