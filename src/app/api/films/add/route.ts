import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file where films are stored
const filmsFilePath = 'd:/project/data/films.json';

// Ensure the data directory exists
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// POST /api/films/add - Add a single film to the JSON file
export async function POST(request: NextRequest) {
  try {
    console.log('Adding new film to films.json...');
    ensureDirectoryExists();
    
    // Get the new film data from the request
    const newFilm = await request.json();
    
    // Check if the file exists
    if (!fs.existsSync(filmsFilePath)) {
      console.log('films.json does not exist, creating new file with the film');
      fs.writeFileSync(filmsFilePath, JSON.stringify([newFilm], null, 2));
      return NextResponse.json({ success: true });
    }
    
    // Read existing films
    const filmsData = fs.readFileSync(filmsFilePath, 'utf8');
    let films = [];
    
    try {
      films = JSON.parse(filmsData);
      if (!Array.isArray(films)) {
        console.error('films.json does not contain an array');
        films = [];
      }
    } catch (parseError) {
      console.error('Error parsing films.json:', parseError);
      // If the file is corrupted, start with an empty array
      films = [];
    }
    
    // Add the new film
    films.push(newFilm);
    
    // Write the updated films back to the file
    fs.writeFileSync(filmsFilePath, JSON.stringify(films, null, 2));
    
    console.log('Film successfully added to films.json');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding film to films.json:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add film to films.json' },
      { status: 500 }
    );
  }
}
