import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P, Inter } from "next/font/google"
import "./globals.css"

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Hot Potato USDC - Legendary Potato",
  description: "On-chain hot potato game with USDC rewards",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${inter.variable}`}>
      <body className="antialiased" suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
