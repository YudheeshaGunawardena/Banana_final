import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  guestMode: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const user = action.payload;
      state.user = user
        ? {
            id: user.id || user.uid,
            email: user.email,
            username: user.username || user.displayName || 'Anonymous',
            avatar: user.avatar || user.photoURL || '',
            gamesPlayed: user.gamesPlayed || 0,
            totalScore: user.totalScore || 0,
            bestStreak: user.bestStreak || 0,
            hintsUsed: user.hintsUsed || 0,
            totalPuzzlesSolved: user.totalPuzzlesSolved || 0,
            xp: user.xp || 0,
            createdAt: user.createdAt || new Date().toISOString(),
            lastActive: user.lastActive || new Date().toISOString(),
            notifications: user.notifications ?? true,
            soundEnabled: user.soundEnabled ?? true,
            theme: user.theme || 'light',
            achievements: user.achievements || [],
            preferences: user.preferences || {},
            stats: user.stats || {},
          }
        : null;
      state.isAuthenticated = !!user;
      state.guestMode = user?.isGuest || false;
      state.error = null;
      state.loading = false;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.guestMode = false;
      state.error = null;
      state.loading = false;
    },

    enterGuestMode: (state) => {
      state.guestMode = true;
      state.isAuthenticated = false;
      state.user = {
        id: 'guest_' + Date.now(),
        username: 'Guest Player',
        email: '',
        avatar: '',
        gamesPlayed: 0,
        totalScore: 0,
        bestStreak: 0,
        hintsUsed: 0,
        totalPuzzlesSolved: 0,
        xp: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        notifications: true,
        soundEnabled: true,
        theme: 'light',
        achievements: [],
        preferences: {},
        stats: {},
        isGuest: true,
      };
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  logout,
  enterGuestMode,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;