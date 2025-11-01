import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.googleProvider = new GoogleAuthProvider();

    // Listen for auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      this.handleAuthStateChange(firebaseUser);
    });
  }

  async handleAuthStateChange(firebaseUser) {
    let userData = null;
    if (firebaseUser) {
      // Get or create user profile for authenticated users
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        userData = {
          id: firebaseUser.uid,
          ...userDoc.data(),
          email: firebaseUser.email || userDoc.data().email,
          username: firebaseUser.displayName || userDoc.data().username || 'Player',
          avatar: firebaseUser.photoURL || userDoc.data().avatar || null,
        };
      } else {
        // Create new user profile
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || 'Player',
          avatar: firebaseUser.photoURL || null,
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
        };

        await setDoc(userRef, userData);
      }
      this.currentUser = userData;
    } else {
      this.currentUser = null;
    }

    // Notify listeners
    (this.authListeners || []).forEach((listener) => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error notifying auth listener:', error);
      }
    });
  }

  async signInWithEmail(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password, username) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile with username
      await updateProfile(result.user, { displayName: username });

      // Create user profile in Firestore
      const userData = {
        id: result.user.uid,
        email,
        username,
        avatar: null,
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
      };

      await setDoc(doc(db, 'users', result.user.uid), userData);
      this.currentUser = userData;

      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithGoogle() {
    try {
      await signInWithPopup(auth, this.googleProvider);
      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  onAuthStateChange(listener) {
    if (!this.authListeners) {
      this.authListeners = [];
    }
    this.authListeners.push(listener);
    // Immediately call listener with current user
    listener(this.currentUser);
    return () => {
      this.authListeners = (this.authListeners || []).filter((l) => l !== listener);
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async updateUserGameData(userId, data) {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    try {
      await setDoc(doc(db, 'users', userId), data, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();