// Simple encryption for solution hiding (not cryptographically secure)
const SECRET_KEY = 'banana_puzzle_secret_2024';

export function encryptSolution(solution) {
  const solutionStr = solution.toString();
  let encrypted = '';
  
  for (let i = 0; i < solutionStr.length; i++) {
    const char = solutionStr.charCodeAt(i);
    const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    encrypted += String.fromCharCode(char ^ keyChar);
  }
  
  return btoa(encrypted);
}

export function decryptSolution(encryptedSolution) {
  try {
    const encrypted = atob(encryptedSolution);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const char = encrypted.charCodeAt(i);
      const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      decrypted += String.fromCharCode(char ^ keyChar);
    }
    
    return parseInt(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}