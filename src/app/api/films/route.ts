import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file where films will be stored
// Use path.join to create a cross-platform compatible path
const filmsFilePath = path.join(process.cwd(), 'data', 'films.json');

// Ensure the data directory exists
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize the films file if it doesn't exist
const initFilmsFile = () => {
  ensureDirectoryExists();
  if (!fs.existsSync(filmsFilePath)) {
    fs.writeFileSync(filmsFilePath, JSON.stringify([]));
  }
};

// GET /api/films - Get all films
export async function GET(request: NextRequest) {
  try {
    // Log the current working directory and file path for debugging
    const cwd = process.cwd();
    console.log('Current working directory:', cwd);
    console.log('Films file path (absolute):', filmsFilePath);
    try {
      const stat = fs.statSync(filmsFilePath);
      console.log('films.json stat:', stat);
    } catch (e) {
      console.error('films.json stat error:', e);
    }
    
    // Ensure the file exists
    initFilmsFile();
    
    // Check if file exists and is readable
    if (!fs.existsSync(filmsFilePath)) {
      console.error('Films file does not exist after initialization!');
      return NextResponse.json(
        { error: 'Films file does not exist' },
        { status: 500 }
      );
    }
    
    // Read the films from the file
    console.log('Reading films file...');
    const filmsData = fs.readFileSync(filmsFilePath, 'utf8');
    console.log('Films data length:', filmsData.length);
    
    // If the file is empty or contains just empty brackets, return mock data
    if (!filmsData || filmsData.trim() === '' || filmsData.trim() === '[]') {
      console.log('Films file is empty, returning mock data');
      const mockFilms = [
        {
          id: '1',
          title: 'The Matrix',
          year: '1999',
          director: 'The Wachowskis',
          genre: 'Action, Sci-Fi',
          runtime: 136,
          language: 'English',
          poster: 'https://m.media-amazon.com/images/I/51EG732BV3L._AC_SY445_.jpg',
          description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
          price: 3.99,
          available: true,
          rentals: 0
        },
        {
          id: '2',
          title: 'Inception',
          year: '2010',
          director: 'Christopher Nolan',
          genre: 'Action, Adventure, Sci-Fi',
          runtime: 148,
          language: 'English',
          poster: 'https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_SY679_.jpg',
          description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
          price: 4.99,
          available: true,
          rentals: 0
        },
        {
          id: '3',
          title: 'Spirited Away',
          year: '2001',
          director: 'Hayao Miyazaki',
          genre: 'Animation, Adventure, Family',
          runtime: 125,
          language: 'Japanese',
          poster: 'https://m.media-amazon.com/images/I/51Qvs9i5a%2BL._AC_SY445_.jpg',
          description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
          price: 3.49,
          available: true,
          rentals: 0
        }
      ];
      return NextResponse.json(mockFilms);
    }
    
    // Parse the JSON data
    try {
      const films = JSON.parse(filmsData);
      
      // Check if we have enough films (more than the mock data)
      if (!Array.isArray(films)) {
        console.error('Films data is not an array:', typeof films);
        return NextResponse.json(
          { error: 'Films data is not an array' },
          { status: 500 }
        );
      }
      
      if (films.length <= 3) {
        console.log('Only mock data found in films.json, returning it anyway');
      } else {
        console.log(`Returning ${films.length} films from local JSON file`);
      }
      
      const response = NextResponse.json(films);
response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
return response;
    } catch (parseError) {
      console.error('Error parsing films JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse films JSON' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error reading films:', error);
    return NextResponse.json(
      { error: 'Failed to read films', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/films - Save all films
export async function POST(request: NextRequest) {
  try {
    ensureDirectoryExists();
    
    // Get the films data from the request
    const films = await request.json();
    
    // Write the films to the file
    fs.writeFileSync(filmsFilePath, JSON.stringify(films, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving films:', error);
    return NextResponse.json(
      { error: 'Failed to save films' },
      { status: 500 }
    );
  }
}
