// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HotPotatoGameUSDT
 * @dev A game where players pay USDT to "steal" a virtual potato from the current holder.
 * The pot grows with each steal until the potato "pops," awarding the pot to the last holder.
 */
contract HotPotatoGameUSDT is Ownable, ReentrancyGuard {
    // State variables
    IERC20 public usdtToken;
    address public currentHolder;
    uint256 public potSize; // in USDT (6 decimals)
    uint256 public stealCount;
    uint256 public stealFeeUsdt; // in USDT (6 decimals, e.g., 330000 = $0.33)
    
    // Events
    event PotatoStolen(address indexed from, address indexed to, uint256 newPotSizeUsdt);
    event PotatoPopped(address indexed winner, uint256 winnerAmountUsdt, uint256 ownerCutUsdt);
    
    // Constants
    uint256 private constant OWNER_CUT_PERCENTAGE = 15; // 15%
    uint256 private constant USDT_DECIMALS = 6;
    
    /**
     * @dev Constructor sets up the initial game state
     * @param _usdtTokenAddress Address of the USDT token contract
     * @param _stealFeeUsdt Fee in USDT (6 decimals, e.g., 330000 = $0.33)
     */
    constructor(address _usdtTokenAddress, uint256 _stealFeeUsdt) Ownable(msg.sender) {
        require(_usdtTokenAddress != address(0), "Invalid USDT token address");
        require(_stealFeeUsdt > 0, "Fee must be greater than 0");
        require(_stealFeeUsdt <= 100000000, "Fee cannot exceed $100"); // 100 USDT max
        
        usdtToken = IERC20(_usdtTokenAddress);
        stealFeeUsdt = _stealFeeUsdt;
        currentHolder = address(this); // Contract starts as the holder
        potSize = 0;
        stealCount = 0;
    }
    
    /**
     * @dev Allows a player to steal the potato by paying USDT
     */
    function stealPotato() external nonReentrant {
        require(currentHolder != address(0), "Game not active - no potato to steal");
        require(msg.sender != currentHolder, "Cannot steal potato from yourself");
        
        // Transfer USDT from player to contract
        require(
            usdtToken.transferFrom(msg.sender, address(this), stealFeeUsdt),
            "USDT transfer failed"
        );
        
        address previousHolder = currentHolder;
        currentHolder = msg.sender;
        potSize += stealFeeUsdt;
        stealCount++;
        
        emit PotatoStolen(previousHolder, msg.sender, potSize);
    }
    
    /**
     * @dev Allows the owner to pop the potato and distribute winnings
     * @param winner The address of the winner (current holder)
     */
    function popPotato(address winner) external onlyOwner nonReentrant {
        require(currentHolder != address(0), "No potato to pop");
        require(winner == currentHolder, "Winner must be current holder");
        require(potSize > 0, "No pot to distribute");
        
        uint256 ownerCut = (potSize * OWNER_CUT_PERCENTAGE) / 100;
        uint256 winnerAmount = potSize - ownerCut;
        
        // Reset game state - contract becomes holder again
        currentHolder = address(this);
        potSize = 0;
        
        // Distribute USDT winnings
        if (ownerCut > 0) {
            require(
                usdtToken.transfer(owner(), ownerCut),
                "Owner USDT transfer failed"
            );
        }
        
        if (winnerAmount > 0) {
            require(
                usdtToken.transfer(winner, winnerAmount),
                "Winner USDT transfer failed"
            );
        }
        
        emit PotatoPopped(winner, winnerAmount, ownerCut);
    }
    
    /**
     * @dev Updates the steal fee (only owner)
     * @param newFeeUsdt New fee in USDT (6 decimals)
     */
    function updateStealFee(uint256 newFeeUsdt) external onlyOwner {
        require(newFeeUsdt > 0, "Fee must be greater than 0");
        require(newFeeUsdt <= 100000000, "Fee cannot exceed $100");
        stealFeeUsdt = newFeeUsdt;
    }
    
    /**
     * @dev Returns the current pot size in USDT
     * @return Current pot size in USDT (6 decimals)
     */
    function getPotSizeUsdt() external view returns (uint256) {
        return potSize;
    }
    
    /**
     * @dev Returns the current steal fee in USDT
     * @return Current steal fee in USDT (6 decimals)
     */
    function getStealFeeUsdt() external view returns (uint256) {
        return stealFeeUsdt;
    }
    
    /**
     * @dev Emergency function to withdraw stuck USDT (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT to withdraw");
        
        require(
            usdtToken.transfer(owner(), balance),
            "Emergency withdrawal failed"
        );
    }
    
    /**
     * @dev Get the current holder address
     * @return Current holder address
     */
    function getCurrentHolder() external view returns (address) {
        return currentHolder;
    }
    
    /**
     * @dev Get the current steal count
     * @return Current steal count
     */
    function getStealCount() external view returns (uint256) {
        return stealCount;
    }
}
