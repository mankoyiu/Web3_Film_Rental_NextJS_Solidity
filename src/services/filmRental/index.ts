import * as ethers from 'ethers';

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
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export interface Film {
  id: string;
  rentalPrice: string;
  isAvailable: boolean;
}

export interface Rental {
  filmId: string;
  renter: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

class FilmRentalService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          FILM_RENTAL_ABI,
          this.signer
        );
        return true;
      } catch (error) {
        console.error('Failed to initialize FilmRentalService:', error);
        return false;
      }
    }
    return false;
  }

  async addFilm(id: string, price: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      const priceInWei = ethers.parseEther(price);
      const tx = await this.contract.addFilm(id, priceInWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to add film:', error);
      throw error;
    }
  }

  async rentFilm(filmId: string, price: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      const tx = await this.contract.rentFilm(filmId, {
        value: ethers.parseEther(price)
      });
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to rent film:', error);
      throw error;
    }
  }

  async endRental(filmId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      const tx = await this.contract.endRental(filmId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to end rental:', error);
      throw error;
    }
  }

  async getFilmPrice(filmId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      const price = await this.contract.getRentalPrice(filmId);
      return ethers.formatEther(price);
    } catch (error) {
      console.error('Failed to get film price:', error);
      throw error;
    }
  }

  async isFilmAvailable(filmId: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      return await this.contract.isFilmAvailable(filmId);
    } catch (error) {
      console.error('Failed to check film availability:', error);
      throw error;
    }
  }

  async getUserRentals(userAddress?: string): Promise<Rental[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      const address = userAddress || (this.signer ? await this.signer.getAddress() : null);
      if (!address) throw new Error('No address provided or available');
      
      const rentals = await this.contract.getUserRentals(address);
      return rentals;
    } catch (error) {
      console.error('Failed to get user rentals:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const filmRentalService = new FilmRentalService();
