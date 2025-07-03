// LocalStorage utilities for managing puzzle data
const STORAGE_KEYS = {
  PUZZLE_STATS: 'puzzle_stats',
  COMPLETIONS: 'puzzle_completions'
};

// Initialize default stats structure
const defaultStats = {
  totalCompleted: 0,
  totalAttempts: 0,
  bestTime: null,
  bestTimeSeconds: null,
  averageTime: null,
  completedPuzzles: [],
  puzzleTimes: {}
};

// Get stored stats or return defaults
export const getStoredStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PUZZLE_STATS);
    return stored ? JSON.parse(stored) : defaultStats;
  } catch (error) {
    console.error('Error reading stats from localStorage:', error);
    return defaultStats;
  }
};

// Save puzzle completion
export const savePuzzleCompletion = (puzzleId, completionTime, timeInSeconds) => {
  try {
    const stats = getStoredStats();
    const completions = getAllCompletions();
    
    // Update stats
    const newStats = {
      ...stats,
      totalCompleted: stats.completedPuzzles.includes(puzzleId) 
        ? stats.totalCompleted 
        : stats.totalCompleted + 1,
      totalAttempts: stats.totalAttempts + 1,
      completedPuzzles: stats.completedPuzzles.includes(puzzleId) 
        ? stats.completedPuzzles 
        : [...stats.completedPuzzles, puzzleId],
      puzzleTimes: {
        ...stats.puzzleTimes,
        [puzzleId]: completionTime
      }
    };
    
    // Update best time if this is better
    if (!newStats.bestTimeSeconds || timeInSeconds < newStats.bestTimeSeconds) {
      newStats.bestTime = completionTime;
      newStats.bestTimeSeconds = timeInSeconds;
    }
    
    // Calculate average time
    const allCompletions = [...completions, {
      puzzleId,
      completionTime,
      timeInSeconds,
      timestamp: Date.now()
    }];
    
    const totalSeconds = allCompletions.reduce((sum, comp) => sum + comp.timeInSeconds, 0);
    const avgSeconds = Math.floor(totalSeconds / allCompletions.length);
    const avgMins = Math.floor(avgSeconds / 60);
    const avgSecsRemainder = avgSeconds % 60;
    newStats.averageTime = `${avgMins.toString().padStart(2, '0')}:${avgSecsRemainder.toString().padStart(2, '0')}`;
    
    // Save updated stats
    localStorage.setItem(STORAGE_KEYS.PUZZLE_STATS, JSON.stringify(newStats));
    
    // Save completion record
    const newCompletion = {
      puzzleId,
      completionTime,
      timeInSeconds,
      timestamp: Date.now()
    };
    
    saveCompletion(newCompletion);
    
    return newStats;
  } catch (error) {
    console.error('Error saving puzzle completion:', error);
    return getStoredStats();
  }
};

// Get all completions
export const getAllCompletions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading completions from localStorage:', error);
    return [];
  }
};

// Save individual completion
const saveCompletion = (completion) => {
  try {
    const completions = getAllCompletions();
    const newCompletions = [completion, ...completions];
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(newCompletions));
  } catch (error) {
    console.error('Error saving completion:', error);
  }
};

// Reset all data (for testing purposes)
export const resetAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PUZZLE_STATS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
  } catch (error) {
    console.error('Error resetting data:', error);
  }
};

// Get completion count for a specific puzzle
export const getPuzzleCompletionCount = (puzzleId) => {
  const completions = getAllCompletions();
  return completions.filter(comp => comp.puzzleId === puzzleId).length;
};

// Get best time for a specific puzzle
export const getPuzzleBestTime = (puzzleId) => {
  const completions = getAllCompletions();
  const puzzleCompletions = completions.filter(comp => comp.puzzleId === puzzleId);
  
  if (puzzleCompletions.length === 0) return null;
  
  const bestCompletion = puzzleCompletions.reduce((best, current) => 
    current.timeInSeconds < best.timeInSeconds ? current : best
  );
  
  return bestCompletion.completionTime;
};