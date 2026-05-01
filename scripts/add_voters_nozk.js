const { ethers } = require("ethers");

const RPC = "https://eth-sepolia.g.alchemy.com/v2/sC-QFWsXNmQSRD5xmfSu3";
const PK = "0xc317449aeeb7dc6e8ac4ad0024a7f62461f665f9272c7454255eaf553f64a6c8";
const CONTRACT = "0x2D74a3a6Da491972D89ea2DbcB8328215bF7CA8f";

const ABI = [
  "function addVoter(address _voter) external",
  "function addVoters(address[] calldata _voters) external",
  "function chair() view returns (address)",
  "function owner() view returns (address)",
];

async function main() {
  const wallet = new ethers.Wallet(PK).connect(new ethers.JsonRpcProvider(RPC));
  const contract = new ethers.Contract(CONTRACT, ABI, wallet);
  
  // Hardhat default accounts
  const voter1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const voter2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  
  console.log("Adding voters from:", wallet.address);
  
  const tx = await contract.addVoters([voter1, voter2]);
  await tx.wait();
  console.log("Added voter1:", voter1);
  console.log("Added voter2:", voter2);
  
  const chair = await contract.chair();
  console.log("Chair:", chair);
  
  console.log("\n=== CONTRACT READY ===");
  console.log("Address:", CONTRACT);
  console.log("Chair:", chair);
  console.log("Voter1:", voter1);
  console.log("Voter2:", voter2);
}

main().catch(e => {
  console.error("Error:", e.message || e);
  process.exit(1);
});