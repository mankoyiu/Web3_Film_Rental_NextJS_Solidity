/**
 * Service for managing rental data storage
 * This service provides methods to save and load rental data from both
 * localStorage (for client-side) and file storage (for server-side persistence)
 */

// Interface for rental data
export interface Rental {
  id: string;
  filmId: string;
  title: string;
  poster: string;
  rentedAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
  price: string;
}

/**
 * Save rentals to both localStorage and server file storage
 */
export const saveRentals = async (address: string, rentals: Rental[]): Promise<void> => {
  if (!address) return;
  
  // 1. Save to localStorage for immediate access
  const storedRentalsKey = `rentals_${address.toLowerCase()}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(storedRentalsKey, JSON.stringify(rentals));
  }
  
  // 2. Save to server file storage for persistence
  try {
    const response = await fetch('/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, rentals })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to save rentals to server:', error);
    }
  } catch (error) {
    console.error('Error saving rentals to server:', error);
    // Continue execution - localStorage backup is still available
  }
};

/**
 * Load rentals from localStorage and server file storage
 * Prioritizes localStorage for speed, but falls back to server data if needed
 */
export const loadRentals = async (address: string): Promise<Rental[]> => {
  if (!address) return [];
  
  const storedRentalsKey = `rentals_${address.toLowerCase()}`;
  let rentals: Rental[] = [];
  
  // 1. Try to load from localStorage first (faster)
  if (typeof window !== 'undefined') {
    const storedRentals = localStorage.getItem(storedRentalsKey);
    if (storedRentals) {
      try {
        rentals = JSON.parse(storedRentals);
        console.log('Loaded rentals from localStorage:', rentals);
        return rentals;
      } catch (e) {
        console.error('Error parsing localStorage rentals:', e);
      }
    }
  }
  
  // 2. If localStorage failed or is empty, try loading from server
  try {
    const response = await fetch(`/api/rentals?address=${encodeURIComponent(address)}`);
    if (response.ok) {
      const data = await response.json();
      rentals = data.rentals;
      
      // Update localStorage with server data
      if (typeof window !== 'undefined' && rentals.length > 0) {
        localStorage.setItem(storedRentalsKey, JSON.stringify(rentals));
      }
      
      console.log('Loaded rentals from server:', rentals);
    } else {
      console.error('Failed to load rentals from server');
    }
  } catch (error) {
    console.error('Error loading rentals from server:', error);
  }
  
  return rentals;
};
