export interface EmergencyContact {
  name: string;
  email: string;
  phone?: string;
}

export interface UserSettings {
  checkInThresholdDays: number; // Default 3
  customMessage: string;
}

export interface AppState {
  lastCheckIn: number; // Timestamp
  contact: EmergencyContact;
  settings: UserSettings;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CONTACTS = 'CONTACTS',
  SETTINGS = 'SETTINGS',
}

export enum StatusLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
}