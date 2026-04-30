require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/types/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: { enabled: true, runs: 10000 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      // No-op for local dev
    },
    sepolia: {
      // Lazily resolve so CI compile doesn't fail on missing env vars
      url: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/fallback-placeholder',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};