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
    // Ensure pendingEvent is cleared
    parsed.pendingEvent = null;
    // Backward compatibility — fill in defaults for fields added after initial save
    parsed.businesses = parsed.businesses || [];
    parsed.loan = parsed.loan || { principal: 0, interestRate: 0.05 };
    parsed.achievements = parsed.achievements || [];
    parsed.netWorthHistory = parsed.netWorthHistory || [];
    parsed.career = parsed.career || { rankIndex: 0, promotionMeter: 0 };
    parsed.properties = parsed.properties || [];
    parsed.luxuryItems = parsed.luxuryItems || [];
    parsed.reputation = parsed.reputation || 0;
    parsed.happiness = parsed.happiness ?? 75;
    parsed.expenseMultiplier = parsed.expenseMultiplier ?? 1.0;
    parsed.expenseMultiplierExpiry = parsed.expenseMultiplierExpiry || 0;
    parsed.headlineHistory = parsed.headlineHistory || [];
    parsed.currentHeadline = parsed.currentHeadline || null;
    parsed.wasBroke = parsed.wasBroke || false;
    parsed.victory = parsed.victory || false;
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
