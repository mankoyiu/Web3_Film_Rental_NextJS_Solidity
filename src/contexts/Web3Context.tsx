'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Contract, ethers } from 'ethers';
import { saveRentals, loadRentals, Rental } from '@/services/rentalStorage';

// Import ABI when available
const FILM_RENTAL_ABI = [
  "function addFilm(string memory _id, uint256 _rentalPrice) public",
  "function rentFilm(string memory _filmId) public payable",
  "function endRental(string memory _filmId) public",
  "function getRentalPrice(string memory _filmId) public view returns (uint256)",
  "function isFilmAvailable(string memory _filmId) public view returns (bool)",
  "function getUserRentals(address _user) public view returns (tuple(string filmId, address renter, uint256 startTime, uint256 endTime, bool isActive)[] memory)"
];

// Updated with the deployed contract address
const CONTRACT_ADDRESS = "0x368675A9542575e312828Ae73968debfbc76645e";

interface Web3ContextType {
  isConnected: boolean
  account: string | undefined
  connect: () => Promise<void>
  disconnect: () => void
  rentFilm: (filmId: string, price: string, filmTitle?: string, filmPoster?: string) => Promise<any>
  endRental: (filmId: string) => Promise<void>
  getFilmPrice: (filmId: string) => Promise<string>
  isFilmAvailable: (filmId: string) => Promise<boolean>
  getUserRentals: () => Promise<any[]>
  contract: Contract | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Local storage key for wallet connection state
const WALLET_CONNECTED_KEY = 'wallet_connected';

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Check localStorage on initial load
  useEffect(() => {
    const checkStoredConnection = async () => {
      if (typeof window !== 'undefined') {
        const storedConnected = localStorage.getItem(WALLET_CONNECTED_KEY) === 'true';
        
        if (storedConnected && !isConnected) {
          try {
            // Try to reconnect wallet if it was previously connected
            await connectAsync({ connector: injected() });
          } catch (err) {
            console.error('Failed to restore wallet connection:', err);
            localStorage.removeItem(WALLET_CONNECTED_KEY);
          }
        }
        
        setInitialLoadComplete(true);
      }
    };
    
    checkStoredConnection();
  }, []);

  // Update contract when connection changes
  useEffect(() => {
    if (isConnected && address) {
      // Save connection state to localStorage
      if (typeof window !== 'undefined' && initialLoadComplete) {
        localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
      }
      initializeContract();
    } else {
      setContract(null);
      // Clear connection state from localStorage
      if (typeof window !== 'undefined' && initialLoadComplete) {
        localStorage.removeItem(WALLET_CONNECTED_KEY);
      }
    }
  }, [isConnected, address, initialLoadComplete]);

  const initializeContract = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum || !address) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, FILM_RENTAL_ABI, signer);
      setContract(contractInstance);
    } catch (err: any) {
      setError('Failed to initialize contract: ' + (err?.message || err));
    }
  };

  const connect = async () => {
    setError(null);
    try {
      await connectAsync({ connector: injected() });
      // Connection state is saved in the useEffect that watches isConnected
    } catch (err: any) {
      setError('Wallet connection failed: ' + (err?.message || err));
    }
  };
  
  const disconnect = () => {
    wagmiDisconnect();
    // Connection state is cleared in the useEffect that watches isConnected
  };

  const rentFilm = async (filmId: string, price: string, filmTitle?: string, filmPoster?: string) => {
    if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
    if (!isConnected || !address) throw new Error('Wallet not connected');
    try {
      // Check if film is already rented by this user
      if (typeof window !== 'undefined') {
        const storedRentalsKey = `rentals_${address.toLowerCase()}`;
        const storedRentals = localStorage.getItem(storedRentalsKey);
        
        if (storedRentals) {
          const userRentals = JSON.parse(storedRentals);
          const now = new Date();
          
          // Check if this film is already in active rentals
          const isAlreadyRented = userRentals.some((rental: any) => {
            return rental.filmId === filmId && new Date(rental.expiresAt) > now;
          });
          
          if (isAlreadyRented) {
            throw new Error('You have already rented this film. Check your rentals page to watch it.');
          }
        }
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      //ETH address that receive ETH from users
      const adminAddress = '0xeC1f782d67575FE1E62078986b05a053bdD46602';
      let ethBalance = await provider.getBalance(userAddress);
      const priceWei = ethers.parseEther(price);
      // Debug: log types and values
      console.log('DEBUG ethBalance:', ethBalance, typeof ethBalance);
      console.log('DEBUG priceWei:', priceWei, typeof priceWei);
      // Ensure both are BigInt for comparison
      if (typeof ethBalance !== 'bigint') {
        ethBalance = BigInt(ethBalance.toString());
      }
      if (typeof priceWei !== 'bigint') {
        throw new Error('priceWei is not a bigint');
      }
      if (ethBalance < priceWei) {
        throw new Error('Insufficient balance to rent this film.');
      }
      
      console.log('Renting film:', { filmId, price, filmTitle });
      
      // Send ETH to admin
      const tx = await signer.sendTransaction({
        to: adminAddress,
        value: priceWei
      });
      await tx.wait();
      
      // Store rental information in localStorage
      const now = Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const expiresAt = now + sevenDaysInMs;
      
      const newRental = {
        id: `${filmId}-${now}`,
        filmId: filmId,
        title: filmTitle || `Film ${filmId}`,
        poster: filmPoster || 'https://via.placeholder.com/300x450?text=Film',
        rentedAt: new Date(now).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        status: 'active' as const,
        price: price
      };
      
      // Get existing rentals and add the new one
      let userRentals = await loadRentals(userAddress);
      userRentals.push(newRental);
      
      // Save to both localStorage and server file storage
      await saveRentals(userAddress, userRentals);
      console.log('Rental saved to storage:', newRental);
      
      // Update film rental count and revenue in films.json
      try {
        // Fetch current films data
        const filmsResponse = await fetch('/api/films');
        if (filmsResponse.ok) {
          const films = await filmsResponse.json();
          
          // Find the film that was rented
          const filmIndex = films.findIndex((film: any) => film.id === filmId);
          
          if (filmIndex !== -1) {
            // Increment rental count
            films[filmIndex].rentals = (films[filmIndex].rentals || 0) + 1;
            
            // Add revenue (convert price string to number)
            films[filmIndex].revenue = (films[filmIndex].revenue || 0) + parseFloat(price);
            
            console.log(`Updated film ${filmId} rentals to ${films[filmIndex].rentals} and revenue to ${films[filmIndex].revenue}`);
            
            // Save updated films data back to the server
            await fetch('/api/films', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(films)
            });
            
            console.log('Films data updated successfully');
          }
        }
      } catch (updateError) {
        console.error('Error updating film rental statistics:', updateError);
        // Continue execution even if statistics update fails
      }
      
      return tx;
    } catch (err: any) {
      console.error('Failed to rent film:', err);
      // Handle MetaMask user rejection
      if (
        (err?.code === 4001) ||
        (err?.reason === 'rejected') ||
        (err?.message?.includes('User denied transaction signature')) ||
        (err?.code === 'ACTION_REJECTED')
      ) {
        throw new Error('Transaction cancelled by user.');
      }
      throw new Error(err?.message || 'Failed to rent film.');
    }
  }

  const endRental = async (filmId: string) => {
    // Web3 functionality temporarily disabled while we focus on traditional auth
    console.log('Web3 functionality temporarily disabled')
    throw new Error('Web3 functionality temporarily disabled')
    /*
    if (!contract) throw new Error('Contract not initialized')
    try {
      const tx = await contract.endRental(filmId)
      await tx.wait()
    } catch (error) {
      console.error('Failed to end rental:', error)
      throw error
    }
    */
  }

  const getFilmPrice = async (filmId: string): Promise<string> => {
    // Web3 functionality temporarily disabled while we focus on traditional auth
    console.log('Web3 functionality temporarily disabled')
    return '0.01' // Return a default price
    /*
    if (!contract) throw new Error('Contract not initialized')
    try {
      const price = await contract.getRentalPrice(filmId)
      const ethPrice = ethers.formatEther(price.toString())
      return ethPrice
    } catch (error) {
      console.error('Failed to get film price:', error)
      throw error
    }
    */
  }

  const isFilmAvailable = async (filmId: string): Promise<boolean> => {
    // Web3 functionality temporarily disabled while we focus on traditional auth
    console.log('Web3 functionality temporarily disabled')
    return true // Default to available
    /*
    if (!contract) throw new Error('Contract not initialized')
    try {
      return await contract.isFilmAvailable(filmId)
    } catch (error) {
      console.error('Failed to check film availability:', error)
      throw error
    }
    */
  }

  const getUserRentals = async () => {
    if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
    if (!isConnected || !address) throw new Error('Wallet not connected');
    
    try {
      console.log('Fetching rentals for address:', address);
      
      // Load rentals from both localStorage and server file storage
      const userRentals = await loadRentals(address);
      
      console.log('Retrieved rentals from storage:', userRentals);
      return userRentals;
    } catch (error) {
      console.error('Failed to get user rentals:', error);
      throw error;
    }
  }

  return (
    <Web3Context.Provider value={{
      isConnected,
      account: address,
      connect,
      disconnect,
      rentFilm,
      endRental,
      getFilmPrice,
      isFilmAvailable,
      getUserRentals,
      contract
    }}>
      {error && <div style={{color:'red',marginBottom:8}}>Wallet Error: {error}</div>}
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}