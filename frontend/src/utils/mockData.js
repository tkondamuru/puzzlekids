// API endpoint for puzzle data
const PUZZLE_API_URL = 'https://azuprddatasave.blob.core.windows.net/minigames/cars.js';

// Cache for puzzle data
let puzzleCache = null;

// Map difficulty levels to consistent format
const normalizeDifficulty = (level) => {
  if (!level) return 'Easy';
  const normalized = level.toLowerCase();
  if (normalized === 'easy') return 'Easy';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'hard') return 'Hard';
  return 'Easy';
};

// Get emoji based on puzzle name or description
const getEmojiForPuzzle = (name, desc) => {
  const text = (name + ' ' + desc).toLowerCase();
  
  if (text.includes('garden') || text.includes('flower')) return '🌻';
  if (text.includes('ocean') || text.includes('sea') || text.includes('fish')) return '🐠';
  if (text.includes('forest') || text.includes('animal') || text.includes('tree')) return '🦝';
  if (text.includes('space') || text.includes('star') || text.includes('rocket')) return '🚀';
  if (text.includes('farm') || text.includes('cow') || text.includes('barn')) return '🐄';
  if (text.includes('castle') || text.includes('dragon') || text.includes('magic')) return '🏰';
  if (text.includes('car') || text.includes('vehicle') || text.includes('truck')) return '🚗';
  if (text.includes('princess') || text.includes('fairy')) return '👸';
  if (text.includes('pirate') || text.includes('ship')) return '🏴‍☠️';
  if (text.includes('dinosaur') || text.includes('dino')) return '🦕';
  
  return '🧩'; // Default puzzle emoji
};

// Transform API data to our format
const transformPuzzleData = (apiData) => {
  return apiData.map((puzzle, index) => ({
    id: `puzzle-${index + 1}`,
    title: puzzle.name || 'Untitled Puzzle',
    description: puzzle.desc || 'A fun puzzle to solve',
    difficulty: normalizeDifficulty(puzzle.level),
    pieces: puzzle.pieces || 9,
    emoji: getEmojiForPuzzle(puzzle.name, puzzle.desc),
    svgPath: puzzle.img || '',
    imgUrl: puzzle.img || ''
  }));
};

// Fetch puzzles from API
export const fetchPuzzles = async () => {
  if (puzzleCache) {
    return puzzleCache;
  }

  try {
    const response = await fetch(PUZZLE_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    puzzleCache = transformPuzzleData(data);
    return puzzleCache;
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    
    // Fallback to mock data if API fails
    const fallbackData = [
      {
        name: "Sunny Garden",
        desc: "A beautiful garden with flowers and butterflies",
        pieces: 9,
        level: "easy",
        img: "https://via.placeholder.com/300x300/FFE5B4/FF6B6B?text=🌻"
      },
      {
        name: "Ocean Adventure", 
        desc: "Dive into the deep blue sea with fish and coral",
        pieces: 16,
        level: "medium",
        img: "https://via.placeholder.com/300x300/B4E5FF/4ECDC4?text=🐠"
      },
      {
        name: "Forest Friends",
        desc: "Meet the cute animals living in the forest", 
        pieces: 12,
        level: "easy",
        img: "https://via.placeholder.com/300x300/C8E6C9/4CAF50?text=🦝"
      }
    ];
    
    puzzleCache = transformPuzzleData(fallbackData);
    return puzzleCache;
  }
};

// Get all puzzles (async version)
export const getPuzzles = async () => {
  return await fetchPuzzles();
};

// Get puzzle by ID (async version)
export const getPuzzleById = async (id) => {
  const puzzles = await fetchPuzzles();
  return puzzles.find(puzzle => puzzle.id === id);
};

// Synchronous version for components that need immediate data
export const getPuzzlesSync = () => {
  return puzzleCache || [];
};

export const getPuzzleByIdSync = (id) => {
  const puzzles = puzzleCache || [];
  return puzzles.find(puzzle => puzzle.id === id);
};

export const getCompletionStats = () => {
  // Mock stats - in real app, these would be calculated from localStorage
  return {
    totalAttempts: 15,
    averageTime: '2:34',
    favoriteTime: 'Morning'
  };
};