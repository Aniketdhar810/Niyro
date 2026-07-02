// src/lib/envValidator.js
// Validate required environment variables on startup.
// Only requires variables that this project actually needs per NIYRO_CONTEXT.md §2.

export const validateEnv = () => {
  const required = [
    'GEMINI_API_KEY',              // For AI Studio SDK
    'FIREBASE_ADMIN_CREDENTIALS',  // Firebase Admin SDK service account path
    'ENCRYPTION_KEY',              // AES-256-GCM key for token encryption
    'GOOGLE_CLIENT_ID',            // OAuth2 for Calendar/Gmail scopes
    'GOOGLE_CLIENT_SECRET',        // OAuth2 for Calendar/Gmail scopes
    'GOOGLE_CALLBACK_URL',         // OAuth2 callback URL
    'GEMINI_MODEL',                // Model for standard Gemini tasks
    'EMBEDDING_MODEL',             // Model for vector embeddings
  ];

  const optional = [
    'PORT',                         // Defaults to 8080
    'FRONTEND_URL',                 // CORS origin
    'GOOGLE_CLOUD_LOCATION',        // Defaults to us-central1
    'TELEGRAM_BOT_TOKEN',           // For Telegram webhook verification
    'NODE_ENV',                     // Defaults to development
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error('🚨 WARNING: Missing required environment variables:', missing.join(', '));
    console.error('The server will start, but API calls will fail until these are provided.');
  }

  // Warn about optional vars
  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length) {
    console.warn('Optional environment variables not set:', missingOptional.join(', '));
  }

  const optionalSlack = ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET', 'SLACK_SIGNING_SECRET', 'SLACK_CALLBACK_URL'];
  optionalSlack.forEach(v => {
    if (!process.env[v]) console.warn(`[Env] Optional Slack var ${v} not set — Slack ingestion disabled`);
  });
};
