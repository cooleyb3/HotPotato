"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

type LeaderboardCategory = "biggest-wins" | "most-wins" | "most-steals"

interface LeaderboardEntry {
  rank: number
  handle: string
  avatar: string
  value: string
  date?: string
}

const mockData: Record<LeaderboardCategory, LeaderboardEntry[]> = {
  "biggest-wins": [
    { rank: 1, handle: "@cryptoking", avatar: "/crypto-king-profile.png", value: "2,847.50 USDT" },
    { rank: 2, handle: "@potatoqueen", avatar: "/potato-queen-profile.png", value: "1,923.80 USDT" },
    { rank: 3, handle: "@hodlmaster", avatar: "/hodl-master-profile.png", value: "1,456.20 USDT" },
    { rank: 4, handle: "@moonboy", avatar: "/moon-boy-profile.png", value: "987.40 USDT" },
    { rank: 5, handle: "@degenape", avatar: "/stylized-ape-profile.png", value: "743.60 USDT" },
  ],
  "most-wins": [
    { rank: 1, handle: "@potatoqueen", avatar: "/potato-queen-profile.png", value: "47 wins" },
    { rank: 2, handle: "@cryptoking", avatar: "/crypto-king-profile.png", value: "32 wins" },
    { rank: 3, handle: "@luckyplayer", avatar: "/lucky-player-profile.png", value: "28 wins" },
    { rank: 4, handle: "@hodlmaster", avatar: "/hodl-master-profile.png", value: "23 wins" },
    { rank: 5, handle: "@speedster", avatar: "/speedster-profile.png", value: "19 wins" },
  ],
  "most-steals": [
    { rank: 1, handle: "@stealking", avatar: "/fantasy-thief-profile.png", value: "1,247 steals" },
    { rank: 2, handle: "@fastfingers", avatar: "/fast-fingers-profile.png", value: "892 steals" },
    { rank: 3, handle: "@potatoqueen", avatar: "/potato-queen-profile.png", value: "743 steals" },
    { rank: 4, handle: "@cryptoking", avatar: "/crypto-king-profile.png", value: "621 steals" },
    { rank: 5, handle: "@degenape", avatar: "/stylized-ape-profile.png", value: "534 steals" },
  ],
}

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("biggest-wins")

  const categories = [
    { id: "biggest-wins" as const, label: "Biggest Wins" },
    { id: "most-wins" as const, label: "Most Wins" },
    { id: "most-steals" as const, label: "Most Steals" },
  ]

  return (
    <div className="min-h-screen bg-black text-[#F5F5F5] px-2 sm:px-4 py-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-8 mx-1">
          <div className="text-center flex-1">
            <h1 className="font-mono text-lg sm:text-2xl mb-1 sm:mb-2 text-[#FF6B00]">LEADERBOARD</h1>
            <p className="text-[9px] sm:text-xs text-[#F5F5F5]/70 font-mono">Top players of Hot Potato</p>
          </div>
          <Link href="/">
            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black font-mono text-[10px] sm:text-xs px-3 sm:px-4 py-2">
              BACK
            </Button>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex mb-4 sm:mb-8 mx-1 gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 py-2 sm:py-3 px-2 text-[10px] sm:text-sm font-mono transition-colors border-b-2 rounded-t ${
                activeCategory === category.id
                  ? "text-[#FF6B00] border-[#FF6B00] bg-[#FF6B00]/10"
                  : "text-[#F5F5F5]/70 border-[#F5F5F5]/30 hover:text-[#F5F5F5] hover:bg-[#F5F5F5]/5"
              }`}
            >
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden leading-tight">
                {category.label.split(" ")[0]}
                <br />
                {category.label.split(" ")[1]}
              </span>
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-black border-[#F5F5F5]/30 mx-1 overflow-hidden">
          <div className="p-2 sm:p-4">
            {/* Table Header */}
            <div className="grid grid-cols-[24px_1fr_80px] sm:grid-cols-[30px_1fr_100px] gap-2 sm:gap-4 text-[10px] sm:text-sm font-mono text-[#FF6B00] mb-2 sm:mb-3 px-1">
              <div className="text-center">#</div>
              <div>PLAYER</div>
              <div className="text-right">
                {activeCategory === "biggest-wins" ? "AMOUNT" : activeCategory === "most-wins" ? "WINS" : "STEALS"}
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-1">
              {mockData[activeCategory].map((entry, index) => (
                <div
                  key={entry.handle}
                  className={`grid grid-cols-[24px_1fr_80px] sm:grid-cols-[30px_1fr_100px] gap-2 sm:gap-4 text-[9px] sm:text-sm font-mono py-2 px-1 rounded transition-colors hover:bg-[#F5F5F5]/5 ${
                    index % 2 === 0 ? "bg-[#F5F5F5]/5" : ""
                  }`}
                >
                  <div className="text-center text-[#F5F5F5]/70 font-semibold">{entry.rank}</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={entry.avatar || "/placeholder.svg"}
                      alt={entry.handle}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-[#F5F5F5]/70 truncate font-medium">{entry.handle}</span>
                  </div>
                  <div className="text-right text-[#F5F5F5]/70 font-semibold">{entry.value}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="flex justify-center pt-4 sm:pt-8 pb-4 font-mono">
          <Link
            href="/"
            className="text-[#FF6B00] hover:text-[#00FF84] transition-colors font-mono text-[11px] sm:text-sm"
          >
            Main Game
          </Link>
        </div>
      </div>
    </div>
  )
}
