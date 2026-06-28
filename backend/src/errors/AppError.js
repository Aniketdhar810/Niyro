// src/errors/AppError.js
export class AppError extends Error {
  /**
   * @param {string} message Human‑readable error message
   * @param {number} statusCode HTTP status code to return
   * @param {string} code Optional machine‑readable error code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request data') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class GeminiError extends AppError {
  constructor(message = 'Gemini service error') {
    super(message, 502, 'GEMINI_ERROR');
  }
}

export class GoogleOAuthError extends AppError {
  constructor(message = 'Google OAuth error') {
    super(message, 502, 'GOOGLE_OAUTH_ERROR');
  }
}

export class FirestoreError extends AppError {
  constructor(message = 'Firestore operation failed') {
    super(message, 502, 'FIRESTORE_ERROR');
  }
}
