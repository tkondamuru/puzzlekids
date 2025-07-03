// Mock data for puzzles - in a real app, these would be loaded from assets
export const puzzles = [
  {
    id: 'puzzle-1',
    title: 'Sunny Garden',
    description: 'A beautiful garden with flowers and butterflies',
    difficulty: 'Easy',
    pieces: 9,
    emoji: '🌻',
    svgPath: '/puzzles/sunny-garden.svg' // This would be the actual SVG file
  },
  {
    id: 'puzzle-2',
    title: 'Ocean Adventure',
    description: 'Dive into the deep blue sea with fish and coral',
    difficulty: 'Medium',
    pieces: 16,
    emoji: '🐠',
    svgPath: '/puzzles/ocean-adventure.svg'
  },
  {
    id: 'puzzle-3',
    title: 'Forest Friends',
    description: 'Meet the cute animals living in the forest',
    difficulty: 'Easy',
    pieces: 12,
    emoji: '🦝',
    svgPath: '/puzzles/forest-friends.svg'
  },
  {
    id: 'puzzle-4',
    title: 'Space Explorer',
    description: 'Journey through the stars and planets',
    difficulty: 'Hard',
    pieces: 25,
    emoji: '🚀',
    svgPath: '/puzzles/space-explorer.svg'
  },
  {
    id: 'puzzle-5',
    title: 'Farm Life',
    description: 'Learn about farm animals and crops',
    difficulty: 'Easy',
    pieces: 9,
    emoji: '🐄',
    svgPath: '/puzzles/farm-life.svg'
  },
  {
    id: 'puzzle-6',
    title: 'Magical Castle',
    description: 'Explore a fairy tale castle with dragons',
    difficulty: 'Hard',
    pieces: 20,
    emoji: '🏰',
    svgPath: '/puzzles/magical-castle.svg'
  }
];

export const getPuzzles = () => puzzles;

export const getPuzzleById = (id) => {
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