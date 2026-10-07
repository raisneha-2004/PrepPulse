import React, { createContext, useContext, useState, useEffect } from 'react';
import { getActiveSession, saveActiveSession, clearActiveSession } from '../utils/storage.js';

const InterviewContext = createContext();

const DEFAULT_CONFIG = {
  name: '',
  experienceLevel: 'Fresher',
  role: 'Full Stack Developer',
  customRole: '',
  interviewType: 'Technical',
  topics: ['React', 'Node.js', 'Express', 'TypeScript', 'Next.js'],
  difficulty: 'Medium',
  count: 5,
  mode: 'practice' // 'practice' | 'mock'
};

export const InterviewProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [resumeData, setResumeData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [chatTranscript, setChatTranscript] = useState([]);
  const [activeInterviewId, setActiveInterviewId] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'in_progress' | 'completed'
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [finalReport, setFinalReport] = useState(null);
  const [savedSessionAvailable, setSavedSessionAvailable] = useState(false);

  // Check on mount if an active session exists in localStorage
  useEffect(() => {
    const saved = getActiveSession();
    if (saved && saved.status === 'in_progress' && saved.questions?.length > 0) {
      setSavedSessionAvailable(true);
    }
  }, []);

  // Autosave active session whenever interview state changes
  useEffect(() => {
    if (status === 'in_progress' && activeInterviewId) {
      saveActiveSession({
        config,
        resumeData,
        questions,
        currentIndex,
        results,
        chatTranscript,
        activeInterviewId,
        status,
        timerSeconds,
        timestamp: new Date().toISOString()
      });
    } else if (status === 'completed' || status === 'idle') {
      clearActiveSession();
      setSavedSessionAvailable(false);
    }
  }, [config, resumeData, questions, currentIndex, results, chatTranscript, activeInterviewId, status, timerSeconds]);

  // Timer counter during active interview
  useEffect(() => {
    let interval = null;
    if (status === 'in_progress') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  /**
   * Initializes and starts a new interview session
   */
  const startInterview = (generatedQuestions, newConfig = config, newResumeData = resumeData) => {
    const id = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveRole = newConfig.role === 'Custom' && newConfig.customRole ? newConfig.customRole : newConfig.role;

    const initialChat = generatedQuestions.length > 0 && newConfig.mode === 'mock' ? [
      {
        id: 'msg_0',
        sender: 'interviewer',
        text: `Welcome ${newConfig.name ? newConfig.name : 'there'}! Let's begin your ${newConfig.interviewType} interview for the ${effectiveRole} role. Here is your first question:`,
        question: generatedQuestions[0]?.question,
        topic: generatedQuestions[0]?.topic,
        timestamp: new Date().toISOString()
      }
    ] : [];

    setConfig({ ...newConfig, effectiveRole });
    setResumeData(newResumeData);
    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setResults([]);
    setChatTranscript(initialChat);
    setActiveInterviewId(id);
    setTimerSeconds(0);
    setFinalReport(null);
    setStatus('in_progress');
    setSavedSessionAvailable(false);
  };

  /**
   * Resumes an in-progress session loaded from storage
   */
  const resumeActiveSession = () => {
    const saved = getActiveSession();
    if (saved) {
      setConfig(saved.config || DEFAULT_CONFIG);
      setResumeData(saved.resumeData || null);
      setQuestions(saved.questions || []);
      setCurrentIndex(saved.currentIndex || 0);
      setResults(saved.results || []);
      setChatTranscript(saved.chatTranscript || []);
      setActiveInterviewId(saved.activeInterviewId || `int_${Date.now()}`);
      setTimerSeconds(saved.timerSeconds || 0);
      setStatus('in_progress');
      setSavedSessionAvailable(false);
      return true;
    }
    return false;
  };

  /**
   * Discards the saved active session
   */
  const discardActiveSession = () => {
    clearActiveSession();
    setSavedSessionAvailable(false);
  };

  /**
   * Adds an evaluation result to the results list
   */
  const recordResult = (resultItem) => {
    setResults(prev => {
      // Replace if question already evaluated (e.g. retry), otherwise append
      const existing = prev.findIndex(r => r.questionId === resultItem.questionId || (r.question === resultItem.question && r.question));
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = resultItem;
        return copy;
      }
      return [...prev, resultItem];
    });
  };

  /**
   * Adds an item to the Mock Interview chat transcript
   */
  const addChatMessage = (message) => {
    setChatTranscript(prev => [...prev, {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString()
    }]);
  };

  /**
   * Moves to the next question or appends a follow-up question in mock mode
   */
  const advanceToNext = (nextQuestionObj = null) => {
    if (nextQuestionObj) {
      // Add dynamically generated follow-up to questions array
      setQuestions(prev => [...prev, nextQuestionObj]);
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  /**
   * Marks the current question as skipped and records a skipped result
   */
  const skipCurrentQuestion = (currentQuestion) => {
    const skippedRecord = {
      questionId: currentQuestion.id || `q_${currentIndex + 1}`,
      question: currentQuestion.question,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      type: currentQuestion.type,
      answer: '',
      skipped: true,
      scores: {
        technicalAccuracy: 0,
        relevance: 0,
        completeness: 0,
        clarity: 0
      },
      overall: 0,
      feedback: 'Question was skipped by candidate.',
      strengths: [],
      improvements: ['Attempt answering even with partial knowledge or clarifying assumptions.'],
      idealAnswer: ''
    };

    recordResult(skippedRecord);

    if (config.mode === 'mock') {
      addChatMessage({
        sender: 'candidate',
        text: 'I would like to skip this question.'
      });
    }

    advanceToNext();
  };

  /**
   * Concludes the interview
   */
  const finishInterview = () => {
    setStatus('completed');
    clearActiveSession();
    setSavedSessionAvailable(false);
  };

  /**
   * Resets all interview state back to idle
   */
  const resetInterview = () => {
    setStatus('idle');
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    setChatTranscript([]);
    setActiveInterviewId(null);
    setTimerSeconds(0);
    setFinalReport(null);
    clearActiveSession();
    setSavedSessionAvailable(false);
  };

  return (
    <InterviewContext.Provider
      value={{
        config,
        setConfig,
        resumeData,
        setResumeData,
        questions,
        setQuestions,
        currentIndex,
        setCurrentIndex,
        results,
        setResults,
        chatTranscript,
        addChatMessage,
        activeInterviewId,
        status,
        setStatus,
        timerSeconds,
        finalReport,
        setFinalReport,
        savedSessionAvailable,
        startInterview,
        resumeActiveSession,
        discardActiveSession,
        recordResult,
        advanceToNext,
        skipCurrentQuestion,
        finishInterview,
        resetInterview
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
