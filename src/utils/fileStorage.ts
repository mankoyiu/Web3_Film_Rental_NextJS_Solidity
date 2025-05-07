import fs from 'fs';
import path from 'path';

// Base directory for storing data files
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Save data to a JSON file in the data directory
 * @param filename Name of the file (without .json extension)
 * @param data Data to save
 */
export const saveToFile = async (filename: string, data: any): Promise<void> => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving data to file ${filename}:`, error);
    throw error;
  }
};

/**
 * Load data from a JSON file in the data directory
 * @param filename Name of the file (without .json extension)
 * @returns Parsed data from the file, or null if file doesn't exist
 */
export const loadFromFile = async (filename: string): Promise<any> => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist`);
      return null;
    }
    
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from file ${filename}:`, error);
    return null;
  }
};

/**
 * Get a safe filename from a wallet address
 * @param address Wallet address
 * @returns Safe filename
 */
export const getRentalFilename = (address: string): string => {
  // Remove 0x prefix and convert to lowercase
  const safeAddress = address.toLowerCase().replace(/^0x/, '');
  return `rentals_${safeAddress}`;
};
