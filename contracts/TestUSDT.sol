// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestUSDT
 * @dev A simple ERC20 token for testing the Hot Potato game
 * @notice This is a test token that mimics USDT behavior (6 decimals)
 */
contract TestUSDT is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;
    
    constructor() ERC20("Test USDT", "TUSDT") Ownable(msg.sender) {
        // Mint 1,000,000 TUSDT to the deployer for testing
        _mint(msg.sender, 1000000 * 10**_DECIMALS);
    }
    
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
    
    /**
     * @dev Mint tokens to any address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in smallest unit)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function - anyone can get 100 TUSDT for testing
     */
    function faucet() external {
        uint256 faucetAmount = 100 * 10**_DECIMALS; // 100 TUSDT
        _mint(msg.sender, faucetAmount);
    }
}
