'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useReadContract, useWriteContract } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { CONTRACT_CONFIG, CONTRACT_ABI, CURRENT_NETWORK } from '@/lib/contract-config';

interface GameState {
  currentHolder: string;
  potSize: string;
  potSizeUsd: string;
  stealCount: number;
  isGameActive: boolean;
  stealFeeUsd: string;
  isLoading: boolean;
}

interface User {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
  wallet: string;
}

export const useContract = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentHolder: '0x0000000000000000000000000000000000000000',
    potSize: '0',
    potSizeUsd: '0.00',
    stealCount: 0,
    isGameActive: false,
    stealFeeUsd: '33', // $0.33 in cents
    isLoading: false,
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Wagmi hooks for wallet connection
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors } = useConnect();

  // Contract configuration
  const contractConfig = CONTRACT_CONFIG[CURRENT_NETWORK as keyof typeof CONTRACT_CONFIG];
  const contractAddress = contractConfig.contractAddress as `0x${string}`;

  // Contract read operations
  const { data: currentHolder } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'currentHolder',
  });

  const { data: potSize } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'potSize',
  });

  const { data: stealCount } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'stealCount',
  });

  const { data: potSizeUsd } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getPotSizeUsd',
  });

  const { data: stealFeeUsd } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getStealFeeUsd',
  });

  const { data: requiredEthForSteal } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getRequiredEthForSteal',
  });

  // Contract write operations
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Helper function to get required ETH for steal
  const getRequiredEthForSteal = async () => {
    if (requiredEthForSteal) {
      return requiredEthForSteal;
    }
    // Fallback to calculating from steal fee if needed
    return BigInt(0);
  };

  // Initialize Farcaster SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if we're in a Farcaster Miniapp environment
        const isInMiniapp = await sdk.isInMiniApp();
        
        if (isInMiniapp) {
          console.log('Running in Farcaster Miniapp environment');
          
          // Call ready() to hide splash screen and show our app
          await sdk.actions.ready();
          
          // Auto-connect to wallet if available
          if (connectors.length > 0 && !isConnected) {
            try {
              await connect({ connector: connectors[0] });
            } catch (error) {
              console.log('Auto-connect failed:', error);
            }
          }
        } else {
          console.log('Running in regular web environment');
        }
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, [connectors, isConnected, connect]);

  // Update game state when contract data changes
  useEffect(() => {
    if (currentHolder !== undefined) {
      setGameState(prev => ({
        ...prev,
        currentHolder: currentHolder || '0x0000000000000000000000000000000000000000',
        isGameActive: currentHolder !== '0x0000000000000000000000000000000000000000',
      }));
    }
  }, [currentHolder]);

  useEffect(() => {
    if (potSize !== undefined) {
      setGameState(prev => ({
        ...prev,
        potSize: potSize?.toString() || '0',
      }));
    }
  }, [potSize]);

  useEffect(() => {
    if (stealCount !== undefined) {
      setGameState(prev => ({
        ...prev,
        stealCount: Number(stealCount) || 0,
      }));
    }
  }, [stealCount]);

  useEffect(() => {
    if (potSizeUsd !== undefined) {
      setGameState(prev => ({
        ...prev,
        potSizeUsd: potSizeUsd ? (Number(potSizeUsd) / 100).toFixed(2) : '0.00',
      }));
    }
  }, [potSizeUsd]);

  useEffect(() => {
    if (stealFeeUsd !== undefined) {
      setGameState(prev => ({
        ...prev,
        stealFeeUsd: stealFeeUsd?.toString() || '33',
      }));
    }
  }, [stealFeeUsd]);

  // Update user when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      // For now, use mock user data until we get FID from Farcaster
      const mockUser = {
        fid: 12345,
        username: 'cryptoking',
        displayName: 'Crypto King',
        pfp: '/crypto-king-profile.png',
        wallet: address,
      };
      
      setUser(mockUser);
      console.log('Wallet connected:', address);
    } else {
      setUser(null);
    }
  }, [isConnected, address]);

  const startGame = async () => {
    try {
      if (!isConnected || !address) {
        console.log('Wallet not connected');
        return;
      }

      setGameState(prev => ({ ...prev, isLoading: true }));
      
      // Call contract to start game
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'startGame',
        args: [address],
      });
      
      console.log('Starting game with holder:', address);
    } catch (error) {
      console.error('Error starting game:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const stealPotato = async (message?: string) => {
    try {
      if (!isConnected || !address) {
        console.log('Wallet not connected');
        return;
      }

      setGameState(prev => ({ ...prev, isLoading: true }));

      // Get required ETH amount for steal
      const requiredEth = await getRequiredEthForSteal();
      
      // Call contract to steal potato
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'stealPotato',
        value: requiredEth,
      });

      console.log('Stealing potato with payment:', requiredEth.toString());

      // TODO: Implement sharing functionality when Farcaster SDK supports it
      if (message) {
        console.log('Would share message:', message);
      }

    } catch (error) {
      console.error('Error stealing potato:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const popPotato = async () => {
    try {
      if (!isConnected || !address) {
        console.log('Wallet not connected');
        return;
      }

      setGameState(prev => ({ ...prev, isLoading: true }));
      
      // Call contract to pop potato (only owner can do this)
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'popPotato',
        args: [currentHolder || address],
      });

      console.log('Popping potato for winner:', currentHolder || address);
    } catch (error) {
      console.error('Error popping potato:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const simulateOtherPlayerSteal = () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    setGameState(prev => ({
      ...prev,
      currentHolder: mockAddress,
    }));
    console.log('Simulated other player steal. New holder:', mockAddress);
  };

  return {
    gameState,
    isConnected,
    account: address,
    user,
    isLoading: isLoading || isWritePending,
    startGame,
    stealPotato,
    popPotato,
    simulateOtherPlayerSteal,
    contractAddress,
    chainId,
  };
};
