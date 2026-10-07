const HISTORY_KEY = 'ipa_history';
const ACTIVE_SESSION_KEY = 'ipa_active_session';

/**
 * Retrieves all saved interview history from localStorage
 * @returns {Array<Object>}
 */
export const getHistory = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read interview history from localStorage', err);
    return [];
  }
};

/**
 * Saves a completed interview to history (avoids duplicates by ID)
 * @param {Object} interviewData 
 * @returns {Array<Object>} Updated history array
 */
export const saveInterview = (interviewData) => {
  try {
    const history = getHistory();
    const existingIndex = history.findIndex(item => item.id === interviewData.id);

    let updated;
    if (existingIndex >= 0) {
      updated = [...history];
      updated[existingIndex] = interviewData;
    } else {
      updated = [interviewData, ...history];
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('history-updated'));
    return updated;
  } catch (err) {
    console.error('Failed to save interview to localStorage', err);
    return getHistory();
  }
};

/**
 * Deletes a single interview by ID
 * @param {string} id 
 * @returns {Array<Object>} Updated history array
 */
export const deleteInterview = (id) => {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('history-updated'));
    return filtered;
  } catch (err) {
    console.error('Failed to delete interview from localStorage', err);
    return getHistory();
  }
};

/**
 * Clears all interview history
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('history-updated'));
  } catch (err) {
    console.error('Failed to clear interview history', err);
  }
};

/**
 * Retrieves the currently active/in-progress interview session if any
 * @returns {Object|null}
 */
export const getActiveSession = () => {
  try {
    const data = localStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to read active session from localStorage', err);
    return null;
  }
};

/**
 * Autosaves the current active interview session to localStorage
 * @param {Object} sessionData 
 */
export const saveActiveSession = (sessionData) => {
  try {
    if (!sessionData) {
      clearActiveSession();
    } else {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
    }
  } catch (err) {
    console.error('Failed to save active session', err);
  }
};

/**
 * Clears the active interview session
 */
export const clearActiveSession = () => {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear active session', err);
  }
};
