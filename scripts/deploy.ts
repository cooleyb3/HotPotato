import { formatEther, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import hre from "hardhat";

async function main() {
  console.log("Deploying HotPotatoGame contract...");

  // Base Sepolia ETH/USD price feed address
  const ETH_USD_PRICE_FEED = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
  
  // Steal fee in USD cents (33 = $0.33)
  const STEAL_FEE_USD_CENTS = 33n;

  // Get the wallet client with explicit chain specification
  const [deployer] = await hre.viem.getWalletClients({
    chain: baseSepolia,
  });
  
  const publicClient = await hre.viem.getPublicClient({
    chain: baseSepolia,
  });

  const hotPotatoGame = await hre.viem.deployContract("HotPotatoGame", [
    STEAL_FEE_USD_CENTS,
    ETH_USD_PRICE_FEED
  ], {
    walletClient: deployer,
    publicClient: publicClient,
  });

  console.log(`HotPotatoGame deployed to: ${hotPotatoGame.address}`);
  console.log(`Steal fee: $${Number(STEAL_FEE_USD_CENTS) / 100}`);
  console.log(`Price feed: ${ETH_USD_PRICE_FEED}`);
  
  // Wait for deployment to be confirmed
  console.log("\nContract deployed successfully!");
  console.log("You can now verify the contract on Base Sepolia Basescan:");
  console.log(`https://sepolia.basescan.org/address/${hotPotatoGame.address}#code`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
