'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useReadContract, useWriteContract, useSwitchChain, useBalance } from 'wagmi';
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

  // Contract configuration
  const contractConfig = CONTRACT_CONFIG[CURRENT_NETWORK as keyof typeof CONTRACT_CONFIG];
  
  // Use Wagmi hooks for wallet connection
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  
  // Get user's ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId: contractConfig.chainId,
  });
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

  // Debug: Log required ETH when it changes
  useEffect(() => {
    console.log('Required ETH from contract:', requiredEthForSteal?.toString());
    if (requiredEthForSteal) {
      console.log('Required ETH in ETH:', Number(requiredEthForSteal) / 1e18);
    }
  }, [requiredEthForSteal]);

  // Contract write operations
  const { writeContract, isPending: isWritePending, data: writeData, error: writeError } = useWriteContract();

  // Helper function to get required ETH for steal
  const getRequiredEthForSteal = async () => {
    if (requiredEthForSteal) {
      return requiredEthForSteal;
    }
    
    // If requiredEthForSteal is not available, calculate it manually
    // This is a fallback for when the contract read fails
    console.log('Required ETH not available from contract, using fallback calculation');
    
    // For Base Sepolia, we'll use a rough estimate based on $0.33
    // This is not ideal but better than sending 0 ETH
    const estimatedEthFor33Cents = BigInt(100000000000000000); // 0.1 ETH as fallback
    return estimatedEthFor33Cents;
  };

  // Helper function to check and switch to correct network
  const ensureCorrectNetwork = async () => {
    const expectedChainId = contractConfig.chainId;
    if (chainId !== expectedChainId) {
      console.log(`Network mismatch: Expected ${expectedChainId} (Base Sepolia), got ${chainId}`);
      
      // Try to switch to the correct network
      try {
        await switchChain({ chainId: expectedChainId });
        console.log('Switched to Base Sepolia network');
        return true;
      } catch (switchError) {
        console.error('Failed to switch network:', switchError);
        alert(`Please switch to Base Sepolia network manually. Current network: ${chainId === 8453 ? 'Base Mainnet' : 'Unknown'}`);
        return false;
      }
    }
    return true;
  };

  // Helper function to check ETH balance
  const checkEthBalance = () => {
    if (!ethBalance) {
      console.log('ETH balance not available');
      return false;
    }
    
    // Check if balance is less than 0.001 ETH (minimum for gas)
    const minBalance = BigInt(1000000000000000); // 0.001 ETH in wei
    if (ethBalance.value < minBalance) {
      console.log('Insufficient ETH balance for gas fees');
      return false;
    }
    
    return true;
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
    console.log('Current holder from contract:', currentHolder);
    if (currentHolder !== undefined) {
      setGameState(prev => ({
        ...prev,
        currentHolder: currentHolder,
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

  // Monitor write contract errors
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      setGameState(prev => ({ ...prev, isLoading: false }));
      
      // Provide more specific error messages
      let errorMessage = writeError.message;
      if (writeError.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH balance for gas fees. Please add more ETH to your wallet.';
      } else if (writeError.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (writeError.message.includes('chain')) {
        errorMessage = 'Network mismatch. Please ensure you are on Base Sepolia network.';
      }
      
      alert(`Transaction failed: ${errorMessage}`);
    }
  }, [writeError]);

  // Monitor write contract success
  useEffect(() => {
    if (writeData) {
      console.log('Transaction successful:', writeData);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [writeData]);

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



  const stealPotato = async (message?: string) => {
    try {
      if (!isConnected || !address) {
        console.log('Wallet not connected');
        alert('Please connect your wallet first');
        return;
      }

      // Check if we're on the correct network
      const networkOk = await ensureCorrectNetwork();
      if (!networkOk) {
        setGameState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get required ETH amount for steal
      const requiredEth = await getRequiredEthForSteal();
      console.log('Required ETH for steal:', requiredEth.toString(), 'wei');
      console.log('Required ETH for steal:', Number(requiredEth) / 1e18, 'ETH');
      
      // Check if user has enough ETH for steal fee + gas
      const totalRequired = requiredEth + BigInt(1000000000000000); // steal fee + 0.001 ETH for gas
      console.log('Total required (steal fee + gas):', Number(totalRequired) / 1e18, 'ETH');
      
      if (ethBalance && ethBalance.value < totalRequired) {
        alert(`Insufficient ETH balance. You need ${Number(totalRequired) / 1e18} ETH (${Number(requiredEth) / 1e18} for steal fee + gas). Current balance: ${Number(ethBalance.value) / 1e18} ETH`);
        setGameState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setGameState(prev => ({ ...prev, isLoading: true }));

      console.log('Stealing potato with payment:', requiredEth.toString());
      console.log('Contract address:', contractAddress);
      console.log('Current network:', chainId);
      console.log('ETH balance:', ethBalance ? `${Number(ethBalance.value) / 1e18} ETH` : 'Unknown');
      
      // Call contract to steal potato
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'stealPotato',
        value: requiredEth,
      });

      // TODO: Implement sharing functionality when Farcaster SDK supports it
      if (message) {
        console.log('Would share message:', message);
      }

    } catch (error) {
      console.error('Error stealing potato:', error);
      alert(`Failed to steal potato: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    stealPotato,
    popPotato,
    simulateOtherPlayerSteal,
    contractAddress,
    chainId,
  };
};
