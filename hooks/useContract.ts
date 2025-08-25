'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

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

  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          
          // Try to authenticate user
          await connectWallet();
        } else {
          console.log('Running in regular web environment');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mock authentication until we properly integrate Farcaster SDK
      const mockUser = {
        fid: 12345,
        username: 'cryptoking',
        displayName: 'Crypto King',
        pfp: '/crypto-king-profile.png',
        wallet: '0xcece3a139cd463da522cc7683bc781ca574e57bb',
      };
      
      setUser(mockUser);
      setAccount(mockUser.wallet);
      setIsConnected(true);
      
      console.log('Mock user authenticated:', mockUser);
      
      // Try to get wallet provider (this should work)
      try {
        const wallet = await sdk.wallet.getEthereumProvider();
        if (wallet) {
          console.log('Wallet provider available');
        }
      } catch (walletError) {
        console.log('Wallet provider not available:', walletError);
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      // Reset game state
      setGameState(prev => ({
        ...prev,
        currentHolder: account,
        potSize: '0',
        potSizeUsd: '0.00',
        stealCount: 0,
        isGameActive: true,
        isLoading: false,
      }));
      
      console.log('Game started with holder:', account);
    } catch (error) {
      console.error('Error starting game:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const stealPotato = async (message?: string) => {
    try {
      if (!isConnected) {
        await connectWallet();
        return;
      }

      setGameState(prev => ({ ...prev, isLoading: true }));

      // Calculate new pot size (mock calculation for now)
      const currentPotSizeUsd = parseFloat(gameState.potSizeUsd);
      const stealFeeUsd = parseFloat(gameState.stealFeeUsd) / 100; // Convert cents to dollars
      const newPotSizeUsd = currentPotSizeUsd + stealFeeUsd;
      const newStealCount = gameState.stealCount + 1;

      // Update game state
      setGameState(prev => ({
        ...prev,
        currentHolder: account,
        potSize: (newPotSizeUsd / 2000).toString(), // Mock ETH conversion
        potSizeUsd: newPotSizeUsd.toFixed(2),
        stealCount: newStealCount,
        isLoading: false,
      }));

      console.log('Potato stolen! New pot size:', newPotSizeUsd);

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
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      // Reset game state
      setGameState(prev => ({
        ...prev,
        currentHolder: '0x0000000000000000000000000000000000000000',
        potSize: '0',
        potSizeUsd: '0.00',
        stealCount: 0,
        isGameActive: false,
        isLoading: false,
      }));

      console.log('Potato popped! Winner:', account);
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
    account,
    user,
    isLoading,
    connectWallet,
    startGame,
    stealPotato,
    popPotato,
    simulateOtherPlayerSteal,
  };
};
