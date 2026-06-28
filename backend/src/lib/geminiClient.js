// src/lib/geminiClient.js
// Gemini client using @google/genai SDK with Application Default Credentials.
// Model: gemini-3.5-flash (hardcoded per spec — older models are shut down).

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
if (!MODEL) throw new Error('GEMINI_MODEL is required');

/**
 * Generate a text response from Gemini.
 * @param {string} prompt - The user prompt.
 * @returns {Promise<string>} Generated text.
 */
export async function generateGemini(prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text ?? '';
}

/**
 * Call Gemini with optional structured (JSON) output.
 * @param {string} prompt - The user prompt.
 * @param {object} options - { structured: boolean }
 * @returns {Promise<string|object>} Text or parsed JSON.
 */
export async function callGemini(prompt, options = {}) {
  const config = {};
  if (options.structured) {
    config.responseMimeType = 'application/json';
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config,
  });

  const text = response.text ?? '';

  if (options.structured) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}
