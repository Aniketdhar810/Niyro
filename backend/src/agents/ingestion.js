// src/agents/ingestion.js
// Ingestion Agent: ingestMessage(uid, source, rawContent)
// Extracts task fields via Gemini, writes to users/{uid}/tasks,
// embeds title+description, stores only sourceRef (not raw content).

import { db } from '../lib/firestoreClient.js';
import { FieldValue } from 'firebase-admin/firestore';
import { callGemini } from '../lib/geminiClient.js';
import { getEmbedding } from '../lib/vertexEmbeddingClient.js';
import { logActivity } from '../lib/activityLogger.js';

/**
 * Ingest a raw message from a source channel.
 * @param {string} uid - Firebase UID of the message owner.
 * @param {'gmail'|'telegram'|'slack'|'voice'|'manual'} source - Channel source.
 * @param {string} rawContent - Raw message text to extract task from.
 * @param {string} [sourceRef] - Reference ID (e.g., message ID) — never the raw body.
 * @returns {Promise<string|null>} Created task ID, or null if no task detected.
 */
export async function ingestMessage(uid, source, rawContent, sourceRef = null) {
  // Extract task fields via Gemini structured output.
  const prompt = `Extract the following fields from the message and return a JSON object with keys:
- title (string, required)
- description (string or null)
- dueAt (ISO-8601 datetime string or null)
- estimatedMinutes (integer or null)

If this message does not describe an actionable task, return {"title": null}.

Message: """${rawContent}"""`;

  const extraction = await callGemini(prompt, { structured: true });

  // If Gemini couldn't find a task, abort.
  if (!extraction || !extraction.title) {
    return null;
  }

  const { title, description = '', dueAt = null, estimatedMinutes = null } = extraction;

  // Embed title + description for vector similarity search.
  let embedding = null;
  try {
    const textToEmbed = `${title} ${description || ''}`.trim();
    embedding = await getEmbedding(textToEmbed);
  } catch (e) {
    console.error('Embedding failed during ingestion, storing task without vector:', e.message);
  }

  const task = {
    source,
    sourceRef,
    title,
    description: description || '',
    dueAt,
    estimatedMinutes,
    createdAt: new Date().toISOString(),
    status: 'pending',
    riskLevel: 'on_track',
    steps: [],
    ...(embedding ? { embedding: FieldValue.vector(embedding) } : {}),
  };

  const docRef = db.collection('users').doc(uid).collection('tasks').doc();
  await docRef.set(task);
  await logActivity(uid, 'task_created', { taskId: docRef.id, title }, {
    agent: 'ingestion',
    action: 'ingestMessage',
    relatedTaskId: docRef.id,
    undoable: false,
  });

  console.log(`Ingested task ${docRef.id} for user ${uid} from ${source}`);
  return docRef.id;
}
