'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useWeb3 } from '@/contexts/Web3Context'

interface FilmRentalCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  price?: string
}

export default function FilmRentalCard({ id, title, description, imageUrl, price }: FilmRentalCardProps) {
  const { isConnected, rentFilm, getFilmPrice, isFilmAvailable } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [rentalPrice, setRentalPrice] = useState<string | null>(null)

  // Check availability and price when component mounts
  useEffect(() => {
    const checkFilmStatus = async () => {
      try {
        const available = await isFilmAvailable(id)
        setAvailable(available)
        
        if (available) {
          const price = await getFilmPrice(id)
          setRentalPrice(price)
        }
      } catch (error) {
        console.error('Error checking film status:', error)
      }
    }
    
    if (isConnected) {
      checkFilmStatus()
    }
  })

  const handleRentFilm = async () => {
    if (!isConnected || !rentalPrice) return
    
    setLoading(true)
    try {
      await rentFilm(id, rentalPrice)
      setAvailable(false)
    } catch (error) {
      console.error('Failed to rent film:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full h-48 overflow-hidden">
        <Image 
          src={imageUrl || 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={title}
          width={300}
          height={450}
          style={{
            objectFit: 'cover',
            objectPosition: 'center top',
            maxHeight: '100%',
            width: '100%'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {isConnected ? (
          <>
            {available === null ? (
              <p className="text-gray-500">Checking availability...</p>
            ) : available ? (
              <div>
                <p className="text-green-600 mb-2">Available for rent</p>
                <p className="text-gray-700 mb-4">Price: {rentalPrice || price || 'Checking...'} ETH</p>
                <button
                  onClick={handleRentFilm}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Rent Now'}
                </button>
              </div>
            ) : (
              <p className="text-red-600">Currently rented</p>
            )}
          </>
        ) : (
          <p className="text-gray-700">Connect your wallet to rent this film</p>
        )}
      </div>
    </div>
  )
}
