import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Trophy, Clock, Target, Zap, Star, TrendingUp, Play } from 'lucide-react';
import { getStoredStats, getAllCompletions } from '../utils/localStorage';
import { fetchPuzzles } from '../utils/mockData';

const Dashboard = () => {
  const [stats, setStats] = useState(getStoredStats());
  const [completions, setCompletions] = useState(getAllCompletions());
  const [puzzles, setPuzzles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPuzzles();
    // Refresh stats when component mounts
    setStats(getStoredStats());
    setCompletions(getAllCompletions());
  }, []);

  const loadPuzzles = async () => {
    try {
      const puzzleData = await fetchPuzzles();
      setPuzzles(puzzleData);
    } catch (error) {
      console.error('Error loading puzzles:', error);
    }
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (stats.totalCompleted >= 1) {
      achievements.push({ 
        title: "First Puzzle!", 
        description: "Completed your first puzzle", 
        icon: "🎯",
        color: "bg-blue-500"
      });
    }
    
    if (stats.totalCompleted >= 5) {
      achievements.push({ 
        title: "Puzzle Enthusiast", 
        description: "Completed 5 puzzles", 
        icon: "🏆",
        color: "bg-green-500"
      });
    }
    
    if (stats.totalCompleted >= 10) {
      achievements.push({ 
        title: "Puzzle Master", 
        description: "Completed 10 puzzles", 
        icon: "👑",
        color: "bg-purple-500"
      });
    }
    
    if (stats.bestTimeSeconds && stats.bestTimeSeconds < 60) {
      achievements.push({ 
        title: "Speed Demon", 
        description: "Completed a puzzle in under 1 minute", 
        icon: "⚡",
        color: "bg-yellow-500"
      });
    }
    
    return achievements;
  };

  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30">
              <ArrowLeft className="mr-2" size={16} />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              🏆 Your Dashboard 🏆
            </h1>
            <p className="text-white/90 text-lg">
              Track your amazing progress!
            </p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {stats.totalCompleted}
              </div>
              <p className="text-gray-600 font-medium">Puzzles Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Clock className="mx-auto mb-4 text-blue-500" size={48} />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {stats.bestTime || 'N/A'}
              </div>
              <p className="text-gray-600 font-medium">Best Time</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Target className="mx-auto mb-4 text-green-500" size={48} />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {stats.totalAttempts}
              </div>
              <p className="text-gray-600 font-medium">Total Attempts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-4 text-purple-500" size={48} />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {stats.averageTime || 'N/A'}
              </div>
              <p className="text-gray-600 font-medium">Average Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm border-2 border-white/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Star className="text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏁</div>
                <p className="text-gray-600 text-lg">
                  Start solving puzzles to unlock achievements!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`
                      p-4 rounded-lg ${achievement.color} text-white
                      transform hover:scale-105 transition-all duration-300
                    `}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                    <p className="text-sm opacity-90">{achievement.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completions */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm border-2 border-white/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              Recent Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg">
                  No completions yet. Start solving puzzles!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completions.slice(0, 10).map((completion, index) => {
                  const puzzle = puzzles.find(p => p.id === completion.puzzleId);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{puzzle?.emoji || '🧩'}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {puzzle?.title || 'Unknown Puzzle'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(completion.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-500 text-white">
                          {completion.completionTime}
                        </Badge>
                        <Badge variant="outline">
                          {puzzle?.difficulty || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;