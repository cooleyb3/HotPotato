import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting USDT-based Hot Potato Game deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy Test USDT Token first
  console.log("\n📝 Deploying Test USDT Token...");
  const TestUSDT = await ethers.getContractFactory("TestUSDT");
  const testUSDT = await TestUSDT.deploy();
  await testUSDT.waitForDeployment();
  const testUSDTAddress = await testUSDT.getAddress();
  console.log("✅ Test USDT deployed to:", testUSDTAddress);

  // Deploy Hot Potato Game with USDT
  console.log("\n🥔 Deploying Hot Potato Game (USDT-based)...");
  const stealFeeUsdt = ethers.parseUnits("0.33", 6); // $0.33 in USDT (6 decimals)
  console.log("Steal fee set to:", ethers.formatUnits(stealFeeUsdt, 6), "USDT");

  const HotPotatoGameUSDT = await ethers.getContractFactory("HotPotatoGameUSDT");
  const hotPotatoGame = await HotPotatoGameUSDT.deploy(testUSDTAddress, stealFeeUsdt);
  await hotPotatoGame.waitForDeployment();
  const gameAddress = await hotPotatoGame.getAddress();
  console.log("✅ Hot Potato Game deployed to:", gameAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const currentHolder = await hotPotatoGame.getCurrentHolder();
  const stealFee = await hotPotatoGame.getStealFeeUsdt();
  const potSize = await hotPotatoGame.getPotSizeUsdt();
  const stealCount = await hotPotatoGame.getStealCount();

  console.log("Current holder:", currentHolder);
  console.log("Steal fee:", ethers.formatUnits(stealFee, 6), "USDT");
  console.log("Pot size:", ethers.formatUnits(potSize, 6), "USDT");
  console.log("Steal count:", stealCount.toString());

  // Mint some test USDT to deployer for testing
  console.log("\n💰 Minting test USDT for testing...");
  const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDT
  await testUSDT.mint(deployer.address, mintAmount);
  console.log("✅ Minted", ethers.formatUnits(mintAmount, 6), "USDT to deployer");

  // Check balances
  const deployerBalance = await testUSDT.balanceOf(deployer.address);
  console.log("Deployer USDT balance:", ethers.formatUnits(deployerBalance, 6), "USDT");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("Test USDT Token:", testUSDTAddress);
  console.log("Hot Potato Game:", gameAddress);
  
  console.log("\n🔧 Next steps:");
  console.log("1. Update contract-config.ts with these addresses");
  console.log("2. Test the game functionality");
  console.log("3. Deploy to mainnet when ready");

  // Save addresses to a file for easy reference
  const addresses = {
    network: "baseSepolia",
    testUSDT: testUSDTAddress,
    gameContract: gameAddress,
    deployer: deployer.address,
    stealFee: ethers.formatUnits(stealFeeUsdt, 6) + " USDT"
  };

  console.log("\n💾 Addresses saved to deployment-addresses.json");
  require('fs').writeFileSync(
    'deployment-addresses.json', 
    JSON.stringify(addresses, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
