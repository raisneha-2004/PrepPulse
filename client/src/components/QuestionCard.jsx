import React, { useState } from 'react';
import { Copy, Check, Sparkles, Tag, BarChart3, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuestionCard = ({
  question,
  topic = 'General',
  difficulty = 'Medium',
  type = 'Technical',
  currentIndex = 0,
  totalQuestions = 5,
  reaction = null
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!question) return;
    navigator.clipboard.writeText(question);
    setCopied(true);
    toast.success('Question copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Hard: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Mixed: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all duration-200 space-y-5">
      {/* Top Metadata Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Index Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            Q{currentIndex + 1} of {totalQuestions}
          </span>

          {/* Topic Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Tag className="w-3 h-3 text-indigo-500" />
            <span>{topic}</span>
          </span>

          {/* Difficulty Badge */}
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border ${difficultyColors[difficulty] || difficultyColors.Medium}`}>
            <BarChart3 className="w-3 h-3" />
            <span>{difficulty}</span>
          </span>

          {/* Type Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
            <HelpCircle className="w-3 h-3" />
            <span>{type}</span>
          </span>
        </div>

        {/* Copy Question Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy question"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Interviewer Reaction if in Mock Mode */}
      {reaction && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">Interviewer reaction: </span>
            <span>{reaction}</span>
          </div>
        </div>
      )}

      {/* Main Question Text */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
          {question}
        </h2>
      </div>
    </div>
  );
};
