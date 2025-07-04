import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, RotateCcw, Clock, Trophy, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPuzzleById } from '../utils/mockData';
import { savePuzzleCompletion, getStoredStats } from '../utils/localStorage';
import { SVG } from '@svgdotjs/svg.js';

const PuzzlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [svgLoading, setSvgLoading] = useState(true);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'completed'
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  
  // SVG related refs and state
  const svgContainerRef = useRef(null);
  const svgInstanceRef = useRef(null);
  const partsRef = useRef({});
  const floatThumbRef = useRef({});
  const debugTextRef = useRef(null);

  const celebrationMessages = [
    "🎉 Complete! 🎉", "🌟 Awesome! 🌟", "🎯 Nailed It!", "🏁 You Did It!",
    "🚀 Well Done!", "🥳 Great Job!", "💫 Puzzle Solved!", "🔥 That Was Fast!",
    "🎈 Fantastic!", "✅ All Set!", "💥 Boom! Complete!", "👏 Bravo!",
    "🧠 Smart Move!", "🎮 Victory!", "✨ Excellent Work!", "🎊 You Rock!",
    "🎵 That Was Smooth!", "🍭 Sweet Success!", "🧩 Puzzle Master!",
    "🌈 Magic Move!", "🏆 Champion!", "🎨 Masterpiece!", "🎤 Mic Drop!",
    "😎 Too Cool!", "🔓 Unlocked!", "🦄 Nailed the Magic!", "🥇 First Place!",
    "🌟 Superstar!", "🛸 Out of This World!"
  ];

  useEffect(() => {
    loadPuzzle();
  }, [id]);

  useEffect(() => {
    if (puzzle && puzzle.imgUrl) {
      loadSVGContent();
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

  const loadSVGContent = async () => {
    try {
      setSvgLoading(true);
      const response = await fetch(puzzle.imgUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const svgText = await response.text();
      
      if (svgContainerRef.current) {
        // Clear previous content
        svgContainerRef.current.innerHTML = '';
        
        // Inject SVG content
        svgContainerRef.current.innerHTML = svgText;
        
        // Initialize SVG.js after content is loaded
        setTimeout(() => {
          initializeSVGInteraction();
          setStartTime(Date.now());
        }, 100);
      }
    } catch (error) {
      console.error('Error loading SVG:', error);
      toast.error('Failed to load puzzle image');
      // Fallback to emoji display
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 400px; font-size: 8rem;">
            ${puzzle.emoji}
          </div>
        `;
      }
    } finally {
      setSvgLoading(false);
    }
  };

  const getSVGCoordsFromEvent = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return svgInstanceRef.current.point(clientX, clientY);
  };

  const setupDrag = (dragId) => {
    const thumb = SVG(`#rt${dragId}`);
    const target = SVG(`#g${dragId}`);
    
    if (!thumb.node || !target.node) return;
    
    const trayPos = thumb.cx();
    const trayY = thumb.cy();
    let floating = null;

    thumb.on('mousedown touchstart', (e) => {
      e.preventDefault();
      
      if (floatThumbRef.current['last'] != null) {
        floatThumbRef.current['last'].remove();
        floatThumbRef.current['last'] = null;
      }
      
      const { x: startX, y: startY } = getSVGCoordsFromEvent(e);
      floating = target.clone().addTo(svgInstanceRef.current).opacity(0.4).front();
      floating.center(startX, startY);
      floating.show();
      floatThumbRef.current['last'] = floating;

      function moveHandler(ev) {
        const { x, y } = getSVGCoordsFromEvent(ev);
        floating.center(x, y);
      }

      function upHandler(ev) {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', upHandler);

        const dist = Math.hypot(
          floating.cx() - partsRef.current[dragId].center.x,
          floating.cy() - partsRef.current[dragId].center.y
        );

        if (debugTextRef.current) {
          debugTextRef.current.text(`target: ${floating.cx()}, ${floating.cy()}`);
        }

        if (dist < 50) {
          target.show();
          floating.remove();
          thumb.parent().hide();
          
          // Check if all thumbs are hidden
          const remaining = svgInstanceRef.current.find('[id^=rt]').filter(el => el.parent().visible());
          if (remaining.length === 0) {
            showPuzzleComplete();
          }
        } else {
          floating.animate(300).center(trayPos, trayY).after(() => {
            floating.remove();
          });
        }
      }

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);
      document.addEventListener("touchmove", moveHandler);
      document.addEventListener("touchend", upHandler);
    });
  };

  const initAllDraggables = () => {
    for (let i = 1; i <= 18; i++) {
      const target = SVG(`#g${i}`);
      if (!target.node) continue;
      
      const bbox = target.bbox();
      partsRef.current[i] = {
        target: target,
        center: { x: bbox.cx, y: bbox.cy }
      };
      
      setupDrag(i);
      target.hide();
    }
  };

  const showPuzzleComplete = () => {
    const puzzleRoot = SVG('#puzzleRoot');
    if (!puzzleRoot.node) return;

    // Shine animation: pulse scale + opacity
    puzzleRoot.animate(600, '<>')
      .scale(0.95)
      .opacity(0.9)
      .loop(3, true)
      .after(() => {
        puzzleRoot.animate(600).scale(1).opacity(1);
        const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
        
        svgInstanceRef.current.text(message)
          .move(150, 30)
          .font({ size: 35, anchor: 'middle', weight: 'bold', family: 'Comic Sans MS, cursive' })
          .fill('#28a745')
          .animate(1000).opacity(1);
        
        // Complete puzzle in React state
        completePuzzle();
      });
  };

  const addThumbHitboxes = () => {
    for (let i = 1; i <= 18; i++) {
      const group = SVG(`#t${i}`);
      if (!group.node) continue;

      const bbox = group.bbox();
      const padding = 5;

      const bg = svgInstanceRef.current.rect(
        bbox.width + padding * 2,
        bbox.height + padding * 2
      )
        .move(bbox.x - padding, bbox.y - padding)
        .fill('#fff')
        .opacity(0.01)
        .attr({ id: `rt${i}` })
        .back();

      group.add(bg);
    }
  };

  const initializeSVGInteraction = () => {
    try {
      // Find the SVG element in the container
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Set an ID for SVG.js to target
      svgElement.id = 'puzzleSvg';
      
      // Initialize SVG.js
      svgInstanceRef.current = SVG('#puzzleSvg');
      
      // Add debug text
      debugTextRef.current = svgInstanceRef.current.text('').move(10, 760).font({ size: 16 }).fill('#f00');
      
      // Initialize drag functionality
      addThumbHitboxes();
      initAllDraggables();
      
      console.log('SVG interaction initialized successfully');
    } catch (error) {
      console.error('Error initializing SVG interaction:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    
    // Reset SVG state
    if (svgInstanceRef.current) {
      // Clear any floating pieces
      if (floatThumbRef.current['last']) {
        floatThumbRef.current['last'].remove();
        floatThumbRef.current['last'] = null;
      }
      
      // Reset all parts to hidden and thumbs to visible
      for (let i = 1; i <= 18; i++) {
        const target = SVG(`#g${i}`);
        const thumb = SVG(`#rt${i}`);
        if (target.node) target.hide();
        if (thumb.node) thumb.parent().show();
      }
      
      // Clear any celebration text
      const textElements = svgInstanceRef.current.find('text').filter(el => 
        el.text() && celebrationMessages.includes(el.text())
      );
      textElements.forEach(el => el.remove());
    }
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
              {gameState === 'completed' && (
                <Badge className="bg-green-500 text-white">
                  <Trophy size={12} className="mr-1" />
                  Completed!
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Interactive SVG Puzzle */}
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
            {svgLoading && (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-purple-500" size={48} />
                <span className="ml-4 text-gray-600">Loading interactive puzzle...</span>
              </div>
            )}
            <div 
              ref={svgContainerRef}
              className="rounded-lg border-2 border-dashed border-gray-300 overflow-hidden min-h-96"
              style={{ display: svgLoading ? 'none' : 'block' }}
            />
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