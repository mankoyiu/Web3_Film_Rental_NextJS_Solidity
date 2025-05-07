'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Web3Provider } from '@/contexts/Web3Context'
import { FilmProvider } from '@/contexts/FilmContext'
import { WalletProvider } from '@/contexts/WalletContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <AuthProvider>
            <FilmProvider>
              <Header />
              {children}
              <Footer />
            </FilmProvider>
          </AuthProvider>
        </Web3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}