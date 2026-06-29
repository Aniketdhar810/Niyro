import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { logActivity } from '../lib/activityLogger.js';
import crypto from 'crypto';
import { format, parseISO, subDays } from 'date-fns';

/**
 * Runs pattern extraction on the user's recent tasks and habits.
 */
export async function extractPatterns(uid) {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    
    // Fetch completed tasks
    const tasksSnap = await db.collection('users').doc(uid).collection('tasks')
      .where('status', '==', 'done')
      .where('completedAt', '>=', thirtyDaysAgo)
      .get();
      
    // Fetch completed habits
    const habitsSnap = await db.collection('users').doc(uid).collection('habits')
      .get(); // Filter locally for recent activity

    // Build the raw log
    let rawLog = [];

    tasksSnap.forEach(doc => {
      const t = doc.data();
      const completedAt = t.completedAt ? parseISO(t.completedAt) : null;
      if (!completedAt) return;
      
      const dayOfWeek = format(completedAt, 'EEEE');
      const timeOfDay = format(completedAt, 'HH:mm');
      
      let timingStatus = 'On-Time';
      if (t.dueAt && new Date(t.completedAt) > new Date(t.dueAt)) {
        timingStatus = 'Late';
      }
      
      rawLog.push(`[Task] "${t.title}" | Completed: ${dayOfWeek} at ${timeOfDay} | Status: ${timingStatus}`);
    });

    habitsSnap.forEach(doc => {
      const h = doc.data();
      if (!h.lastCompletedDate) return;
      const completedAt = parseISO(h.lastCompletedDate);
      if (completedAt > subDays(new Date(), 30)) {
        const dayOfWeek = format(completedAt, 'EEEE');
        const timeOfDay = format(completedAt, 'HH:mm');
        rawLog.push(`[Habit] "${h.title}" | Completed: ${dayOfWeek} at ${timeOfDay} | Streak: ${h.streak}`);
      }
    });

    if (rawLog.length < 5) {
      return []; // Not enough data to find meaningful patterns
    }

    // Cap the log length to save tokens
    if (rawLog.length > 200) {
      rawLog = rawLog.slice(-200);
    }

    const logString = rawLog.join('\n');

    const prompt = `You are Niyro's AI Memory Engine. Analyze the following raw log of a user's completed tasks and habits over the last 30 days.

RAW LOG:
${logString}

Your goal is to extract deep semantic behavioral patterns. Do NOT just summarize the data. Find correlations between the MEANING of the task/habit (e.g., Gym, Coding, Emails, Reading), the DAY OF THE WEEK, and the TIME OF DAY.

Examples of good patterns:
- "You always finish coding tasks before lunch. Schedule coding between 9–12."
- "Gym completion drops on Fridays. Move gym to Thursday evening."
- "Email tasks are often completed late when scheduled after 5 PM."

Generate 1 to 3 distinct patterns.
Return ONLY a JSON array with this exact structure (no markdown, no preamble):
[
  {
    "observation": "What you observed (e.g., Gym completion drops on Fridays)",
    "actionableRule": "What the user should do (e.g., Move gym to Thursday evening)"
  }
]`;

    let responseData = await callGemini(prompt, { structured: true });
    
    let patterns = [];
    if (Array.isArray(responseData)) {
      patterns = responseData;
    } else if (typeof responseData === 'string') {
      try {
        const cleanJson = responseData.replace(/```json/g, '').replace(/```/g, '').trim();
        patterns = JSON.parse(cleanJson);
      } catch (e) {
        console.error('Failed to parse Gemini memory JSON:', e);
      }
    }

    // Hydrate and save
    const now = new Date().toISOString();
    const hydratedPatterns = patterns.map(p => ({
      id: crypto.randomUUID(),
      observation: p.observation,
      actionableRule: p.actionableRule,
      generatedAt: now,
    }));

    await saveMemoryPatterns(uid, hydratedPatterns);

    await logActivity(uid, 'memory_extracted', { count: hydratedPatterns.length }, {
      agent: 'memory',
      action: 'extract',
      undoable: false
    });

    return hydratedPatterns;
  } catch (err) {
    console.error('Error in extractPatterns:', err);
    return [];
  }
}

async function saveMemoryPatterns(uid, patterns) {
  const collectionRef = db.collection('users').doc(uid).collection('aiMemory');
  
  // Wipe old patterns
  const oldSnap = await collectionRef.get();
  const batch = db.batch();
  oldSnap.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Save new
  patterns.forEach(p => {
    batch.set(collectionRef.doc(p.id), p);
  });
  
  await batch.commit();
}
