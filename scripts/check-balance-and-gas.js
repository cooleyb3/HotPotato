const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  
  console.log("=== Wallet Information ===");
  console.log("Address:", deployer.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
  console.log("Balance in USD (approx):", (parseFloat(ethers.utils.formatEther(balance)) * 4754).toFixed(2), "USD");
  
  console.log("\n=== Gas Estimation ===");
  console.log("Estimated gas for deployment: ~300,000 units");
  console.log("Current gas price on Base: ~10 gwei");
  console.log("Estimated cost: ~0.003 ETH (~$14.26)");
  
  const estimatedCost = ethers.utils.parseEther("0.003");
  if (balance.lt(estimatedCost)) {
    console.log("\n⚠️  Warning: Balance might be too low");
    console.log("   You need at least 0.003 ETH for deployment");
    console.log("   Recommended: Have at least 0.005 ETH for safety");
  } else {
    console.log("\n✅ Balance sufficient for deployment!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
