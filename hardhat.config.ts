import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { baseSepolia } from "viem/chains";

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, ".env") });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: ["0c73df2f5e5d7c16a2954e53642711e151b99442a59e7fc92b4b523cc0bf4907"],
      chainId: 8453,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: ["0c73df2f5e5d7c16a2954e53642711e151b99442a59e7fc92b4b523cc0bf4907"],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      base: "551XXCKRWMSG5FSQP4P62ITVKC2Q4C6R4V",
      baseSepolia: "551XXCKRWMSG5FSQP4P62ITVKC2Q4C6R4V",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
