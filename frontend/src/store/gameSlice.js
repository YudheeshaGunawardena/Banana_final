import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import PuzzleService from '../services/PuzzleService';
import GameService from '../services/GameService';
import { GAME_STATES } from '../models/Game';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const fetchPuzzle = createAsyncThunk(
  'game/fetchPuzzle',
  async (_, { getState }) => {
    const { game } = getState();
    
    try {
      if (navigator.onLine) {
        if (game.mode === 'multiplayer' && game.roomId) {
          return await GameService.getRoomPuzzle(game.roomId);
        }
        return await PuzzleService.fetchPuzzle();
      } else {
        return await PuzzleService.getCachedPuzzle();
      }
    } catch (error) {
      toast.error('Failed to fetch puzzle. Using cached puzzle.');
      return await PuzzleService.getCachedPuzzle();
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'game/submitAnswer',
  async ({ answer, timeElapsed }, { getState, dispatch }) => {
    const { game, auth } = getState();
    const puzzle = game.currentPuzzle;
    
    if (!puzzle) throw new Error('No active puzzle');
    
    const isCorrect = parseInt(answer) === parseInt(puzzle.solution);
    
    if (game.mode === 'multiplayer' && game.roomId) {
      const result = await GameService.submitAnswer(
        game.roomId,
        auth.user?.id,
        answer,
        timeElapsed
      );
      if (result.correct) {
        dispatch(updateStreak({ correct: true }));
        await GameService.notifyNextPuzzle(game.roomId);
      } else {
        dispatch(updateStreak({ correct: false }));
      }
      return result;
    }
    
    // Solo mode
    dispatch(updateStreak({ correct: isCorrect }));
    
    if (game.lives === 1 && !isCorrect && game.state !== GAME_STATES.FINISHED) {
      const session = {
        id: game.session.id,
        userId: auth.user?.id,
        mode: game.mode,
        difficulty: game.difficulty,
        score: game.score,
        streak: game.streak,
        hintsUsed: game.hintsUsed,
        createdAt: game.session.createdAt,
      };
      await GameService.saveGameSession(session);
      await GameService.updateUserBestStreak(auth.user?.id, game.streak);
      if (game.score > 0 && auth.user?.id) {
        const userRef = doc(db, 'users', auth.user.id);
        await updateDoc(userRef, {
          gamesWon: (auth.user.gamesWon || 0) + 1,
        });
      }
      dispatch(updateGameState(GAME_STATES.FINISHED));
    }
    
    return { success: true, correct: isCorrect, timeElapsed };
  }
);

export const fetchUserStats = createAsyncThunk(
  'game/fetchUserStats',
  async (_, { getState }) => {
    const { auth } = getState();
    if (!auth.user?.id) return null;
    
    try {
      const userRef = doc(db, 'users', auth.user.id);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return null;
      
      return userDoc.data() || {};
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  }
);

export const listenToRoomUpdates = createAsyncThunk(
  'game/listenToRoomUpdates',
  async (roomId, { dispatch }) => {
    try {
      const unsubscribe = GameService.listenToRoomUpdates(roomId, (roomData) => {
        dispatch(updateRoomState(roomData));
      });
      return unsubscribe;
    } catch (error) {
      toast.error('Failed to listen to room updates: ' + error.message);
      throw error;
    }
  }
);

const initialState = {
  session: null,
  currentPuzzle: null,
  mode: 'solo',
  state: GAME_STATES.WAITING,
  roomId: null,
  players: [],
  playerStats: {},
  score: 0,
  lives: 3,
  hintsUsed: 0,
  streak: 0,
  startTime: null,
  loading: false,
  error: null,
  cachedPuzzles: 0,
  difficulty: 'NORMAL',
  userStats: {},
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startSoloGame: (state, action) => {
      state.session = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mode: 'solo',
        difficulty: action.payload.difficulty || 'NORMAL',
        createdAt: new Date().toISOString()
      };
      state.mode = 'solo';
      state.state = GAME_STATES.WAITING;
      state.score = 0;
      state.lives = 3;
      state.hintsUsed = 0;
      state.streak = 0;
      state.startTime = Date.now();
    },
    
    joinMultiplayerGame: (state, action) => {
      state.mode = 'multiplayer';
      state.roomId = action.payload.roomId;
      state.players = action.payload.players || [];
      state.playerStats = action.payload.playerStats || {};
      state.state = GAME_STATES.WAITING;
      state.score = 0;
      state.lives = 3;
      state.hintsUsed = 0;
      state.streak = 0;
      state.startTime = Date.now();
    },
    
    updateGameState: (state, action) => {
      state.state = action.payload;
    },
    
    useHint: (state) => {
      if (state.hintsUsed < 3) {
        state.hintsUsed += 1;
      }
    },
    
    updateStreak: (state, action) => {
      if (action.payload.correct) {
        state.streak += 1;
      } else {
        state.streak = 0;
        if (action.payload.forceGameOver) {
          state.lives = 0;
        } else {
          state.lives = Math.max(0, state.lives - 1);
        }
      }
    },
    
    resetGame: (state) => {
      Object.assign(state, initialState);
    },
    
    setCachedPuzzlesCount: (state, action) => {
      state.cachedPuzzles = action.payload;
    },
    
    updateRoomState: (state, action) => {
      const { players, playerStats, currentPuzzle, gameState } = action.payload;
      state.players = players || state.players;
      state.playerStats = playerStats || state.playerStats;
      state.currentPuzzle = currentPuzzle || state.currentPuzzle;
      state.state = gameState || GAME_STATES.WAITING;
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchPuzzle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPuzzle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPuzzle = action.payload;
        state.state = GAME_STATES.PLAYING;
      })
      .addCase(fetchPuzzle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.currentPuzzle = null;
        state.state = GAME_STATES.WAITING;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const { correct, timeElapsed } = action.payload;
        
        if (correct) {
          const timeBonus = Math.max(0, (60 - timeElapsed) * 2);
          const streakBonus = state.streak * 10;
          const hintPenalty = state.hintsUsed * 25;
          const points = 100 + timeBonus + streakBonus - hintPenalty;
          
          state.score += points;
        }

        if (state.lives === 0 && state.state !== GAME_STATES.FINISHED) {
          state.state = GAME_STATES.FINISHED;
        }
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload || {};
      })
      .addCase(fetchUserStats.rejected, (state) => {
        state.userStats = {};
      })
      .addCase(listenToRoomUpdates.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export const {
  startSoloGame,
  joinMultiplayerGame,
  updateGameState,
  useHint,
  updateStreak,
  resetGame,
  setCachedPuzzlesCount,
  updateRoomState
} = gameSlice.actions;

export default gameSlice.reducer;