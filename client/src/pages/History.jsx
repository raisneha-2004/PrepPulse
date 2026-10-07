import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Trash2,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  PlusCircle,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';
import { getHistory, deleteInterview, clearHistory } from '../utils/storage.js';
import { getSessions, getDailyCounts } from '../utils/stats.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { ScoreChart } from '../components/ScoreChart.jsx';
import { ActivityHeatmap } from '../components/ActivityHeatmap.jsx';

export const History = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = getHistory();
    setHistoryList(list);
  };

  const handleOpenReport = (item) => {
    navigate('/report', { state: { historyItem: item } });
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    const updated = deleteInterview(id);
    setHistoryList(updated);
    setItemToDelete(null);
    toast.success('Interview removed from history.');
  };

  const handleClearAll = () => {
    clearHistory();
    setHistoryList([]);
    setShowClearConfirm(false);
    toast.success('Interview history cleared.');
  };

  const sessions = getSessions();
  const dailyCounts = getDailyCounts();

  return (
    <div className="min-h-screen pb-20 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <HistoryIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Interview History & Progress
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track your score progression and review past interview feedback
          </p>
        </div>

        {historyList.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/80 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
          </div>
        )}
      </div>

      {historyList.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-16 border border-slate-200/90 dark:border-slate-800 shadow-soft text-center space-y-5 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Interview History Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Start your first AI mock interview to generate personalized performance reports and track your skill growth over time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <span>Start an Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Score Chart & Stats */}
          <ScoreChart sessions={sessions} />

          {/* Activity Heatmap */}
          <ActivityHeatmap dailyCounts={dailyCounts} />

          {/* List of Past Interviews */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Past Interviews ({historyList.length})
            </h3>

            <div className="space-y-3">
              {historyList.map((item, index) => {
                const dateFormatted = item.date
                  ? new Date(item.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent session';

                const score = item.overallPercent || 0;

                return (
                  <div
                    key={item.id || index}
                    onClick={() => handleOpenReport(item)}
                    className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-soft hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-105 transition-transform border border-slate-100 dark:border-slate-700">
                        {score}%
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.role || 'Software Engineer'}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.interviewType || 'Technical'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {item.difficulty || 'Medium'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{dateFormatted}</span>
                          </span>
                          <span>•</span>
                          <span>{item.stats?.answered || item.results?.filter(r => !r.skipped).length || 0} answered</span>
                          <span>•</span>
                          <span>{item.stats?.skipped || item.results?.filter(r => r.skipped).length || 0} skipped</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Delete interview"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        <span>View Report</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Clear All History Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Interview History?"
        description="Are you sure you want to delete all saved interview sessions and scores? This action cannot be undone."
        confirmText="Clear History"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Single Item Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Interview Record?"
        description={`Are you sure you want to remove the interview for "${itemToDelete?.role || 'this session'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={(e) => handleDeleteItem(e, itemToDelete?.id)}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
