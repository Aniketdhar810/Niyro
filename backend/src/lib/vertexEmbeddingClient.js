// src/lib/vertexEmbeddingClient.js
// Embedding client using @google/genai SDK with ADC.
// Model: gemini-embedding-001 (per spec §2).
// One input text per request — never batch.

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
if (!EMBEDDING_MODEL) throw new Error('EMBEDDING_MODEL is required');

/**
 * Retrieve an embedding vector for a given text.
 * @param {string} text - The text to embed (single string, never batched).
 * @returns {Promise<number[]>} Embedding vector.
 */
export async function getEmbedding(text) {
  if (!text) {
    throw new Error('Input text is required for embedding');
  }

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 768,
    },
  });

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error('Failed to retrieve embedding from Gemini response');
  }
  return embedding;
}
