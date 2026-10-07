import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  LogOut,
  Sparkles,
  Layers,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useInterview } from '../context/InterviewContext.jsx';
import { evaluateAnswer, getFollowup } from '../api/client.js';
import { QuestionCard } from '../components/QuestionCard.jsx';
import { AnswerBox } from '../components/AnswerBox.jsx';
import { EvaluationCard } from '../components/EvaluationCard.jsx';
import { ChatBubble } from '../components/ChatBubble.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { EvaluationSkeleton } from '../components/Loader.jsx';

export const Interview = () => {
  const navigate = useNavigate();
  const {
    config,
    questions,
    currentIndex,
    results,
    chatTranscript,
    addChatMessage,
    recordResult,
    advanceToNext,
    skipCurrentQuestion,
    status,
    timerSeconds,
    finishInterview,
    activeInterviewId
  } = useInterview();

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = currentIndex >= questions.length - 1 && questions.length > 0;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  // Format count-up timer mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If no questions in state, redirect home or check if completed
  useEffect(() => {
    if (!currentQuestion && questions.length === 0) {
      if (results.length > 0) {
        navigate('/report');
      } else {
        toast.error('No active interview session found. Please configure and start one.');
        navigate('/');
      }
    }
  }, [currentQuestion, questions, results, navigate]);

  // Check if current question already has an evaluation stored (e.g. after refresh/navigation)
  useEffect(() => {
    if (currentQuestion) {
      const existing = results.find(r => r.questionId === currentQuestion.id || r.question === currentQuestion.question);
      if (existing && !existing.skipped) {
        setCurrentEvaluation(existing);
        setCurrentAnswer(existing.answer || '');
      } else {
        setCurrentEvaluation(null);
        setCurrentAnswer('');
      }
      setHasError(false);
    }
  }, [currentIndex, currentQuestion]);

  /**
   * Evaluates the candidate's answer via `/api/answer/evaluate`
   */
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    if (currentAnswer.trim().length < 10) {
      toast.error('Please write at least 10 characters before submitting.');
      return;
    }

    setIsSubmitting(true);
    setHasError(false);
    const toastId = toast.loading('Evaluating your response with AI...');

    try {
      const targetRole = config.role === 'Custom' ? config.customRole : config.role;

      const evalPayload = {
        question: currentQuestion.question,
        answer: currentAnswer.trim(),
        role: targetRole || 'Software Engineer',
        difficulty: currentQuestion.difficulty || config.difficulty || 'Medium',
        experienceLevel: config.experienceLevel || 'Fresher'
      };

      const evalData = await evaluateAnswer(evalPayload);
      toast.dismiss(toastId);

      const resultRecord = {
        questionId: currentQuestion.id || `q_${currentIndex + 1}`,
        question: currentQuestion.question,
        topic: currentQuestion.topic || 'General',
        difficulty: currentQuestion.difficulty || config.difficulty,
        type: currentQuestion.type || config.interviewType,
        answer: currentAnswer.trim(),
        skipped: false,
        scores: evalData.scores,
        overall: evalData.overall,
        feedback: evalData.feedback,
        strengths: evalData.strengths || [],
        improvements: evalData.improvements || [],
        idealAnswer: evalData.idealAnswer || ''
      };

      // Save to state
      recordResult(resultRecord);
      setCurrentEvaluation(resultRecord);

      // Record in Mock Interview chat transcript
      if (config.mode === 'mock') {
        addChatMessage({
          sender: 'candidate',
          answer: currentAnswer.trim()
        });
      }

      toast.success('Evaluation ready!');
    } catch (error) {
      toast.dismiss(toastId);
      setHasError(true);
      console.error('Answer evaluation failed:', error);
      toast.error(error.message || 'Evaluation failed. You can click retry to submit again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Skips the current question
   */
  const handleSkip = () => {
    if (!currentQuestion) return;
    skipCurrentQuestion(currentQuestion);
    toast('Question skipped', { icon: '⏭️' });

    if (isLastQuestion) {
      handleCompleteInterview();
    }
  };

  /**
   * Moves to the next question or fetches conversational follow-up if in Mock mode
   */
  const handleNext = async () => {
    if (isLastQuestion) {
      handleCompleteInterview();
      return;
    }

    // In Mock Mode, fetch conversational follow-up for the next step if configured
    if (config.mode === 'mock') {
      setIsAdvancing(true);
      try {
        const targetRole = config.role === 'Custom' ? config.customRole : config.role;
        const historyTurns = results.map(r => ({
          question: r.question,
          answer: r.answer || '',
          overall: r.overall || 0
        }));

        const followupData = await getFollowup({
          role: targetRole || 'Software Engineer',
          interviewType: config.interviewType,
          difficulty: config.difficulty,
          experienceLevel: config.experienceLevel || 'Fresher',
          history: historyTurns.slice(-5) // Last 5 turns for prompt efficiency
        });

        // Add follow-up question to transcript
        addChatMessage({
          sender: 'interviewer',
          reaction: followupData.reaction,
          question: followupData.question,
          topic: followupData.topic
        });

        // Advance to next existing question or dynamic followup
        advanceToNext({
          id: `q_mock_${Date.now()}`,
          question: followupData.question,
          topic: followupData.topic || 'Follow-up',
          difficulty: config.difficulty,
          type: 'Conversational Follow-up',
          reaction: followupData.reaction
        });
      } catch (error) {
        console.warn('Follow-up generation fallback to next question:', error);
        advanceToNext();
      } finally {
        setIsAdvancing(false);
      }
    } else {
      // In Practice mode, simply advance to the next pre-generated question
      advanceToNext();
    }
  };

  /**
   * Concludes the interview and navigates to `/report`
   */
  const handleCompleteInterview = () => {
    finishInterview();
    navigate('/report');
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen pb-16 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Progress & Index */}
        <div className="w-full sm:w-auto flex-1 space-y-2">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Question {currentIndex + 1} <span className="text-slate-400 font-normal">of {totalQuestions}</span>
            </span>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {config.mode === 'mock' ? 'Mock Interview Mode' : 'Practice Mode'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full sm:max-w-md bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Timer, Transcript Toggle & End Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Transcript toggle in Mock mode */}
          {config.mode === 'mock' && (
            <button
              type="button"
              onClick={() => setShowTranscript(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showTranscript
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Transcript</span>
            </button>
          )}

          {/* End Interview button */}
          <button
            type="button"
            onClick={() => setShowEndConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/80 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Mock Mode Chat Transcript Drawer / Section */}
      {config.mode === 'mock' && showTranscript && chatTranscript.length > 0 && (
        <div className="bg-slate-50/90 dark:bg-slate-850/90 rounded-3xl p-5 sm:p-6 border border-indigo-100 dark:border-indigo-950/80 shadow-soft space-y-4 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Live Interview Transcript</span>
            </h3>
            <span className="text-xs text-slate-400">{chatTranscript.length} messages</span>
          </div>
          <div className="space-y-3">
            {chatTranscript.map((msg, idx) => (
              <ChatBubble key={msg.id || idx} message={msg} />
            ))}
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <QuestionCard
        question={currentQuestion.question}
        topic={currentQuestion.topic || 'General'}
        difficulty={currentQuestion.difficulty || config.difficulty}
        type={currentQuestion.type || config.interviewType}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        reaction={currentQuestion.reaction}
      />

      {/* Answer Box or Evaluated State */}
      {!currentEvaluation ? (
        <AnswerBox
          answer={currentAnswer}
          onChange={setCurrentAnswer}
          onSubmit={handleSubmitAnswer}
          onSkip={handleSkip}
          isSubmitting={isSubmitting}
          isDisabled={isAdvancing}
          hasError={hasError}
          onRetry={handleSubmitAnswer}
        />
      ) : (
        <EvaluationCard
          evaluation={currentEvaluation}
          userAnswer={currentAnswer}
          onNext={handleNext}
          isLastQuestion={isLastQuestion}
          isAdvancing={isAdvancing}
        />
      )}

      {/* End Interview Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showEndConfirm}
        title="Conclude Interview Early?"
        description="Are you sure you want to end this interview session now? Your answered questions will be evaluated and compiled into a final report."
        confirmText="Yes, End Interview"
        cancelText="Continue Interview"
        variant="warning"
        onConfirm={handleCompleteInterview}
        onCancel={() => setShowEndConfirm(false)}
      />
    </div>
  );
};
