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
  
  // Deploy ZKVotingRobRulesWithCredentials first with address(0) for verifier placeholder
  console.log("\n1. Deploying ZKVotingRobRulesWithCredentials (verifier placeholder)...");
  const ZKVotingRobRulesWithCredentials = await hre.ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
  const votingContract = await ZKVotingRobRulesWithCredentials.deploy(
    hre.ethers.ZeroAddress, // govVerifier placeholder — will be wired in step 3
    deployer.address,       // initial chair
    3                       // choiceCount (Yes, No, Abstain)
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
  
  // Wire verifier into voting contract (fixes circular dependency)
  console.log("\n3. Wiring verifier into voting contract...");
  const tx = await votingContract.setVerifier(govVerifierAddress);
  await tx.wait();
  console.log(`   Verifier wired: ${govVerifierAddress}`);

  // Step 4: Initialize ZKP request on verifier (Polygon ID credential circuit)
  // This enables the GovVerifier to accept Polygon ID BJJSignature2021 proofs
  // and call setAllowedUser() on the voting contract after verification.
  console.log("\n4. Initializing ZKP request on verifier...");

  // Schema hash for FortWorthDAOMembershipCredential
  const SCHEMA_HASH = BigInt('0x63da8028ea572b245541ced3451e0f67');

  // CredentialAtomicQuerySigV2Validator — official Polygon ID validator on Base Sepolia
  // Source: iden3/contracts/validators/request/CredentialAtomicQuerySigV2Validator.sol
  // Onchain circuit ID: "credentialAtomicQuerySigV2OnChain"
  const VALIDATOR_ADDRESS = '0x8c99F13dc5083b1E4c16f269735EaD4cFbc4970d';

  const REQ_ID = 1;

  // The query struct matches ICircuitValidator.CircuitQuery:
  // - schema: schema hash of the credential
  // - slotIndex: 0 (no slot-based query)
  // - operator: 0 = EQ (exact match, no value required for existence proof)
  // - value: empty array (no value constraint)
  // - circuitId: "credentialAtomicQuerySigV2OnChain" (BJJ Sig circuit)
  const circuitQuery = {
    schema: SCHEMA_HASH,
    slotIndex: 0,
    operator: 0,
    value: [],
    circuitId: "credentialAtomicQuerySigV2OnChain",
  };

  // Get validator contract interface
  const validatorABI = [
    "function initialize(address _stateContractAddress, address _verifierContractAddr, address owner) public initializer"
  ];
  const validatorContract = await hre.ethers.getContractAt(validatorABI, VALIDATOR_ADDRESS);

  const setZKPRequestTx = await govVerifier.setZKPRequest(REQ_ID, validatorContract, circuitQuery);
  await setZKPRequestTx.wait();
  console.log(`   ZKPRequest set: reqId=${REQ_ID}, validator=${VALIDATOR_ADDRESS}, circuitId=credentialAtomicQuerySigV2OnChain`);
  console.log(`   Schema hash: 0x63da8028ea572b245541ced3451e0f67`);

  // Verify the request was stored correctly
  const storedQuery = await govVerifier.getZKPRequest(REQ_ID);
  console.log(`   Stored circuitId: ${storedQuery.circuitId}`);
  console.log(`   Stored schema: ${storedQuery.schema.toString()}`);

  
  // Save deployment info as structured JSON
  const deploymentsDir = path.join(process.cwd(), "deployments");
  ensureDir(deploymentsDir);

  const frontendConfig = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || null,
    votingAddress,
    govVerifierAddress,
    chair: deployer.address,
    generatedAt: new Date().toISOString(),
    notes: [
      "ZKPRequest initialized — GovVerifier accepts Polygon ID BJJSignature2021 proofs on Base Sepolia."
    ]
  };

  const deploymentInfo = {
    generatedAt: frontendConfig.generatedAt,
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
    frontend: frontendConfig,
    notes: [
      "setZKPRequest called in deploy — CredentialAtomicQuerySigV2Validator wired on Base Sepolia.",
      "GovVerifier accepts Polygon ID BJJSignature2021 proofs; _afterProofSubmit calls setAllowedUser on voting contract."
    ]
  };

  fs.writeFileSync(path.join(deploymentsDir, `${hre.network.name}-credentials.json`), JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync(path.join(deploymentsDir, `${hre.network.name}-frontend.json`), JSON.stringify(frontendConfig, null, 2));
  fs.writeFileSync("contracts.json", JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`\nZKVotingRobRulesWithCredentials: ${votingAddress}`);
  console.log(`GovVerifier:                       ${govVerifierAddress}`);
  console.log(`Chair (you):                        ${deployer.address}`);
  console.log(`\nDeployment info saved to contracts.json, deployments/${hre.network.name}-credentials.json, and deployments/${hre.network.name}-frontend.json`);
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
