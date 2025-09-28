"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-[#F5F5F5] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-mono text-[#FF6B00] mb-2">TERMS & CONDITIONS</h1>
          <p className="text-[#F5F5F5]/70 font-mono text-sm">Hot Potato Game</p>
        </div>

        {/* Terms Content */}
        <Card className="bg-black border-[#F5F5F5]/30 p-6 mb-6">
          <div className="space-y-6 font-mono text-sm leading-relaxed">
            <section>
              <h2 className="text-[#FF6B00] text-lg mb-3">1. Game Overview</h2>
              <p className="text-[#F5F5F5]/90">
                Hot Potato is a blockchain-based game where players pay a fee to "steal" a virtual potato. 
                The pot grows with each steal until the potato "pops," awarding the pot to the last holder.
              </p>
            </section>

            <section>
              <h2 className="text-[#FF6B00] text-lg mb-3">2. Game Rules</h2>
              <ul className="list-disc list-inside space-y-2 text-[#F5F5F5]/90">
                <li>Each steal costs 0.33 USDT</li>
                <li>Players cannot steal from themselves</li>
                <li>The pot grows with each successful steal</li>
                <li>When the potato "pops," 85% goes to the winner, 15% to the game owner</li>
                <li>All transactions are final and irreversible</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#FF6B00] text-lg mb-3">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-[#F5F5F5]/90">
                <li>Ensure you have sufficient USDT balance for transactions</li>
                <li>Pay gas fees for blockchain transactions</li>
                <li>Use the game responsibly and in good faith</li>
                <li>Do not attempt to exploit or manipulate the game</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#FF6B00] text-lg mb-3">4. Disclaimers</h2>
              <ul className="list-disc list-inside space-y-2 text-[#F5F5F5]/90">
                <li>This is a game of chance - no guaranteed winnings</li>
                <li>Blockchain transactions may fail due to network congestion</li>
                <li>Game owner reserves the right to pause or modify the game</li>
                <li>Users participate at their own risk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#FF6B00] text-lg mb-3">5. Privacy</h2>
              <p className="text-[#F5F5F5]/90">
                We collect minimal data necessary for game functionality. Wallet addresses and transaction 
                data are stored on the blockchain and are publicly visible. We do not store personal information.
              </p>
            </section>

            <section>
              <h2 className="text-[#FF6B00] text-lg mb-3">6. Contact</h2>
              <p className="text-[#F5F5F5]/90">
                For questions or support, please contact us through the game interface or 
                visit our community channels.
              </p>
            </section>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/">
            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-black font-mono">
              ← Back to Game
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
