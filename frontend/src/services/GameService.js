import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MultiplayerRoom, GameSession } from '../models/Game';
import { calculateScore } from '../utils/scoring';
import PuzzleService from './PuzzleService';

class GameService {
  constructor() {
    this.roomListeners = new Map();
  }

  async createMultiplayerRoom(hostId, settings = {}) {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = new MultiplayerRoom({
        id: roomId,
        hostId: hostId,
        players: [{ id: hostId, score: 0, lives: settings.lives || 3, streak: 0 }],
        settings: { maxPlayers: 2, timeLimit: 60, lives: 3, ...settings }
      });

      // Convert MultiplayerRoom instance to a plain object and add playerIds
      const roomData = {
        id: room.id,
        hostId: room.hostId,
        players: room.players,
        playerIds: [hostId],
        settings: room.settings,
        currentPuzzle: room.currentPuzzle || null,
        state: room.state || 'WAITING'
      };

      await setDoc(doc(db, 'rooms', roomId), roomData);
      return { success: true, roomId, room: roomData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async joinRoom(roomId, playerId) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        return { success: false, error: 'Room not found' };
      }

      const room = roomDoc.data();
      
      if (room.players.length >= room.settings.maxPlayers) {
        return { success: false, error: 'Room is full' };
      }

      if (room.playerIds.includes(playerId)) {
        return { success: false, error: 'Already in room' };
      }

      const updatedPlayers = [...room.players, { 
        id: playerId, 
        score: 0, 
        lives: room.settings.lives,
        streak: 0
      }];
      const updatedPlayerIds = [...room.playerIds, playerId];

      await updateDoc(roomRef, { 
        players: updatedPlayers,
        playerIds: updatedPlayerIds
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async submitAnswer(roomId, playerId, answer, timeElapsed) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        return { success: false, error: 'Room not found' };
      }

      const room = roomDoc.data();
      const puzzle = room.currentPuzzle;
      
      if (!puzzle) {
        return { success: false, error: 'No active puzzle' };
      }

      const isCorrect = parseInt(answer) === parseInt(puzzle.solution);
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) {
        return { success: false, error: 'Player not in room' };
      }

      const updatedPlayers = [...room.players];
      const player = updatedPlayers[playerIndex];

      if (isCorrect) {
        const score = calculateScore(timeElapsed, room.settings.timeLimit, true);
        player.score += score;
        player.streak = (player.streak || 0) + 1;
      } else {
        player.lives -= 1;
        player.streak = 0;
      }

      await updateDoc(roomRef, { players: updatedPlayers });
      
      if (player.lives === 0) {
        await this.updateUserBestStreak(playerId, player.streak);
      }

      return { success: true, correct: isCorrect, newScore: player.score, newStreak: player.streak };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRoomPuzzle(roomId) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        throw new Error('Room not found');
      }

      const room = roomDoc.data();
      if (room.currentPuzzle) {
        return room.currentPuzzle;
      }

      const puzzle = await PuzzleService.fetchPuzzle();
      await updateDoc(roomRef, { currentPuzzle: puzzle });
      return puzzle;
    } catch (error) {
      return await PuzzleService.getCachedPuzzle();
    }
  }

  async notifyNextPuzzle(roomId) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const puzzle = await PuzzleService.fetchPuzzle();
      await updateDoc(roomRef, { 
        currentPuzzle: puzzle,
        state: 'PLAYING'
      });
    } catch (error) {
      console.error('Failed to notify next puzzle:', error);
    }
  }

  async updateUserBestStreak(userId, sessionStreak) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const user = userDoc.data();
      const currentBestStreak = user.stats?.bestStreak || 0;
      
      if (sessionStreak > currentBestStreak) {
        await updateDoc(userRef, {
          'stats.bestStreak': sessionStreak
        });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  listenToRoomUpdates(roomId, callback) {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });

    this.roomListeners.set(roomId, unsubscribe);
    return unsubscribe;
  }

  stopListeningToRoom(roomId) {
    const unsubscribe = this.roomListeners.get(roomId);
    if (unsubscribe) {
      unsubscribe();
      this.roomListeners.delete(roomId);
    }
  }

  async saveGameSession(session) {
    try {
      await setDoc(doc(db, 'gameSessions', session.id), {
        ...session,
        endTime: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRecentSessions(userId, limitCount = 10) {
    try {
      const q = query(
        collection(db, 'gameSessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error);
      return [];
    }
  }
}

export default new GameService();