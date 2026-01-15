import { UserSettings, EmergencyContact } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  checkInThresholdDays: 3,
  customMessage: "I haven't checked into my safety app for 3 days. Please check on me immediately. Here is my last known location.",
};

export const DEFAULT_CONTACT: EmergencyContact = {
  name: '',
  email: '',
  phone: '',
};

export const STORAGE_KEY = 'are-u-dead-app-data';

// 3 days in milliseconds
export const THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; 
// Warning threshold (e.g., 2 days)
export const WARNING_MS = 2 * 24 * 60 * 60 * 1000;