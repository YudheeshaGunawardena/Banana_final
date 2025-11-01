export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username || 'Anonymous';
    this.avatar = data.avatar || null;
    this.xp = data.xp || 0;
    this.level = data.level || 1;
    this.gamesPlayed = data.gamesPlayed || 0;
    this.gamesWon = data.gamesWon || 0;
    this.totalScore = data.totalScore || 0;
    this.achievements = data.achievements || [];
    this.preferences = data.preferences || {
      theme: 'light',
      soundEnabled: true,
      notifications: true
    };
    this.stats = data.stats || {
      averageSolveTime: 0,
      bestStreak: 0,
      totalPuzzlesSolved: 0,
      hintsUsed: 0
    };
    this.createdAt = data.createdAt || new Date();
    this.lastActive = data.lastActive || new Date();
  }

  get winRate() {
    return this.gamesPlayed > 0 ? (this.gamesWon / this.gamesPlayed) * 100 : 0;
  }

  get currentDifficulty() {
    const avgTime = this.stats.averageSolveTime;
    if (avgTime === 0) return 'NORMAL';
    if (avgTime < 25) return 'INSANE';
    if (avgTime < 40) return 'HARD';
    if (avgTime < 60) return 'NORMAL';
    if (avgTime < 90) return 'EASY';
    return 'PRACTICE';
  }
}

export const ACHIEVEMENTS = {
  FIRST_SOLVE: { id: 'first_solve', name: 'First Success', description: 'Solve your first puzzle' },
  SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', description: 'Solve 10 puzzles in under 30 seconds' },
  STREAK_MASTER: { id: 'streak_master', name: 'Streak Master', description: 'Achieve a 10-puzzle streak' },
  MULTIPLAYER_WIN: { id: 'multiplayer_win', name: 'Multiplayer Champion', description: 'Win your first multiplayer game' },
  PERFECTIONIST: { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 5 games without using hints' }
};