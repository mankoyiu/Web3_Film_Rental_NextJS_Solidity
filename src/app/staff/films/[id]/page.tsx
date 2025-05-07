'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getFilmById, Film } from '@/services/filmApi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function FilmDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isStaff, loading } = useAuth()
  const [film, setFilm] = useState<Film | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not staff
    if (!loading && !isStaff) {
      router.push('/login')
    }
  }, [loading, isStaff, router])

  useEffect(() => {
    const fetchFilm = async () => {
      try {
        setIsLoading(true)
        const filmData = await getFilmById(params.id)
        setFilm(filmData)
      } catch (err) {
        console.error('Error fetching film:', err)
        setError('Failed to load film details')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchFilm()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <main className="flex-1">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !film) {
    return (
      <main className="flex-1">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || 'Film not found'}
            </div>
            <div className="flex justify-center mt-6">
              <button onClick={() => router.back()} className="btn-secondary">
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex-1">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{film.title}</h1>
            <div className="space-x-4">
              <Link href={`/staff/films/${film._id}/edit`} className="btn-secondary">
                Edit Film
              </Link>
              <Link href="/staff/dashboard" className="btn-outline">
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 p-4 flex justify-center">
                {film.poster ? (
                  <div className="relative h-80 w-full">
                    <Image
                      src={film.poster}
                      alt={film.title}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-80 w-full bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-500">No poster available</span>
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Year</h3>
                    <p className="mt-1">{film.year}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Director</h3>
                    <p className="mt-1">{film.director}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                    <p className="mt-1">{film.genre}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Runtime</h3>
                    <p className="mt-1">{film.runtime} min</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                    <p className="mt-1">0.01 ETH</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">{film.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Rental Statistics</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Rentals</h3>
                  <p className="mt-1 text-2xl font-semibold">{Math.floor(Math.random() * 20)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Active Rentals</h3>
                  <p className="mt-1 text-2xl font-semibold">{Math.floor(Math.random() * 5)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                  <p className="mt-1 text-2xl font-semibold">0.05 ETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
