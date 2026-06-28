// src/lib/authMiddleware.js
// Firebase ID token verification middleware.
// Uses the centralized Firebase Admin SDK instance.

import admin from './firebaseAdmin.js';

/**
 * Express authentication middleware.
 * Verifies Firebase ID token and attaches the decoded user to req.user.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing Authorization header', code: 401 });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // { uid, email, ... }
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ success: false, error: 'Invalid ID token', code: 401 });
  }
};
