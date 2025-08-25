import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther } from "viem";

describe("HotPotatoGame", function () {
  async function deployHotPotatoGameFixture() {
    const [owner, player1, player2] = await hre.viem.getWalletClients();
    
    // Mock price feed address for testing
    const mockPriceFeed = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
    const stealFeeUsdCents = 33n; // $0.33
    
    const hotPotatoGame = await hre.viem.deployContract("HotPotatoGame", [
      stealFeeUsdCents,
      mockPriceFeed
    ]);

    return { hotPotatoGame, owner, player1, player2, stealFeeUsdCents };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { hotPotatoGame, owner } = await loadFixture(deployHotPotatoGameFixture);
      expect(await hotPotatoGame.read.owner()).to.equal(owner.account.address);
    });

    it("Should set the correct steal fee", async function () {
      const { hotPotatoGame, stealFeeUsdCents } = await loadFixture(deployHotPotatoGameFixture);
      expect(await hotPotatoGame.read.stealFeeUsd()).to.equal(stealFeeUsdCents);
    });

    it("Should start with no current holder", async function () {
      const { hotPotatoGame } = await loadFixture(deployHotPotatoGameFixture);
      expect(await hotPotatoGame.read.currentHolder()).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("Game Management", function () {
    it("Should allow owner to start a game", async function () {
      const { hotPotatoGame, owner, player1 } = await loadFixture(deployHotPotatoGameFixture);
      
      await hotPotatoGame.write.startGame([player1.account.address], { account: owner.account.address });
      expect(await hotPotatoGame.read.currentHolder()).to.equal(player1.account.address);
    });

    it("Should not allow non-owner to start a game", async function () {
      const { hotPotatoGame, player1 } = await loadFixture(deployHotPotatoGameFixture);
      
      await expect(
        hotPotatoGame.write.startGame([player1.account.address], { account: player1.account.address })
      ).to.be.revertedWithCustomError(hotPotatoGame, "OwnableUnauthorizedAccount");
    });
  });

  describe("Stealing Potato", function () {
    it("Should not allow stealing when no game is active", async function () {
      const { hotPotatoGame, player1 } = await loadFixture(deployHotPotatoGameFixture);
      
      await expect(
        hotPotatoGame.write.stealPotato({ account: player1.account.address, value: parseEther("0.001") })
      ).to.be.revertedWith("No potato to steal");
    });

    it("Should not allow stealing from yourself", async function () {
      const { hotPotatoGame, owner, player1 } = await loadFixture(deployHotPotatoGameFixture);
      
      await hotPotatoGame.write.startGame([player1.account.address], { account: owner.account.address });
      
      await expect(
        hotPotatoGame.write.stealPotato({ account: player1.account.address, value: parseEther("0.001") })
      ).to.be.revertedWith("Cannot steal from yourself");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update steal fee", async function () {
      const { hotPotatoGame, owner } = await loadFixture(deployHotPotatoGameFixture);
      const newFee = 50n; // $0.50
      
      await hotPotatoGame.write.updateStealFee([newFee], { account: owner.account.address });
      expect(await hotPotatoGame.read.stealFeeUsd()).to.equal(newFee);
    });

    it("Should not allow non-owner to update steal fee", async function () {
      const { hotPotatoGame, player1 } = await loadFixture(deployHotPotatoGameFixture);
      const newFee = 50n;
      
      await expect(
        hotPotatoGame.write.updateStealFee([newFee], { account: player1.account.address })
      ).to.be.revertedWithCustomError(hotPotatoGame, "OwnableUnauthorizedAccount");
    });
  });
});
