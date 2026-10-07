import React from 'react';
import { Bot, User, Award, HelpCircle } from 'lucide-react';

export const ChatBubble = ({ message }) => {
  const isInterviewer = message.sender === 'interviewer';

  return (
    <div className={`flex gap-3 ${isInterviewer ? 'justify-start' : 'justify-end'} text-left`}>
      {isInterviewer && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm space-y-2 ${
          isInterviewer
            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
            : 'bg-indigo-600 text-white shadow-indigo-600/20'
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-[11px] opacity-75 pb-1 border-b border-white/10 dark:border-slate-700/60">
          <span className="font-semibold">
            {isInterviewer ? 'AI Interviewer' : 'You (Candidate)'}
          </span>
          {message.timestamp && (
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Reaction text if any */}
        {message.reaction && (
          <p className="text-xs italic text-indigo-500 dark:text-indigo-300 font-medium">
            "{message.reaction}"
          </p>
        )}

        {/* Main message text */}
        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
          {message.text || message.answer || message.question}
        </p>

        {/* Question highlight if included */}
        {message.question && message.sender === 'interviewer' && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            {message.question}
          </div>
        )}

        {/* Overall Score Badge if turn had score */}
        {typeof message.overall === 'number' && (
          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
            <Award className="w-3 h-3" />
            <span>Score: {message.overall} / 10</span>
          </div>
        )}
      </div>

      {!isInterviewer && (
        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
