import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filmsFilePath = path.join(process.cwd(), 'data', 'films.json');

const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Film ID is required' },
        { status: 400 }
      );
    }
    
    const updatedFilm = await request.json();
    
    if (!updatedFilm) {
      return NextResponse.json(
        { success: false, error: 'Film data is required' },
        { status: 400 }
      );
    }
    
    // Check if the file exists
    if (!fs.existsSync(filmsFilePath)) {
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
    
    // Find the film to update
    const filmIndex = films.findIndex(film => film.id === id);
    
    if (filmIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Film with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Update the film
    films[filmIndex] = {
      ...films[filmIndex],
      ...updatedFilm
    };
    
    // Write the updated films back to the file
    fs.writeFileSync(filmsFilePath, JSON.stringify(films, null, 2));
    
    console.log(`Film with ID ${id} successfully updated in films.json`);
    return NextResponse.json({ 
      success: true,
      film: films[filmIndex]
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error updating film in films.json:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update film in films.json' },
      { status: 500 }
    );
  }
}
