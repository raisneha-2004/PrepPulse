import React, { useRef, useEffect } from 'react';
import { Send, SkipForward, Mic, CornerDownLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from './Loader.jsx';
import { ANSWER_MIN, ANSWER_MAX } from '../config/limits.js';

export const AnswerBox = ({
  answer,
  onChange,
  onSubmit,
  onSkip,
  isSubmitting = false,
  isDisabled = false,
  maxLength = ANSWER_MAX,
  minLength = ANSWER_MIN,
  onRetry = null,
  hasError = false
}) => {
  const textareaRef = useRef(null);
  const charCount = answer.length;
  const isTooShort = charCount < ANSWER_MIN;
  const canSubmit = !isTooShort && !isSubmitting && !isDisabled;
  const isNearMax = charCount > Math.floor(ANSWER_MAX * 0.9);

  // Auto focus textarea when mounting or question changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSubmit) {
        onSubmit();
      } else if (isTooShort) {
        toast.error(`Please write at least ${ANSWER_MIN} characters before submitting.`);
      }
    }
  };

  /**
   * Voice Input handler - Web Speech API Integration Hook
   */
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    toast('Voice input hook ready. Web Speech API integration in progress!', {
      icon: '🎙️',
      duration: 3000
    });
  };

  const progressPercent = Math.min(100, (charCount / ANSWER_MIN) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-4">
      {/* Header / Labels */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="interview-answer"
          className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
        >
          <span>Your Response</span>
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            (Markdown supported)
          </span>
        </label>

        {/* Voice Input Hook (Web Speech API) */}
        <button
          type="button"
          onClick={handleVoiceInput}
          title="Voice input (Speech to Text)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Input</span>
        </button>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="interview-answer"
          rows={7}
          value={answer}
          onChange={(e) => onChange(e.target.value.slice(0, ANSWER_MAX))}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isSubmitting}
          placeholder="Structure your answer clearly (e.g. context, approach, technical trade-offs, results)..."
          className={`w-full p-4 rounded-2xl text-sm sm:text-base border transition-all duration-200 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans resize-y min-h-[160px] ${
            hasError
              ? 'border-rose-300 dark:border-rose-700 ring-1 ring-rose-300'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        />

        {/* Thin Progress Line filling up to ANSWER_MIN */}
        <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full transition-all duration-200 ${
              charCount >= ANSWER_MIN ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Character Counter & Helper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mt-2 px-1 gap-1">
          <div className="flex items-center gap-2">
            {charCount === 0 ? (
              <span className="text-slate-400 dark:text-slate-500">
                Write your answer (min {ANSWER_MIN} characters)
              </span>
            ) : charCount < ANSWER_MIN ? (
              <span className="text-amber-500 dark:text-amber-400 font-medium">
                Min {ANSWER_MIN} characters required ({ANSWER_MIN - charCount} more needed)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
                  <CornerDownLeft className="w-3 h-3" />
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700">Enter</kbd> to submit</span>
                </span>
              </div>
            )}
          </div>

          <span
            className={`font-mono text-xs ${
              charCount >= ANSWER_MAX
                ? 'text-rose-500 font-bold'
                : isNearMax
                ? 'text-amber-500 font-semibold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {charCount} / {ANSWER_MAX}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onSkip}
          disabled={isDisabled || isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip Question</span>
        </button>

        <div className="flex items-center gap-3">
          {hasError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Evaluation</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none min-w-[140px]"
          >
            {isSubmitting ? (
              <Spinner size="sm" className="text-white" label="Evaluating..." />
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerBox;
