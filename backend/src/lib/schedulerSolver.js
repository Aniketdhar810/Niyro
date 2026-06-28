// src/lib/schedulerSolver.js
// Scheduler constraint solver — computes earliest free slot for task steps.
// Uses the calendarClient free-busy API against the user's actual calendar.
// All times are ISO strings. Respects workHours from the user document.

import { queryFreeBusy } from './calendarClient.js';
import { db } from './firestoreClient.js';

/**
 * Find the first free slot of a given duration for a user within a window,
 * respecting their workHours setting.
 * @param {string} uid - Firebase UID.
 * @param {Date} windowStart - Start of search window.
 * @param {Date} windowEnd - End of search window.
 * @param {number} durationMinutes - Required slot duration in minutes.
 * @param {object} [workHours] - { start: number, end: number, timezone: string }
 * @returns {Promise<Date|null>} Start of the first free slot, or null.
 */
async function findFirstFreeSlot(uid, windowStart, windowEnd, durationMinutes = 15, workHours = null) {
  const freebusy = await queryFreeBusy(uid, windowStart.toISOString(), windowEnd.toISOString());
  const busy = freebusy.calendars?.primary?.busy ?? [];
  const slotMs = durationMinutes * 60 * 1000;

  // Build a set of occupied time blocks (quantized to slot-sized chunks).
  const occupied = new Set();
  busy.forEach((interval) => {
    const start = new Date(interval.start).getTime();
    const end = new Date(interval.end).getTime();
    for (let t = start; t < end; t += slotMs) {
      occupied.add(Math.floor(t / slotMs));
    }
  });

  for (let t = windowStart.getTime(); t + slotMs <= windowEnd.getTime(); t += slotMs) {
    // Check workHours if provided.
    if (workHours) {
      const d = new Date(t);
      const hour = d.getHours(); // Simplified — timezone handling omitted for now.
      if (hour < (workHours.start || 9) || hour >= (workHours.end || 17)) {
        continue;
      }
    }
    if (!occupied.has(Math.floor(t / slotMs))) {
      return new Date(t);
    }
  }
  return null;
}

/**
 * Schedule a single step for a user within workHours.
 * @param {string} uid - Firebase UID.
 * @param {number} durationMinutes - Duration of the step.
 * @param {object} options - { windowHours?: number }
 * @returns {Promise<{ scheduledAt: string }>}
 */
export async function solveSingle(uid, durationMinutes = 15, { windowHours = 24 } = {}) {
  // Load user workHours.
  const userSnap = await db.collection('users').doc(uid).get();
  const workHours = userSnap.exists ? userSnap.data()?.workHours : null;

  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
  const freeSlot = await findFirstFreeSlot(uid, now, windowEnd, durationMinutes, workHours);
  if (!freeSlot) {
    throw new Error(`No free slot found in the next ${windowHours} hours`);
  }
  return { scheduledAt: freeSlot.toISOString() };
}

/**
 * Schedule multiple steps for a user — non-overlapping slots.
 * @param {string} uid - Firebase UID.
 * @param {Array<{durationMinutes: number}>} steps - Steps to schedule.
 * @param {object} options
 * @returns {Promise<Array<{index: number, scheduledAt: string}>>}
 */
export async function solveBatch(uid, steps, { windowHours = 24, autonomousActions = false } = {}) {
  const userSnap = await db.collection('users').doc(uid).get();
  const workHours = userSnap.exists ? userSnap.data()?.workHours : null;

  const results = [];
  let cursor = new Date();
  for (let i = 0; i < steps.length; i++) {
    const duration = steps[i].durationMinutes || 15;
    const windowEnd = new Date(cursor.getTime() + windowHours * 60 * 60 * 1000);
    
    let slot = await findFirstFreeSlot(uid, cursor, windowEnd, duration, workHours);
    
    // AUTONOMOUS ACTIONS LOGIC
    if (!slot && autonomousActions) {
      console.log(`No free slot found for UID ${uid}. Autonomous Actions enabled. Looking for deletable events...`);
      try {
        const { listEvents, deleteEvent } = await import('./calendarClient.js');
        const events = await listEvents(uid, cursor.toISOString(), windowEnd.toISOString());
        for (const evt of events) {
          const title = evt.summary || '';
          if (title.match(/sync|catch up|1:1/i)) {
            console.log(`Auto-declining (deleting) event: "${title}"`);
            await deleteEvent(uid, evt.id);
            // Try finding a slot again after deletion
            slot = await findFirstFreeSlot(uid, cursor, windowEnd, duration, workHours);
            if (slot) break;
          }
        }
      } catch (e) {
        console.warn('Failed autonomous action logic:', e.message);
      }
    }

    if (!slot) continue;
    results.push({ index: i, scheduledAt: slot.toISOString() });
    cursor = new Date(slot.getTime() + duration * 60 * 1000);
  }
  return results;
}
