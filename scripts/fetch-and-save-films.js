// Script to fetch films from the API and save them to local JSON file
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://pcpdfilm.starsknights.com:18888/api/v2';
const FILMS_FILE_PATH = path.join(process.cwd(), '..', 'data', 'films.json');

// Ensure data directory exists
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Convert API film to our Film format
const convertApiFilm = (apiFilm) => ({
  id: apiFilm._id || apiFilm.id || '',
  title: apiFilm.title || '',
  year: apiFilm.year ? apiFilm.year.toString() : '',
  director: apiFilm.director || '',
  genre: apiFilm.genre || '',
  runtime: apiFilm.runtime ? (typeof apiFilm.runtime === 'number' ? apiFilm.runtime : parseInt(apiFilm.runtime) || 0) : 0,
  language: apiFilm.language || '',
  poster: apiFilm.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
  description: apiFilm.description || '',
  price: typeof apiFilm.price === 'number' ? apiFilm.price : 0,
  available: typeof apiFilm.available === 'boolean' ? apiFilm.available : true,
  rentals: typeof apiFilm.rentals === 'number' ? apiFilm.rentals : 0
});

// Fetch films from API
async function fetchFilmsFromApi() {
  try {
    console.log('Fetching films from API...');
    const response = await axios.get(`${API_BASE_URL}/films`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Handle different response structures
    let films = [];
    if (Array.isArray(response.data)) {
      films = response.data;
    } else if (Array.isArray(response.data?.data)) {
      films = response.data.data;
    } else if (Array.isArray(response.data?.films)) {
      films = response.data.films;
    } else if (typeof response.data === 'object') {
      // Try to extract any array we can find
      const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        films = possibleArrays[0];
      }
    }
    
    if (films.length === 0) {
      console.error('No films found in API response');
      process.exit(1);
    }
    
    // Convert API films to our format
    const formattedFilms = films.map(film => convertApiFilm(film));
    console.log(`Successfully fetched ${formattedFilms.length} films from API`);
    return formattedFilms;
  } catch (error) {
    console.error('Error fetching films from API:', error.message);
    process.exit(1);
  }
}

// Save films to local JSON file
async function saveFilmsToFile(films) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(FILMS_FILE_PATH, JSON.stringify(films, null, 2));
    console.log(`Successfully saved ${films.length} films to ${FILMS_FILE_PATH}`);
  } catch (error) {
    console.error('Error saving films to file:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  const films = await fetchFilmsFromApi();
  await saveFilmsToFile(films);
  console.log('Done!');
}

// Run the script
main();
