'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface Film {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean;
}

interface FilmCardProps {
  film: Film;
  onRent: (filmId: string) => Promise<void>;
}

export default function FilmCard({ film, onRent }: FilmCardProps) {
  const { isAuthenticated, isStaff } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={film.imageUrl}
          alt={film.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{film.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{film.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {film.price} ETH
          </span>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${
              film.available ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-500">
              {film.available ? 'Available' : 'Rented'}
            </span>
          </div>
        </div>
        {isAuthenticated && !isStaff && film.available && (
          <button
            onClick={() => onRent(film.id)}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Rent Now
          </button>
        )}
      </div>
    </div>
  );
}
