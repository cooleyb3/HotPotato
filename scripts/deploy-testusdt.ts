import hre from "hardhat";
import * as dotenv from "dotenv";

// Manually load .env file
dotenv.config();

async function main() {
  console.log("🚀 Deploying TestUSDT token...");

  // Debug environment variables
  console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('PRIVATE')));
  console.log("Private key loaded:", process.env.PRIVATE_KEY ? "Yes" : "No");
  console.log("Private key length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  // Deploy TestUSDT using Hardhat's deployment system
  console.log("\n📝 Deploying TestUSDT token...");
  const testUSDT = await hre.viem.deployContract("TestUSDT", []);
  console.log("✅ TestUSDT deployed to:", testUSDT.address);

  // Check the token details
  const name = await testUSDT.read.name();
  const symbol = await testUSDT.read.symbol();
  const decimals = await testUSDT.read.decimals();
  const totalSupply = await testUSDT.read.totalSupply();
  const deployerBalance = await testUSDT.read.balanceOf([deployer.account.address]);

  console.log("\n📋 Token Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Decimals:", decimals.toString());
  console.log("Total Supply:", hre.viem.formatUnits(totalSupply, decimals), symbol);
  console.log("Deployer Balance:", hre.viem.formatUnits(deployerBalance, decimals), symbol);

  console.log("\n🎉 TestUSDT deployment completed successfully!");
  console.log("Contract Address:", testUSDT.address);
  console.log("Network: Base Sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
