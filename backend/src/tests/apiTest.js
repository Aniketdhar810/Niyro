// src/tests/apiTest.js
import 'dotenv/config';

import { generateGemini, callGemini } from '../lib/geminiClient.js';
import { getEmbedding } from '../lib/vertexEmbeddingClient.js';

async function testGemini() {
  console.log('🔎 Testing Gemini generation (text)...');
  try {
    const response = await generateGemini('What is 2+2? Keep it short.');
    console.log('✅ Gemini text response:', response);
  } catch (e) {
    console.error('❌ Gemini error:', e.message);
  }

  console.log('🔎 Testing Gemini structured output...');
  try {
    const response = await callGemini('Give me a JSON object with {"name": "test"}', { structured: true });
    console.log('✅ Gemini structured response:', response);
  } catch (e) {
    console.error('❌ Gemini structured error:', e.message);
  }
}

async function testEmbedding() {
  console.log('🔎 Testing Gemini embedding...');
  try {
    const vec = await getEmbedding('test embedding text');
    console.log('✅ Embedding vector length:', vec.length);
  } catch (e) {
    console.error('❌ Embedding error:', e.message);
  }
}

(async () => {
  await testGemini();
  await testEmbedding();
  console.log('✅ All Gemini API tests completed');
})();
