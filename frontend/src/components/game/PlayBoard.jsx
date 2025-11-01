import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart, X } from 'lucide-react';
import { fetchPuzzle, submitAnswer, useHint, updateGameState, updateStreak, fetchUserStats } from '../../store/gameSlice';
import { GAME_STATES } from '../../models/Game';
import Timer from '../ui/Timer';
import Keypad from '../ui/Keypad';
import Button from '../ui/Button';
import Card from '../ui/Card';
import toast from 'react-hot-toast';
import GameService from '../../services/GameService';

const PlayBoard = () => {
  const dispatch = useDispatch();
  const { 
    currentPuzzle, 
    state, 
    score, 
    lives, 
    hintsUsed, 
    streak, 
    loading,
    difficulty,
    session,
    mode,
    userStats,
  } = useSelector(state => state.game);
  const { user } = useSelector(state => state.auth);
  
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hasShownGameOver, setHasShownGameOver] = useState(false);

  useEffect(() => {
    if (state === GAME_STATES.WAITING) {
      dispatch(fetchPuzzle());
      setGameStartTime(Date.now());
    }
  }, [dispatch, state]);

  useEffect(() => {
    if (state === GAME_STATES.PLAYING) {
      setHasShownGameOver(false);
    }
  }, [state]);

  useEffect(() => {
    dispatch(fetchUserStats());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (state !== GAME_STATES.PLAYING) return;

      const key = event.key;
      if (/^[0-9]$/.test(key)) {
        const number = parseInt(key);
        setSelectedNumber(number);
      }
      if (key === 'Enter' && selectedNumber !== null) {
        handleSubmit(selectedNumber);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [state, selectedNumber]);

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
  };

  const handleSubmit = async (answer) => {
    if (!answer || !gameStartTime) return;
    
    const timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const result = await dispatch(submitAnswer({ answer, timeElapsed }));
    
    if (result.payload.correct) {
      toast('Correct! 🎉', { type: 'success' });
      setSelectedNumber(null);
      setShowHint(false);
      setTimeout(() => {
        dispatch(fetchPuzzle());
        setGameStartTime(Date.now());
      }, 1500);
    } else {
      toast('Wrong answer! Try again.', { type: 'error' });
      setSelectedNumber(null);
      if (lives === 1 && !hasShownGameOver) {
        setHasShownGameOver(true);
        toast.dismiss();
        toast('Game Over!', { type: 'error', duration: 3000 });
        const sessionData = {
          id: session.id,
          userId: user?.id,
          mode,
          difficulty,
          score,
          streak,
          hintsUsed,
          createdAt: session.createdAt,
        };
        await GameService.saveGameSession(sessionData);
        await GameService.updateUserBestStreak(user?.id, streak);
        await dispatch(fetchUserStats());
        dispatch(updateGameState(GAME_STATES.FINISHED));
      }
    }
  };

  const handleTimeUp = async () => {
    if (!hasShownGameOver) {
      setHasShownGameOver(true);
      toast.dismiss();
      toast('Game Over! Time’s up!', { type: 'error', duration: 3000 });

      dispatch(updateStreak({ correct: false, forceGameOver: true }));

      const sessionData = {
        id: session.id,
        userId: user?.id,
        mode,
        difficulty,
        score,
        streak,
        hintsUsed,
        createdAt: session.createdAt,
      };
      await GameService.saveGameSession(sessionData);
      await GameService.updateUserBestStreak(user?.id, streak);
      await dispatch(fetchUserStats());
      dispatch(updateGameState(GAME_STATES.FINISHED));
    }
  };

  const handleUseHint = () => {
    if (hintsUsed >= 3) {
      toast('No hints remaining!', { type: 'error' });
      return;
    }
    
    dispatch(useHint());
    setShowHint(true);
    toast(`Hint: The answer is ${currentPuzzle.solution}!`, { type: 'custom' });
  };

  const handleCloseHint = () => {
    setShowHint(false);
  };

  if (loading || !currentPuzzle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-yellow-600">{score.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    className={i < lives ? 'text-red-500 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-xl font-bold text-purple-600">{streak}</p>
              </div>
            </div>
            
            <Timer
              timeLimit={60}
              onTimeUp={handleTimeUp}
              isActive={state === GAME_STATES.PLAYING}
              className="flex-shrink-0"
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              What's the value of the Banana?
            </h2>
            <div className="relative max-w-md mx-auto w-full h-64">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg"
              >
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
              </motion.div>
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseHint}
                disabled={hintsUsed >= 3 || showHint}
                className="flex items-center space-x-2"
              >
                <Lightbulb size={16} />
                <span>Hint ({3 - hintsUsed} left)</span>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Keypad
            onNumberClick={handleNumberSelect}
            onSubmit={handleSubmit}
            disabled={state !== GAME_STATES.PLAYING}
            selectedNumber={selectedNumber}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-yellow-600">{score.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  size={20}
                  className={i < lives ? 'text-red-500 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-xl font-bold text-purple-600">{streak}</p>
            </div>
          </div>
          
          <Timer
            timeLimit={60}
            onTimeUp={handleTimeUp}
            isActive={state === GAME_STATES.PLAYING}
            className="flex-shrink-0"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            What number do you see?
          </h2>
          
          <div className="relative max-w-md mx-auto w-full h-64">
            <motion.img
              key={currentPuzzle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={currentPuzzle.question}
              alt="Puzzle"
              className="w-full h-full object-contain rounded-lg shadow-lg"
            />
            
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 bg-yellow-500 bg-opacity-90 rounded-lg flex items-center justify-center"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <p className="text-white font-semibold text-lg px-4 text-center">
                      The answer is {currentPuzzle.solution}!
                    </p>
                    <button
                      onClick={handleCloseHint}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Close hint"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseHint}
              disabled={hintsUsed >= 3 || showHint}
              className="flex items-center space-x-2"
            >
              <Lightbulb size={16} />
              <span>Hint ({3 - hintsUsed} left)</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Keypad
          onNumberClick={handleNumberSelect}
          onSubmit={handleSubmit}
          disabled={state !== GAME_STATES.PLAYING}
          selectedNumber={selectedNumber}
        />
      </Card>
    </div>
  );
};

export default PlayBoard;