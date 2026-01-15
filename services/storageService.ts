import { AppState } from '../types';
import { STORAGE_KEY, DEFAULT_SETTINGS, DEFAULT_CONTACT } from '../constants';

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  
  // Return default state if nothing stored
  return {
    lastCheckIn: Date.now(),
    contact: DEFAULT_CONTACT,
    settings: DEFAULT_SETTINGS,
  };
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};