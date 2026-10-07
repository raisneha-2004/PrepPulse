import axios from 'axios';

// Resolve baseURL ensuring consistent /api prefix without double-slashing
const rawEnvUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const baseURL = rawEnvUrl.endsWith('/api') ? rawEnvUrl : `${rawEnvUrl}/api`;

export const apiClient = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout for AI generation
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to extract clean error message with detailed classification
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Log the real underlying error in browser console for developer debugging
    console.error('[API Client Error]:', error);

    let message = 'An unexpected error occurred. Please try again.';
    let code = 'UNKNOWN_ERROR';
    const status = error.response?.status;
    const serverData = error.response?.data;
    const serverError = serverData?.error || serverData;

    if (!error.response) {
      // (a) No response from backend (backend server down or offline)
      message = 'Cannot connect to backend server. Please verify the server is running.';
      code = 'NETWORK_ERROR';
    } else if (status === 400 || status === 422) {
      // (b) 400/422 validation errors: show the server's message directly
      if (typeof serverError === 'string') {
        message = serverError;
      } else if (serverError?.message) {
        message = serverError.message;
      } else {
        message = 'Invalid request. Please verify your interview inputs.';
      }
      code = serverError?.code || 'VALIDATION_ERROR';
    } else if (status === 429) {
      // Rate limit error
      message = serverError?.message || 'Rate limit exceeded. Please wait a minute before sending more requests.';
      code = 'RATE_LIMIT_EXCEEDED';
    } else if (status >= 500) {
      // (c) 5xx / AI errors
      if (serverError?.code === 'CONFIG_ERROR') {
        message = serverError.message || 'Server configuration error: GEMINI_API_KEY is missing in backend .env';
        code = 'CONFIG_ERROR';
      } else if (serverError?.code === 'BAD_GATEWAY' || serverError?.code === 'AI_ERROR') {
        message = 'AI service error, please retry.';
        code = 'AI_ERROR';
      } else {
        message = serverError?.message || 'AI service error, please retry.';
        code = serverError?.code || 'SERVER_ERROR';
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. The AI model is taking longer than usual.';
      code = 'TIMEOUT';
    } else if (serverError?.message) {
      message = serverError.message;
      code = serverError.code || code;
    }

    const customError = new Error(message);
    customError.code = code;
    customError.status = status;
    customError.originalError = error;
    return Promise.reject(customError);
  }
);

/**
 * Health check endpoint
 */
export const checkHealth = async () => {
  return apiClient.get('/health');
};

/**
 * Generates interview questions
 * @param {Object} payload
 */
export const generateQuestions = async (payload) => {
  return apiClient.post('/questions/generate', payload);
};

/**
 * Evaluates candidate's answer
 * @param {Object} payload
 */
export const evaluateAnswer = async (payload) => {
  return apiClient.post('/answer/evaluate', payload);
};

/**
 * Gets ideal answer for a skipped question
 * @param {Object} payload
 */
export const getIdealAnswer = async (payload) => {
  return apiClient.post('/answer/ideal', payload);
};

/**
 * Gets conversational follow-up question
 * @param {Object} payload
 */
export const getFollowup = async (payload) => {
  return apiClient.post('/interview/followup', payload);
};

/**
 * Generates final performance report
 * @param {Object} payload
 */
export const generateReport = async (payload) => {
  return apiClient.post('/interview/report', payload);
};

/**
 * Parses uploaded PDF resume
 * @param {File} file 
 */
export const parseResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  return apiClient.post('/resume/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
