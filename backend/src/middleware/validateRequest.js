// src/middleware/validateRequest.js
import { ValidationError } from '../errors/AppError.js';
import { ZodSchema } from 'zod';

/**
 * Express middleware to validate request body or query using a Zod schema.
 * Throws ValidationError on failure, which is caught by the central error handler.
 */
export function validateRequest(schema, options = { source: 'body', allowUnknown: false }) {
  return (req, res, next) => {
    try {
      let data;
      if (options.source === 'query') {
        data = req.query;
      } else if (options.source === 'params') {
        data = req.params;
      } else {
        data = req.body;
      }

      const result = schema.safeParse(data);
      if (!result.success) {
        const messages = result.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        throw new ValidationError(messages);
      }

      if (options.source === 'query') {
        req.validatedQuery = result.data;
      } else if (options.source === 'params') {
        req.validatedParams = result.data;
      } else {
        req.validatedBody = result.data;
      }
      next();
    } catch (err) {
      next(err);
      
    }
  };
}
