
import { Schedule, Speaker, AppState } from '../types';
import { INITIAL_SPEAKERS, INITIAL_OUTLINES, INITIAL_SONGS } from '../constants';

const STORAGE_KEY = 'discursos_publicos_db_v1';

const DEFAULT_SETTINGS = {
  themeConflictDays: 180,
  themeMode: 'dark' as const
};

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure outlines and songs are always loaded correctly even if not in storage or old version
      // Ensure settings exist for legacy data
      return {
        ...parsed,
        outlines: INITIAL_OUTLINES,
        songs: INITIAL_SONGS,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings }
      };
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  
  return {
    speakers: INITIAL_SPEAKERS,
    schedules: [],
    outlines: INITIAL_OUTLINES,
    songs: INITIAL_SONGS,
    settings: DEFAULT_SETTINGS
  };
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const exportData = (state: AppState) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "backup_discursos.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};