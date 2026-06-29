// src/lib/geminiClient.js
// Gemini client using @google/genai SDK with Application Default Credentials.

import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

function getAi() {
  if (!aiInstance) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) throw new Error('GOOGLE_CLOUD_PROJECT environment variable is missing');
    aiInstance = new GoogleGenAI({
      vertexai: true,
      project,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'asia-southeast1',
    });
  }
  return aiInstance;
}

const getModel = () => process.env.GEMINI_MODEL || 'gemini-3.5-flash';

/**
 * Generate a text response from Gemini.
 * @param {string} prompt - The user prompt.
 * @returns {Promise<string>} Generated text.
 */
export async function generateGemini(prompt) {
  const response = await getAi().models.generateContent({
    model: getModel(),
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

  const response = await getAi().models.generateContent({
    model: getModel(),
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
