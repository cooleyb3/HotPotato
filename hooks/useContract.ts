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
    const getUserData = async () => {
      try {
        if (isConnected && address) {
          // Check if we're in a Farcaster Miniapp environment
          const isInMiniapp = await sdk.isInMiniApp();
          
          if (isInMiniapp) {
            // Use Quick Auth to get real user data
            try {
              console.log('Attempting Quick Auth to get user data...');
              
              // Get JWT token using Quick Auth
              const { token } = await sdk.quickAuth.getToken();
              console.log('Quick Auth token received:', token);
              
              if (token) {
                // Decode JWT to extract FID from sub field
                try {
                  const tokenParts = token.split('.');
                  if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('Decoded JWT payload:', payload);
                    
                    const fid = payload.sub; // FID is in the 'sub' field
                    console.log('Extracted FID from JWT:', fid);
                    
                    if (fid) {
                      // Fetch real user data from Farcaster API using the FID
                      const userResponse = await fetch(`https://api.farcaster.xyz/fc/user?fid=${fid}`);
                      
                      if (userResponse.ok) {
                        const userData = await userResponse.json();
                        console.log('Farcaster API response:', userData);
                        
                        if (userData && userData.user) {
                          const realUser = {
                            fid: userData.user.fid,
                            username: userData.user.username || 'unknown',
                            displayName: userData.user.displayName || userData.user.username || 'Unknown User',
                            pfp: userData.user.pfpUrl || '/abstract-geometric-shapes.png',
                            wallet: address,
                          };
                          
                          setUser(realUser);
                          console.log('✅ REAL Farcaster user data loaded:', realUser);
                          return;
                        }
                      } else {
                        console.log('❌ Farcaster API request failed:', userResponse.status);
                      }
                    }
                  }
                } catch (jwtError) {
                  console.log('❌ Error decoding JWT:', jwtError);
                }
              }
              
              // Fallback: try to get user data from context
              console.log('Trying context fallback...');
              let farcasterUser = null;
              try {
                const context = await sdk.context;
                if (context?.user) {
                  farcasterUser = context.user;
                } else if (context?.location && 'cast' in context.location && context.location.cast?.author) {
                  farcasterUser = context.location.cast.author;
                }
              } catch (contextError) {
                console.log('Error accessing SDK context:', contextError);
              }
                
              if (farcasterUser) {
                const realUser = {
                  fid: farcasterUser.fid,
                  username: farcasterUser.username || 'unknown',
                  displayName: farcasterUser.displayName || 'Unknown User',
                  pfp: farcasterUser.pfpUrl || '/abstract-geometric-shapes.png',
                  wallet: address,
                };
                
                setUser(realUser);
                console.log('✅ Farcaster user data loaded via context fallback:', realUser);
              } else {
                // If all else fails, use mock data
                console.log('❌ No user data available, using mock data');
                const mockUser = {
                  fid: 12345,
                  username: 'cryptoking',
                  displayName: 'Crypto King',
                  pfp: '/crypto-king-profile.png',
                  wallet: address,
                };
                setUser(mockUser);
              }
            } catch (authError) {
              console.log('❌ Quick Auth error:', authError);
              // Fallback to mock data
              const mockUser = {
                fid: 12345,
                username: 'cryptoking',
                displayName: 'Crypto King',
                pfp: '/crypto-king-profile.png',
                wallet: address,
              };
              setUser(mockUser);
            }
          } else {
            // Fallback to mock data for non-Farcaster environment
            const mockUser = {
              fid: 12345,
              username: 'cryptoking',
              displayName: 'Crypto King',
              pfp: '/crypto-king-profile.png',
              wallet: address,
            };
            
            setUser(mockUser);
            console.log('Using mock user data (not in Farcaster environment)');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        // Fallback to mock data on error
        if (isConnected && address) {
          const mockUser = {
            fid: 12345,
            username: 'cryptoking',
            displayName: 'Crypto King',
            pfp: '/crypto-king-profile.png',
            wallet: address,
          };
          setUser(mockUser);
        }
      }
    };

    getUserData();
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
