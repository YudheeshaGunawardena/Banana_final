import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { startSoloGame, resetGame } from '../store/gameSlice';
import PlayBoard from '../components/game/PlayBoard';
import Lives from '../components/game/Lives';
import StreakMeter from '../components/game/StreakMeter';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GameService from '../services/GameService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const SoloPlay = () => {
  const dispatch = useDispatch();
  const { state, score, lives, streak, difficulty, hintsUsed, session } = useSelector(state => state.game);
  const { user, isAuthenticated, guestMode } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(startSoloGame({ difficulty: 'NORMAL' }));
    
    return () => {
      dispatch(resetGame());
    };
  }, [dispatch]);

  useEffect(() => {
    if (state === 'finished' && user?.id && session && isAuthenticated && !guestMode) {
      const saveGameData = async () => {
        try {
          // Save game session
          const gameSession = {
            id: session.id,
            userId: user.id,
            mode: 'solo',
            score,
            streak,
            hintsUsed,
            difficulty,
            createdAt: session.createdAt,
            endTime: new Date().toISOString(),
          };
          const result = await GameService.saveGameSession(gameSession);
          if (!result.success) {
            throw new Error(result.error || 'Failed to save game session');
          }

          // Update user stats
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            gamesPlayed: (user.gamesPlayed || 0) + 1,
            totalScore: (user.totalScore || 0) + score,
            bestStreak: Math.max(user.bestStreak || 0, streak),
            hintsUsed: (user.hintsUsed || 0) + hintsUsed,
            totalPuzzlesSolved: (user.totalPuzzlesSolved || 0) + (score > 0 ? streak : 0),
            lastActive: new Date().toISOString(),
          });

          toast.success('Game data saved successfully!');
        } catch (error) {
          console.error('Error saving game data:', error);
          if (error.message.includes('Missing or insufficient permissions')) {
            toast.error('Permission denied. Please ensure you are logged in and have access.');
          } else if (error.message.includes('User not authenticated')) {
            toast.error('Please log in to save game data.');
          } else {
            toast.error('Failed to save game data: ' + error.message);
          }
        }
      };

      saveGameData();
    }
  }, [state, user, isAuthenticated, guestMode, score, streak, hintsUsed, difficulty, session]);

  if (state === 'finished') {
    return (
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Game Over!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Final Score: {score.toLocaleString()}
            </p>
          </motion.div>
          
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={() => dispatch(startSoloGame({ difficulty }))}
              className="w-full"
            >
              Play Again
            </Button>
            
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full">
                Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 scrollbar-auto h-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 backdrop-blur-md bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30" id="btn-back">
              <ArrowLeft className="text-white" size={16} />
              <span className="text-white">Back</span>
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Solo Play</h1>
          
          <div className="flex items-center space-x-4">
            <Lives current={lives} />
            <StreakMeter streak={streak} />
          </div>
        </div>

        {/* Game Board */}
        <PlayBoard />
      </div>
    </div>
  );
};

export default SoloPlay;