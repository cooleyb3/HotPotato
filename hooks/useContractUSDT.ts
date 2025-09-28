import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export interface User {
  fid: string
  username: string
  displayName: string
  pfp: string
  wallet: string
}

export interface GameState {
  currentHolder: string
  potSizeUsd: string
  stealCount: number
  stealFeeUsd: string
  isLoading: boolean
}

export const useContractUSDT = () => {
  // Wagmi hooks
  const { address, isConnected, chainId } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    chainId: 84532, // Base Sepolia
  })
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()

  // Farcaster context (optional - only available in Farcaster environment)
  const [sdk, setSdk] = useState<any>(null)

  // Local state
  const [user, setUser] = useState<User | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentHolder: '0x0000000000000000000000000000000000000000',
    potSizeUsd: '0.00',
    stealCount: 0,
    stealFeeUsd: '33', // $0.33 in cents
    isLoading: false,
  })

  // Fetch user data when connected
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) return

      try {
        // Try to get Farcaster SDK if available (only in Farcaster environment)
        let farcasterSdk = null
        try {
          // This will only work in Farcaster environment
          const { useFarcasterContext } = await import('@farcaster/miniapp-sdk')
          // Note: We can't use hooks conditionally, so we'll handle this differently
        } catch (error) {
          console.log('Farcaster SDK not available - using MetaMask mode')
        }

        // For now, create a basic user profile for MetaMask testing
        const basicUser: User = {
          fid: 'metamask-user',
          username: 'metamask-user',
          displayName: 'MetaMask User',
          pfp: '/abstract-geometric-shapes.png',
          wallet: address,
        }
        
        setUser(basicUser)
        console.log('✅ MetaMask user data loaded:', basicUser)
        
      } catch (error) {
        console.error('Error setting up user data:', error)
        // Fallback to basic user data
        setUser({
          fid: 'unknown',
          username: 'unknown',
          displayName: 'Unknown User',
          pfp: '/abstract-geometric-shapes.png',
          wallet: address,
        })
      }
    }

    fetchUserData()
  }, [isConnected, address])

  // Game functions (ready for USDT contract integration)
  const stealPotato = async () => {
    console.log('Steal function - ready for USDT contract')
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    // TODO: Implement actual USDT contract interaction
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isLoading: false }))
    }, 2000)
  }

  const popPotato = async () => {
    console.log('Pop function - ready for USDT contract')
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    // TODO: Implement actual USDT contract interaction
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isLoading: false }))
    }, 2000)
  }

  const refreshContractData = () => {
    console.log('Refresh function - ready for USDT contract')
    // TODO: Implement actual contract data fetching
  }

  // Format balance for display
  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return '0.00'
    const formatted = (Number(balance) / Math.pow(10, decimals)).toFixed(4)
    return formatted
  }

  // Get ETH balance for display
  const ethBalance = balance ? formatBalance(balance.value, balance.decimals) : '0.00'

  return {
    // Connection state
    isConnected,
    address,
    chainId,
    isConnecting,
    connectors,
    connect,
    disconnect,
    
    // User data
    user,
    
    // Game state
    gameState,
    setGameState,
    
    // Balance
    ethBalance,
    balance,
    
    // Game functions
    stealPotato,
    popPotato,
    refreshContractData,
  }
}
