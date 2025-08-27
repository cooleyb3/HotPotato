import hre from "hardhat";
import { formatEther, parseEther } from "viem";
import { baseSepolia } from "viem/chains";

async function main() {
  const [deployer] = await hre.viem.getWalletClients({
    chain: baseSepolia,
  });
  const publicClient = await hre.viem.getPublicClient({
    chain: baseSepolia,
  });
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  
  console.log("Deployer address:", deployer.account.address);
  console.log("Balance:", formatEther(balance), "ETH");
  
  // Check if balance is sufficient for deployment
  const estimatedGas = parseEther("0.01"); // Rough estimate
  if (balance < estimatedGas) {
    console.log("⚠️  Warning: Balance might be too low for deployment");
    console.log("   Estimated gas cost: ~0.01 ETH");
    console.log("   Recommended: Have at least 0.02 ETH for safety");
  } else {
    console.log("✅ Balance sufficient for deployment");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
