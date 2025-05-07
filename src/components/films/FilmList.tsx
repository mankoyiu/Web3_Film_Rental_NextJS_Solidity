'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Film {
  id: string
  title: string
  year: number
  director: string
  genre: string
  runtime: number
  price: number
  poster: string
  available: boolean
}

// Mock data - replace with actual data fetching
const mockFilms: Film[] = [
  {
    id: '1',
    title: 'The Shawshank Redemption',
    year: 1994,
    director: 'Frank Darabont',
    genre: 'Drama',
    runtime: 142,
    price: 0.1,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    available: true
  },
  {
    id: '2',
    title: 'The Godfather',
    year: 1972,
    director: 'Francis Ford Coppola',
    genre: 'Crime',
    runtime: 175,
    price: 0.15,
    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    available: true
  },
  {
    id: '3',
    title: 'The Dark Knight',
    year: 2008,
    director: 'Christopher Nolan',
    genre: 'Action',
    runtime: 152,
    price: 0.12,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    available: true
  }
]

export default function FilmList() {
  const [currentPage, setCurrentPage] = useState(1)
  const filmsPerPage = 9
  const totalPages = Math.ceil(mockFilms.length / filmsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const paginatedFilms = mockFilms.slice(
    (currentPage - 1) * filmsPerPage,
    currentPage * filmsPerPage
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedFilms.map((film) => (
          <div key={film.id} className="card">
            <img
              src={film.poster}
              alt={film.title}
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{film.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{film.year} • {film.director}</p>
                <p>{film.genre} • {film.runtime} min</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-bold">
                  {film.price} ETH
                </div>
                <Link
                  href={`/films/${film.id}`}
                  className="btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 