"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useContract } from "@/hooks/useContract"
import { useConnect } from "wagmi"

export default function HotPotatoGame() {
  const [showAbout, setShowAbout] = useState(false)
  const [isFever, setIsFever] = useState(false)
  const [potatoMood, setPotatoMood] = useState("happy")
  const [holdTime, setHoldTime] = useState(0)
  const [showStealPopup, setShowStealPopup] = useState(false)
  const [showMessagePrompt, setShowMessagePrompt] = useState(false)
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [selectedMessage, setSelectedMessage] = useState("")
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [showDevWarning, setShowDevWarning] = useState(true)

  // Contract integration
  const { gameState, isConnected, account, user, startGame, stealPotato, popPotato, simulateOtherPlayerSteal, contractAddress, chainId, isLoading } = useContract()
  
  // Wallet connection
  const { connect, connectors, isPending: isConnecting } = useConnect()

  useEffect(() => {
    const timer = setInterval(() => {
      setHoldTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFever(Math.random() > 0.8)
      const moods = ["happy", "nervous", "angry", "dizzy"]
      setPotatoMood(moods[Math.floor(Math.random() * moods.length)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Combine dynamic history with some sample entries for demo
  const historyEntries = [
    ...gameHistory,
    { newHolder: "alice", previousHolder: "bob", message: "This potato is mine now!", time: "2h ago", type: "steal" },
    { newHolder: "bob", previousHolder: "charlie", message: "Feeling lucky today 🍀", time: "4h ago", type: "steal" },
    { newHolder: "charlie", previousHolder: "dave", message: "HODL the potato! 💎🙌💎", time: "6h ago", type: "steal" },
  ].slice(0, 8) // Show max 8 entries

  const getProfilePicture = (username: string) => {
    const profileMap: Record<string, string> = {
      alice: "/crypto-king-profile.png",
      bob: "/potato-queen-profile.png",
      charlie: "/hodl-master-profile.png",
      dave: "/moon-boy-profile.png",
      eve: "/stylized-ape-profile.png",
      frank: "/lucky-player-profile.png",
      grace: "/speedster-profile.png",
      henry: "/fantasy-thief-profile.png",
      iris: "/fast-fingers-profile.png",
      cryptoking: "/crypto-king-profile.png",
    }
    return profileMap[username] || "/abstract-geometric-shapes.png"
  }

  const handleSteal = async () => {
    if (!isConnected) {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] })
      }
      return
    }
    
    try {
      const previousHolder = gameState.currentHolder
      await stealPotato()
      
      // Add to history with temporary message
      const newHistoryEntry = {
        newHolder: account.slice(0, 6) + '...' + account.slice(-4),
        previousHolder: previousHolder === '0x0000000000000000000000000000000000000000' 
          ? 'No one' 
          : previousHolder.slice(0, 6) + '...' + previousHolder.slice(-4),
        message: "Got it! 🥔", // This will be updated when user selects a message
        time: "Just now",
        type: "steal"
      }
      
      setGameHistory(prev => [newHistoryEntry, ...prev.slice(0, 7)]) // Keep last 8 entries
      
      setShowStealPopup(true)
      setTimeout(() => {
        setShowStealPopup(false)
        setShowMessagePrompt(true)
      }, 4500)
    } catch (error) {
      console.error('Failed to steal potato:', error)
    }
  }

  const handleMessageSubmit = (message: string) => {
    const messageWithAttribution = message.includes("@") ? message : `${message}, @cryptoking`
    
    // Update the most recent history entry with the selected message
    setGameHistory(prev => {
      if (prev.length > 0) {
        const updatedHistory = [...prev]
        updatedHistory[0] = {
          ...updatedHistory[0],
          message: messageWithAttribution
        }
        return updatedHistory
      }
      return prev
    })
    
    setShowMessagePrompt(false)
    setCustomMessage("")
  }

  const presetMessages = [
    "Got it! 🥔, @cryptoking",
    "Thanks for the potato!, @cryptoking",
    "My turn now!, @cryptoking",
    "Let's see how long I can hold this!, @cryptoking",
  ]

  const handleStartGame = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }
    
    try {
      await startGame()
      
      // Add game start to history
      const newHistoryEntry = {
        newHolder: account.slice(0, 6) + '...' + account.slice(-4),
        previousHolder: 'No one',
        message: "Game started! 🎮",
        time: "Just now",
        type: "steal"
      }
      
      setGameHistory(prev => [newHistoryEntry, ...prev.slice(0, 7)])
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  if (showAbout) {
    return (
      <div className="min-h-screen bg-black text-[#F5F5F5] p-4">
        <div className="max-w-md mx-auto pt-8">
          <h1 className="font-mono text-2xl text-center mb-8 text-[#FF6B00]">About Hot Potato</h1>

          <div className="space-y-6 font-mono text-sm leading-relaxed">
            <div>
              <h2 className="text-[#FF6B00] font-mono font-semibold mb-2">Rules:</h2>
              <ol className="space-y-1 text-xs font-mono">
                <li>1. One potato exists</li>
                <li>2. Steal for $0.33</li>
                <li>3. Pot grows each steal</li>
                <li>4. Pops 2-5x daily (random)</li>
                <li>5. Holder wins pot when it pops</li>
                <li>6. Fever = might pop soon</li>
              </ol>
            </div>

            <div>
              <h2 className="text-[#FF6B00] font-mono font-semibold mb-2">Origin:</h2>
              <p className="text-xs font-mono">
                Inspired by the party game, retro arcade mechanics, and on-chain game theory.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowAbout(false)}
            className="w-full mt-8 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black font-mono text-sm"
          >
            BACK TO GAME
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-black text-[#F5F5F5] px-2 sm:px-4 py-4 transition-all duration-500 ${
        isFever ? "animate-pulse" : ""
      }`}
    >
      {/* Development Warning Popup */}
      {showDevWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-[#FF6B00] rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-[#FF6B00] text-2xl mb-4">⚠️</div>
              <h3 className="font-mono text-lg text-[#FF6B00] mb-2">DEVELOPMENT MODE</h3>
              <p className="font-mono text-sm text-[#F5F5F5] mb-6 leading-relaxed">
                This app is still in development. Smart contract not yet deployed to mainnet. All transactions are simulated.
              </p>
              <Button
                onClick={() => setShowDevWarning(false)}
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black font-mono text-sm"
              >
                UNDERSTOOD
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto">
        {showStealPopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#FF6B00] text-black px-4 py-2 rounded font-mono text-sm animate-bounce">
            🥔 Potato stolen! New holder: @cryptoking
          </div>
        )}

        {showMessagePrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-black border-2 border-[#FF6B00] p-4 rounded max-w-sm w-full">
              <h3 className="text-[#FF6B00] font-mono text-sm mb-4">Leave a message:</h3>

              <div className="space-y-2 mb-4">
                {presetMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-2 text-xs font-mono rounded transition-all duration-200 ${
                      selectedMessage === msg 
                        ? "bg-[#FF6B00] text-black border-2 border-[#FF6B00]" 
                        : "bg-[#F5F5F5]/10 hover:bg-[#FF6B00]/20 text-[#F5F5F5]"
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value)
                  setSelectedMessage(e.target.value) // Auto-select custom message when typing
                }}
                placeholder="Custom message..."
                className={`w-full p-2 border text-xs font-mono mb-3 rounded transition-all duration-200 ${
                  selectedMessage === customMessage && customMessage !== ""
                    ? "bg-[#FF6B00] text-black border-[#FF6B00]" 
                    : "bg-[#F5F5F5]/10 border-[#F5F5F5]/30 text-[#F5F5F5]"
                }`}
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleMessageSubmit(selectedMessage || customMessage || "No message, @cryptoking")}
                  disabled={!selectedMessage && !customMessage}
                  className={`flex-1 font-mono text-xs ${
                    selectedMessage || customMessage
                      ? "bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black"
                      : "bg-[#F5F5F5]/20 text-[#F5F5F5] cursor-not-allowed"
                  }`}
                >
                  Send
                </Button>
                <Button
                  onClick={() => {
                    setShowMessagePrompt(false)
                    setSelectedMessage("")
                    setCustomMessage("")
                  }}
                  className="flex-1 bg-[#F5F5F5]/20 hover:bg-[#F5F5F5]/30 text-[#F5F5F5] font-mono text-xs"
                >
                  Skip
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center pt-2 sm:pt-6 mb-6 sm:mb-8 px-1">
          <h1 className="font-mono text-xl sm:text-2xl mb-2 text-[#FF6B00]">LEGENDARY POTATO</h1>
          <p className="text-[9px] sm:text-xs text-[#F5F5F5]/70 px-2 sm:px-4 font-mono">
            Pops 2-5x daily at random. Don't hold when it pops... or do.
          </p>
        </div>

        {/* Fever Banner */}
        {isFever && (
          <div className="bg-[#FF6B00] text-black text-center py-2 mb-4 sm:mb-6 font-mono text-xs animate-pulse mx-1">
            🔥 FEVER! Could pop ANY moment!
          </div>
        )}

        {/* Potato Display */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className={`inline-block p-4 sm:p-8 rounded-full transition-all duration-300 ${isFever ? "animate-bounce" : ""}`}
            style={{
              boxShadow: `0 0 ${isFever ? "60px" : "40px"} ${isFever ? "#FF6B00" : "#FF6B00"}`,
              animation: isFever ? "pulse 1s infinite" : "pulse 3s infinite",
            }}
          >
            <div className="text-6xl sm:text-8xl">
              {potatoMood === "happy" && "🥔"}
              {potatoMood === "nervous" && "😰"}
              {potatoMood === "angry" && "😡"}
              {potatoMood === "dizzy" && "😵"}
            </div>
          </div>
        </div>



        {/* Potato Info */}
        <Card className="bg-black border-[#F5F5F5]/30 p-3 sm:p-4 mb-4 sm:mb-6 mx-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs font-mono">
            <div>
              <div className="text-[#FF6B00] font-mono">HOLDER</div>
              <div className="font-mono font-semibold truncate text-[#F5F5F5]/70">
                {gameState.currentHolder === '0x0000000000000000000000000000000000000000' 
                  ? 'No holder' 
                  : gameState.currentHolder.slice(0, 6) + '...' + gameState.currentHolder.slice(-4)}
              </div>
            </div>
            <div>
              <div className="text-[#FF6B00] font-mono">TIME</div>
              <div className="font-mono font-semibold text-[#F5F5F5]/70">{formatTime(holdTime)}</div>
            </div>
            <div>
              <div className="text-[#FF6B00] font-mono">POT</div>
              <div className="font-mono font-semibold text-[#F5F5F5]/70">
                ${parseFloat(gameState.potSizeUsd).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[#FF6B00] font-mono">STEALS</div>
              <div className="font-mono font-semibold text-[#F5F5F5]/70">{gameState.stealCount}</div>
            </div>
          </div>
        </Card>

        {/* Start Game Button */}
        {isConnected && gameState.currentHolder === '0x0000000000000000000000000000000000000000' && (
          <Button
            onClick={handleStartGame}
            className="w-full py-4 mb-4 mx-1 font-mono text-sm bg-[#00FF84] hover:bg-[#00FF84]/80 text-black"
            disabled={gameState.isLoading}
          >
            <span className="text-sm">
              {gameState.isLoading ? 'Starting Game...' : 'START GAME'}
            </span>
          </Button>
        )}

        {/* Steal Button */}
        {isConnected && gameState.currentHolder !== '0x0000000000000000000000000000000000000000' && gameState.currentHolder !== account && (
          <Button
            onClick={handleSteal}
            className={`w-full py-4 mb-6 sm:mb-8 mx-1 font-mono text-sm transition-all duration-300 ${
              isFever
                ? "bg-[#00FF84] hover:bg-[#00FF84]/80 text-black animate-pulse"
                : "bg-[#FF6B00] hover:bg-[#FF6B00]/80 hover:ring-2 hover:ring-[#00FF84] text-black"
            }`}
            disabled={gameState.isLoading}
          >
            <span className="text-sm">
              {gameState.isLoading ? 'Stealing...' : `STEAL THE POTATO – $${(parseInt(gameState.stealFeeUsd) / 100).toFixed(2)}`}
            </span>
          </Button>
        )}

        {/* Current Holder Info */}
        {isConnected && gameState.currentHolder !== '0x0000000000000000000000000000000000000000' && gameState.currentHolder === account && (
          <Card className="bg-black border-[#00FF84]/30 p-3 sm:p-4 mb-6 sm:mb-8 mx-1">
            <div className="text-center">
              <div className="text-[#00FF84] font-mono text-sm mb-2">🎉 YOU HOLD THE POTATO! 🎉</div>
              <div className="text-[#F5F5F5]/70 font-mono text-xs mb-3">
                Wait for someone else to steal it from you...
              </div>
              <Button
                onClick={simulateOtherPlayerSteal}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black font-mono text-xs"
              >
                🧪 TEST: Simulate Other Player
              </Button>
            </div>
          </Card>
        )}

        {/* Wallet Status Section */}
        <Card className="bg-black border-[#F5F5F5]/30 p-3 sm:p-4 mb-6 sm:mb-8 mx-1">
          <h3 className="text-[#FF6B00] font-mono text-xs mb-3">WALLET STATUS</h3>
          
          {!isConnected ? (
            <div className="text-center">
              <div className="text-[#F5F5F5]/70 font-mono text-xs mb-3">
                Connect your wallet to play the Hot Potato game
              </div>
              <Button
                onClick={() => {
                  if (connectors.length > 0) {
                    connect({ connector: connectors[0] });
                  }
                }}
                className="w-full py-3 font-mono text-sm bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black"
                disabled={connectors.length === 0 || isConnecting}
              >
                <span className="text-sm">
                  {isConnecting ? 'CONNECTING...' : 
                   connectors.length === 0 ? 'NO WALLET AVAILABLE' : 'CONNECT WALLET TO PLAY'}
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#F5F5F5]/70">Status:</span>
                <span className="text-[#00FF84]">
                  {isLoading ? '● Loading...' : '● Connected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F5F5F5]/70">Address:</span>
                <span className="text-[#F5F5F5]/90 font-mono">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F5F5F5]/70">Network:</span>
                <span className="text-[#F5F5F5]/90">
                  {chainId === 84532 ? 'Base Sepolia' : chainId === 8453 ? 'Base' : `Chain ID: ${chainId}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F5F5F5]/70">Contract:</span>
                <span className="text-[#F5F5F5]/90 font-mono text-[10px]">
                  {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* User Profile Section */}
        {isConnected && user && (
          <Card className="bg-black border-[#F5F5F5]/30 p-3 sm:p-4 mb-6 sm:mb-8 mx-1">
            <h3 className="text-[#FF6B00] font-mono text-xs mb-3">PLAYER PROFILE</h3>
            <div className="flex items-center space-x-3">
              <img
                src={user.pfp}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[#F5F5F5]/90 font-mono text-xs font-semibold truncate">
                  {user.displayName}
                </div>
                <div className="text-[#F5F5F5]/70 font-mono text-[10px]">
                  @{user.username} • FID: {user.fid}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-black border-[#F5F5F5]/30 p-3 sm:p-4 mb-6 sm:mb-8 mx-1">
          <h3 className="text-[#FF6B00] font-mono text-xs mb-3">{showFullHistory ? "FULL HISTORY" : "RECENT DIARY"}</h3>

          {showFullHistory ? (
            <div className="space-y-2 text-xs font-mono max-h-64 overflow-y-auto">
              {historyEntries.map((entry, index) => (
                <div key={index} className={`p-2 rounded ${index % 2 === 0 ? "bg-[#F5F5F5]/5" : "bg-transparent"}`}>
                  {entry.type === "steal" ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🥔</span>
                        <img
                          src={getProfilePicture(entry.newHolder) || "/placeholder.svg"}
                          alt={entry.newHolder}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[#F5F5F5]/80 font-semibold">@{entry.newHolder}</span>
                        <span className="text-[#F5F5F5]/50 text-[10px]">stole from @{entry.previousHolder}</span>
                        <span className="text-[#F5F5F5]/50 text-[10px] ml-auto">{entry.time}</span>
                      </div>
                      <div className="text-[#F5F5F5]/80 ml-8">
                        "{entry.message}"<span className="text-[#00FF84]/70 text-[10px]">, @{entry.newHolder}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-l-2 border-[#00FF84] pl-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#00FF84]">💥 POTATO POP! @{entry.winner} wins the pot!</span>
                        <span className="text-[#F5F5F5]/50 text-[10px] ml-auto">{entry.time}</span>
                      </div>
                      <div className="text-[#00FF84] text-[10px]">
                        💰 POTATO POP! @{entry.winner} wins {entry.amount}!
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-xs font-mono">
              {historyEntries.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-lg">🥔</span>
                  <img
                    src={getProfilePicture(entry.newHolder) || "/placeholder.svg"}
                    alt={entry.newHolder}
                    className="w-3 h-3 rounded-full object-cover mt-0.5 flex-shrink-0"
                  />
                  <div className="text-[#F5F5F5]/80 truncate font-mono min-w-0">
                    <span className="font-semibold">@{entry.newHolder}</span>
                    <span className="text-[#F5F5F5]/50 text-[10px] ml-1">stole</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="text-[#00FF84] text-[11px] mt-3 hover:underline font-mono"
          >
            {showFullHistory ? "Hide History" : "View Full History"}
          </button>
        </Card>

        {/* Footer */}
        <div className="flex justify-center space-x-6 text-sm pb-4 font-mono px-1">
          <button
            onClick={() => setShowAbout(true)}
            className="text-[#FF6B00] hover:text-[#00FF84] transition-colors font-mono"
          >
            About
          </button>
          <Link href="/leaderboard" className="text-[#FF6B00] hover:text-[#00FF84] transition-colors font-mono">
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
