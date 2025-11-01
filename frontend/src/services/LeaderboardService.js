import { 
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class LeaderboardService {
  async updateScore(userId, score, gameMode = 'solo') {
    try {
      const scoreEntry = {
        userId,
        score,
        gameMode,
        timestamp: Timestamp.now(),
        week: this.getCurrentWeek(),
        year: new Date().getFullYear()
      };

      const docId = `${userId}_${Date.now()}`;
      await setDoc(doc(db, 'scores', docId), scoreEntry);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getGlobalLeaderboard(gameMode = 'solo', limitCount = 50) {
    try {
      const q = query(
        collection(db, 'scores'),
        where('gameMode', '==', gameMode),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map(doc => doc.data());
      
      // Group by userId and take highest score
      const userBestScores = new Map();
      scores.forEach(score => {
        const existing = userBestScores.get(score.userId);
        if (!existing || score.score > existing.score) {
          userBestScores.set(score.userId, score);
        }
      });
      
      return Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Failed to fetch global leaderboard:', error);
      return [];
    }
  }

  async getWeeklyLeaderboard(gameMode = 'solo', limitCount = 50) {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const q = query(
        collection(db, 'scores'),
        where('gameMode', '==', gameMode),
        where('week', '==', currentWeek),
        where('year', '==', currentYear),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map(doc => doc.data());
      
      // Group by userId and take highest score for the week
      const userBestScores = new Map();
      scores.forEach(score => {
        const existing = userBestScores.get(score.userId);
        if (!existing || score.score > existing.score) {
          userBestScores.set(score.userId, score);
        }
      });
      
      return Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Failed to fetch weekly leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId, gameMode = 'solo') {
    try {
      const globalScores = await this.getGlobalLeaderboard(gameMode, 1000);
      const userIndex = globalScores.findIndex(score => score.userId === userId);
      return userIndex >= 0 ? userIndex + 1 : null;
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return null;
    }
  }

  getCurrentWeek() {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const daysDiff = Math.floor((now - yearStart) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysDiff + yearStart.getDay() + 1) / 7);
  }
}

export default new LeaderboardService();