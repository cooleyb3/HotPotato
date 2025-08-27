// Contract configuration for Hot Potato Game
export const CONTRACT_CONFIG = {
      // Base Sepolia Testnet
    baseSepolia: {
      contractAddress: "0x063656f13e0c4f6090da5ecdcf25dabb7da7e611",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
  },
  // Base Mainnet (for future deployment)
  base: {
    contractAddress: "", // Will be set after mainnet deployment
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
  },
}

// Current network (change this when deploying to mainnet)
export const CURRENT_NETWORK = "baseSepolia"

// Contract ABI (minimal version for frontend)
export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_stealFeeUsd", type: "uint256" },
      { internalType: "address", name: "_priceFeedAddress", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "newPotSizeUsd", type: "uint256" }
    ],
    name: "PotatoStolen",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "winnerAmountUsd", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "ownerCutUsd", type: "uint256" }
    ],
    name: "PotatoPopped",
    type: "event"
  },
  {
    inputs: [],
    name: "currentHolder",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "potSize",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "stealCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getPotSizeUsd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getStealFeeUsd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getRequiredEthForSteal",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },

  {
    inputs: [],
    name: "stealPotato",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "winner", type: "address" }],
    name: "popPotato",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const
