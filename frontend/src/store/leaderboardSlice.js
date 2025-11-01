import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LeaderboardService from '../services/LeaderboardService';

export const fetchGlobalLeaderboard = createAsyncThunk(
  'leaderboard/fetchGlobal',
  async (gameMode = 'solo') => {
    return await LeaderboardService.getGlobalLeaderboard(gameMode);
  }
);

export const fetchWeeklyLeaderboard = createAsyncThunk(
  'leaderboard/fetchWeekly',
  async (gameMode = 'solo') => {
    return await LeaderboardService.getWeeklyLeaderboard(gameMode);
  }
);

const initialState = {
  global: [],
  weekly: [],
  userRank: null,
  loading: false,
  error: null
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setUserRank: (state, action) => {
      state.userRank = action.payload;
    },
    clearLeaderboards: (state) => {
      state.global = [];
      state.weekly = [];
      state.userRank = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.global = action.payload;
      })
      .addCase(fetchGlobalLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchWeeklyLeaderboard.fulfilled, (state, action) => {
        state.weekly = action.payload;
      });
  }
});

export const { setUserRank, clearLeaderboards } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;