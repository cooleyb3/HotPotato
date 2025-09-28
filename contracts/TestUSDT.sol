// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDT is ERC20, Ownable {
    constructor() ERC20("Test Tether USD", "tUSDT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * (10 ** decimals())); // Mint 1,000,000 tUSDT to deployer
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function faucet() public {
        _mint(msg.sender, 1000 * (10 ** decimals())); // Allow anyone to get 1000 tUSDT
    }
}