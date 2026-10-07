import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import interviewRoutes from './routes/interview.routes.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

const app = express();

// Enable Trust Proxy for accurate IP resolution behind proxies/load balancers
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = Array.from(new Set([
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean)));

const corsOptions = {
  origin: config.clientUrl === '*' ? '*' : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// JSON Body Parser with 1MB payload limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiter: 30 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP. Please try again after a minute.', 429, 'RATE_LIMIT_EXCEEDED'));
  }
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api', interviewRoutes);

// Catch-all 404 handler for undefined routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
});

// Central Error Handler
app.use(errorHandler);

// Start server when executed directly
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('index.js') || 
  process.argv[1].endsWith('index')
);

if (isDirectRun || process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 AI Interview Prep Assistant Server running on http://localhost:${config.port}`);
    console.log(`📡 Gemini Model configured: ${config.geminiModel}`);
    console.log(`🔒 CORS Origin configured: ${config.clientUrl}`);
    console.log(`⏱️ Rate limit: ${config.rateLimitMax} req / ${config.rateLimitWindowMs / 1000}s`);
  });
}

export default app;
