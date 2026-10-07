import React from 'react';
import { motion } from 'framer-motion';

export const ScoreRing = ({ score = 0, size = 160, strokeWidth = 12, label = 'Overall Score' }) => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  // Grade badge & color scheme
  const getGradeInfo = (pct) => {
    if (pct >= 85) return { grade: 'Excellent', color: '#10b981', gradientId: 'grad-emerald', textClass: 'text-emerald-500' };
    if (pct >= 70) return { grade: 'Proficient', color: '#6366f1', gradientId: 'grad-indigo', textClass: 'text-indigo-500' };
    if (pct >= 50) return { grade: 'Moderate', color: '#f59e0b', gradientId: 'grad-amber', textClass: 'text-amber-500' };
    return { grade: 'Needs Work', color: '#f43f5e', gradientId: 'grad-rose', textClass: 'text-rose-500' };
  };

  const { grade, gradientId, textClass } = getGradeInfo(normalized);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="grad-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />

          {/* Animated Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            {normalized}<span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-500">%</span>
          </motion.span>
          <span className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${textClass}`}>
            {grade}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
          {label}
        </span>
      )}
    </div>
  );
};
