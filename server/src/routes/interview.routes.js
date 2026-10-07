import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { uploadResumeMiddleware } from '../middleware/upload.js';
import {
  generateQuestions,
  evaluateAnswer,
  getFollowup,
  generateReport,
  parseResume,
  healthCheck,
  healthCheckAI,
  idealAnswer
} from '../controllers/interview.controller.js';

const router = Router();

// Zod schemas for request validation

const experienceLevelSchema = z.enum(
  ['Intern', 'Fresher', 'Junior', 'Mid', 'Senior', 'Experienced'],
  {
    errorMap: () => ({ message: 'experienceLevel must be one of: Intern, Fresher, Junior, Mid, Senior' })
  }
);

const generateQuestionsSchema = z.object({
  role: z.string().trim().min(1, 'Role is required').max(200, 'Role must not exceed 200 characters'),
  experienceLevel: experienceLevelSchema.default('Fresher'),
  interviewType: z.enum(['Technical', 'HR', 'Behavioral', 'Coding', 'AI/ML', 'Mixed'], {
    errorMap: () => ({ message: 'interviewType must be one of: Technical, HR, Behavioral, Coding, AI/ML, Mixed' })
  }),
  topics: z.array(z.string().trim().max(100)).max(30).default([]),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed'], {
    errorMap: () => ({ message: 'difficulty must be one of: Easy, Medium, Hard, Mixed' })
  }),
  count: z.number().int().min(1, 'Count must be at least 1').max(15, 'Count cannot exceed 15').default(10),
  resumeData: z.record(z.any()).optional()
});

const evaluateAnswerSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(2000, 'Question must not exceed 2000 characters'),
  answer: z.string().trim().min(30, 'Answer must be between 30 and 5000 characters').max(5000, 'Answer must be between 30 and 5000 characters'),
  role: z.string().trim().min(1, 'Role is required').max(200, 'Role must not exceed 200 characters'),
  difficulty: z.string().trim().min(1, 'Difficulty is required').max(50),
  experienceLevel: experienceLevelSchema.optional().default('Mid')
});

const idealAnswerSchema = z.object({
  question: z.string().trim().min(5, 'Question must be at least 5 characters').max(1500, 'Question must not exceed 1500 characters'),
  topic: z.string().max(80, 'Topic must not exceed 80 characters').optional(),
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(60, 'Role must not exceed 60 characters'),
  experienceLevel: experienceLevelSchema,
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed'], {
    errorMap: () => ({ message: 'difficulty must be one of: Easy, Medium, Hard, Mixed' })
  })
});


const followupSchema = z.object({
  role: z.string().trim().min(1, 'Role is required').max(200),
  interviewType: z.string().trim().min(1, 'Interview type is required').max(50),
  difficulty: z.string().trim().min(1, 'Difficulty is required').max(50),
  experienceLevel: experienceLevelSchema.optional().default('Mid'),
  history: z.array(
    z.object({
      question: z.string().trim().min(1).max(2000),
      answer: z.string().trim().max(5000).default(''),
      overall: z.number().min(0).max(10).optional()
    })
  ).min(1, 'History must contain at least one question-answer turn').max(30)
});

const reportSchema = z.object({
  role: z.string().trim().min(1, 'Role is required').max(200),
  interviewType: z.string().trim().min(1, 'Interview type is required').max(50),
  difficulty: z.string().trim().min(1, 'Difficulty is required').max(50),
  experienceLevel: experienceLevelSchema.optional().default('Mid'),
  results: z.array(
    z.object({
      question: z.string().trim().min(1).max(2000),
      topic: z.string().trim().max(200).optional(),
      answer: z.string().trim().max(5000).optional().default(''),
      skipped: z.boolean().optional().default(false),
      scores: z.object({
        technicalAccuracy: z.number().min(0).max(10).optional(),
        relevance: z.number().min(0).max(10).optional(),
        completeness: z.number().min(0).max(10).optional(),
        clarity: z.number().min(0).max(10).optional()
      }).optional(),
      overall: z.number().min(0).max(10).optional()
    })
  ).min(1, 'Results must contain at least one question record').max(50)
});

// Endpoint Routes
router.get('/health', healthCheck);
router.get('/health/ai', healthCheckAI);
router.post('/questions/generate', validateBody(generateQuestionsSchema), generateQuestions);
router.post('/answer/evaluate', validateBody(evaluateAnswerSchema), evaluateAnswer);
router.post('/answer/ideal', validateBody(idealAnswerSchema), idealAnswer);
router.post('/interview/followup', validateBody(followupSchema), getFollowup);
router.post('/interview/report', validateBody(reportSchema), generateReport);
router.post('/resume/parse', uploadResumeMiddleware, parseResume);

export default router;
