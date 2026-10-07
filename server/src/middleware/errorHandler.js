export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const code = err.code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' : statusCode === 502 ? 'BAD_GATEWAY' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred';

  // Log server errors in development or non-operational errors
  if (statusCode >= 500) {
    console.error(`[Error] ${code}: ${message}`, err.stack || err);
  }

  res.status(statusCode).json({
    error: {
      message,
      code
    }
  });
};
