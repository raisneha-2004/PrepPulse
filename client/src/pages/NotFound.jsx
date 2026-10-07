import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 border border-slate-200/90 dark:border-slate-800 shadow-soft text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
            404
          </h1>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Setup</span>
        </Link>
      </div>
    </div>
  );
};
