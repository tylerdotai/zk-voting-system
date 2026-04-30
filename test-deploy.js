const { ethers } = require("hardhat");
async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const chair = signers[1];
  
  const Mock = await ethers.getContractFactory("MockVerifier");
  const mock = await Mock.deploy();
  await mock.waitForDeployment();
  console.log("MockVerifier deployed at:", mock.address);
  console.log("MockVerifier address type:", typeof mock.address);
  console.log("MockVerifier address is valid:", mock.address !== null);
  
  const ZK = await ethers.getContractFactory("ZKVotingRobRulesWithCredentials");
  console.log("ZK factory created");
  
  const deployTx = await ZK.getDeployTransaction(mock.address, chair.address, 3);
  console.log("Deploy tx created, to:", deployTx.to);
  
  const tx = await owner.sendTransaction(deployTx);
  const receipt = await tx.wait();
  console.log("Deployed at:", receipt.contractAddress);
}
main().catch(e => console.error("Error:", e.message));
