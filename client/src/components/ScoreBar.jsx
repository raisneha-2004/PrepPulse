import React from 'react';
import { motion } from 'framer-motion';

export const ScoreBar = ({ label, score = 0, max = 10, showScore = true, size = 'md' }) => {
  const normalized = typeof score === 'number' ? Math.max(0, Math.min(max, score)) : 0;
  const percentage = Math.round((normalized / max) * 100);

  // Dynamic color depending on percentage
  const getColorScheme = (pct) => {
    if (pct >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (pct >= 65) return { bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
    if (pct >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
  };

  const colors = getColorScheme(percentage);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        {showScore && (
          <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md border ${colors.badge}`}>
            {normalized} / {max} ({percentage}%)
          </span>
        )}
      </div>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size] || heightClasses.md}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors.bar}`}
        />
      </div>
    </div>
  );
};
