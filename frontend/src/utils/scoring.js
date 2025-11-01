export function calculateScore(timeElapsed, timeLimit, isCorrect, streak = 0, hintsUsed = 0) {
  if (!isCorrect) return 0;
  
  const baseScore = 100;
  const timeBonus = Math.max(0, Math.floor((timeLimit - timeElapsed) * 2));
  const streakBonus = streak > 0 ? streak * 10 : 0;
  const hintPenalty = hintsUsed * 25;
  
  return Math.max(10, baseScore + timeBonus + streakBonus - hintPenalty);
}

export function calculateXP(score, difficulty = 'NORMAL') {
  const multipliers = {
    PRACTICE: 0.5,
    EASY: 1.0,
    NORMAL: 1.5,
    HARD: 2.0,
    INSANE: 3.0
  };
  
  return Math.floor(score * (multipliers[difficulty] || 1.0));
}

export function getLevelFromXP(xp) {
  return Math.floor(xp / 1000) + 1;
}

export function getXPForNextLevel(currentXP) {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevelXP = currentLevel * 1000;
  return nextLevelXP - (currentXP % 1000);
}