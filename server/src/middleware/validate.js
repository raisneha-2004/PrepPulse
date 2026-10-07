import { AppError } from './errorHandler.js';

/**
 * Express middleware to validate request body using Zod schema
 * @param {import('zod').ZodSchema} schema 
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.errors.map(err => {
        const field = err.path.join('.');
        return field ? `${field}: ${err.message}` : err.message;
      });
      const message = `Validation error: ${issues.join('; ')}`;
      return next(new AppError(message, 400, 'VALIDATION_ERROR'));
    }
    // Set sanitized/parsed data back to req.body
    req.body = result.data;
    next();
  };
};
