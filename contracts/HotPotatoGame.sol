// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HotPotatoGame
 * @dev A game where players pay a fee to "steal" a virtual potato from the current holder.
 * The pot grows with each steal until the potato "pops," awarding the pot to the last holder.
 */
contract HotPotatoGame is Ownable, ReentrancyGuard {
    // State variables
    address public currentHolder;
    uint256 public potSize; // in wei
    uint256 public stealCount;
    uint256 public stealFeeUsd; // stored in cents (e.g., 33 = $0.33)
    AggregatorV3Interface public priceFeed;
    
    // Events
    event PotatoStolen(address indexed from, address indexed to, uint256 newPotSizeUsd);
    event PotatoPopped(address indexed winner, uint256 winnerAmountUsd, uint256 ownerCutUsd);
    
    // Constants
    uint256 private constant OWNER_CUT_PERCENTAGE = 15; // 15%
    uint256 private constant PRICE_FEED_DECIMALS = 8;
    uint256 private constant USD_CENTS_DECIMALS = 2;
    
    /**
     * @dev Constructor sets up the initial game state
     * @param _stealFeeUsd Fee in USD cents (e.g., 33 = $0.33)
     * @param _priceFeedAddress Chainlink ETH/USD price feed address for Base
     */
    constructor(uint256 _stealFeeUsd, address _priceFeedAddress) Ownable(msg.sender) {
        stealFeeUsd = _stealFeeUsd;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        currentHolder = address(0); // No initial holder
        potSize = 0;
        stealCount = 0;
    }
    
    /**
     * @dev Converts USD cents to ETH in wei using Chainlink price feed
     * @param usdCents Amount in USD cents
     * @return ethAmount Amount in wei
     */
    function getEthAmount(uint256 usdCents) internal view returns (uint256 ethAmount) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        
        // Convert USD cents to USD (divide by 100)
        uint256 usdAmount = usdCents * (10 ** (18 - USD_CENTS_DECIMALS));
        
        // Convert USD to ETH: (USD * 10^18) / (ETH price * 10^8)
        ethAmount = (usdAmount * (10 ** PRICE_FEED_DECIMALS)) / uint256(price);
    }
    
    /**
     * @dev Allows a player to steal the potato by paying the fee
     */
    function stealPotato() external payable nonReentrant {
        require(currentHolder != address(0), "No potato to steal");
        require(msg.sender != currentHolder, "Cannot steal from yourself");
        
        uint256 requiredEth = getEthAmount(stealFeeUsd);
        require(msg.value == requiredEth, "Incorrect payment amount");
        
        address previousHolder = currentHolder;
        currentHolder = msg.sender;
        potSize += msg.value;
        stealCount++;
        
        emit PotatoStolen(previousHolder, msg.sender, getPotSizeUsd());
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
        
        // Reset game state
        currentHolder = address(0);
        potSize = 0;
        
        // Distribute winnings
        if (ownerCut > 0) {
            (bool ownerSuccess,) = owner().call{value: ownerCut}("");
            require(ownerSuccess, "Owner transfer failed");
        }
        
        if (winnerAmount > 0) {
            (bool winnerSuccess,) = winner.call{value: winnerAmount}("");
            require(winnerSuccess, "Winner transfer failed");
        }
        
        emit PotatoPopped(winner, getUsdAmount(winnerAmount), getUsdAmount(ownerCut));
    }
    
    /**
     * @dev Starts a new game by setting an initial holder
     * @param initialHolder The address to start as the potato holder
     */
    function startGame(address initialHolder) external onlyOwner {
        require(currentHolder == address(0), "Game already in progress");
        require(initialHolder != address(0), "Invalid initial holder");
        currentHolder = initialHolder;
    }
    
    /**
     * @dev Updates the steal fee (only owner)
     * @param newFeeUsd New fee in USD cents
     */
    function updateStealFee(uint256 newFeeUsd) external onlyOwner {
        stealFeeUsd = newFeeUsd;
    }
    
    /**
     * @dev Converts ETH amount to USD for display
     * @param ethAmount Amount in wei
     * @return usdAmount Amount in USD cents
     */
    function getUsdAmount(uint256 ethAmount) public view returns (uint256 usdAmount) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        
        // Convert ETH to USD: (ETH * price * 10^8) / 10^18
        usdAmount = (ethAmount * uint256(price)) / (10 ** (18 - PRICE_FEED_DECIMALS));
        // Convert to cents
        usdAmount = usdAmount / (10 ** (18 - USD_CENTS_DECIMALS));
    }
    
    /**
     * @dev Returns the current pot size in USD cents
     * @return Current pot size in USD cents
     */
    function getPotSizeUsd() public view returns (uint256) {
        return getUsdAmount(potSize);
    }
    
    /**
     * @dev Returns the current steal fee in USD cents
     * @return Current steal fee in USD cents
     */
    function getStealFeeUsd() external view returns (uint256) {
        return stealFeeUsd;
    }
    
    /**
     * @dev Returns the ETH amount required to steal the potato
     * @return Required ETH amount in wei
     */
    function getRequiredEthForSteal() external view returns (uint256) {
        return getEthAmount(stealFeeUsd);
    }
    
    /**
     * @dev Emergency function to withdraw stuck ETH (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success,) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Prevents direct ETH transfers to the contract
     */
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
    
    /**
     * @dev Prevents direct ETH transfers to the contract
     */
    fallback() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
