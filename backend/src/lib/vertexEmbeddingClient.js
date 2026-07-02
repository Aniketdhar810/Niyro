// src/lib/vertexEmbeddingClient.js
// Embedding client using @google/genai SDK with ADC.
// Model: gemini-embedding-001 (per spec §2).
// One input text per request — never batch.

import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is missing');
    aiInstance = new GoogleGenAI({
      apiKey,
    });
  }
  return aiInstance;
}

const getModel = () => process.env.EMBEDDING_MODEL || 'gemini-embedding-001';

/**
 * Retrieve an embedding vector for a given text.
 * @param {string} text - The text to embed (single string, never batched).
 * @returns {Promise<number[]>} Embedding vector.
 */
export async function getEmbedding(text) {
  if (!text) {
    throw new Error('Input text is required for embedding');
  }

  const response = await getAi().models.embedContent({
    model: getModel(),
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
