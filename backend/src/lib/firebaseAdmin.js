// src/lib/firebaseAdmin.js
// Single centralized Firebase Admin SDK initialization.
// Every module that needs `admin` should import from here.

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!serviceAccountPath) {
    console.error('FIREBASE_ADMIN_CREDENTIALS environment variable is not set.');
    // Don't exit — let individual callers handle the missing SDK gracefully.
  } else {
    try {
      const resolvedPath = resolve(__dirname, '..', serviceAccountPath);
      const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to initialize Firebase Admin SDK:', e);
    }
  }
}

export default admin;
