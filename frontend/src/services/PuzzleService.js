import axios from 'axios';
import { db, functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { encryptSolution, decryptSolution } from '../utils/crypto';

class PuzzleService {
  constructor() {
    this.apiUrl = 'http://localhost:3000/fetch-banana-api';
    this.proxyFunction = httpsCallable(functions, 'fetchPuzzle');
    this.fallbackPuzzles = this.generateFallbackPuzzles();
  }

  async fetchPuzzle() {
    try {
      // Use direct API call to your backend
      const response = await axios.get(this.apiUrl);
      const puzzle = response.data;
      
      // Validate response format
      if (!puzzle.question || !puzzle.solution) {
        throw new Error('Invalid puzzle format from backend');
      }
      
      return {
        question: puzzle.question,
        solution: puzzle.solution,
        id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.warn('Backend fetch failed, using fallback:', error);
      return this.getRandomFallback();
    }
  }

  async cachePuzzles(count = 20) {
    const puzzles = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const puzzle = await this.fetchPuzzle();
        if (puzzle && puzzle.question && puzzle.solution) {
          // Encrypt solution for security
          const encryptedSolution = encryptSolution(puzzle.solution.toString());
          puzzles.push({
            ...puzzle,
            solution: encryptedSolution,
            cached: true
          });
        }
        // Small delay to avoid overwhelming the backend
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`Failed to fetch puzzle ${i}:`, error);
      }
    }

    // Store in IndexedDB
    await this.storePuzzlesInCache(puzzles);
    return puzzles;
  }

  async getCachedPuzzle() {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['puzzles'], 'readwrite');
      const store = transaction.objectStore('puzzles');
      
      // Get a random cached puzzle
      const allPuzzles = await this.getAllFromStore(store);
      if (allPuzzles.length > 0) {
        const randomIndex = Math.floor(Math.random() * allPuzzles.length);
        const puzzle = allPuzzles[randomIndex];
        
        // Remove from cache to avoid repeats
        store.delete(puzzle.id);
        
        // Decrypt solution
        puzzle.solution = decryptSolution(puzzle.solution);
        return puzzle;
      }
    } catch (error) {
      console.warn('Cache access failed:', error);
    }
    
    return this.getRandomFallback();
  }

  getRandomFallback() {
    const randomIndex = Math.floor(Math.random() * this.fallbackPuzzles.length);
    return this.fallbackPuzzles[randomIndex];
  }

  generateFallbackPuzzles() {
    return [
      { id: 'fallback_1', question: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 5 },
      { id: 'fallback_2', question: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 3 },
      { id: 'fallback_3', question: 'https://images.pexels.com/photos/1093039/pexels-photo-1093039.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 7 },
      { id: 'fallback_4', question: 'https://images.pexels.com/photos/2872756/pexels-photo-2872756.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 2 },
      { id: 'fallback_5', question: 'https://images.pexels.com/photos/1093040/pexels-photo-1093040.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 8 },
      { id: 'fallback_6', question: 'https://images.pexels.com/photos/2872757/pexels-photo-2872757.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 1 },
      { id: 'fallback_7', question: 'https://images.pexels.com/photos/1093041/pexels-photo-1093041.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 9 },
      { id: 'fallback_8', question: 'https://images.pexels.com/photos/2872758/pexels-photo-2872758.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 4 },
      { id: 'fallback_9', question: 'https://images.pexels.com/photos/1093042/pexels-photo-1093042.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 6 },
      { id: 'fallback_10', question: 'https://images.pexels.com/photos/2872759/pexels-photo-2872759.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 3 },
      { id: 'fallback_11', question: 'https://images.pexels.com/photos/1093043/pexels-photo-1093043.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 5 },
      { id: 'fallback_12', question: 'https://images.pexels.com/photos/2872760/pexels-photo-2872760.jpeg?auto=compress&cs=tinysrgb&w=400', solution: 7 }
    ];
  }

  async openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BananaPuzzleDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('puzzles')) {
          db.createObjectStore('puzzles', { keyPath: 'id' });
        }
      };
    });
  }

  async storePuzzlesInCache(puzzles) {
    const db = await this.openIndexedDB();
    const transaction = db.transaction(['puzzles'], 'readwrite');
    const store = transaction.objectStore('puzzles');
    
    puzzles.forEach(puzzle => {
      store.put(puzzle);
    });
    
    await transaction.complete;
  }

  async getAllFromStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export default new PuzzleService();