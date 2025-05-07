'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Film {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isStaff } = useAuth();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newFilm, setNewFilm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: 0.01,
  });

  useEffect(() => {
    if (!isAuthenticated || !isStaff) {
      router.push('/');
      return;
    }

    // TODO: Fetch films from API
    setFilms([
      {
        id: '1',
        title: 'The Matrix',
        description: 'A computer programmer discovers a mysterious world...',
        imageUrl: '/films/matrix.jpg',
        price: 0.01,
        available: true,
      },
      // Add more mock films here
    ]);
    setLoading(false);
  }, [isAuthenticated, isStaff, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // TODO: Implement actual film creation logic
      const film: Film = {
        id: Date.now().toString(),
        ...newFilm,
        available: true,
      };
      setFilms(prev => [...prev, film]);
      setNewFilm({
        title: '',
        description: '',
        imageUrl: '',
        price: 0.01,
      });
    } catch (err) {
      setError('Failed to add film. Please try again.');
      console.error('Add film error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Film Management</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Film Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Film</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newFilm.title}
                  onChange={e => setNewFilm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newFilm.description}
                  onChange={e => setNewFilm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newFilm.imageUrl}
                  onChange={e => setNewFilm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  value={newFilm.price}
                  onChange={e => setNewFilm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                  step="0.001"
                  min="0.001"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Adding...' : 'Add Film'}
              </button>
            </div>
          </form>
        </div>

        {/* Film List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Films</h2>
          <div className="space-y-4">
            {films.map(film => (
              <div
                key={film.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">{film.title}</h3>
                  <p className="text-sm text-gray-500">
                    {film.price} ETH - {film.available ? 'Available' : 'Rented'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // TODO: Implement delete functionality
                    setFilms(prev => prev.filter(f => f.id !== film.id));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 