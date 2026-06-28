// src/middleware/errorHandler.js
import { AppError } from '../errors/AppError.js';

/**
 * Express error handling middleware.
 * Formats errors into the standard JSON shape and includes the requestId.
 */
export default function errorHandler(err, req, res, next) {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Internal server error');
  const response = {
    success: false,
    error: error.message,
    code: error.statusCode,
    requestId: req.id || null,
  };
  console.error(`[${new Date().toISOString()}] Error:`, error);
  res.status(error.statusCode).json(response);
}
