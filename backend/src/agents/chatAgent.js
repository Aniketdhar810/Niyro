// src/agents/chatAgent.js
// Chat Agent: Conversational AI that knows the user's tasks.
// Handles general Q&A and semantic search for tasks via vector embeddings.

import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { getEmbedding } from '../lib/vertexEmbeddingClient.js';



/**
 * Handle a chat message from the user, retrieving relevant context.
 * @param {string} uid - Firebase UID.
 * @param {string} message - User's message.
 * @returns {Promise<string>} Agent response.
 */
export async function chat(uid, message) {
  if (!uid || !message) throw new Error('uid and message are required');

  let relevantTasksContext = '';
  let citedTaskIds = [];

  try {
    // 1. Embed the user's message
    const queryEmbedding = await getEmbedding(message);

    // 2. Fetch all tasks with embeddings for this user
    const vectorQuery = db.collection('users').doc(uid).collection('tasks')
      .findNearest('embedding', queryEmbedding, {
        limit: 5,
        distanceMeasure: 'COSINE'
      });
    
    const snap = await vectorQuery.get();
    const scoredTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (scoredTasks.length > 0) {
      citedTaskIds = scoredTasks.map(t => t.id);
      relevantTasksContext = 'Relevant tasks:\n' + scoredTasks.map(t =>
        `- ${t.title} (Status: ${t.status}, Due: ${t.dueAt || 'none'})`
      ).join('\n');
    }
  } catch (e) {
    console.warn('Vector search failed during chat, proceeding without context:', e.message);
  }

  // 3. Generate response
  const prompt = `You are Niyro, an AI productivity assistant.
The user sent a message. Be helpful, concise, and professional.

Context (if any):
${relevantTasksContext}

User Message: "${message}"`;

  const response = await callGemini(prompt);
  return { reply: response, citedTaskIds };
}
