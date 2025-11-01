import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/index.js';
import AuthService from './services/AuthService.js';
import { setUser, setLoading } from './store/authSlice.js';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';
import Layout from './components/ui/Layout.tsx';          

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SoloPlay from './pages/SoloPlay.jsx';
import MultiplayerLobby from './pages/MultiplayerLobby.jsx';
import MultiplayerGame from './pages/MultiplayerGame.jsx';
import Leaderboards from './pages/Leaderboards.jsx';
import Profile from './pages/Profile.jsx';

// PWA Registration
import { registerSW } from 'virtual:pwa-register';

// Register service worker
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      console.log('New content available, please refresh.');
    },
    onOfflineReady() {
      console.log('App ready to work offline.');
    },
  });
}

// Protected Route Component (allows authenticated or guest users)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, guestMode, user } = useSelector((state) => state.auth);

  // Wait for auth state to resolve for multiplayer routes
  if (window.location.pathname.startsWith('/play/multiplayer') && loading) {
    console.log('ProtectedRoute: Waiting for auth state, loading:', loading, 'isAuthenticated:', isAuthenticated, 'guestMode:', guestMode, 'user:', user);
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !guestMode) {
    console.log('ProtectedRoute: Redirecting to /login, isAuthenticated:', isAuthenticated, 'guestMode:', guestMode, 'user:', user, 'path:', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Allowing access, isAuthenticated:', isAuthenticated, 'guestMode:', guestMode, 'user:', user, 'path:', window.location.pathname);
  return children;
};

// Profile Route Component (requires authentication, no guest access)
const ProfileRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    console.log('ProfileRoute: Waiting for auth state, loading:', loading);
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('ProfileRoute: Redirecting to /login, isAuthenticated:', isAuthenticated);
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect authenticated users from login page
const LoginRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    console.log('LoginRoute: Waiting for auth state, loading:', loading);
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    console.log('LoginRoute: Redirecting to /, isAuthenticated:', isAuthenticated);
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const authInitialized = useRef(false);

  useEffect(() => {
    if (authInitialized.current) {
      console.log('AppContent: Auth already initialized, skipping');
      return;
    }
    authInitialized.current = true;

    console.log('AppContent: Initializing auth state');
    dispatch(setLoading(true)); // Set loading to true initially
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      console.log('AppContent: Auth state changed, user:', user);
      dispatch(setUser(user));
      dispatch(setLoading(false)); // Ensure loading is false after auth state resolves
    });

    return () => {
      console.log('AppContent: Cleaning up auth listener');
      authInitialized.current = false;
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  if (loading) {
    console.log('AppContent: Showing loading spinner, loading:', loading);
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Layout>                                    
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <LoginRoute>
                <Login />
              </LoginRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/play/solo"
            element={
              <ProtectedRoute>
                <SoloPlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/play/multiplayer"
            element={
              <ProtectedRoute>
                <MultiplayerLobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/play/multiplayer/:roomId"
            element={
              <ProtectedRoute>
                <MultiplayerGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboards"
            element={
              <ProtectedRoute>
                <Leaderboards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileRoute>
                <Profile />
              </ProfileRoute>
            }
          />
          <Route path="/settings" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: { duration: 2000 },
            error: { duration: 4000 },
          }}
        />
      </div>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;