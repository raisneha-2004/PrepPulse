import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Check, Copy, Sparkles, Trophy, BookOpen, Award } from 'lucide-react';
import { ScoreBar } from './ScoreBar.jsx';
import toast from 'react-hot-toast';

export const EvaluationCard = ({
  evaluation,
  userAnswer,
  onNext,
  isLastQuestion = false,
  isAdvancing = false
}) => {
  const [copiedIdeal, setCopiedIdeal] = useState(false);

  if (!evaluation) return null;

  const { scores = {}, overall = 0, feedback = '', strengths = [], improvements = [], idealAnswer = '' } = evaluation;

  const handleCopyIdeal = () => {
    if (!idealAnswer) return;
    navigator.clipboard.writeText(idealAnswer);
    setCopiedIdeal(true);
    toast.success('Ideal answer copied');
    setTimeout(() => setCopiedIdeal(false), 2000);
  };

  const getOverallBadge = (score) => {
    if (score >= 8.5) return { text: 'Outstanding', color: 'bg-emerald-500 text-white' };
    if (score >= 7.0) return { text: 'Strong Answer', color: 'bg-indigo-600 text-white' };
    if (score >= 5.0) return { text: 'Satisfactory', color: 'bg-amber-500 text-white' };
    return { text: 'Needs Improvement', color: 'bg-rose-500 text-white' };
  };

  const overallBadge = getOverallBadge(overall);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft-lg space-y-6 transition-all duration-300">
      {/* Header with Overall Score */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              AI Evaluation & Feedback
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-dimensional scoring and constructive feedback
          </p>
        </div>

        {/* Big Overall Score Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Overall Score
            </span>
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${overallBadge.color}`}>
              {overallBadge.text}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {overall}<span className="text-base text-slate-400">/10</span>
          </div>
        </div>
      </div>

      {/* 4 Score Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-850/60 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <ScoreBar label="Technical Accuracy" score={scores.technicalAccuracy || 0} max={10} />
        <ScoreBar label="Question Relevance" score={scores.relevance || 0} max={10} />
        <ScoreBar label="Completeness & Depth" score={scores.completeness || 0} max={10} />
        <ScoreBar label="Clarity & Communication" score={scores.clarity || 0} max={10} />
      </div>

      {/* General Feedback Text */}
      {feedback && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Evaluation Summary
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-200 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/40 leading-relaxed">
            {feedback}
          </p>
        </div>
      )}

      {/* Strengths & Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Key Strengths</span>
          </h4>
          <ul className="space-y-2">
            {strengths && strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 dark:text-slate-400 italic">No specific strengths identified.</li>
            )}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Areas to Improve</span>
          </h4>
          <ul className="space-y-2">
            {improvements && improvements.length > 0 ? (
              improvements.map((imp, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 dark:text-slate-400 italic">Great response! No major gaps noted.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Side-by-Side: Your Answer vs Ideal Answer */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Response Comparison</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Candidate Answer */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Your Answer
            </div>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-1">
              {userAnswer || <span className="italic text-slate-400">No answer provided (skipped)</span>}
            </div>
          </div>

          {/* Ideal Model Answer */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Ideal Answer</span>
              </span>
              {idealAnswer && (
                <button
                  type="button"
                  onClick={handleCopyIdeal}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {copiedIdeal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIdeal ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-1">
              {idealAnswer || <span className="italic text-slate-400">No ideal answer available</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Next Question / Proceed Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={isAdvancing}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <span>{isLastQuestion ? 'View Performance Report' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
