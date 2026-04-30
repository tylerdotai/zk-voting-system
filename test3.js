async function main() {
  const hre = require("hardhat");
  const { ethers } = hre;
  const Mock = await ethers.getContractFactory("MockVerifier");
  console.log("Mock fragment:", Mock.interface.functions);
  const m = await Mock.deploy();
  console.log("Mock address:", m.address);
  console.log("Mock deployed:", m.deployed());
}
main().catch(e => console.error(e));
