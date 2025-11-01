import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
  notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false',
  showTutorial: !localStorage.getItem('tutorialCompleted'),
  activeModal: null,
  toast: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('soundEnabled', state.soundEnabled);
    },
    
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      localStorage.setItem('notificationsEnabled', state.notificationsEnabled);
    },
    
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    
    hideToast: (state) => {
      state.toast = null;
    },
    
    completeTutorial: (state) => {
      state.showTutorial = false;
      localStorage.setItem('tutorialCompleted', 'true');
    }
  }
});

export const {
  toggleTheme,
  toggleSound,
  toggleNotifications,
  setActiveModal,
  showToast,
  hideToast,
  completeTutorial
} = uiSlice.actions;

export default uiSlice.reducer;