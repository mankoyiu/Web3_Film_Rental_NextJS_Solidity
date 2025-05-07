import { NextRequest, NextResponse } from 'next/server';
import { saveToFile, loadFromFile, getRentalFilename } from '@/utils/fileStorage';

// GET endpoint to retrieve rentals for a specific wallet address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    const filename = getRentalFilename(address);
    const rentals = await loadFromFile(filename) || [];
    
    return NextResponse.json({ rentals });
  } catch (error) {
    console.error('Error retrieving rentals:', error);
    return NextResponse.json({ error: 'Failed to retrieve rentals' }, { status: 500 });
  }
}

// POST endpoint to save rentals for a specific wallet address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, rentals } = body;
    
    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    if (!rentals || !Array.isArray(rentals)) {
      return NextResponse.json({ error: 'Rentals must be an array' }, { status: 400 });
    }
    
    const filename = getRentalFilename(address);
    await saveToFile(filename, rentals);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving rentals:', error);
    return NextResponse.json({ error: 'Failed to save rentals' }, { status: 500 });
  }
}
