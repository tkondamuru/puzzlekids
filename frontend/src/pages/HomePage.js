import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Trophy, Clock, Star, Sparkles, Loader2, Search, Filter, Settings } from 'lucide-react';
import { fetchPuzzles, getCompletionStats } from '../utils/mockData';
import { getStoredStats } from '../utils/localStorage';

const HomePage = () => {
  const [allPuzzles, setAllPuzzles] = useState([]);
  const [filteredPuzzles, setFilteredPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(getStoredStats());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchSection, setShowSearchSection] = useState(true);
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

  useEffect(() => {
    // Filter puzzles when search term or selected tags change
    filterPuzzles();
  }, [searchTerm, selectedTags, allPuzzles]);

  const refreshStats = () => {
    const updatedStats = getStoredStats();
    setStats(updatedStats);
  };

  const loadPuzzles = async () => {
    try {
      setLoading(true);
      setError(null);
      const puzzleData = await fetchPuzzles();
      setAllPuzzles(puzzleData);
      
      // Extract unique tags
      const tags = new Set();
      puzzleData.forEach(puzzle => {
        if (puzzle.tags && puzzle.tags.length > 0) {
          puzzle.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags).sort());
      
    } catch (err) {
      setError('Failed to load puzzles. Please try again.');
      console.error('Error loading puzzles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPuzzles = () => {
    let filtered = allPuzzles;

    // Filter by search term (name and description)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(puzzle => 
        puzzle.title.toLowerCase().includes(term) ||
        puzzle.description.toLowerCase().includes(term)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(puzzle => 
        puzzle.tags && puzzle.tags.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredPuzzles(filtered);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
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
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-wrap gap-4 md:gap-8 items-center justify-center border border-white/30 max-w-full">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-300" size={20} />
              <span className="text-white font-semibold text-sm md:text-base">
                {stats.totalCompleted} Solved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-300" size={20} />
              <span className="text-white font-semibold text-sm md:text-base">
                Best: {stats.bestTime || 'N/A'}
              </span>
            </div>
            <Link to="/dashboard">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 md:px-6 py-2 rounded-xl transform hover:scale-105 transition-all duration-200 text-sm md:text-base">
                <Sparkles className="mr-1 md:mr-2" size={14} />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin">
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 font-bold px-4 md:px-6 py-2 rounded-xl transform hover:scale-105 transition-all duration-200 text-sm md:text-base">
                <Settings className="mr-1 md:mr-2" size={14} />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 overflow-hidden">
            {/* Section Header */}
            <div 
              className="p-4 cursor-pointer select-none hover:bg-gray-50/50 transition-colors duration-200"
              onClick={() => setShowSearchSection(!showSearchSection)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search size={20} className="text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Search & Filter Puzzles</h3>
                </div>
                <div className="flex items-center gap-2">
                  {(searchTerm || selectedTags.length > 0) && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {searchTerm ? 'Search active' : ''} 
                      {searchTerm && selectedTags.length > 0 ? ' • ' : ''}
                      {selectedTags.length > 0 ? `${selectedTags.length} filters` : ''}
                    </Badge>
                  )}
                  <div className={`transform transition-transform duration-300 ${showSearchSection ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Content */}
            <div className={`transition-all duration-500 ease-in-out ${
              showSearchSection 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            } overflow-hidden`}>
              <CardContent className="pt-0 pb-6">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search puzzles by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-base transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="flex items-center gap-2 transition-all duration-200 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Filter size={16} />
                    <span>Tag Filters</span>
                    {selectedTags.length > 0 && (
                      <Badge className="bg-purple-600 text-white ml-1">
                        {selectedTags.length}
                      </Badge>
                    )}
                    <div className={`transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Button>
                  
                  {(searchTerm || selectedTags.length > 0) && (
                    <Button 
                      onClick={clearFilters} 
                      variant="ghost" 
                      size="sm"
                      className="transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Tag Filters */}
                <div className={`transition-all duration-300 ease-in-out ${
                  showFilters && availableTags.length > 0
                    ? 'max-h-40 opacity-100 mb-4' 
                    : 'max-h-0 opacity-0 mb-0'
                } overflow-hidden`}>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Tags:</h4>
                    <div className="flex flex-wrap gap-3">
                      {availableTags.map(tag => (
                        <div 
                          key={tag} 
                          className={`flex items-center gap-2 rounded-lg p-3 transition-all duration-200 cursor-pointer hover:scale-105 ${
                            selectedTags.includes(tag) 
                              ? 'bg-purple-100 border-2 border-purple-300 shadow-sm' 
                              : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => handleTagToggle(tag)}
                        >
                          <Switch
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                            className="data-[state=checked]:bg-purple-600"
                          />
                          <label className="text-sm font-medium text-gray-700 capitalize cursor-pointer">
                            {tag.replace('-', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                {(searchTerm || selectedTags.length > 0) && (
                  <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <span className="font-medium">
                      Showing {filteredPuzzles.length} of {allPuzzles.length} puzzles
                    </span>
                    {searchTerm && (
                      <span className="ml-2 text-blue-600">
                        • Searching for "{searchTerm}"
                      </span>
                    )}
                    {selectedTags.length > 0 && (
                      <span className="ml-2 text-purple-600">
                        • Tags: {selectedTags.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Puzzle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPuzzles.map((puzzle) => {
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

                  {/* Tags Display */}
                  {puzzle.tags && puzzle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {puzzle.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {tag.replace('-', ' ')}
                        </Badge>
                      ))}
                      {puzzle.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{puzzle.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
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

        {/* No Results Message */}
        {filteredPuzzles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No puzzles found</h3>
            <p className="text-white/80 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={clearFilters} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;