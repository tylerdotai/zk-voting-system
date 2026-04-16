const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();
  console.log("Deploying from:", await signer.getAddress());
  
  const factory = new ethers.ContractFactory(
    [
      "function chair() view returns (address)",
      "function choiceCount() view returns (uint256)",
      "function proposalCount() view returns (uint256)",
      "function createProposal(string) returns (uint256)",
      "function secondProposal(uint256)",
      "event ProposalCreated(uint256 indexed, string, address)"
    ],
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    signer
  );
  
  // Get existing count
  const count = await factory.proposalCount();
  console.log("Existing proposal count:", count.toString());
  
  // Try to create a proposal if we have one
  if (count === 0n) {
    console.log("No proposals. Need to deploy NEW contract.");
  }
}

main().catch(console.error);