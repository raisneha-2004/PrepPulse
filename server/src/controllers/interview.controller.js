import { geminiService } from '../services/gemini.service.js';
import { resumeService } from '../services/resume.service.js';
import { buildQuestionPrompt } from '../prompts/questionPrompt.js';
import { buildEvaluatePrompt } from '../prompts/evaluatePrompt.js';
import { buildFollowupPrompt } from '../prompts/followupPrompt.js';
import { buildReportPrompt } from '../prompts/reportPrompt.js';
import { idealPrompt } from '../prompts/idealPrompt.js';

/**
 * Normalizes experienceLevel values and maps backward-compatible 'Experienced' to 'Mid'
 * @param {string} level
 * @returns {"Intern"|"Fresher"|"Junior"|"Mid"|"Senior"}
 */
export const normalizeExperienceLevel = (level) => {
  if (!level) return 'Fresher';
  const trimmed = String(level).trim();
  if (trimmed === 'Experienced') return 'Mid';
  if (['Intern', 'Fresher', 'Junior', 'Mid', 'Senior'].includes(trimmed)) {
    return trimmed;
  }
  return 'Mid';
};

/**
 * Calculates weighted overall score (0 - 10) rounded to 1 decimal place
 * @param {Object} scores
 * @returns {number}
 */
const calculateOverallScore = (scores = {}) => {
  const tech = Math.min(10, Math.max(0, Number(scores.technicalAccuracy) || 0));
  const relevance = Math.min(10, Math.max(0, Number(scores.relevance) || 0));
  const completeness = Math.min(10, Math.max(0, Number(scores.completeness) || 0));
  const clarity = Math.min(10, Math.max(0, Number(scores.clarity) || 0));

  // Weighted formula: Technical 35%, Relevance 25%, Completeness 20%, Clarity 20%
  const weighted = (tech * 0.35) + (relevance * 0.25) + (completeness * 0.20) + (clarity * 0.20);
  return Math.round(weighted * 10) / 10;
};

/**
 * Controller for generating interview questions
 */
export const generateQuestions = async (req, res, next) => {
  try {
    const {
      role,
      experienceLevel = 'Fresher',
      interviewType,
      topics = [],
      difficulty,
      count = 10,
      resumeData
    } = req.body;

    const normalizedLevel = normalizeExperienceLevel(experienceLevel);

    const prompt = buildQuestionPrompt({
      role,
      experienceLevel: normalizedLevel,
      interviewType,
      topics,
      difficulty,
      count,
      resumeData
    });

    const aiResponse = await geminiService.generateJSON(prompt);

    const questions = (aiResponse.questions || []).map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      question: q.question || '',
      topic: q.topic || (topics[0] || 'General'),
      difficulty: q.difficulty || difficulty,
      type: q.type || interviewType
    }));

    res.json({ questions });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for evaluating candidate answers
 */
export const evaluateAnswer = async (req, res, next) => {
  try {
    const {
      question,
      answer = '',
      role,
      difficulty,
      experienceLevel = 'Mid'
    } = req.body;

    const normalizedLevel = normalizeExperienceLevel(experienceLevel);

    const prompt = buildEvaluatePrompt({
      question,
      answer,
      role,
      difficulty,
      experienceLevel: normalizedLevel
    });

    const aiResponse = await geminiService.generateJSON(prompt);

    const rawScores = aiResponse.scores || {};
    const scores = {
      technicalAccuracy: Math.min(10, Math.max(0, Number(rawScores.technicalAccuracy) || 0)),
      relevance: Math.min(10, Math.max(0, Number(rawScores.relevance) || 0)),
      completeness: Math.min(10, Math.max(0, Number(rawScores.completeness) || 0)),
      clarity: Math.min(10, Math.max(0, Number(rawScores.clarity) || 0))
    };

    // Server-computed weighted average score (1 decimal place)
    const overall = calculateOverallScore(scores);

    res.json({
      scores,
      overall,
      feedback: aiResponse.feedback || 'Answer evaluated.',
      strengths: Array.isArray(aiResponse.strengths) ? aiResponse.strengths : [],
      improvements: Array.isArray(aiResponse.improvements) ? aiResponse.improvements : [],
      idealAnswer: aiResponse.idealAnswer || ''
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for generating ideal answer for a skipped question
 */
export const idealAnswer = async (req, res, next) => {
  try {
    const {
      question,
      topic = '',
      role,
      difficulty,
      experienceLevel = 'Mid'
    } = req.body;

    const normalizedLevel = normalizeExperienceLevel(experienceLevel);

    const prompt = idealPrompt({
      question,
      topic,
      role,
      difficulty,
      experienceLevel: normalizedLevel
    });

    const aiResponse = await geminiService.generateJSON(prompt);

    if (
      !aiResponse.idealAnswer ||
      typeof aiResponse.idealAnswer !== 'string' ||
      !Array.isArray(aiResponse.keyPoints)
    ) {
      return res.status(500).json({
        status: 'error',
        message: 'Invalid response format from AI service'
      });
    }

    res.json({
      idealAnswer: aiResponse.idealAnswer,
      keyPoints: aiResponse.keyPoints,
      example: aiResponse.example || ''
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for conversational follow-up questions
 */
export const getFollowup = async (req, res, next) => {
  try {
    const {
      role,
      interviewType,
      difficulty,
      experienceLevel = 'Mid',
      history = []
    } = req.body;

    const normalizedLevel = normalizeExperienceLevel(experienceLevel);

    const prompt = buildFollowupPrompt({
      role,
      interviewType,
      difficulty,
      experienceLevel: normalizedLevel,
      history
    });

    const aiResponse = await geminiService.generateJSON(prompt);

    res.json({
      reaction: aiResponse.reaction || 'Understood. Moving to the next question.',
      question: aiResponse.question || 'Could you elaborate further on this topic?',
      topic: aiResponse.topic || 'Follow-up'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for generating comprehensive performance reports
 */
export const generateReport = async (req, res, next) => {
  try {
    const {
      role,
      interviewType,
      difficulty,
      experienceLevel = 'Mid',
      results = []
    } = req.body;

    const normalizedLevel = normalizeExperienceLevel(experienceLevel);

    const total = results.length;
    const skipped = results.filter(r => r.skipped === true).length;
    const answered = total - skipped;

    // Calculate server-side percentage metrics
    let technicalSum = 0;
    let claritySum = 0;
    let relevanceSum = 0;
    let completenessSum = 0;
    let overallSum = 0;

    results.forEach(r => {
      if (!r.skipped && r.scores) {
        technicalSum += (Number(r.scores.technicalAccuracy) || 0) * 10;
        claritySum += (Number(r.scores.clarity) || 0) * 10;
        relevanceSum += (Number(r.scores.relevance) || 0) * 10;
        completenessSum += (Number(r.scores.completeness) || 0) * 10;
        overallSum += (typeof r.overall === 'number' ? r.overall : calculateOverallScore(r.scores)) * 10;
      }
    });

    const divisor = answered > 0 ? answered : 1;

    const breakdown = {
      technical: answered > 0 ? Math.round(technicalSum / divisor) : 0,
      communication: answered > 0 ? Math.round(claritySum / divisor) : 0,
      accuracy: answered > 0 ? Math.round(relevanceSum / divisor) : 0,
      completeness: answered > 0 ? Math.round(completenessSum / divisor) : 0
    };

    const overallPercent = answered > 0 ? Math.round(overallSum / divisor) : 0;
    const stats = { total, answered, skipped };

    // Request qualitative analysis and recommendations from AI
    const prompt = buildReportPrompt({
      role,
      interviewType,
      difficulty,
      experienceLevel: normalizedLevel,
      results,
      stats,
      breakdown
    });

    const aiResponse = await geminiService.generateJSON(prompt);

    res.json({
      overallPercent,
      breakdown,
      stats,
      strongAreas: Array.isArray(aiResponse.strongAreas) ? aiResponse.strongAreas : [],
      weakAreas: Array.isArray(aiResponse.weakAreas) ? aiResponse.weakAreas : [],
      recommendedTopics: Array.isArray(aiResponse.recommendedTopics) ? aiResponse.recommendedTopics : [],
      summary: aiResponse.summary || 'Interview completed.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for PDF resume parsing
 */
export const parseResume = async (req, res, next) => {
  try {
    const resumeData = await resumeService.parseResume(req.file.buffer);
    res.json(resumeData);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for health check
 */
export const healthCheck = (req, res) => {
  res.json({ status: 'ok' });
};

/**
 * Controller for AI health check
 */
export const healthCheckAI = async (req, res, next) => {
  try {
    const prompt = 'Return the exact following JSON: { "ai": "ok" }';
    const response = await geminiService.generateJSON(prompt);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
