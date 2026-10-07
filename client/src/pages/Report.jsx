import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  RotateCcw,
  PlusCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Check,
  X,
  Sparkles,
  HelpCircle,
  FileText,
  Lightbulb,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useInterview } from '../context/InterviewContext.jsx';
import { generateReport, generateQuestions, getIdealAnswer } from '../api/client.js';
import { saveInterview, getHistory } from '../utils/storage.js';
import { ScoreRing } from '../components/ScoreRing.jsx';
import { ScoreBar } from '../components/ScoreBar.jsx';
import { Spinner, Skeleton } from '../components/Loader.jsx';

export const Report = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    config,
    results,
    finalReport,
    setFinalReport,
    startInterview,
    resetInterview,
    timerSeconds,
    activeInterviewId
  } = useInterview();

  const [isLoading, setIsLoading] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const hasSavedToHistory = useRef(false);

  // Ideal Answer States
  const [fetchingIdeal, setFetchingIdeal] = useState({});
  const [idealErrors, setIdealErrors] = useState({});
  const [localIdealData, setLocalIdealData] = useState({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [genAllProgress, setGenAllProgress] = useState({ done: 0, total: 0 });
  const [copiedIndex, setCopiedIndex] = useState(null);

  // If passed an existing interview report from History page via state
  const historyItem = location.state?.historyItem;
  const activeReport = historyItem?.report || finalReport;
  const activeResults = historyItem?.results || results;
  const activeConfig = historyItem?.config || config;
  const activeStats = historyItem?.stats || activeReport?.stats;

  // Format timer
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Generate Report if not already present
  useEffect(() => {
    // If viewing from history, no need to call API
    if (historyItem) return;

    if (!finalReport && results.length > 0) {
      const fetchReport = async () => {
        setIsLoading(true);
        const toastId = toast.loading('Synthesizing your interview performance report with AI...');
        try {
          const targetRole = config.role === 'Custom' ? config.customRole : config.role;

          const payload = {
            role: targetRole || 'Software Engineer',
            interviewType: config.interviewType,
            difficulty: config.difficulty,
            experienceLevel: config.experienceLevel || 'Fresher',
            results: results.map(r => ({
              question: r.question,
              topic: r.topic || 'General',
              answer: r.answer || '',
              skipped: r.skipped || false,
              scores: r.scores,
              overall: r.overall
            }))
          };

          const reportData = await generateReport(payload);
          setFinalReport(reportData);
          toast.dismiss(toastId);
          toast.success('Performance report generated!');
        } catch (error) {
          toast.dismiss(toastId);
          console.error('Failed to generate report:', error);
          toast.error(error.message || 'Could not generate report. Showing local summary.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchReport();
    } else if (results.length === 0 && !historyItem) {
      toast.error('No completed interview results found.');
      navigate('/');
    }
  }, [finalReport, results, historyItem, config, navigate, setFinalReport]);

  // Auto-save interview to localStorage history upon report completion
  useEffect(() => {
    if (activeReport && !historyItem && !hasSavedToHistory.current && results.length > 0) {
      const id = activeInterviewId || `int_${Date.now()}`;
      const targetRole = config.role === 'Custom' ? config.customRole : config.role;

      const recordToSave = {
        id,
        date: new Date().toISOString(),
        role: targetRole || 'Software Engineer',
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        overallPercent: activeReport.overallPercent || 0,
        stats: activeReport.stats || {
          total: results.length,
          answered: results.filter(r => !r.skipped).length,
          skipped: results.filter(r => r.skipped).length
        },
        durationSeconds: timerSeconds,
        config,
        results,
        report: activeReport
      };

      saveInterview(recordToSave);
      hasSavedToHistory.current = true;
    }
  }, [activeReport, historyItem, results, config, timerSeconds, activeInterviewId]);

  const getHistoryRecordId = () => historyItem?.id || activeInterviewId;

  const updateHistoryWithIdealAnswer = (idx, idealData) => {
    const history = getHistory();
    const id = getHistoryRecordId();
    const record = history.find(item => item.id === id);
    if (record && record.results && record.results[idx]) {
      record.results[idx] = { ...record.results[idx], ...idealData };
      saveInterview(record);
    }
  };

  const handleFetchIdealAnswer = async (idx, item) => {
    if (item.idealAnswer || localIdealData[idx] || fetchingIdeal[idx]) return;

    setFetchingIdeal(prev => ({ ...prev, [idx]: true }));
    setIdealErrors(prev => ({ ...prev, [idx]: null }));

    try {
      const payload = {
        question: item.question,
        topic: item.topic || 'General',
        role: activeConfig?.role === 'Custom' ? activeConfig?.customRole : activeConfig?.role || 'Software Engineer',
        difficulty: activeConfig?.difficulty || 'Medium',
        experienceLevel: activeConfig?.experienceLevel || 'Fresher'
      };
      const res = await getIdealAnswer(payload);
      const idealData = {
        idealAnswer: res.idealAnswer,
        keyPoints: res.keyPoints || [],
        example: res.example || ''
      };
      setLocalIdealData(prev => ({ ...prev, [idx]: idealData }));
      updateHistoryWithIdealAnswer(idx, idealData);
    } catch (err) {
      setIdealErrors(prev => ({ ...prev, [idx]: err.message || 'Failed to generate answer.' }));
    } finally {
      setFetchingIdeal(prev => ({ ...prev, [idx]: false }));
    }
  };

  const toggleQuestionExpand = (idx) => {
    setExpandedQuestions(prev => {
      const isExpanded = !prev[idx];
      if (isExpanded) {
        const item = activeResults[idx];
        if (item.skipped && !item.idealAnswer && !localIdealData[idx]) {
          handleFetchIdealAnswer(idx, item);
        }
      }
      return { ...prev, [idx]: isExpanded };
    });
  };

  const skippedWithoutAnswers = activeResults.map((r, i) => ({r, i})).filter(({r, i}) => r.skipped && !r.idealAnswer && !localIdealData[i]);

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    setGenAllProgress({ done: 0, total: skippedWithoutAnswers.length });
    let count = 0;
    for (const {r, i} of skippedWithoutAnswers) {
      if (!localIdealData[i]) {
        await handleFetchIdealAnswer(i, r);
        await new Promise(res => setTimeout(res, 600)); // 600ms delay
      }
      count++;
      setGenAllProgress(prev => ({ ...prev, done: count }));
    }
    setIsGeneratingAll(false);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRetake = async () => {
    setIsRetaking(true);
    const toastId = toast.loading('Generating fresh questions with same configuration...');
    try {
      const targetRole = activeConfig.role === 'Custom' ? activeConfig.customRole : activeConfig.role;
      const response = await generateQuestions({
        role: targetRole || 'Software Engineer',
        experienceLevel: activeConfig.experienceLevel || 'Fresher',
        interviewType: activeConfig.interviewType || 'Technical',
        topics: activeConfig.topics || ['General'],
        difficulty: activeConfig.difficulty || 'Medium',
        count: Number(activeConfig.count) || 5
      });

      toast.dismiss(toastId);
      startInterview(response.questions, activeConfig);
      toast.success('Retake ready! Starting interview.');
      navigate('/interview');
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Failed to retake interview:', error);
      toast.error(error.message || 'Failed to generate retake questions.');
    } finally {
      setIsRetaking(false);
    }
  };

  const handleNewInterview = () => {
    resetInterview();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <Spinner size="xl" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analyzing Performance & Compiling Report
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            AI is calculating multi-category competencies, identifying strengths, and curating recommended topics...
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  const breakdown = activeReport?.breakdown || {
    technical: 0,
    communication: 0,
    accuracy: 0,
    completeness: 0
  };

  const overallPercent = activeReport?.overallPercent || 0;
  const strongAreas = activeReport?.strongAreas || [];
  const weakAreas = activeReport?.weakAreas || [];
  const recommendedTopics = activeReport?.recommendedTopics || [];
  const summary = activeReport?.summary || 'Interview concluded.';

  return (
    <div className="min-h-screen pb-20 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Interview Performance Report
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Target Role: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeConfig?.role === 'Custom' ? activeConfig?.customRole : activeConfig?.role}</span> • {activeConfig?.interviewType} • {activeConfig?.difficulty}
          </p>
        </div>

        {/* Action Buttons (Download, Retake, New) */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleRetake}
            disabled={isRetaking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake</span>
          </button>

          <button
            type="button"
            onClick={handleNewInterview}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Interview</span>
          </button>
        </div>
      </div>

      {/* Summary Score Ring & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Big Score Ring & Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col items-center justify-center text-center space-y-6">
          <ScoreRing score={overallPercent} size={170} label="Overall Competency" />

          {/* Key Stats Counter */}
          <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{activeStats?.total || activeResults.length}</span>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase block">Answered</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{activeStats?.answered || activeResults.filter(r => !r.skipped).length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Skipped</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300 font-mono">{activeStats?.skipped || activeResults.filter(r => r.skipped).length}</span>
            </div>
          </div>
        </div>

        {/* Right: Competency Breakdown & AI Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Skill Dimension Breakdown</span>
            </h3>

            <div className="space-y-3.5">
              <ScoreBar label="Technical Accuracy & Knowledge" score={breakdown.technical} max={100} />
              <ScoreBar label="Question Relevance & Focus" score={breakdown.accuracy} max={100} />
              <ScoreBar label="Completeness & Depth" score={breakdown.completeness} max={100} />
              <ScoreBar label="Clarity & Communication" score={breakdown.communication} max={100} />
            </div>
          </div>

          {/* Executive Summary */}
          {summary && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-400 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Coach Assessment</span>
              </span>
              <p>{summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Strong Areas & Needs Improvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {strongAreas && strongAreas.length > 0 ? (
              strongAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                  <span>{area}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Continue practicing to build identified strengths.</span>
            )}
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Growth Opportunities</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {weakAreas && weakAreas.length > 0 ? (
              weakAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>{area}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No major weak areas flagged! Excellent work.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Topics To Revise */}
      {recommendedTopics && recommendedTopics.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Recommended Revision Roadmap</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Review Accordion */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <span>Question-by-Question Review ({activeResults.length})</span>
          </h3>

          {skippedWithoutAnswers.length >= 2 && (
            <button
              onClick={handleGenerateAll}
              disabled={isGeneratingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 transition-colors disabled:opacity-50"
            >
              <Lightbulb className="w-4 h-4" />
              <span>
                {isGeneratingAll 
                  ? `Generating... ${genAllProgress.done}/${genAllProgress.total}` 
                  : 'Generate all ideal answers'}
              </span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {activeResults.map((item, idx) => {
            const isExpanded = !!expandedQuestions[idx];
            const isSkipped = !!item.skipped;
            const score = typeof item.overall === 'number' ? item.overall : 0;

            return (
              <div
                key={item.questionId || idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleQuestionExpand(idx)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.topic || 'General'}
                        </span>
                        {isSkipped && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200">
                            Skipped
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                        {item.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!isSkipped ? (
                      <span className="text-xs sm:text-sm font-bold font-mono px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {score} / 10
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">0 / 10</span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && !isSkipped && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Your Submitted Response
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                        {item.answer || <span className="italic text-slate-400">No answer text</span>}
                      </p>
                    </div>

                    {/* Feedback */}
                    {item.feedback && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          AI Feedback
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
                          {item.feedback}
                        </p>
                      </div>
                    )}

                    {/* Ideal Model Answer */}
                    {item.idealAnswer && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Ideal Answer</span>
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 whitespace-pre-wrap">
                          {item.idealAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && isSkipped && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4" aria-live="polite">
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                      You skipped this question
                    </div>

                    {fetchingIdeal[idx] ? (
                      <div className="space-y-3 p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400">
                          <Spinner size="sm" />
                          <span>Preparing ideal answer...</span>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : idealErrors[idx] ? (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start justify-between gap-3">
                        <div className="text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{idealErrors[idx]}</span>
                        </div>
                        <button
                          onClick={() => handleFetchIdealAnswer(idx, item)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (item.idealAnswer || localIdealData[idx]) ? (
                      (() => {
                        const data = localIdealData[idx] || item;
                        return (
                          <div className="bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 flex justify-between items-center border-b border-emerald-100 dark:border-emerald-900/40">
                              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                <Lightbulb className="w-4 h-4" />
                                Ideal Answer
                              </h4>
                              <button
                                onClick={() => handleCopy(data.idealAnswer, idx)}
                                className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md text-emerald-700 dark:text-emerald-500 transition-colors"
                                title="Copy answer"
                              >
                                {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            
                            <div className="p-4 space-y-4">
                              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {data.idealAnswer}
                              </div>

                              {data.keyPoints && data.keyPoints.length > 0 && (
                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Key Points</h5>
                                  <ul className="space-y-1.5">
                                    {data.keyPoints.map((kp, kIdx) => (
                                      <li key={kIdx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span>{kp}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {data.example && (
                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Example</h5>
                                  <div className="text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto text-slate-800 dark:text-slate-200">
                                    {data.example.split('```').map((part, i) => (
                                      i % 2 === 1 
                                        ? <pre key={i} className="my-2 p-2 bg-slate-100 dark:bg-slate-950 rounded-lg">{part}</pre>
                                        : <span key={i}>{part}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
