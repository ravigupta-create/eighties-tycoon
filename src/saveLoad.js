const SAVE_KEY = 'eighties-tycoon-save';
const SETTINGS_KEY = 'eighties-tycoon-settings';

/**
 * Save game state to localStorage.
 * Strips pendingEvent (contains functions) — it's transient anyway.
 */
export function saveGame(state) {
  try {
    const serializable = {
      ...state,
      pendingEvent: null, // functions can't be serialized
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load game state from localStorage.
 * Returns null if no save exists or it's corrupt.
 */
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validation — check a few required fields
    if (!parsed.playerName || typeof parsed.year !== 'number') return null;
    // Ensure pendingEvent is cleared (was serialized as null)
    parsed.pendingEvent = null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Delete save data.
 */
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Check if a save exists.
 */
export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Save user settings (volume, mute).
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

/**
 * Load user settings.
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
