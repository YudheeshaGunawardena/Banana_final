export const DIFFICULTY_LEVELS = {
  PRACTICE: { name: 'Practice', timeLimit: 120, multiplier: 0.5 },
  EASY: { name: 'Easy', timeLimit: 90, multiplier: 1.0 },
  NORMAL: { name: 'Normal', timeLimit: 60, multiplier: 1.5 },
  HARD: { name: 'Hard', timeLimit: 40, multiplier: 2.0 },
  INSANE: { name: 'Insane', timeLimit: 25, multiplier: 3.0 }
};

export const GAME_MODES = {
  SOLO: 'solo',
  MULTIPLAYER: 'multiplayer'
};

export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

export class Puzzle {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.question = data.question; // Image URL
    this.solution = data.solution; // Number 1-9
    this.difficulty = data.difficulty || 'NORMAL';
    this.createdAt = data.createdAt || new Date();
  }
}

export class GameSession {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.mode = data.mode || GAME_MODES.SOLO;
    this.state = data.state || GAME_STATES.WAITING;
    this.currentPuzzle = data.currentPuzzle || null;
    this.score = data.score || 0;
    this.lives = data.lives || 3;
    this.hintsUsed = data.hintsUsed || 0;
    this.streak = data.streak || 0;
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.difficulty = data.difficulty || 'NORMAL';
  }
}

export class MultiplayerRoom {
  constructor(data = {}) {
    this.id = data.id;
    this.hostId = data.hostId;
    this.players = data.players || [];
    this.currentPuzzle = data.currentPuzzle || null;
    this.state = data.state || GAME_STATES.WAITING;
    this.settings = data.settings || {
      maxPlayers: 4,
      timeLimit: 60,
      lives: 3
    };
    this.createdAt = data.createdAt || new Date();
  }
}