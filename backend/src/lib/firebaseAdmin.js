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
    console.log('FIREBASE_ADMIN_CREDENTIALS not set, using Application Default Credentials.');
    try {
      admin.initializeApp({
        projectId: process.env.GOOGLE_CLOUD_PROJECT || 'niyro-e3ddb'
      });
    } catch (e) {
      console.error('Failed to initialize Firebase Admin with ADC:', e);
    }
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
