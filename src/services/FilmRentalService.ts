import { getPublicClient, getWalletClient, getAccount } from 'wagmi/actions';
import { parseEther, formatEther } from 'viem';
import { FilmRental as FilmRentalContract } from '@/contracts/types';
import FilmRentalABI from '@/contracts/FilmRental.json';

export interface Film {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean;
  currentRenter: string;
  rentalEndTime: number;
}

class FilmRentalService {
  private contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  private abi = FilmRentalABI.abi;

  async getFilm(filmId: string): Promise<Film> {
    const publicClient = getPublicClient();
    const data = await publicClient.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.abi,
      functionName: 'getFilm',
      args: [BigInt(filmId)],
    }) as any;

    return this.parseFilm(data);
  }

  async rentFilm(filmId: string, price: number) {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error('Wallet not connected');

    const { request } = await publicClient.simulateContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.abi,
      functionName: 'rentFilm',
      args: [BigInt(filmId)],
      value: parseEther(price.toString()),
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async returnFilm(filmId: string) {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error('Wallet not connected');

    const { request } = await publicClient.simulateContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.abi,
      functionName: 'returnFilm',
      args: [BigInt(filmId)],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async getUserRentals(address: string): Promise<string[]> {
    const publicClient = getPublicClient();
    const data = await publicClient.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.abi,
      functionName: 'getUserRentals',
      args: [address as `0x${string}`],
    }) as bigint[];

    return data.map(id => id.toString());
  }

  // Admin functions
  async addFilm(
    title: string,
    description: string,
    imageUrl: string,
    price: number
  ) {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error('Wallet not connected');

    const { request } = await publicClient.simulateContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.abi,
      functionName: 'addFilm',
      args: [title, description, imageUrl, parseEther(price.toString())],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async removeFilm(filmId: string) {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error('Wallet not connected');

    const { request } = await publicClient.simulateContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.abi,
      functionName: 'removeFilm',
      args: [BigInt(filmId)],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
  }

  private parseFilm(filmData: any): Film {
    return {
      id: filmData.id.toString(),
      title: filmData.title,
      description: filmData.description,
      imageUrl: filmData.imageUrl,
      price: Number(formatEther(filmData.price)),
      available: filmData.available,
      currentRenter: filmData.currentRenter,
      rentalEndTime: Number(filmData.rentalEndTime),
    };
  }
}

export const filmRentalService = new FilmRentalService();
export default filmRentalService; 