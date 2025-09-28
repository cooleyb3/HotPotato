import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [
    // Prefer Farcaster Miniapp first to avoid MetaMask initialization in Farcaster webview
    miniAppConnector(), // For Farcaster environment
    metaMask(), // For localhost testing with MetaMask
  ]
})
