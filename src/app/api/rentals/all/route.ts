import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Base directory for storing data files
const DATA_DIR = path.join(process.cwd(), 'data');

// GET endpoint to retrieve all rentals from all users
export async function GET(request: NextRequest) {
  try {
    // Ensure the data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      return NextResponse.json({ rentals: [] });
    }

    // Get all rental files
    const files = fs.readdirSync(DATA_DIR);
    const rentalFiles = files.filter(file => file.startsWith('rentals_') && file.endsWith('.json'));
    
    // Collect all rentals
    let allRentals: any[] = [];
    
    for (const file of rentalFiles) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const rentals = JSON.parse(fileContent);
        
        if (Array.isArray(rentals)) {
          allRentals = [...allRentals, ...rentals];
        }
      } catch (err) {
        console.error(`Error reading rental file ${file}:`, err);
        // Continue with other files
      }
    }
    
    return NextResponse.json({ rentals: allRentals });
  } catch (error) {
    console.error('Error retrieving all rentals:', error);
    return NextResponse.json({ error: 'Failed to retrieve rentals', details: error }, { status: 500 });
  }
}
