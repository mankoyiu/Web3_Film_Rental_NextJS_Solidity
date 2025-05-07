// src/services/filmApi.ts

import axios from 'axios';

export interface Film {
  _id: string;
  id?: string;
  title: string;
  year: number | string;
  runtime: number | string;
  language: string;
  genre: string;
  director: string;
  poster?: string;
  description?: string;
  price?: number;
  available?: boolean;
  rentals?: number;
}

// Demo/mock film data
const mockFilms: Film[] = [
  {
    _id: '1',
    title: 'The Matrix',
    year: 1999,
    runtime: 136,
    language: 'English',
    genre: 'Action, Sci-Fi',
    director: 'The Wachowskis',
    poster: 'https://m.media-amazon.com/images/I/51EG732BV3L._AC_SY445_.jpg',
    description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    price: 3.99,
    available: true,
    rentals: 0
  },
  {
    _id: '2',
    title: 'Inception',
    year: 2010,
    runtime: 148,
    language: 'English',
    genre: 'Action, Adventure, Sci-Fi',
    director: 'Christopher Nolan',
    poster: 'https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_SY679_.jpg',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    price: 4.99,
    available: true,
    rentals: 0
  },
  {
    _id: '3',
    title: 'Spirited Away',
    year: 2001,
    runtime: 125,
    language: 'Japanese',
    genre: 'Animation, Adventure, Family',
    director: 'Hayao Miyazaki',
    poster: 'https://m.media-amazon.com/images/I/51Qvs9i5a%2BL._AC_SY445_.jpg',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    price: 3.49,
    available: true,
    rentals: 0
  },
];

// API base URL
const API_BASE_URL = 'https://pcpdfilm.starsknights.com:18888/api/v2';

// Check if we're on /films or /staff/dashboard pages
const isFilmsOrDashboardPage = (): boolean => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    return path === '/films' || path === '/staff/dashboard' || path.startsWith('/staff/dashboard');
  }
  return false;
};

// Get films from local JSON file
async function getFilmsFromLocalJson(): Promise<Film[]> {
  try {
    console.log('Getting films from local JSON file...');
    const response = await axios.get('/api/films');
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(`Retrieved ${response.data.length} films from local JSON`);
      return response.data;
    }
    throw new Error('No films found in local JSON');
  } catch (error) {
    console.error('Error fetching films from local JSON:', error);
    return mockFilms;
  }
}

// Fetch all films from the real API (handle pagination if needed)
export async function getFilms(): Promise<Film[]> {
  // For films and dashboard pages, always use LOCAL JSON
  if (isFilmsOrDashboardPage()) {
    console.log('On films or dashboard page - using LOCAL JSON data only');
    return getFilmsFromLocalJson();
  }
  
  // For other pages, try API first, then fallback to local
  try {
    // Direct API call with no fallback
    const response = await axios.get(`${API_BASE_URL}/films`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API response:', response);
    
    // Handle different response structures
    let films: any[] = [];
    if (Array.isArray(response.data)) {
      films = response.data;
    } else if (Array.isArray(response.data?.data)) {
      films = response.data.data;
    } else if (Array.isArray(response.data?.films)) {
      films = response.data.films;
    } else if (typeof response.data === 'object') {
      // If it's an object but not in expected format, log it
      console.log('Unexpected API response structure:', response.data);
      // Try to extract any array we can find
      const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        films = possibleArrays[0] as any[];
      }
    }
    
    console.log('Films extracted from API:', films);
    
    if (films.length === 0) {
      console.warn('No films found in API response, falling back to local JSON');
      return getFilmsFromLocalJson();
    }
    
    return films;
  } catch (error) {
    console.error('Error fetching films from API:', error);
    console.log('Falling back to local JSON...');
    return getFilmsFromLocalJson();
  }
}

// Get a single film by ID
export async function getFilmById(id: string): Promise<Film> {
  try {
    const response = await axios.get(`${API_BASE_URL}/films/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Handle different response structures
    let film = response.data;
    if (response.data?.data) {
      film = response.data.data;
    } else if (response.data?.film) {
      film = response.data.film;
    }
    
    return film;
  } catch (error) {
    console.error(`Error fetching film ${id}:`, error);
    // Return a mock film if API fails
    const mockFilm = mockFilms.find(f => f._id === id || f.id === id);
    if (mockFilm) return mockFilm;
    throw new Error(`Film with ID ${id} not found`);
  }
}

// Update a film
export async function updateFilm(id: string, filmData: Partial<Film>): Promise<Film> {
  try {
    const response = await axios.put(`/api/films/update/${id}`, filmData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    
    if (response.data.success) {
      console.log(`Film with ID ${id} successfully updated in local JSON file`);
      return response.data.film;
    } else {
      console.error(`Error updating film ${id}:`, response.data.error);
      throw new Error(`Failed to update film: ${response.data.error}`);
    }
  } catch (error: any) {
    console.error(`Error updating film ${id}:`, error);
    console.error('Error details:', error?.response?.data || error?.message || 'Unknown error');
    throw new Error(`Failed to update film: ${error?.response?.data?.error || error?.message || 'Unknown error'}`);
  }
}

// Create a new film
export async function createFilm(filmData: Partial<Film>): Promise<Film> {
  try {
    console.log('Creating new film and saving to local JSON file...');
    
    // Generate a new ID for the film
    const newId = crypto.randomUUID();
    const newFilm = { 
      _id: newId, 
      id: newId, 
      ...filmData,
      // Set defaults for required fields if not provided
      title: filmData.title || 'Untitled Film',
      year: filmData.year || new Date().getFullYear().toString(),
      director: filmData.director || 'Unknown',
      genre: filmData.genre || 'Uncategorized',
      runtime: filmData.runtime || 0,
      language: filmData.language || '',
      poster: filmData.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      description: filmData.description || '',
      price: typeof filmData.price === 'number' ? filmData.price : 0,
      available: typeof filmData.available === 'boolean' ? filmData.available : true,
      rentals: typeof filmData.rentals === 'number' ? filmData.rentals : 0
    } as Film;
    
    // Send the new film to our local API to be saved in the JSON file
    const response = await axios.post('/api/films/add', newFilm, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('Film successfully saved to local JSON file');
      return newFilm;
    } else {
      throw new Error(response.data.error || 'Failed to save film to local JSON');
    }
  } catch (error) {
    console.error('Error creating film:', error);
    // If the local save fails, still return the film object so the UI can show it
    // but log the error so we know something went wrong
    const newId = crypto.randomUUID();
    return { _id: newId, id: newId, ...filmData } as Film;
  }
}

// Delete a film
export async function deleteFilm(id: string): Promise<boolean> {
  try {
    console.log(`Deleting film with ID ${id} from local JSON file...`);
    const response = await axios.delete(`/api/films/delete?id=${id}`);
    
    if (response.data.success) {
      console.log(`Film with ID ${id} successfully deleted from local JSON file`);
      return true;
    } else {
      console.error(`Error deleting film ${id}:`, response.data.error);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting film ${id}:`, error);
    return false;
  }
}

// Optionally enrich film with poster (no-op for mock)
export async function enrichFilmWithPoster(film: Film): Promise<Film> {
  return film;
}
