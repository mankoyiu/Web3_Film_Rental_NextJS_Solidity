import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "antd/dist/reset.css";
import "./globals.css";
import '@/styles/global.css';
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Film Rental DApp',
  description: 'A decentralized film rental platform built on blockchain technology.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 