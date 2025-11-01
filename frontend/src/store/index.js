import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import authReducer from './authSlice';
import leaderboardReducer from './leaderboardSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
    leaderboard: leaderboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;