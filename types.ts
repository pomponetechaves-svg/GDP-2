
export interface Speaker {
  id: string;
  name: string;
  congregation: string;
  phone: string;
  isDeleted: boolean;
}

export interface Outline {
  number: number;
  title: string;
}

export interface Song {
  number: number;
  title: string;
}

export interface Schedule {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  speakerId: string;
  outlineNumber: number;
  notes?: string;
  song?: string;
}

export interface AppSettings {
  themeConflictDays: number;
  themeMode: 'light' | 'dark';
}

export interface AppState {
  speakers: Speaker[];
  schedules: Schedule[];
  outlines: Outline[];
  songs: Song[];
  settings: AppSettings;
}

export type ViewState = 'dashboard' | 'schedule' | 'speakers' | 'outlines' | 'settings' | 'info';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}