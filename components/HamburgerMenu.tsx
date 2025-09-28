"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HamburgerMenuProps {
  isConnected: boolean
  user: any
  ethBalance: string
  account: string
}

export default function HamburgerMenu({ isConnected, user, ethBalance, account }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
      {/* Hamburger Button */}
      <Button
        onClick={toggleMenu}
        className="bg-transparent hover:bg-[#2D1B0E] border border-[#F5F5F5]/20 text-[#F5F5F5] p-2 sm:p-3 rounded-lg backdrop-blur-sm shadow-lg"
        size="sm"
      >
        <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-10 sm:top-12 right-0 bg-transparent hover:bg-[#2D1B0E]/95 border border-[#F5F5F5]/20 rounded-lg p-3 sm:p-4 w-[280px] sm:min-w-[280px] max-w-[calc(100vw-1rem)] backdrop-blur-sm shadow-xl">
          {/* User Profile Section */}
          {isConnected && user && (
            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#F5F5F5]/20">
              <h3 className="text-[#FF6B00] font-mono text-sm mb-2 sm:mb-3">PLAYER PROFILE</h3>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src={user.pfp}
                  alt={user.displayName}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F5F5]/90 font-mono text-xs font-semibold truncate">
                    {user.displayName}
                  </div>
                  <div className="text-[#F5F5F5]/70 font-mono text-[9px] sm:text-[10px]">
                    @{user.username} • FID: {user.fid}
                  </div>
                  <div className="text-[#F5F5F5]/60 font-mono text-[8px] sm:text-[9px] mt-1 truncate">
                    {account}
                  </div>
                  <div className="text-[#00FF84] font-mono text-[9px] sm:text-[10px] mt-1 flex items-center gap-1">
                    <svg width="10" height="10" className="sm:w-3 sm:h-3 text-[#00FF84] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 7h-3V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V10a3 3 0 0 0-3-3zM5 4h10a1 1 0 0 1 1 1v1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm15 12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6z"/>
                      <path d="M16 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                    </svg>
                    <span className="truncate">{ethBalance} ETH</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-1 sm:space-y-2">
            <Link href="/about" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-[#F5F5F5] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 font-mono text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 overflow-hidden whitespace-nowrap"
                onClick={() => setIsOpen(false)}
              >
                <span className="truncate">📖 About</span>
              </Button>
            </Link>
            
            <Link href="/terms" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-[#F5F5F5] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 font-mono text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 overflow-hidden whitespace-nowrap"
                onClick={() => setIsOpen(false)}
              >
                <span className="truncate">📋 Terms & Conditions</span>
              </Button>
            </Link>
            
            <Link href="/leaderboard" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-[#F5F5F5] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 font-mono text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 overflow-hidden whitespace-nowrap"
                onClick={() => setIsOpen(false)}
              >
                <span className="truncate">🏆 Leaderboard</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop to close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
