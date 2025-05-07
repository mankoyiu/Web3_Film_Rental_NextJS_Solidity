import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the JSON file where films are stored
const filmsFilePath = path.join(process.cwd(), 'data', 'films.json');

// Ensure the data directory exists
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// DELETE /api/films/delete - Delete a film from the JSON file
export async function DELETE(request: NextRequest) {
  try {
    console.log('Deleting film from films.json...');
    ensureDirectoryExists();
    
    // Get the film ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      console.error('Delete request missing film ID');
      return NextResponse.json(
        { success: false, error: 'Film ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the file exists
    if (!fs.existsSync(filmsFilePath)) {
      console.error('films.json not found at path:', filmsFilePath);
      return NextResponse.json(
        { success: false, error: 'films.json does not exist' },
        { status: 404 }
      );
    }
    
    // Read existing films
    const filmsData = fs.readFileSync(filmsFilePath, 'utf8');
    let films = [];
    
    try {
      films = JSON.parse(filmsData);
      if (!Array.isArray(films)) {
        console.error('films.json does not contain an array');
        return NextResponse.json(
          { success: false, error: 'films.json does not contain an array' },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error('Error parsing films.json:', parseError);
      return NextResponse.json(
        { success: false, error: 'Error parsing films.json' },
        { status: 500 }
      );
    }
    
    // Find and remove the film
    const filmToDelete = films.find(film => film.id === id);
    if (!filmToDelete) {
      console.error(`Film with ID ${id} not found in films.json`);
      return NextResponse.json(
        { success: false, error: `Film with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    const updatedFilms = films.filter(film => film.id !== id);
    
    // Write the updated films back to the file
    fs.writeFileSync(filmsFilePath, JSON.stringify(updatedFilms, null, 2));
    
    console.log(`Film with ID ${id} successfully deleted from films.json`);
    return NextResponse.json({ 
      success: true,
      deletedFilm: filmToDelete
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error deleting film from films.json:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete film from films.json' },
      { status: 500 }
    );
  }
}
