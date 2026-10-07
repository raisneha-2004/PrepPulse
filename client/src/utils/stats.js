import { getHistory } from './storage.js';

export const getSessions = () => {
  const history = getHistory();
  return history.map(session => {
    // Session structure from storage:
    // id, createdAt, config: { role, experienceLevel }, report: { finalScore, summary }
    const resultsCount = session.results ? session.results.length : 0;
    const finalScore = session.overallPercent || session.report?.finalScore || 0;
    return {
      id: session.id,
      date: new Date(session.createdAt || session.date).toISOString(),
      role: session.role || session.config?.role || 'Custom',
      level: session.experienceLevel || session.config?.experienceLevel || 'Unknown',
      score: finalScore,
      questionsCount: resultsCount
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getStreak = () => {
  const sessions = getSessions();
  if (!sessions.length) return { streak: 0, todayComplete: false };

  // Group by date string (YYYY-MM-DD local)
  const uniqueDates = [...new Set(sessions.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let streak = 0;
  let todayComplete = uniqueDates.includes(todayStr);

  let currentCheckDate = new Date();
  if (!todayComplete) {
    if (!uniqueDates.includes(yesterdayStr)) {
      return { streak: 0, todayComplete: false };
    }
    currentCheckDate = new Date(yesterday);
  }

  // Count backwards
  while (true) {
    const checkStr = `${currentCheckDate.getFullYear()}-${String(currentCheckDate.getMonth() + 1).padStart(2, '0')}-${String(currentCheckDate.getDate()).padStart(2, '0')}`;
    if (uniqueDates.includes(checkStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, todayComplete };
};

export const getDailyCounts = (weeks = 12) => {
  const sessions = getSessions();
  const counts = {}; // 'YYYY-MM-DD': count
  sessions.forEach(s => {
    const d = new Date(s.date);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    counts[str] = (counts[str] || 0) + 1;
  });
  return counts;
};
