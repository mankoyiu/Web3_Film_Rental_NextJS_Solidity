'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getFilms as apiGetFilms, 
  getFilmById as apiGetFilmById,
  updateFilm as apiUpdateFilm,
  createFilm as apiCreateFilm,
  deleteFilm as apiDeleteFilm,
  Film as ApiFilm
} from '@/services/filmApi';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import axios from 'axios';

export interface Film {
  id: string;
  title: string;
  year: string;
  director: string;
  genre: string;
  runtime: string | number;
  language: string;
  poster: string;
  description?: string;
  price: number;
  available: boolean;
  rentals?: number;
  revenue?: number;
}

interface FilmContextType {
  films: Film[];
  loading: boolean;
  error: string | null;
  refreshFilms: () => Promise<void>;
  getFilmById: (id: string) => Promise<Film | null>;
  updateFilm: (id: string, filmData: Partial<Film>) => Promise<Film>;
  createFilm: (filmData: Partial<Film>) => Promise<Film>;
  deleteFilm: (id: string) => Promise<boolean>;
}

const FilmContext = createContext<FilmContextType | undefined>(undefined);

export const useFilms = () => {
  const context = useContext(FilmContext);
  if (!context) {
    throw new Error('useFilms must be used within a FilmProvider');
  }
  return context;
};

interface FilmProviderProps {
  children: ReactNode;
}

// Local storage key for caching films
const FILMS_STORAGE_KEY = 'film_rental_films_cache';
const FILMS_LOADED_FROM_FILE_KEY = 'film_rental_films_loaded_from_file';

export const FilmProvider: React.FC<FilmProviderProps> = ({ children }) => {
  // Use our custom hook for localStorage persistence
  const [storedFilms, setStoredFilms] = useLocalStorage<Film[]>(FILMS_STORAGE_KEY, []);
  // Initialize with stored films regardless of page to prevent loading issues
const [films, setFilms] = useState<Film[]>(storedFilms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedFromFile, setLoadedFromFile] = useLocalStorage<boolean>(FILMS_LOADED_FROM_FILE_KEY, false);

  // Convert API film to our Film format
  const convertApiFilm = (apiFilm: ApiFilm): Film => ({
    id: apiFilm._id || apiFilm.id || '',
    title: apiFilm.title || '',
    year: apiFilm.year ? apiFilm.year.toString() : '',
    director: apiFilm.director || '',
    genre: apiFilm.genre || '',
    runtime: apiFilm.runtime ? (typeof apiFilm.runtime === 'number' ? apiFilm.runtime : parseInt(apiFilm.runtime as string) || 0) : 0,
    language: apiFilm.language || '',
    poster: apiFilm.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
    description: apiFilm.description || '',
    price: typeof apiFilm.price === 'number' ? apiFilm.price : 0,
    available: typeof apiFilm.available === 'boolean' ? apiFilm.available : true,
    rentals: typeof apiFilm.rentals === 'number' ? apiFilm.rentals : 0
  });

  // Save films to server file
  const saveFilmsToFile = async (filmsToSave: Film[]) => {
    try {
      await axios.post('/api/films', filmsToSave);
      console.log('Films saved to server file');
    } catch (err) {
      console.error('Error saving films to file:', err);
    }
  };

  // Load films from server file
  const loadFilmsFromFile = async () => {
    try {
      console.log('Attempting to load films from server file...');
      const response = await axios.get('/api/films', {
        // Add timestamp to prevent caching issues
        params: { t: new Date().getTime() }
      });
      
      console.log('API response status:', response.status);
      console.log('API response data type:', typeof response.data);
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log('Films data is an array with length:', response.data.length);
          
          if (response.data.length > 0) {
            setFilms(response.data);
            setStoredFilms(response.data);
            setLoadedFromFile(true);
            console.log('Films loaded from server file:', response.data.length);
            return true;
          } else {
            console.warn('Films array is empty');
          }
        } else if (typeof response.data === 'object' && response.data.error) {
          console.error('API returned an error:', response.data.error, response.data.details || '');
        } else {
          console.error('Unexpected response data format:', response.data);
        }
      } else {
        console.error('No data in response');
      }
      
      return false;
    } catch (err) {
      console.error('Error loading films from file:', err);
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
      }
      return false;
    }
  };

  // Check if we're on /films or /staff/dashboard pages
  const isFilmsOrDashboardPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path === '/films' || path.includes('/staff/dashboard');
    }
    return false;
  };

  const refreshFilms = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always try to load from local JSON file first
      console.log('Loading films from local JSON data');
      
      // Load from server file
      const loadedFromServer = await loadFilmsFromFile();
      
      if (loadedFromServer) {
        console.log('Successfully loaded films from local JSON');
        setLoading(false);
        return;
      }
      
      // If local file load fails, try API
      console.log('Fetching films from external API...');
      try {
        // Fetch from external API
        const apiFilms = await apiGetFilms();
        if (apiFilms && apiFilms.length > 0) {
          // Convert API films to our format
          const formattedFilms = apiFilms.map(apiFilm => convertApiFilm(apiFilm));
          console.log('Films fetched from API:', formattedFilms.length);
          
          // Update state and localStorage
          setFilms(formattedFilms);
          setStoredFilms(formattedFilms);
          
          // Save to server file
          await saveFilmsToFile(formattedFilms);
          return;
        }
      } catch (apiErr) {
        console.error('Error fetching from external API:', apiErr);
      }
      
      // If we get here, both local file and API failed
      // Use localStorage data as last resort
      setFilms(storedFilms);
      console.log('Using films from localStorage as last resort:', storedFilms.length);
      
      // Save current localStorage films to file for future use
      if (storedFilms.length > 0) {
        await saveFilmsToFile(storedFilms);
      }
    } catch (err) {
      console.error('Error loading films:', err);
      setError('Failed to load films');
      
      // Fallback to localStorage
      setFilms(storedFilms);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    // On mount, always fetch from /api/films if on /films page (ignore localStorage)
    const loadInitialFilms = async () => {
      if (typeof window !== 'undefined' && window.location.pathname === '/films') {
        setLoading(true);
        setError(null);
        try {
          const loaded = await loadFilmsFromFile();
          if (!loaded) {
            setError('Failed to load films from server');
            setFilms([]);
          }
        } catch (err) {
          setError('Failed to load films');
          setFilms([]);
        } finally {
          setLoading(false);
        }
        return;
      }
      if (!loadedFromFile) {
        await refreshFilms();
      } else {
        // Already loaded from file before, just use localStorage
        setFilms(storedFilms);
        console.log('Using cached films from localStorage:', storedFilms.length);
      }
    };
    
    loadInitialFilms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flag to prevent continuous POST requests during API operations
  const [isApiOperation, setIsApiOperation] = useState(false);

  // Update storedFilms whenever films change
  useEffect(() => {
    // Skip saving to server file if we're in the middle of an API operation
    // This prevents continuous POST requests
    if (!isApiOperation && films.length > 0 && JSON.stringify(films) !== JSON.stringify(storedFilms)) {
      console.log('Updating localStorage with new films data');
      setStoredFilms(films);
      
      // We no longer automatically save to the server file here
      // This prevents the continuous POST requests
      // saveFilmsToFile(films);
    }
  }, [films, storedFilms, isApiOperation]);

  const getFilmById = async (id: string): Promise<Film | null> => {
    try {
      // First check if we have it in our local state
      const localFilm = films.find(film => film.id === id);
      if (localFilm) return localFilm;

      // Otherwise fetch from API
      const apiFilm = await apiGetFilmById(id);
      return convertApiFilm(apiFilm);
    } catch (err) {
      console.error(`Error fetching film ${id}:`, err);
      return null;
    }
  };

  const updateFilm = async (id: string, filmData: Partial<Film>): Promise<Film> => {
    try {
      console.log('FilmContext.updateFilm called with ID:', id);
      console.log('Film data received:', filmData);
      
      // Set flag to prevent continuous POST requests
      setIsApiOperation(true);
      
      // Find the film in our local state
      const filmIndex = films.findIndex(film => film.id === id);
      console.log('Film index in local state:', filmIndex);
      
      if (filmIndex === -1) {
        console.error(`Film with ID ${id} not found in local state`);
        throw new Error(`Film with ID ${id} not found`);
      }
      
      console.log('Current film in state:', films[filmIndex]);
      
      // Create an updated film object
      const updatedFilm = { ...films[filmIndex], ...filmData };
      console.log('Merged film object to be saved:', updatedFilm);
      
      // Use the filmApi.updateFilm function to update the film in the local JSON file
      console.log('Calling apiUpdateFilm...');
      const apiResponse = await apiUpdateFilm(id, updatedFilm);
      console.log('API response from updateFilm:', apiResponse);
      
      // Update our local state
      const updatedFilms = [...films];
      updatedFilms[filmIndex] = updatedFilm;
      console.log('Setting updated films in state...');
      setFilms(updatedFilms);
      setStoredFilms(updatedFilms);
      
      // Reset the flag after the operation is complete
      setIsApiOperation(false);
      console.log('Film update completed successfully');
      
      return updatedFilm;
    } catch (err) {
      // Reset the flag in case of error
      setIsApiOperation(false);
      console.error(`Error updating film ${id}:`, err);
      throw new Error('Failed to update film');
    }
  };

  const createFilm = async (filmData: Partial<Film>): Promise<Film> => {
    try {
      // Set flag to prevent continuous POST requests
      setIsApiOperation(true);
      
      // Validate required fields
      if (!filmData.title) {
        throw new Error('Film title is required');
      }
      // Ensure price is a number and present
      let price = filmData.price;
      if (typeof price === 'string') {
        price = parseFloat(price);
      }
      if (typeof price !== 'number' || isNaN(price)) {
        throw new Error('Film price is required and must be a number');
      }
      
      // Use the filmApi.createFilm function to save the film to the local JSON file
      // This will handle generating the ID and saving to the file
      const apiFilm = await apiCreateFilm(filmData);
      
      // Convert API Film to our Film type
      const newFilm: Film = {
        id: apiFilm.id || apiFilm._id || '',
        title: apiFilm.title || '',
        year: typeof apiFilm.year === 'number' ? apiFilm.year.toString() : (apiFilm.year || ''),
        director: apiFilm.director || '',
        genre: apiFilm.genre || '',
        runtime: typeof apiFilm.runtime === 'number' ? apiFilm.runtime : 0,
        language: apiFilm.language || '',
        poster: apiFilm.poster || '',
        description: apiFilm.description || '',
        price: typeof apiFilm.price === 'number' ? apiFilm.price : 0,
        available: typeof apiFilm.available === 'boolean' ? apiFilm.available : true,
        rentals: typeof apiFilm.rentals === 'number' ? apiFilm.rentals : 0
      };
      
      // After successful creation, update our local state
      const updatedFilms = [...films, newFilm];
      setFilms(updatedFilms);
      setStoredFilms(updatedFilms);
      
      // Reset the flag after the operation is complete
      setIsApiOperation(false);
      
      return newFilm;
    } catch (err) {
      console.error('Error creating film:', err);
      throw new Error('Failed to create film');
    }
  };

  const deleteFilm = async (id: string): Promise<boolean> => {
    try {
      // Set flag to prevent continuous POST requests
      setIsApiOperation(true);
      
      // Use the filmApi.deleteFilm function to delete the film from the local JSON file
      const success = await apiDeleteFilm(id);
      
      if (success) {
        // Remove from our local state and localStorage
        const updatedFilms = films.filter(film => film.id !== id);
        setFilms(updatedFilms);
        setStoredFilms(updatedFilms);
      }
      
      // Reset the flag after the operation is complete
      setIsApiOperation(false);
      
      return success;
    } catch (err) {
      // Reset the flag in case of error
      setIsApiOperation(false);
      console.error(`Error deleting film ${id}:`, err);
      throw new Error('Failed to delete film');
    }
  };

  const value = {
    films,
    loading,
    error,
    refreshFilms,
    getFilmById,
    updateFilm,
    createFilm,
    deleteFilm
  };

  return (
    <FilmContext.Provider value={value}>
      {children}
    </FilmContext.Provider>
  );
};
