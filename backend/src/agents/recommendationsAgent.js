import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { logActivity } from '../lib/activityLogger.js';
import crypto from 'crypto';

/**
 * Collects and computes 30-day task and activity statistics for the user.
 * Wraps everything in try/catch to ensure it never throws.
 */
export async function collectUserStats(uid) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    
    // 1. Fetch user doc
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};
    
    // 2. Fetch tasks
    const tasksSnap = await db.collection('users').doc(uid).collection('tasks')
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();
      
    // 3. Fetch activity feed
    const activitySnap = await db.collection('users').doc(uid).collection('activityFeed')
      .where('timestamp', '>=', thirtyDaysAgo)
      .get();
      
    // Momentum & Estimation from user doc
    const momentum = userData.momentum || {};
    const estimationProfile = userData.estimationProfile || {};
    
    let daysSinceLastCompletion = null;
    if (momentum.lastCompletionDate) {
      daysSinceLastCompletion = Math.floor((Date.now() - new Date(momentum.lastCompletionDate).getTime()) / 86400000);
    }

    const stats = {
      estimationFactor: estimationProfile.globalAdjustmentFactor || 1.0,
      estimationSampleCount: estimationProfile.sampleCount || 0,
      
      streakCount: momentum.streakCount || 0,
      focusScore: momentum.focusScore || 0,
      totalTasksLast30Days: tasksSnap.size,
      completedTasksLast30Days: 0,
      completionRate: 0,
      
      tasksGoneCritical: 0,
      tasksGoneAtRisk: 0,
      tasksCompletedOnTime: 0,
      tasksCompletedLate: 0,
      lastMinuteTriggers: 0,
      
      sourceBreakdown: { gmail: 0, telegram: 0, slack: 0, manual: 0 },
      
      tasksWithSteps: 0,
      tasksWithoutSteps: 0,
      averageStepsPerTask: 0,
      
      mostActiveAgentHour: null,
      daysSinceLastCompletion
    };

    let totalSteps = 0;

    tasksSnap.forEach(doc => {
      const t = doc.data();
      
      // Completion stats
      if (t.status === 'done') {
        stats.completedTasksLast30Days++;
        
        // Timing accuracy (On Time vs Late)
        if (t.actualMinutes && t.estimatedMinutes) {
          if (t.actualMinutes <= t.estimatedMinutes * 1.2) {
            stats.tasksCompletedOnTime++;
          } else {
            stats.tasksCompletedLate++;
          }
        }
      }
      
      // Risk
      if (t.riskLevel === 'critical') stats.tasksGoneCritical++;
      if (t.riskLevel === 'at_risk') stats.tasksGoneAtRisk++;
      
      // Source
      if (t.source && stats.sourceBreakdown[t.source] !== undefined) {
        stats.sourceBreakdown[t.source]++;
      }
      
      // Planning
      if (t.steps && t.steps.length > 0) {
        stats.tasksWithSteps++;
        totalSteps += t.steps.length;
      } else {
        stats.tasksWithoutSteps++;
      }
    });

    if (stats.totalTasksLast30Days > 0) {
      stats.completionRate = (stats.completedTasksLast30Days / stats.totalTasksLast30Days) * 100;
    }
    
    if (stats.tasksWithSteps > 0) {
      stats.averageStepsPerTask = totalSteps / stats.tasksWithSteps;
    }

    // Process activity feed
    const hourCounts = {};
    activitySnap.forEach(doc => {
      const act = doc.data();
      
      if (act.action === 'last_minute') {
        stats.lastMinuteTriggers++;
      }
      
      if (act.timestamp) {
        const h = new Date(act.timestamp).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });
    
    // Find most active hour
    let maxCount = -1;
    for (const [hourStr, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        stats.mostActiveAgentHour = parseInt(hourStr, 10);
      }
    }

    return stats;
  } catch (err) {
    console.error('Error in collectUserStats:', err);
    // Return empty stats object on failure
    return {
      estimationFactor: 1.0, estimationSampleCount: 0, streakCount: 0, focusScore: 0,
      totalTasksLast30Days: 0, completedTasksLast30Days: 0, completionRate: 0,
      tasksGoneCritical: 0, tasksGoneAtRisk: 0, tasksCompletedOnTime: 0, tasksCompletedLate: 0, lastMinuteTriggers: 0,
      sourceBreakdown: { gmail: 0, telegram: 0, slack: 0, manual: 0 },
      tasksWithSteps: 0, tasksWithoutSteps: 0, averageStepsPerTask: 0,
      mostActiveAgentHour: null, daysSinceLastCompletion: null
    };
  }
}

/**
 * Generates personalized recommendations for the user.
 */
export async function generateRecommendations(uid) {
  const stats = await collectUserStats(uid);
  const now = new Date().toISOString();
  
  if (stats.estimationSampleCount < 3 && stats.totalTasksLast30Days < 5) {
    const bootstrap = [{
      id: crypto.randomUUID(),
      type: 'bootstrap',
      priority: 'high',
      title: 'Complete a few tasks to unlock insights',
      body: 'Niyro needs data to personalize recommendations for you. Complete 3-5 tasks and come back.',
      icon: '🌱',
      actionLabel: null,
      actionRoute: null,
      generatedAt: now,
      expiresAt: null,
    }];
    await saveRecommendations(uid, bootstrap, stats, now);
    return bootstrap;
  }

  const prompt = `You are a productivity coach analyzing a user's task management data to
generate personalized, data-driven recommendations. Every recommendation
MUST reference specific numbers from the user's data — never give generic advice.

USER STATS (last 30 days):
Estimation accuracy: ${stats.estimationFactor.toFixed(2)}x
(1.0 = perfect, ${stats.estimationFactor > 1 ? 'they UNDERESTIMATE' : 'they OVERESTIMATE'}
by ${Math.abs((stats.estimationFactor - 1) * 100).toFixed(0)}%,
based on ${stats.estimationSampleCount} completed tasks)
Task completion rate: ${stats.completionRate.toFixed(0)}%
(${stats.completedTasksLast30Days} completed out of ${stats.totalTasksLast30Days} created)
Tasks that went CRITICAL: ${stats.tasksGoneCritical}
Tasks that needed Last-Minute mode: ${stats.lastMinuteTriggers}
Tasks completed ON TIME: ${stats.tasksCompletedOnTime}
Tasks completed LATE: ${stats.tasksCompletedLate}
Current streak: ${stats.streakCount} days
Focus score: ${stats.focusScore}/100
Days since last completion: ${stats.daysSinceLastCompletion !== null ? stats.daysSinceLastCompletion : 'unknown'}
Tasks WITH planning (steps): ${stats.tasksWithSteps}
Tasks WITHOUT planning: ${stats.tasksWithoutSteps}
Most productive hour: ${stats.mostActiveAgentHour !== null ? stats.mostActiveAgentHour + ':00' : 'unknown'}
Task sources: Gmail=${stats.sourceBreakdown.gmail}, Telegram=${stats.sourceBreakdown.telegram}, Manual=${stats.sourceBreakdown.manual}

Generate exactly 3-5 recommendations. Each must be specific to this user's numbers. Prioritize the most impactful issues first.
Return ONLY a JSON array with this exact structure (no markdown, no preamble):
[
  {
    "type": "estimation" | "planning" | "streak" | "risk" | "channel" | "focus" | "timing",
    "priority": "high" | "medium" | "low",
    "title": "Short title under 8 words",
    "body": "2-3 sentences. MUST mention specific numbers from the data. Be direct and actionable.",
    "icon": "single relevant emoji",
    "actionLabel": "Short CTA text (e.g., 'Plan a task now') or null if no action",
    "actionRoute": "/tasks" | "/focus" | "/assistant" | "/settings" | null
  }
]

Rules:
If estimationFactor > 1.3: include an estimation recommendation
If lastMinuteTriggers > 2: include a risk/planning recommendation
If tasksWithoutSteps > tasksWithSteps && totalTasksLast30Days > 5: include a planning recommendation
If daysSinceLastCompletion > 3: include a streak/momentum recommendation
If completionRate < 60: include a focus/workload recommendation
actionRoute must be one of the exact strings listed above or null
Never say "consider" or "try to" — be direct: "Add 40% buffer time to your estimates"`;

  let responseData;
  try {
    responseData = await callGemini(prompt, { structured: true });
  } catch (err) {
    console.error('Gemini error generating recommendations:', err);
    responseData = null;
  }

  let recs = [];
  if (Array.isArray(responseData)) {
    recs = responseData;
  } else if (typeof responseData === 'string') {
    try {
      const cleanJson = responseData.replace(/```json/g, '').replace(/```/g, '').trim();
      recs = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse Gemini recommendations JSON:', e);
    }
  }

  if (!Array.isArray(recs) || recs.length === 0) {
    // Fallback if parsing completely fails
    recs = [{
      id: crypto.randomUUID(),
      type: 'bootstrap',
      priority: 'high',
      title: 'AI Coaching Unavailable',
      body: 'We are currently analyzing your data. Please check back later.',
      icon: '🤖',
      actionLabel: null,
      actionRoute: null,
    }];
  }

  // Hydrate recommendations
  const hydrated = recs.map(r => ({
    ...r,
    id: crypto.randomUUID(),
    generatedAt: now,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
  }));

  await saveRecommendations(uid, hydrated, stats, now);
  
  await logActivity(uid, 'recommendations_generated', { count: hydrated.length }, {
    agent: 'recommendations',
    action: 'generate',
    undoable: false
  });

  return hydrated;
}

async function saveRecommendations(uid, recs, stats, generatedAt) {
  const collectionRef = db.collection('users').doc(uid).collection('recommendations');
  
  // Delete old recommendations (excluding _meta)
  const oldSnap = await collectionRef.get();
  const batch = db.batch();
  
  oldSnap.forEach(doc => {
    if (doc.id !== '_meta') {
      batch.delete(doc.ref);
    }
  });
  
  // Add new recommendations
  recs.forEach(rec => {
    batch.set(collectionRef.doc(rec.id), rec);
  });
  
  // Update meta
  batch.set(collectionRef.doc('_meta'), {
    generatedAt,
    statsSnapshot: stats
  });
  
  await batch.commit();
}
