// src/lib/firestoreClient.js
// Exports the Firestore `db` instance. Nothing else.
// All modules that need Firestore import { db } from here.

import admin from './firebaseAdmin.js';

export const db = admin.apps.length ? admin.app().firestore() : null;

if (!db) {
  console.error('Firestore client unavailable — Firebase Admin SDK not initialized.');
}
