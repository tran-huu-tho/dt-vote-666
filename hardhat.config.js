import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.28",
  networks: {
    coinexTestnet: {
      type: "http",
      url: "https://testnet-rpc.coinex.net",
      chainId: 53,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 60000,
      gasPrice: 500000000000
    }
  }
};
