import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock Firebase
const mockFirebase = {
  initializeApp: () => ({}),
  getAuth: () => ({}),
  getFirestore: () => ({}),
  getFunctions: () => ({})
};

global.firebase = mockFirebase;

// Mock IndexedDB
global.indexedDB = {
  open: () => ({
    result: {
      transaction: () => ({
        objectStore: () => ({
          getAll: () => ({ result: [] }),
          put: () => ({}),
          delete: () => ({})
        })
      })
    }
  })
};