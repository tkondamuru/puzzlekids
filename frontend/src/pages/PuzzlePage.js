import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, RotateCcw, CheckCircle2, Clock, Trophy, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPuzzleById } from '../utils/mockData';
import { savePuzzleCompletion, getStoredStats } from '../utils/localStorage';

const PuzzlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [gameState, setGameState] = useState('playing'); // 'playing', 'completed'
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [completedPieces, setCompletedPieces] = useState([]);

  useEffect(() => {
    loadPuzzle();
  }, [id]);

  useEffect(() => {
    if (puzzle) {
      setStartTime(Date.now());
      initializePuzzle();
    }
  }, [puzzle]);

  useEffect(() => {
    if (startTime && gameState === 'playing') {
      const timer = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, gameState]);

  const loadPuzzle = async () => {
    try {
      setLoading(true);
      const puzzleData = await getPuzzleById(id);
      setPuzzle(puzzleData);
    } catch (error) {
      console.error('Error loading puzzle:', error);
      toast.error('Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  };

  const initializePuzzle = () => {
    if (!puzzle) return;
    
    const pieces = [];
    for (let i = 0; i < puzzle.pieces; i++) {
      pieces.push({
        id: i,
        correctPosition: i,
        currentPosition: Math.floor(Math.random() * puzzle.pieces),
        isPlaced: false,
        rotation: Math.floor(Math.random() * 4) * 90,
      });
    }
    setPuzzlePieces(pieces);
    setCompletedPieces([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePieceClick = (piece) => {
    if (gameState !== 'playing') return;
    
    // Simulate puzzle piece placement
    const newPuzzlePieces = puzzlePieces.map(p => {
      if (p.id === piece.id) {
        const newRotation = (p.rotation + 90) % 360;
        const isCorrect = newRotation === 0 && p.currentPosition === p.correctPosition;
        return {
          ...p,
          rotation: newRotation,
          isPlaced: isCorrect
        };
      }
      return p;
    });
    
    setPuzzlePieces(newPuzzlePieces);
    
    const newCompletedPieces = newPuzzlePieces.filter(p => p.isPlaced);
    setCompletedPieces(newCompletedPieces);
    
    if (newCompletedPieces.length === puzzle.pieces) {
      completePuzzle();
    }
  };

  const completePuzzle = () => {
    const completionTime = formatTime(currentTime);
    setGameState('completed');
    
    // Save completion to localStorage
    savePuzzleCompletion(puzzle.id, completionTime, currentTime);
    
    toast.success(
      `🎉 Puzzle Completed! Time: ${completionTime}`,
      {
        duration: 4000,
        description: "Great job! You're becoming a puzzle master!"
      }
    );
  };

  const resetPuzzle = () => {
    setGameState('playing');
    setStartTime(Date.now());
    setCurrentTime(0);
    initializePuzzle();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/95 backdrop-blur-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-purple-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Puzzle...</h2>
          <p className="text-gray-600">Getting your puzzle ready!</p>
        </Card>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle className="text-2xl mb-4">Puzzle Not Found</CardTitle>
          <Button onClick={() => navigate('/')} className="bg-purple-500 hover:bg-purple-600">
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Clock size={20} />
                {formatTime(currentTime)}
              </div>
            </div>
            
            <Button
              onClick={resetPuzzle}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
            >
              <RotateCcw className="mr-2" size={16} />
              Reset
            </Button>
          </div>
        </div>

        {/* Puzzle Info */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-white/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {puzzle.title}
                </CardTitle>
                <p className="text-gray-600">{puzzle.description}</p>
              </div>
              <div className="text-6xl">{puzzle.emoji}</div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary">{puzzle.difficulty}</Badge>
              <Badge variant="outline">{puzzle.pieces} pieces</Badge>
              <Badge className="bg-green-500 text-white">
                {completedPieces.length}/{puzzle.pieces} completed
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Large Puzzle Image Display */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              🧩 Assemble the Car — One Part at a Time!
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Drag each part into place — if you miss, we'll show you where it belongs!
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
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
              <div 
                className="w-full h-full flex items-center justify-center text-8xl" 
                style={{ display: puzzle.imgUrl ? 'none' : 'flex' }}
              >
                {puzzle.emoji}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Modal */}
        {gameState === 'completed' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="m-4 max-w-md w-full bg-white/95 backdrop-blur-sm border-2 border-white/50">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  Puzzle Completed!
                </CardTitle>
                <p className="text-gray-600">
                  Amazing work! You solved the puzzle in {formatTime(currentTime)}.
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600">
                  <Trophy size={24} />
                  New Achievement Unlocked!
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Back to Home
                  </Button>
                  <Button
                    onClick={resetPuzzle}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Sparkles className="mr-2" size={16} />
                    Play Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzlePage;