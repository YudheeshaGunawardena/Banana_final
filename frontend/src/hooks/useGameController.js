import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  startSoloGame, 
  fetchPuzzle, 
  submitAnswer, 
  useHint,
  resetGame,
  setCachedPuzzlesCount
} from '../store/gameSlice';
import PuzzleService from '../services/PuzzleService';
import toast from 'react-hot-toast';

export const useGameController = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(state => state.game);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Pre-cache puzzles when component mounts
    if (navigator.onLine) {
      PuzzleService.cachePuzzles(20).then(puzzles => {
        console.log(`Cached ${puzzles.length} puzzles for offline play`);
        dispatch(setCachedPuzzlesCount(puzzles.length));
      }).catch(error => {
        console.error('Failed to cache puzzles:', error);
        toast.error('Failed to cache puzzles for offline play.');
      });
    }
  }, [dispatch]);

  const startGame = (difficulty = 'NORMAL') => {
    dispatch(startSoloGame({ difficulty }));
  };

  const nextPuzzle = async () => {
    try {
      await dispatch(fetchPuzzle());
    } catch (error) {
      toast.error('Failed to load next puzzle.');
    }
  };

  const submitPlayerAnswer = async (answer, timeElapsed) => {
    const result = await dispatch(submitAnswer({ answer, timeElapsed }));
    
    if (result.payload.correct) {
      toast.success('Correct! 🎉');
    } else {
      toast.error('Wrong answer!');
    }
    
    return result.payload;
  };

  const requestHint = () => {
    if (gameState.hintsUsed >= 3) {
      toast.error('No hints remaining!');
      return false;
    }
    
    dispatch(useHint());
    toast.info('Hint used! Look for mathematical patterns.');
    return true;
  };

  const endGame = () => {
    dispatch(resetGame());
  };

  return {
    gameState,
    startGame,
    nextPuzzle,
    submitPlayerAnswer,
    requestHint,
    endGame
  };
};

export default useGameController;