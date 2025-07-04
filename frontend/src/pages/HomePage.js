import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trophy, Clock, Star, Sparkles, Loader2 } from 'lucide-react';
import { fetchPuzzles, getCompletionStats } from '../utils/mockData';
import { getStoredStats } from '../utils/localStorage';

const HomePage = () => {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(getStoredStats());
  const completionStats = getCompletionStats();
  const location = useLocation();

  useEffect(() => {
    loadPuzzles();
    // Refresh stats when component mounts or when returning from puzzle page
    refreshStats();
    
    // Add focus event listener to refresh stats when user returns to tab
    const handleFocus = () => {
      refreshStats();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    // Refresh stats when location changes (returning from puzzle page)
    refreshStats();
  }, [location.pathname]);

  const refreshStats = () => {
    const updatedStats = getStoredStats();
    setStats(updatedStats);
  };

  const loadPuzzles = async () => {
    try {
      setLoading(true);
      setError(null);
      const puzzleData = await fetchPuzzles();
      setPuzzles(puzzleData);
    } catch (err) {
      setError('Failed to load puzzles. Please try again.');
      console.error('Error loading puzzles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/95 backdrop-blur-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-purple-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Puzzles...</h2>
          <p className="text-gray-600">Getting your amazing puzzles ready!</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/95 backdrop-blur-sm">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadPuzzles} className="bg-purple-500 hover:bg-purple-600">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🧩 Kids Puzzle Palace 🧩
          </h1>
          <p className="text-2xl text-white/90 font-medium">
            Solve amazing puzzles and become a puzzle master!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex gap-8 items-center border border-white/30">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-300" size={24} />
              <span className="text-white font-semibold">
                {stats.totalCompleted} Puzzles Solved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-300" size={24} />
              <span className="text-white font-semibold">
                Best Time: {stats.bestTime || 'N/A'}
              </span>
            </div>
            <Link to="/dashboard">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl transform hover:scale-105 transition-all duration-200">
                <Sparkles className="mr-2" size={16} />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Puzzle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {puzzles.map((puzzle) => {
            const isCompleted = stats.completedPuzzles.includes(puzzle.id);
            const completionTime = stats.puzzleTimes[puzzle.id];
            
            return (
              <Card key={puzzle.id} className="overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-2 border-white/50">
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2">
                    {isCompleted && (
                      <Badge className="bg-green-500 text-white">
                        <Trophy size={12} className="mr-1" />
                        Solved!
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                    {puzzle.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{puzzle.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                    {puzzle.imgUrl ? (
                      <img 
                        src={puzzle.imgUrl} 
                        alt={puzzle.title}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="text-6xl" style={{ display: puzzle.imgUrl ? 'none' : 'flex' }}>
                      {puzzle.emoji}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {puzzle.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {puzzle.pieces} pieces
                      </Badge>
                    </div>
                    {completionTime && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={12} />
                        {completionTime}
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/puzzle/${puzzle.id}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transform hover:scale-105 transition-all duration-200">
                      {isCompleted ? 'Play Again' : 'Start Puzzle'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Fun Facts */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
          <h3 className="text-2xl font-bold text-white mb-4">🌟 Fun Facts 🌟</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-white">
              <div className="text-3xl font-bold">{completionStats.totalAttempts}</div>
              <div className="text-sm opacity-90">Total Attempts</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">{completionStats.averageTime}</div>
              <div className="text-sm opacity-90">Average Time</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">{completionStats.favoriteTime}</div>
              <div className="text-sm opacity-90">Favorite Play Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;