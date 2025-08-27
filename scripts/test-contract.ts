import hre from "hardhat";
import { formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { CONTRACT_CONFIG } from "../lib/contract-config";

async function main() {
  console.log("Testing Hot Potato Game contract...");
  
  const [deployer] = await hre.viem.getWalletClients({
    chain: baseSepolia,
  });
  
  const publicClient = await hre.viem.getPublicClient({
    chain: baseSepolia,
  });

  const contractAddress = CONTRACT_CONFIG.baseSepolia.contractAddress;
  console.log("Contract address:", contractAddress);

  // Get contract instance
  const contract = await hre.viem.getContractAt("HotPotatoGame", contractAddress);

  // Test basic contract state
  const currentHolder = await contract.read.currentHolder();
  const potSize = await contract.read.potSize();
  const stealCount = await contract.read.stealCount();
  const stealFeeUsd = await contract.read.getStealFeeUsd();
  const potSizeUsd = await contract.read.getPotSizeUsd();
  const requiredEth = await contract.read.getRequiredEthForSteal();

  console.log("\n=== Contract State ===");
  console.log("Current holder:", currentHolder);
  console.log("Pot size (wei):", potSize.toString());
  console.log("Pot size (USD):", Number(potSizeUsd) / 100, "USD");
  console.log("Steal count:", stealCount.toString());
  console.log("Steal fee (USD):", Number(stealFeeUsd) / 100, "USD");
  console.log("Required ETH for steal:", formatEther(requiredEth), "ETH");

  // Check if contract is the initial holder (as expected)
  if (currentHolder === contractAddress) {
    console.log("\n✅ Contract is the initial holder - ready for first steal!");
  } else {
    console.log("\n❌ Unexpected initial holder:", currentHolder);
  }

  console.log("\n=== Contract is ready for frontend interaction ===");
  console.log("Users can now call stealPotato() function!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
