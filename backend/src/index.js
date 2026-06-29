// src/index.js
// Main entry point for the Niyro backend.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { validateEnv } from './lib/envValidator.js';
import requestId from './middleware/requestId.js';
import errorHandler from './middleware/errorHandler.js';
import { authMiddleware } from './lib/authMiddleware.js';


// Import Routers
import tasksRouter from './routes/tasks.js';
import agentsRouter from './routes/agents.js';
import ingestRouter from './routes/ingest.js';
import authRouter from './routes/auth.js';
import approvalsRouter from './routes/approvals.js';
import riskBatchRouter from './routes/riskBatch.js';
import settingsRouter from './routes/settings.js';
import chatRouter from './routes/chat.js';
import activityFeedRouter from './routes/activityFeed.js';
import cronRouter from './routes/cron.js';
import recommendationsRouter from './routes/recommendations.js';

// Validate env BEFORE initializing
validateEnv();

// Cron jobs are now handled via Cloud Scheduler calling /api/v1/cron

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestId);

// ---------------------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------------------
app.use('/api/v1/auth', authRouter); // /login, /callback
app.use('/api/v1/ingest', ingestRouter); // Includes webhooks and manual ingest
app.use('/api/v1/agents', riskBatchRouter); // /risk/run batch route (scheduler)
app.use('/api/v1/cron', cronRouter); // Cloud Scheduler cron jobs

// ---------------------------------------------------------
// PROTECTED ROUTES (require Bearer token)
// ---------------------------------------------------------
app.use('/api/v1/tasks', authMiddleware, tasksRouter);
app.use('/api/v1/agents', authMiddleware, agentsRouter);
app.use('/api/v1/approvals', authMiddleware, approvalsRouter);
app.use('/api/v1/settings', authMiddleware, settingsRouter);
app.use('/api/v1/chat', authMiddleware, chatRouter);
app.use('/api/v1/activityFeed', authMiddleware, activityFeedRouter);
app.use('/api/v1/recommendations', recommendationsRouter); // authMiddleware is already in router

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Niyro Backend listening on port ${PORT} (0.0.0.0)`);
});
