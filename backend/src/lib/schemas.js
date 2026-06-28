// src/lib/schemas.js
// Centralized Zod schemas for API request validation.

import { z } from 'zod';

// Task status values per NIYRO_CONTEXT.md §4 — exactly these three, no variants.
export const TASK_STATUSES = ['pending', 'in_progress', 'done'];

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  dueAt: z.string().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  source: z.enum(['gmail', 'telegram', 'slack', 'voice', 'manual']).optional().default('manual'),
});

export const taskUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueAt: z.string().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  status: z.enum(['pending', 'in_progress', 'done']).optional(),
});

export const taskIdSchema = z.object({
  taskId: z.string().min(1),
});

// Settings update schema — passthrough for arbitrary map fields on user doc.
export const settingsUpdateSchema = z.object({
  workHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string().min(1),
  }).optional(),
  connectedChannels: z.object({
    gmail: z.boolean(), telegram: z.boolean(), slack: z.boolean(),
  }).partial().optional(),
  accountabilityPartner: z.object({
    name: z.string().min(1), email: z.string().email(),
  }).optional(),
  notificationPrefs: z.object({
    intensity: z.enum(['low','normal','high']),
    channels: z.array(z.string()),
  }).partial().optional(),
}).strict();

// Ingestion webhook schemas
export const gmailIngestSchema = z.object({
  messageId: z.string().min(1),
});

export const telegramIngestSchema = z.object({
  // Telegram webhook update object — we extract what we need in the handler
}).passthrough();

export const slackIngestSchema = z.object({
  channel: z.string().min(1),
  ts: z.string().min(1),
});

export const riskBatchSchema = z.object({}).passthrough();
