// src/middleware/requestId.js
// Generates a unique request ID for each incoming HTTP request.
// This ID is attached to req.id and can be used by logging and error handling.
import { randomUUID } from 'crypto';

export default function requestId(req, res, next) {
  req.id = randomUUID();
  next();
}
