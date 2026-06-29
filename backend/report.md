# Backend Codebase Report

This report documents all files, functions, and exports under `backend/src`.

## Table of Contents

- [agents](#agents)
  - [agents/accountabilityAgent.js](#agentsaccountabilityAgentjs)
  - [agents/chatAgent.js](#agentschatAgentjs)
  - [agents/executorAgent.js](#agentsexecutorAgentjs)
  - [agents/ingestion.js](#agentsingestionjs)
  - [agents/lastMinuteAgent.js](#agentslastMinuteAgentjs)
  - [agents/negotiationAgent.js](#agentsnegotiationAgentjs)
  - [agents/plannerAgent.js](#agentsplannerAgentjs)
  - [agents/prioritizerAgent.js](#agentsprioritizerAgentjs)
  - [agents/riskAgent.js](#agentsriskAgentjs)
  - [agents/schedulerAgent.js](#agentsschedulerAgentjs)
- [controllers](#controllers)
  - [controllers/activityFeedController.js](#controllersactivityFeedControllerjs)
  - [controllers/agentsController.js](#controllersagentsControllerjs)
  - [controllers/approvalsController.js](#controllersapprovalsControllerjs)
  - [controllers/authController.js](#controllersauthControllerjs)
  - [controllers/chatController.js](#controllerschatControllerjs)
  - [controllers/ingestionController.js](#controllersingestionControllerjs)
  - [controllers/riskBatchController.js](#controllersriskBatchControllerjs)
  - [controllers/settingsController.js](#controllerssettingsControllerjs)
  - [controllers/taskCompletionController.js](#controllerstaskCompletionControllerjs)
- [credentials](#credentials)
  - [credentials/firebase-admin.json](#credentialsfirebase-adminjson)
  - [credentials/google-service-account.json](#credentialsgoogle-service-accountjson)
- [cron](#cron)
  - [cron/dailyBriefing.js](#crondailyBriefingjs)
- [errors](#errors)
  - [errors/AppError.js](#errorsAppErrorjs)
- [lib](#lib)
  - [lib/activityLogger.js](#libactivityLoggerjs)
  - [lib/authMiddleware.js](#libauthMiddlewarejs)
  - [lib/calendarClient.js](#libcalendarClientjs)
  - [lib/envValidator.js](#libenvValidatorjs)
  - [lib/fcmClient.js](#libfcmClientjs)
  - [lib/firebaseAdmin.js](#libfirebaseAdminjs)
  - [lib/firestoreClient.js](#libfirestoreClientjs)
  - [lib/geminiClient.js](#libgeminiClientjs)
  - [lib/gmailClient.js](#libgmailClientjs)
  - [lib/logger.js](#libloggerjs)
  - [lib/oauthService.js](#liboauthServicejs)
  - [lib/rateLimiter.js](#librateLimiterjs)
  - [lib/schedulerSolver.js](#libschedulerSolverjs)
  - [lib/schemas.js](#libschemasjs)
  - [lib/stateSigner.js](#libstateSignerjs)
  - [lib/tokenProvider.js](#libtokenProviderjs)
  - [lib/undoRegistry.js](#libundoRegistryjs)
  - [lib/userLookup.js](#libuserLookupjs)
  - [lib/userMetrics.js](#libuserMetricsjs)
  - [lib/vertexEmbeddingClient.js](#libvertexEmbeddingClientjs)
- [middleware](#middleware)
  - [middleware/errorHandler.js](#middlewareerrorHandlerjs)
  - [middleware/requestId.js](#middlewarerequestIdjs)
  - [middleware/validateRequest.js](#middlewarevalidateRequestjs)
- [routes](#routes)
  - [routes/activityFeed.js](#routesactivityFeedjs)
  - [routes/agents.js](#routesagentsjs)
  - [routes/approvals.js](#routesapprovalsjs)
  - [routes/auth.js](#routesauthjs)
  - [routes/chat.js](#routeschatjs)
  - [routes/ingest.js](#routesingestjs)
  - [routes/riskBatch.js](#routesriskBatchjs)
  - [routes/settings.js](#routessettingsjs)
  - [routes/tasks.js](#routestasksjs)
- [tests](#tests)
  - [tests/apiTest.js](#testsapiTestjs)
- [utils](#utils)
  - [utils/dateParser.js](#utilsdateParserjs)
  - [utils/encrypt.js](#utilsencryptjs)
- [Root](#root)
  - [index.js](#indexjs)

---

## agents

### agents/accountabilityAgent.js
<a id="agentsaccountabilityAgentjs"></a>

**Path:** `backend/src/agents/accountabilityAgent.js`

**Description:** Component in agents module.

#### Function: `checkAccountabilityEscalation(uid, taskId)`
- **Purpose:** Handles logic for `checkAccountabilityEscalation`.
- **Snippet:**
```javascript
13: export async function checkAccountabilityEscalation(uid, taskId) {
14:   if (!uid) throw new Error('uid is required');
15:   if (!taskId) throw new Error('taskId is required');
16: 
17:   const userSnap = await db.collection('users').doc(uid).get();
```

### agents/chatAgent.js
<a id="agentschatAgentjs"></a>

**Path:** `backend/src/agents/chatAgent.js`

**Description:** Component in agents module.

#### Function: `chat(uid, message)`
- **Purpose:** Handles logic for `chat`.
- **Snippet:**
```javascript
17: export async function chat(uid, message) {
18:   if (!uid || !message) throw new Error('uid and message are required');
19: 
20:   let relevantTasksContext = '';
21:   let citedTaskIds = [];
```

### agents/executorAgent.js
<a id="agentsexecutorAgentjs"></a>

**Path:** `backend/src/agents/executorAgent.js`

**Description:** Component in agents module.

#### Function: `executeTask(uid, taskId)`
- **Purpose:** Handles logic for `executeTask`.
- **Snippet:**
```javascript
19: export async function executeTask(uid, taskId) {
20:   if (!uid) throw new Error('uid is required');
21:   if (!taskId) throw new Error('taskId is required');
22: 
23:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

### agents/ingestion.js
<a id="agentsingestionjs"></a>

**Path:** `backend/src/agents/ingestion.js`

**Description:** Component in agents module.

#### Function: `ingestMessage(uid, source, rawContent, sourceRef = null)`
- **Purpose:** Handles logic for `ingestMessage`.
- **Snippet:**
```javascript
20: export async function ingestMessage(uid, source, rawContent, sourceRef = null) {
21:   // Extract task fields via Gemini structured output.
22:   const prompt = `Extract the following fields from the message and return a JSON object with keys:
23: - title (string, required)
24: - description (string or null)
```

### agents/lastMinuteAgent.js
<a id="agentslastMinuteAgentjs"></a>

**Path:** `backend/src/agents/lastMinuteAgent.js`

**Description:** Component in agents module.

#### Function: `processLastMinute(uid, taskId)`
- **Purpose:** Handles logic for `processLastMinute`.
- **Snippet:**
```javascript
19: export async function processLastMinute(uid, taskId) {
20:   if (!uid) throw new Error('uid is required');
21:   if (!taskId) throw new Error('taskId is required');
22: 
23:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

### agents/negotiationAgent.js
<a id="agentsnegotiationAgentjs"></a>

**Path:** `backend/src/agents/negotiationAgent.js`

**Description:** Component in agents module.

#### Function: `draftExtensionRequest(uid, taskId)`
- **Purpose:** Handles logic for `draftExtensionRequest`.
- **Snippet:**
```javascript
15: export async function draftExtensionRequest(uid, taskId) {
16:   if (!uid) throw new Error('uid is required');
17:   if (!taskId) throw new Error('taskId is required');
18: 
19:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

### agents/plannerAgent.js
<a id="agentsplannerAgentjs"></a>

**Path:** `backend/src/agents/plannerAgent.js`

**Description:** Component in agents module.

#### Function: `planTask(uid, taskId)`
- **Purpose:** Handles logic for `planTask`.
- **Snippet:**
```javascript
18: export async function planTask(uid, taskId) {
19:   if (!uid) throw new Error('uid is required');
20:   if (!taskId) throw new Error('taskId is required');
21: 
22:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

#### Function: `generateMVPSteps(uid, taskId, maxSteps = 3)`
- **Purpose:** Handles logic for `generateMVPSteps`.
- **Snippet:**
```javascript
87: export async function generateMVPSteps(uid, taskId, maxSteps = 3) {
88:   if (!uid) throw new Error('uid is required');
89:   if (!taskId) throw new Error('taskId is required');
90: 
91:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

### agents/prioritizerAgent.js
<a id="agentsprioritizerAgentjs"></a>

**Path:** `backend/src/agents/prioritizerAgent.js`

**Description:** Component in agents module.

#### Function: `prioritizeTasks(uid)`
- **Purpose:** Handles logic for `prioritizeTasks`.
- **Snippet:**
```javascript
16: export async function prioritizeTasks(uid) {
17:   if (!uid) throw new Error('uid is required');
18: 
19:   // Get all non-done tasks.
20:   const tasksSnap = await db
```

### agents/riskAgent.js
<a id="agentsriskAgentjs"></a>

**Path:** `backend/src/agents/riskAgent.js`

**Description:** Component in agents module.

#### Function: `assessRisk(uid, taskId)`
- **Purpose:** Handles logic for `assessRisk`.
- **Snippet:**
```javascript
19: export async function assessRisk(uid, taskId) {
20:   if (!uid) throw new Error('uid is required');
21:   if (!taskId) throw new Error('taskId is required');
22: 
23:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

#### Function: `assessRiskBatch(uid)`
- **Purpose:** Handles logic for `assessRiskBatch`.
- **Snippet:**
```javascript
98: export async function assessRiskBatch(uid) {
99:   if (!uid) throw new Error('uid is required');
100: 
101:   // Find all non-done tasks for this user.
102:   const tasksSnap = await db
```

### agents/schedulerAgent.js
<a id="agentsschedulerAgentjs"></a>

**Path:** `backend/src/agents/schedulerAgent.js`

**Description:** Component in agents module.

#### Function: `scheduleTask(uid, taskId)`
- **Purpose:** Handles logic for `scheduleTask`.
- **Snippet:**
```javascript
15: export async function scheduleTask(uid, taskId) {
16:   if (!uid) throw new Error('uid is required');
17:   if (!taskId) throw new Error('taskId is required');
18: 
19:   const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
```

## controllers

### controllers/activityFeedController.js
<a id="controllersactivityFeedControllerjs"></a>

**Path:** `backend/src/controllers/activityFeedController.js`

**Description:** Component in controllers module.

#### Function: `undoActivity(req, res)`
- **Purpose:** Handles logic for `undoActivity`.
- **Snippet:**
```javascript
6: export async function undoActivity(req, res) {
7:   try {
8:     const uid = req.user.uid;
9:     const { id: entryId } = req.params;
10: 
```

### controllers/agentsController.js
<a id="controllersagentsControllerjs"></a>

**Path:** `backend/src/controllers/agentsController.js`

**Description:** Component in controllers module.

#### Function: `runRiskAgent(req, res)`
- **Purpose:** Handles logic for `runRiskAgent`.
- **Snippet:**
```javascript
12: export async function runRiskAgent(req, res) {
13:   try {
14:     const { taskId } = req.params;
15:     const uid = req.user.uid;
16:     const result = await assessRisk(uid, taskId);
```

#### Function: `runPlanner(req, res)`
- **Purpose:** Handles logic for `runPlanner`.
- **Snippet:**
```javascript
24: export async function runPlanner(req, res) {
25:   try {
26:     const { taskId } = req.params;
27:     const uid = req.user.uid;
28:     const steps = await planTask(uid, taskId);
```

#### Function: `runPrioritizer(req, res)`
- **Purpose:** Handles logic for `runPrioritizer`.
- **Snippet:**
```javascript
36: export async function runPrioritizer(req, res) {
37:   try {
38:     const uid = req.user.uid;
39:     // Prioritizer runs across all tasks, no taskId needed
40:     const ranked = await prioritizeTasks(uid);
```

#### Function: `runScheduler(req, res)`
- **Purpose:** Handles logic for `runScheduler`.
- **Snippet:**
```javascript
48: export async function runScheduler(req, res) {
49:   try {
50:     const { taskId } = req.body;
51:     const uid = req.user.uid;
52:     const result = await scheduleTask(uid, taskId);
```

#### Function: `runExecutor(req, res)`
- **Purpose:** Handles logic for `runExecutor`.
- **Snippet:**
```javascript
60: export async function runExecutor(req, res) {
61:   try {
62:     const { taskId } = req.body;
63:     const uid = req.user.uid;
64:     const result = await executeTask(uid, taskId);
```

#### Function: `runLastMinute(req, res)`
- **Purpose:** Handles logic for `runLastMinute`.
- **Snippet:**
```javascript
72: export async function runLastMinute(req, res) {
73:   try {
74:     const { taskId } = req.params;
75:     const uid = req.user.uid;
76:     const result = await processLastMinute(uid, taskId);
```

### controllers/approvalsController.js
<a id="controllersapprovalsControllerjs"></a>

**Path:** `backend/src/controllers/approvalsController.js`

**Description:** Component in controllers module.

#### Function: `listPending(req, res)`
- **Purpose:** Handles logic for `listPending`.
- **Snippet:**
```javascript
11: export async function listPending(req, res) {
12:   try {
13:     const uid = req.user.uid;
14:     const snap = await db
15:       .collection('users')
```

#### Function: `approve(req, res)`
- **Purpose:** Handles logic for `approve`.
- **Snippet:**
```javascript
28: export async function approve(req, res) {
29:   try {
30:     const uid = req.user.uid;
31:     const { id } = req.params;
32: 
```

#### Function: `reject(req, res)`
- **Purpose:** Handles logic for `reject`.
- **Snippet:**
```javascript
60: export async function reject(req, res) {
61:   try {
62:     const uid = req.user.uid;
63:     const { id } = req.params;
64: 
```

### controllers/authController.js
<a id="controllersauthControllerjs"></a>

**Path:** `backend/src/controllers/authController.js`

**Description:** Component in controllers module.

#### Function: `startGoogleOAuth(req, res)`
- **Purpose:** Handles logic for `startGoogleOAuth`.
- **Snippet:**
```javascript
11: export async function startGoogleOAuth(req, res) {
12:   if (!req.user || !req.user.uid) {
13:     throw new AppError('Unauthenticated request', 401);
14:   }
15:   const uid = req.user.uid;
```

#### Function: `handleGoogleCallback(req, res)`
- **Purpose:** Handles logic for `handleGoogleCallback`.
- **Snippet:**
```javascript
22: export async function handleGoogleCallback(req, res) {
23:   const { code, state } = req.query;
24:   if (!code || !state) {
25:     throw new AppError('Missing code or state', 400);
26:   }
```

### controllers/chatController.js
<a id="controllerschatControllerjs"></a>

**Path:** `backend/src/controllers/chatController.js`

**Description:** Component in controllers module.

#### Function: `postChat(req, res)`
- **Purpose:** Handles logic for `postChat`.
- **Snippet:**
```javascript
6: export async function postChat(req, res) {
7:   try {
8:     const uid = req.user.uid;
9:     const { message } = req.body;
10:     
```

### controllers/ingestionController.js
<a id="controllersingestionControllerjs"></a>

**Path:** `backend/src/controllers/ingestionController.js`

**Description:** Component in controllers module.

#### Function: `runIngestion(req, res)`
- **Purpose:** Handles logic for `runIngestion`.
- **Snippet:**
```javascript
7: export async function runIngestion(req, res) {
8:   try {
9:     const uid = req.user.uid;
10:     const { source = 'manual', rawContent, sourceRef } = req.body;
11: 
```

### controllers/riskBatchController.js
<a id="controllersriskBatchControllerjs"></a>

**Path:** `backend/src/controllers/riskBatchController.js`

**Description:** Component in controllers module.

#### Function: `runRiskBatch(req, res)`
- **Purpose:** Handles logic for `runRiskBatch`.
- **Snippet:**
```javascript
8: export async function runRiskBatch(req, res) {
9:   try {
10:     const uid = req.user.uid;
11:     const results = await assessRiskBatch(uid);
12:     res.json({ success: true, results });
```

#### Function: `runRiskBatchAll(req, res)`
- **Purpose:** Handles logic for `runRiskBatchAll`.
- **Snippet:**
```javascript
18: export async function runRiskBatchAll(req, res) {
19:   try {
20:     const usersSnap = await db.collection('users').get();
21:     const results = [];
22:     
```

### controllers/settingsController.js
<a id="controllerssettingsControllerjs"></a>

**Path:** `backend/src/controllers/settingsController.js`

**Description:** Component in controllers module.

#### Function: `getSettings(req, res)`
- **Purpose:** Handles logic for `getSettings`.
- **Snippet:**
```javascript
7: export async function getSettings(req, res) {
8:   try {
9:     const uid = req.user.uid;
10:     const userRef = db.collection('users').doc(uid);
11:     const snap = await userRef.get();
```

#### Function: `updateSettings(req, res)`
- **Purpose:** Handles logic for `updateSettings`.
- **Snippet:**
```javascript
26: export async function updateSettings(req, res) {
27:   try {
28:     const uid = req.user.uid;
29:     const updates = req.body; // Body is validated by settingsUpdateSchema (passthrough)
30: 
```

### controllers/taskCompletionController.js
<a id="controllerstaskCompletionControllerjs"></a>

**Path:** `backend/src/controllers/taskCompletionController.js`

**Description:** Component in controllers module.

#### Function: `completeTask(req, res)`
- **Purpose:** Handles logic for `completeTask`.
- **Snippet:**
```javascript
8: export async function completeTask(req, res) {
9:   try {
10:     const uid = req.user.uid;
11:     const { taskId } = req.params;
12:     const { actualMinutes } = req.body;
```

## credentials

### credentials/firebase-admin.json
<a id="credentialsfirebase-adminjson"></a>

**Path:** `backend/src/credentials/firebase-admin.json`

**Description:** JSON Configuration / Credentials file.

```json
1: {
2:   "type": "service_account",
3:   "project_id": "niyro-e3ddb",
4:   "private_key_id": "984ef70a36ceb203abfcaebd61a2b1fac364205d",
5:   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDkgIK3CZvccXHk\nEjVPihvheXmxICeG1s2POVYZL0Pvg8puLQO7HN+1zS1fSpuHtQSZgQaA5VDa89bR\nTYbokaWMSbgG3zwUxhRUeAKbmum4XHL3sk7XO/xKVr1Ry5pR9Wbwg+OEdB9185pv\neO/hnqFywnPBiI7cSmlrd35vSnn9poo9HaTNEn09zLkOKDotkF70MQhf5nbYTSal\n9Uo6ExkhQN2gz3GObv2QT5k8VWjiONE1JyPEvGbGa1xjAX9OQ4WKMGA/o0+8Z9Fh\nYTbtTxeTtLFCDqOXj8w6CVcAzr241QVb9YADPRqKFF6NFxuCR5YsTnYDwS78WrIq\nlZTWOxn1AgMBAAECggEAG5Q/MqRgQX0Xx/VCpfT/ZHlq7Kv62VV3vf+nmqaPxorb\nleys9JqJjcHT5hp1Jy37/iMKi+ghmCuyE9UNoWhi2MnVAk9TSxaVQZSyi+FosC3I\nWokU5vmAe+B4PTUbzSSXZhQlE8mIOo5KZ4XrPgoNZnJ90jAPPhtlGel0Qy50Bt8m\niaCu0R9TlGw4PR9uJ725MVDIWmyUBZJc3ZzXQN9WXKZiD1QAukN0IC2mS7uohXZH\ntIMh6rh6sslPz8e6r1xehwPCAvTSGqVWK/xjef3Kl3aqcGv9VW1tkcGDb+ylPWUl\nxSFrPs2AarxdUb2VL8TOsnPx938wWOhU4subdinsgQKBgQD6FecGjtKhtyyeC8Mt\njJGjuprczL6fs5hm0AOmBcap8wf1Dszz5vj5odafxcAztV3yBKQnTR5vNUcqpTNh\nL1LXnTGlgx7qQ1lYRDo16DTXH0SunYMFjouAJA/7syF8Xx9s2BW19F5JMtWoht8G\nsVuGv5+ag8bczmd69pwxcMDtBQKBgQDp5+81Y8mC/F9bHI49ZWJh7l+M4xCWq1QI\nAimrApF1lsyHz6ECJOX7h14pYc574wn0yHdizqnlVl4r4WumqX01OkVxsytcXQwd\nzegrmUoAl5vmMR8C5o6GPPhY3KifNHplgBTar6GLnvBCON8+haS29w0WjNJCYfg0\n1hoyeCOMMQKBgGe5md6gckBcpwbOPh+wQ9+yz/Rwf0fhx34tHLZJgwKOKGi9wMgQ\nrodrVodiD7vip5pvzl32oH7jjCbl6g+O/z8qlaLeZX4ofPAdLD+blf77mxMJhYRS\ngQ2e53ov692X3oLYhPi46DpX+UIy3mH6Qcn7xIjjyyFeApF/o3zmFT65AoGAcdQK\nCAxgo1rXuMojumMdRpUvcKuLhhcoVKFgz7T3Pqc9L5ZuP1HfjdFplG/hgU6SqMnp\nt27lJRMrzuTrc3al1QJfix5rKo6pd9OdeaImbjVZi+M5uTqj/1WqcewoLxnluoFj\nJK01y3F0cHWmxpFZACUn/GJZbC6rEGNk6kym1/ECgYEA9b25hivXYZ0D+dAohWj0\nHLVYE9VcMyGw0AoUaS9zGjrp3HH/MZAU2JHtVHgR6KUdkATguyEJSgXnWVDIsFgD\nPZwEaoH3YpfURtZqkNdA82Fs5RXc/H0EgQ6qnD8BSZHl51gXXwIiZwYfwyc2kh0F\nswVLBmA+DXzsm8z+UoY9gRo=\n-----END PRIVATE KEY-----\n",
6:   "client_email": "firebase-adminsdk-fbsvc@niyro-e3ddb.iam.gserviceaccount.com",
7:   "client_id": "100126598795250634190",
8:   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
9:   "token_uri": "https://oauth2.googleapis.com/token",
10:   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
11:   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40niyro-e3ddb.iam.gserviceaccount.com",
12:   "universe_domain": "googleapis.com"
13: }
14: 
```

### credentials/google-service-account.json
<a id="credentialsgoogle-service-accountjson"></a>

**Path:** `backend/src/credentials/google-service-account.json`

**Description:** JSON Configuration / Credentials file.

```json
1: {
2:   "type": "service_account",
3:   "project_id": "niyro-e3ddb",
4:   "private_key_id": "d50bc9b4846e787c74166d5e8fb6ea0befa98441",
5:   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJzkiOtAq/Hd+c\nwBhHORvPusTFxhMD5OR5G1KOSrgvF5eEQN44hCUZR8pdkrMBF02s8BBmRTsukIuJ\nYtVpnYd9XphvtT4bQp04RXbMQyPyUJnBHMOI3CGcaFzd/W9sj60c9LSe+hkpJUp/\ncyIuvZbxyrw6fZaDxyKNM9slwXEGoXeIBQrd+QR65y5tgsHW8SCOd5JqeZKcZ8YN\n1UQI5wD+LD+MxjFndinMxo5u/CenVXIdWT9rLL3QCMp/lx0OZmmJA+nmqEAllRax\nWUGS0bOmjjvaDyR8AEIqDClMuYbFXWSIpK9qUkiBgRR8tgwzgGMRmzOP7GsORUbs\nPLPvZ12ZAgMBAAECggEABHckNSvBmoTnwO4IOEuiQUIcK6Ml7xD5lD6l4KbbG5Ta\nTuK1+Bd5qa0XirAEQxReRq+0l5eIrakk1hUOub/l8sDgPx9XANJQ+WDu6SpDXJyE\nQz9mo6JGIeucqHKjH7DjLy/9lV0qQUL4h2IhDsDPtJYPlny9n9KNDp8bEyM/Y/RH\n7qdPbdxxO91rplkYJFcrAc+udxdIwhJqynrc1VDzOcpQ/H89gubQsXlo12SyUm6B\nPwED6QJd6FzLT1dHJ62bKKu26bDN4BBCw2Wq1tsnFve2BYVDUukGptkZBze6vg51\nwqX955LgeyKDXQoPVuvWF3kerdoY4Ty7B7sY54udQQKBgQDsiD0G23sfEGKjVZR3\nmGmS+LzwfNa6JKBdM8E6xHqicFurlHVvXrBAT91L5s4wwVrI5YaTAICRALmDTzNt\nsyMsCJvc4wyAf6tmQBGiQIQ27AXb/Jbw3FRgqLNGGHP//h0/3Owk7/YbF5Lwh1Ou\nW/6VljPEJB1Cmgru3ExZlmcB+QKBgQDaalsbPN4bl8n67JWFnXns1A5iWIS2I85s\nrKEMfiTUoUvvVR+MOnHmk7XA5ONimvKbLp1d4aa+X8aIA8XP1CjeUZ725wHIO7r9\nzE3JJ+ITgJXhlcy30RMG+qS4vsK/qzCtCpkwJJ78U5vOOYEfV+46LAqYjLFYQNHM\nPKZjU2AgoQKBgQDE+shn14x3WDvs7i5QUttJDGC8nhpstmfedmVrPYkrkgqln2MV\nNnPtexU+Sp5YOA4U1CD4dyiamVHlKqYXq2GVIC49C9Czip8A7kZBKx1wZ6qRg49o\nUvTp8lQqAd9IxyUwtBjswfHgqgcyzGBCCla/2HCP3cuIVaTZOxlSWlC6cQKBgF8M\nealYy69mVteDrW4AIdcWUUwrCVXaLzLLzSoKmyyNJOZ6PMhhhr+4+BeBhBKdK4as\nun7ofA/MzjDSs3rF8SMOkgcQcI4asD1Sc2dem9uw0YjiD7zOl2EqIhTjrwyKCxzC\nx/dTeHyGRf9wtuhU868NC29niqXFT4d5vU7sMaEBAoGAc8lJzP4U8xVudue+wN+B\npetkWzDfZQ0xON8hWJj6hjRkBqLznuXJLQYmPQ24Ht2p1OQfZHayl4iRiP6m3W/z\nN7cgHaQwtIKtIrrSdwujGK6v1MYgm2Kt4GX74SqAGM7B/SIquLQZyKFILQwoM8S8\nYsXcFQTB4x7Y9lKp2qScpYE=\n-----END PRIVATE KEY-----\n",
6:   "client_email": "niyro-backend@niyro-e3ddb.iam.gserviceaccount.com",
7:   "client_id": "114372097873535933705",
8:   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
9:   "token_uri": "https://oauth2.googleapis.com/token",
10:   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
11:   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/niyro-backend%40niyro-e3ddb.iam.gserviceaccount.com",
12:   "universe_domain": "googleapis.com"
13: }
14: 
```

## cron

### cron/dailyBriefing.js
<a id="crondailyBriefingjs"></a>

**Path:** `backend/src/cron/dailyBriefing.js`

**Description:** Component in cron module.

#### Function: `startDailyBriefingCron()`
- **Purpose:** Handles logic for `startDailyBriefingCron`.
- **Snippet:**
```javascript
7: export function startDailyBriefingCron() {
8:   // Run at 08:00 AM every day
9:   // You can adjust the timezone if needed, or iterate per user timezone
10:   cron.schedule('0 8 * * *', async () => {
11:     logger.info('Running Daily Briefing Job...');
```

#### Function: `sendTelegramMessage(chatId, text)`
- **Purpose:** Handles logic for `sendTelegramMessage`.
- **Snippet:**
```javascript
79: async function sendTelegramMessage(chatId, text) {
80:   if (!process.env.TELEGRAM_BOT_TOKEN) return;
81:   try {
82:     await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
83:       method: 'POST',
```

## errors

### errors/AppError.js
<a id="errorsAppErrorjs"></a>

**Path:** `backend/src/errors/AppError.js`

**Description:** Component in errors module.

#### Class: `AppError`
- **Purpose:** Defines the `AppError` class.
- **Snippet:**
```javascript
2: export class AppError extends Error {
3:   /**
4:    * @param {string} message Human‑readable error message
5:    * @param {number} statusCode HTTP status code to return
6:    * @param {string} code Optional machine‑readable error code
```

#### Class: `ValidationError`
- **Purpose:** Defines the `ValidationError` class.
- **Snippet:**
```javascript
17: export class ValidationError extends AppError {
18:   constructor(message = 'Invalid request data') {
19:     super(message, 400, 'VALIDATION_ERROR');
20:   }
21: }
```

#### Class: `AuthenticationError`
- **Purpose:** Defines the `AuthenticationError` class.
- **Snippet:**
```javascript
23: export class AuthenticationError extends AppError {
24:   constructor(message = 'Authentication required') {
25:     super(message, 401, 'AUTHENTICATION_ERROR');
26:   }
27: }
```

#### Class: `AuthorizationError`
- **Purpose:** Defines the `AuthorizationError` class.
- **Snippet:**
```javascript
29: export class AuthorizationError extends AppError {
30:   constructor(message = 'Unauthorized') {
31:     super(message, 403, 'AUTHORIZATION_ERROR');
32:   }
33: }
```

#### Class: `NotFoundError`
- **Purpose:** Defines the `NotFoundError` class.
- **Snippet:**
```javascript
35: export class NotFoundError extends AppError {
36:   constructor(message = 'Resource not found') {
37:     super(message, 404, 'NOT_FOUND_ERROR');
38:   }
39: }
```

#### Class: `GeminiError`
- **Purpose:** Defines the `GeminiError` class.
- **Snippet:**
```javascript
41: export class GeminiError extends AppError {
42:   constructor(message = 'Gemini service error') {
43:     super(message, 502, 'GEMINI_ERROR');
44:   }
45: }
```

#### Class: `GoogleOAuthError`
- **Purpose:** Defines the `GoogleOAuthError` class.
- **Snippet:**
```javascript
47: export class GoogleOAuthError extends AppError {
48:   constructor(message = 'Google OAuth error') {
49:     super(message, 502, 'GOOGLE_OAUTH_ERROR');
50:   }
51: }
```

#### Class: `FirestoreError`
- **Purpose:** Defines the `FirestoreError` class.
- **Snippet:**
```javascript
53: export class FirestoreError extends AppError {
54:   constructor(message = 'Firestore operation failed') {
55:     super(message, 502, 'FIRESTORE_ERROR');
56:   }
57: }
```

## lib

### lib/activityLogger.js
<a id="libactivityLoggerjs"></a>

**Path:** `backend/src/lib/activityLogger.js`

**Description:** Component in lib module.

#### Function: `logActivity(uid, type, details = {}, meta = {})`
- **Purpose:** Handles logic for `logActivity`.
- **Snippet:**
```javascript
10: export async function logActivity(uid, type, details = {}, meta = {}) {
11:   const { db } = await import('./firestoreClient.js');
12:   const activityRef = db
13:     .collection('users')
14:     .doc(uid)
```

### lib/authMiddleware.js
<a id="libauthMiddlewarejs"></a>

**Path:** `backend/src/lib/authMiddleware.js`

**Description:** Component in lib module.

#### Arrow Function: `authMiddleware`
- **Purpose:** Exported or module-level variable `authMiddleware`.
- **Snippet:**
```javascript
11: export const authMiddleware = async (req, res, next) => {
12:   const authHeader = req.headers.authorization;
13:   if (!authHeader || !authHeader.startsWith('Bearer ')) {
14:     return res.status(401).json({ success: false, error: 'Missing Authorization header', code: 401 });
```

### lib/calendarClient.js
<a id="libcalendarClientjs"></a>

**Path:** `backend/src/lib/calendarClient.js`

**Description:** Component in lib module.

#### Function: `getCalendarClient(uid)`
- **Purpose:** Handles logic for `getCalendarClient`.
- **Snippet:**
```javascript
13: async function getCalendarClient(uid) {
14:   const accessToken = await getAccessToken(uid);
15:   const auth = new google.auth.OAuth2();
16:   auth.setCredentials({ access_token: accessToken });
17:   return google.calendar({ version: 'v3', auth });
```

#### Function: `queryFreeBusy(uid, timeMin, timeMax)`
- **Purpose:** Handles logic for `queryFreeBusy`.
- **Snippet:**
```javascript
27: export async function queryFreeBusy(uid, timeMin, timeMax) {
28:   const calendar = await getCalendarClient(uid);
29:   const response = await calendar.freebusy.query({
30:     requestBody: {
31:       timeMin,
```

#### Function: `createEvent(uid, event)`
- **Purpose:** Handles logic for `createEvent`.
- **Snippet:**
```javascript
45: export async function createEvent(uid, event) {
46:   const calendar = await getCalendarClient(uid);
47:   const response = await calendar.events.insert({
48:     calendarId: 'primary',
49:     requestBody: event,
```

#### Function: `deleteEvent(uid, eventId)`
- **Purpose:** Handles logic for `deleteEvent`.
- **Snippet:**
```javascript
53: export async function deleteEvent(uid, eventId) {
54:   const calendar = await getCalendarClient(uid);
55:   await calendar.events.delete({ calendarId: 'primary', eventId });
56: }
57: 
```

#### Function: `listEvents(uid, timeMin, timeMax)`
- **Purpose:** Handles logic for `listEvents`.
- **Snippet:**
```javascript
65: export async function listEvents(uid, timeMin, timeMax) {
66:   const calendar = await getCalendarClient(uid);
67:   const response = await calendar.events.list({
68:     calendarId: 'primary',
69:     timeMin,
```

### lib/envValidator.js
<a id="libenvValidatorjs"></a>

**Path:** `backend/src/lib/envValidator.js`

**Description:** Component in lib module.

#### Arrow Function: `validateEnv`
- **Purpose:** Exported or module-level variable `validateEnv`.
- **Snippet:**
```javascript
5: export const validateEnv = () => {
6:   const required = [
7:     'GOOGLE_CLOUD_PROJECT',        // For Gemini SDK (ADC)
8:     'FIREBASE_ADMIN_CREDENTIALS',  // Firebase Admin SDK service account path
```

### lib/fcmClient.js
<a id="libfcmClientjs"></a>

**Path:** `backend/src/lib/fcmClient.js`

**Description:** Component in lib module.

#### Function: `sendNotification(token, payload)`
- **Purpose:** Handles logic for `sendNotification`.
- **Snippet:**
```javascript
13: export async function sendNotification(token, payload) {
14:   const message = {
15:     token,
16:     notification: {
17:       title: payload.title || '',
```

### lib/firebaseAdmin.js
<a id="libfirebaseAdminjs"></a>

**Path:** `backend/src/lib/firebaseAdmin.js`

**Description:** Component in lib module.

#### Constant: `__filename`
- **Purpose:** Exported or module-level variable `__filename`.
- **Snippet:**
```javascript
10: const __filename = fileURLToPath(import.meta.url);
11: const __dirname = dirname(__filename);
12: 
13: if (!admin.apps.length) {
```

#### Constant: `__dirname`
- **Purpose:** Exported or module-level variable `__dirname`.
- **Snippet:**
```javascript
11: const __dirname = dirname(__filename);
12: 
13: if (!admin.apps.length) {
14:   const serviceAccountPath = process.env.FIREBASE_ADMIN_CREDENTIALS;
```

### lib/firestoreClient.js
<a id="libfirestoreClientjs"></a>

**Path:** `backend/src/lib/firestoreClient.js`

**Description:** Component in lib module.

#### Constant: `db`
- **Purpose:** Exported or module-level variable `db`.
- **Snippet:**
```javascript
7: export const db = admin.apps.length ? admin.app().firestore() : null;
8: 
9: if (!db) {
10:   console.error('Firestore client unavailable — Firebase Admin SDK not initialized.');
```

### lib/geminiClient.js
<a id="libgeminiClientjs"></a>

**Path:** `backend/src/lib/geminiClient.js`

**Description:** Component in lib module.

#### Function: `getAi()`
- **Purpose:** Handles logic for `getAi`.
- **Snippet:**
```javascript
8: function getAi() {
9:   if (!aiInstance) {
10:     aiInstance = new GoogleGenAI({
11:       vertexai: true,
12:       project: process.env.GOOGLE_CLOUD_PROJECT || 'niyro-e3ddb',
```

#### Function: `generateGemini(prompt)`
- **Purpose:** Handles logic for `generateGemini`.
- **Snippet:**
```javascript
26: export async function generateGemini(prompt) {
27:   const response = await getAi().models.generateContent({
28:     model: getModel(),
29:     contents: prompt,
30:   });
```

#### Function: `callGemini(prompt, options = {})`
- **Purpose:** Handles logic for `callGemini`.
- **Snippet:**
```javascript
40: export async function callGemini(prompt, options = {}) {
41:   const config = {};
42:   if (options.structured) {
43:     config.responseMimeType = 'application/json';
44:   }
```

#### Arrow Function: `getModel`
- **Purpose:** Exported or module-level variable `getModel`.
- **Snippet:**
```javascript
19: const getModel = () => process.env.GEMINI_MODEL || 'gemini-3.5-flash';
20: 
21: /**
22:  * Generate a text response from Gemini.
```

### lib/gmailClient.js
<a id="libgmailClientjs"></a>

**Path:** `backend/src/lib/gmailClient.js`

**Description:** Component in lib module.

#### Function: `getGmailClient(uid)`
- **Purpose:** Handles logic for `getGmailClient`.
- **Snippet:**
```javascript
13: async function getGmailClient(uid) {
14:   const accessToken = await getAccessToken(uid);
15:   const auth = new google.auth.OAuth2();
16:   auth.setCredentials({ access_token: accessToken });
17:   return google.gmail({ version: 'v1', auth });
```

#### Function: `listMessages(uid, maxResults = 20)`
- **Purpose:** Handles logic for `listMessages`.
- **Snippet:**
```javascript
26: export async function listMessages(uid, maxResults = 20) {
27:   const gmail = await getGmailClient(uid);
28:   const res = await gmail.users.messages.list({
29:     userId: 'me',
30:     maxResults,
```

#### Function: `getMessageBody(uid, messageId)`
- **Purpose:** Handles logic for `getMessageBody`.
- **Snippet:**
```javascript
41: export async function getMessageBody(uid, messageId) {
42:   const gmail = await getGmailClient(uid);
43:   const res = await gmail.users.messages.get({
44:     userId: 'me',
45:     id: messageId,
```

#### Function: `sendMessage(uid, rawMessage)`
- **Purpose:** Handles logic for `sendMessage`.
- **Snippet:**
```javascript
67: export async function sendMessage(uid, rawMessage) {
68:   const gmail = await getGmailClient(uid);
69:   const res = await gmail.users.messages.send({
70:     userId: 'me',
71:     requestBody: {
```

### lib/logger.js
<a id="libloggerjs"></a>

**Path:** `backend/src/lib/logger.js`

**Description:** Component in lib module.

#### Arrow Function: `logger`
- **Purpose:** Exported or module-level variable `logger`.
- **Snippet:**
```javascript
2: const logger = {
3:   info: (...args) => console.log(`[INFO]  ${new Date().toISOString()}`, ...args),
4:   warn: (...args) => console.warn(`[WARN]  ${new Date().toISOString()}`, ...args),
5:   error: (...args) => console.error(`[ERROR] ${new Date().toISOString()}`, ...args),
```

### lib/oauthService.js
<a id="liboauthServicejs"></a>

**Path:** `backend/src/lib/oauthService.js`

**Description:** Component in lib module.

#### Function: `generateAuthUrl(state)`
- **Purpose:** Handles logic for `generateAuthUrl`.
- **Snippet:**
```javascript
19: export function generateAuthUrl(state) {
20:   const scopes = [
21:     'https://www.googleapis.com/auth/calendar',
22:     'https://www.googleapis.com/auth/gmail.readonly',
23:     'https://www.googleapis.com/auth/gmail.send',
```

#### Function: `getTokens(code)`
- **Purpose:** Handles logic for `getTokens`.
- **Snippet:**
```javascript
38: export async function getTokens(code) {
39:   const { tokens } = await oauth2Client.getToken(code);
40:   return tokens;
41: }
42: 
```

#### Constant: `oauth2Client`
- **Purpose:** Exported or module-level variable `oauth2Client`.
- **Snippet:**
```javascript
7: const oauth2Client = new google.auth.OAuth2(
8:   process.env.GOOGLE_CLIENT_ID,
9:   process.env.GOOGLE_CLIENT_SECRET,
10:   process.env.GOOGLE_CALLBACK_URL
```

### lib/rateLimiter.js
<a id="librateLimiterjs"></a>

**Path:** `backend/src/lib/rateLimiter.js`

**Description:** Component in lib module.

#### Constant: `limiter`
- **Purpose:** Exported or module-level variable `limiter`.
- **Snippet:**
```javascript
3: const limiter = rateLimit({
4:   windowMs: 15 * 60 * 1000, // 15 minutes
5:   max: 100, // limit each IP to 100 requests per windowMs
6:   message: { success: false, error: 'Too many requests, please try again later.', code: 429 },
```

### lib/schedulerSolver.js
<a id="libschedulerSolverjs"></a>

**Path:** `backend/src/lib/schedulerSolver.js`

**Description:** Component in lib module.

#### Function: `findFirstFreeSlot(uid, windowStart, windowEnd, durationMinutes = 15, workHours = null)`
- **Purpose:** Handles logic for `findFirstFreeSlot`.
- **Snippet:**
```javascript
19: async function findFirstFreeSlot(uid, windowStart, windowEnd, durationMinutes = 15, workHours = null) {
20:   const freebusy = await queryFreeBusy(uid, windowStart.toISOString(), windowEnd.toISOString());
21:   const busy = freebusy.calendars?.primary?.busy ?? [];
22:   const slotMs = durationMinutes * 60 * 1000;
23: 
```

#### Function: `solveSingle(uid, durationMinutes = 15, { windowHours = 24 } = {})`
- **Purpose:** Handles logic for `solveSingle`.
- **Snippet:**
```javascript
57: export async function solveSingle(uid, durationMinutes = 15, { windowHours = 24 } = {}) {
58:   // Load user workHours.
59:   const userSnap = await db.collection('users').doc(uid).get();
60:   const workHours = userSnap.exists ? userSnap.data()?.workHours : null;
61: 
```

#### Function: `solveBatch(uid, steps, { windowHours = 24, autonomousActions = false } = {})`
- **Purpose:** Handles logic for `solveBatch`.
- **Snippet:**
```javascript
78: export async function solveBatch(uid, steps, { windowHours = 24, autonomousActions = false } = {}) {
79:   const userSnap = await db.collection('users').doc(uid).get();
80:   const workHours = userSnap.exists ? userSnap.data()?.workHours : null;
81: 
82:   const results = [];
```

### lib/schemas.js
<a id="libschemasjs"></a>

**Path:** `backend/src/lib/schemas.js`

**Description:** Component in lib module.

#### Constant: `TASK_STATUSES`
- **Purpose:** Exported or module-level variable `TASK_STATUSES`.
- **Snippet:**
```javascript
7: export const TASK_STATUSES = ['pending', 'in_progress', 'done'];
8: 
9: export const taskCreateSchema = z.object({
10:   title: z.string().min(1),
```

#### Constant: `taskCreateSchema`
- **Purpose:** Exported or module-level variable `taskCreateSchema`.
- **Snippet:**
```javascript
9: export const taskCreateSchema = z.object({
10:   title: z.string().min(1),
11:   description: z.string().optional().default(''),
12:   dueAt: z.string().optional(),
```

#### Constant: `taskUpdateSchema`
- **Purpose:** Exported or module-level variable `taskUpdateSchema`.
- **Snippet:**
```javascript
17: export const taskUpdateSchema = z.object({
18:   title: z.string().optional(),
19:   description: z.string().optional(),
20:   dueAt: z.string().optional(),
```

#### Constant: `taskIdSchema`
- **Purpose:** Exported or module-level variable `taskIdSchema`.
- **Snippet:**
```javascript
25: export const taskIdSchema = z.object({
26:   taskId: z.string().min(1),
27: });
28: 
```

#### Constant: `settingsUpdateSchema`
- **Purpose:** Exported or module-level variable `settingsUpdateSchema`.
- **Snippet:**
```javascript
30: export const settingsUpdateSchema = z.object({
31:   workHours: z.object({
32:     start: z.string().regex(/^\d{2}:\d{2}$/),
33:     end: z.string().regex(/^\d{2}:\d{2}$/),
```

#### Constant: `gmailIngestSchema`
- **Purpose:** Exported or module-level variable `gmailIngestSchema`.
- **Snippet:**
```javascript
49: export const gmailIngestSchema = z.object({
50:   messageId: z.string().min(1),
51: });
52: 
```

#### Constant: `telegramIngestSchema`
- **Purpose:** Exported or module-level variable `telegramIngestSchema`.
- **Snippet:**
```javascript
53: export const telegramIngestSchema = z.object({
54:   // Telegram webhook update object — we extract what we need in the handler
55: }).passthrough();
56: 
```

#### Constant: `slackIngestSchema`
- **Purpose:** Exported or module-level variable `slackIngestSchema`.
- **Snippet:**
```javascript
57: export const slackIngestSchema = z.object({
58:   channel: z.string().min(1),
59:   ts: z.string().min(1),
60: });
```

#### Constant: `riskBatchSchema`
- **Purpose:** Exported or module-level variable `riskBatchSchema`.
- **Snippet:**
```javascript
62: export const riskBatchSchema = z.object({}).passthrough();
63: 
```

### lib/stateSigner.js
<a id="libstateSignerjs"></a>

**Path:** `backend/src/lib/stateSigner.js`

**Description:** Component in lib module.

#### Function: `getSecret()`
- **Purpose:** Handles logic for `getSecret`.
- **Snippet:**
```javascript
11: function getSecret() {
12:   const secret = process.env.ENCRYPTION_KEY;
13:   if (!secret) {
14:     throw new Error('ENCRYPTION_KEY environment variable is strictly required for security.');
15:   }
```

#### Function: `createSignedState(uid)`
- **Purpose:** Handles logic for `createSignedState`.
- **Snippet:**
```javascript
24: export function createSignedState(uid) {
25:   const nonce = randomUUID();
26:   const payload = { uid, nonce };
27:   // 5-minute expiry — short enough to prevent replay, long enough for the OAuth round-trip.
28:   return jwt.sign(payload, getSecret(), { expiresIn: '5m' });
```

#### Function: `verifySignedState(token)`
- **Purpose:** Handles logic for `verifySignedState`.
- **Snippet:**
```javascript
37: export function verifySignedState(token) {
38:   try {
39:     const decoded = jwt.verify(token, getSecret());
40:     return decoded.uid;
41:   } catch (err) {
```

### lib/tokenProvider.js
<a id="libtokenProviderjs"></a>

**Path:** `backend/src/lib/tokenProvider.js`

**Description:** Component in lib module.

#### Function: `getAccessToken(uid)`
- **Purpose:** Handles logic for `getAccessToken`.
- **Snippet:**
```javascript
15: export async function getAccessToken(uid) {
16:   const docRef = db
17:     .collection('users')
18:     .doc(uid)
19:     .collection('integrations')
```

### lib/undoRegistry.js
<a id="libundoRegistryjs"></a>

**Path:** `backend/src/lib/undoRegistry.js`

**Description:** Component in lib module.

#### Function: `registerUndo(uid, entryId, descriptor)`
- **Purpose:** Handles logic for `registerUndo`.
- **Snippet:**
```javascript
16: export async function registerUndo(uid, entryId, descriptor) {
17:   if (!uid || !entryId || !descriptor) {
18:     throw new Error('registerUndo requires uid, entryId, and descriptor');
19:   }
20:   await db
```

#### Function: `dispatchUndo(uid, entryId)`
- **Purpose:** Handles logic for `dispatchUndo`.
- **Snippet:**
```javascript
38: export async function dispatchUndo(uid, entryId) {
39:   const undoRef = db
40:     .collection('users')
41:     .doc(uid)
42:     .collection('undoActions')
```

#### Function: `hasUndo(uid, entryId)`
- **Purpose:** Handles logic for `hasUndo`.
- **Snippet:**
```javascript
98: export async function hasUndo(uid, entryId) {
99:   const snap = await db
100:     .collection('users')
101:     .doc(uid)
102:     .collection('undoActions')
```

### lib/userLookup.js
<a id="libuserLookupjs"></a>

**Path:** `backend/src/lib/userLookup.js`

**Description:** Component in lib module.

#### Function: `getUserIdByPhone(e164Phone)`
- **Purpose:** Handles logic for `getUserIdByPhone`.
- **Snippet:**
```javascript
12: export async function getUserIdByPhone(e164Phone) {
13:   if (!db) {
14:     console.error('Firestore not initialized – cannot lookup user by phone');
15:     return null;
16:   }
```

#### Function: `getUserIdByTelegramChatId(chatId)`
- **Purpose:** Handles logic for `getUserIdByTelegramChatId`.
- **Snippet:**
```javascript
38: export async function getUserIdByTelegramChatId(chatId) {
39:   if (!db) {
40:     console.error('Firestore not initialized – cannot lookup user by telegram chat id');
41:     return null;
42:   }
```

### lib/userMetrics.js
<a id="libuserMetricsjs"></a>

**Path:** `backend/src/lib/userMetrics.js`

**Description:** Component in lib module.

#### Function: `updateMomentum(uid, completedOnTime)`
- **Purpose:** Handles logic for `updateMomentum`.
- **Snippet:**
```javascript
11: export async function updateMomentum(uid, completedOnTime) {
12:   const userRef = db.collection('users').doc(uid);
13:   const snap = await userRef.get();
14:   const data = snap.data() || {};
15:   const momentum = data.momentum || { streakCount: 0, lastCompletionDate: null, focusScore: 0 };
```

#### Function: `updateEstimationProfile(uid, actualMinutes, estimatedMinutes)`
- **Purpose:** Handles logic for `updateEstimationProfile`.
- **Snippet:**
```javascript
38: export async function updateEstimationProfile(uid, actualMinutes, estimatedMinutes) {
39:   if (!estimatedMinutes || estimatedMinutes <= 0) return;
40: 
41:   const ratio = actualMinutes / estimatedMinutes;
42:   const userRef = db.collection('users').doc(uid);
```

### lib/vertexEmbeddingClient.js
<a id="libvertexEmbeddingClientjs"></a>

**Path:** `backend/src/lib/vertexEmbeddingClient.js`

**Description:** Component in lib module.

#### Function: `getAi()`
- **Purpose:** Handles logic for `getAi`.
- **Snippet:**
```javascript
10: function getAi() {
11:   if (!aiInstance) {
12:     aiInstance = new GoogleGenAI({
13:       vertexai: true,
14:       project: process.env.GOOGLE_CLOUD_PROJECT || 'niyro-e3ddb',
```

#### Function: `getEmbedding(text)`
- **Purpose:** Handles logic for `getEmbedding`.
- **Snippet:**
```javascript
28: export async function getEmbedding(text) {
29:   if (!text) {
30:     throw new Error('Input text is required for embedding');
31:   }
32: 
```

#### Arrow Function: `getModel`
- **Purpose:** Exported or module-level variable `getModel`.
- **Snippet:**
```javascript
21: const getModel = () => process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
22: 
23: /**
24:  * Retrieve an embedding vector for a given text.
```

## middleware

### middleware/errorHandler.js
<a id="middlewareerrorHandlerjs"></a>

**Path:** `backend/src/middleware/errorHandler.js`

**Description:** Component in middleware module.

*No major exported functions/classes detected via simple parsing.*

### middleware/requestId.js
<a id="middlewarerequestIdjs"></a>

**Path:** `backend/src/middleware/requestId.js`

**Description:** Component in middleware module.

*No major exported functions/classes detected via simple parsing.*

### middleware/validateRequest.js
<a id="middlewarevalidateRequestjs"></a>

**Path:** `backend/src/middleware/validateRequest.js`

**Description:** Component in middleware module.

#### Function: `validateRequest(schema, options = { source: 'body', allowUnknown: false })`
- **Purpose:** Handles logic for `validateRequest`.
- **Snippet:**
```javascript
9: export function validateRequest(schema, options = { source: 'body', allowUnknown: false }) {
10:   return (req, res, next) => {
11:     try {
12:       let data;
13:       if (options.source === 'query') {
```

## routes

### routes/activityFeed.js
<a id="routesactivityFeedjs"></a>

**Path:** `backend/src/routes/activityFeed.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
6: const router = express.Router();
7: router.use(authMiddleware);
8: 
9: // Update an activity‑feed entry (e.g., mark undone, set agent/action info)
```

### routes/agents.js
<a id="routesagentsjs"></a>

**Path:** `backend/src/routes/agents.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
15: const router = express.Router();
16: router.use(authMiddleware);
17: 
18: // Risk agent (taskId in URL param)
```

### routes/approvals.js
<a id="routesapprovalsjs"></a>

**Path:** `backend/src/routes/approvals.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
6: const router = express.Router();
7: router.use(authMiddleware);
8: 
9: router.get('/', listPending);
```

### routes/auth.js
<a id="routesauthjs"></a>

**Path:** `backend/src/routes/auth.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
5: const router = express.Router();
6: 
7: import { authMiddleware } from '../lib/authMiddleware.js';
8: 
```

### routes/chat.js
<a id="routeschatjs"></a>

**Path:** `backend/src/routes/chat.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
6: const router = express.Router();
7: router.use(authMiddleware);
8: 
9: // POST /api/v1/chat
```

### routes/ingest.js
<a id="routesingestjs"></a>

**Path:** `backend/src/routes/ingest.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
9: const router = express.Router();
10: 
11: // ── Manual ingestion (authenticated user) ──────────────────────────────────
12: router.post('/', authMiddleware, runIngestion);
```

### routes/riskBatch.js
<a id="routesriskBatchjs"></a>

**Path:** `backend/src/routes/riskBatch.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
5: const router = express.Router();
6: 
7: const schedulerAuth = (req, res, next) => {
8:   const secret = process.env.CRON_SECRET;
```

#### Arrow Function: `schedulerAuth`
- **Purpose:** Exported or module-level variable `schedulerAuth`.
- **Snippet:**
```javascript
7: const schedulerAuth = (req, res, next) => {
8:   const secret = process.env.CRON_SECRET;
9:   const header = req.headers['authorization'];
10:   if (secret && header === `Bearer ${secret}`) return next();
```

### routes/settings.js
<a id="routessettingsjs"></a>

**Path:** `backend/src/routes/settings.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
7: const router = express.Router();
8: router.use(authMiddleware);
9: 
10: router.get('/', getSettings);
```

### routes/tasks.js
<a id="routestasksjs"></a>

**Path:** `backend/src/routes/tasks.js`

**Description:** Component in routes module.

#### Constant: `router`
- **Purpose:** Exported or module-level variable `router`.
- **Snippet:**
```javascript
10: const router = express.Router();
11: router.use(authMiddleware);
12: 
13: // GET /api/v1/tasks — list all non-deleted tasks for the user
```

## tests

### tests/apiTest.js
<a id="testsapiTestjs"></a>

**Path:** `backend/src/tests/apiTest.js`

**Description:** Component in tests module.

#### Function: `testGemini()`
- **Purpose:** Handles logic for `testGemini`.
- **Snippet:**
```javascript
7: async function testGemini() {
8:   console.log('🔎 Testing Gemini generation (text)...');
9:   try {
10:     const response = await generateGemini('What is 2+2? Keep it short.');
11:     console.log('✅ Gemini text response:', response);
```

#### Function: `testEmbedding()`
- **Purpose:** Handles logic for `testEmbedding`.
- **Snippet:**
```javascript
25: async function testEmbedding() {
26:   console.log('🔎 Testing Gemini embedding...');
27:   try {
28:     const vec = await getEmbedding('test embedding text');
29:     console.log('✅ Embedding vector length:', vec.length);
```

## utils

### utils/dateParser.js
<a id="utilsdateParserjs"></a>

**Path:** `backend/src/utils/dateParser.js`

**Description:** Component in utils module.

#### Function: `parseDates(text)`
- **Purpose:** Handles logic for `parseDates`.
- **Snippet:**
```javascript
10: export function parseDates(text) {
11:   if (!text) return [];
12:   const results = chrono.parse(text);
13:   return results.map(r => r.start.date().toISOString());
14: }
```

### utils/encrypt.js
<a id="utilsencryptjs"></a>

**Path:** `backend/src/utils/encrypt.js`

**Description:** Component in utils module.

#### Function: `getKey()`
- **Purpose:** Handles logic for `getKey`.
- **Snippet:**
```javascript
9: function getKey() {
10:   if (keyCache) return keyCache;
11:   const rawKey = process.env.ENCRYPTION_KEY;
12:   if (!rawKey) {
13:     throw new Error('ENCRYPTION_KEY environment variable is required for token encryption');
```

#### Function: `encrypt(text)`
- **Purpose:** Handles logic for `encrypt`.
- **Snippet:**
```javascript
29: export function encrypt(text) {
30:   const iv = crypto.randomBytes(12); // 96‑bit IV recommended for GCM
31:   const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
32:   const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
33:   const authTag = cipher.getAuthTag();
```

#### Function: `decrypt(ciphertext)`
- **Purpose:** Handles logic for `decrypt`.
- **Snippet:**
```javascript
38: export function decrypt(ciphertext) {
39:   const [ivB64, tagB64, dataB64] = ciphertext.split(':');
40:   if (!ivB64 || !tagB64 || !dataB64) return null;
41:   const iv = Buffer.from(ivB64, 'base64');
42:   const authTag = Buffer.from(tagB64, 'base64');
```

#### Constant: `algorithm`
- **Purpose:** Exported or module-level variable `algorithm`.
- **Snippet:**
```javascript
27: const algorithm = 'aes-256-gcm';
28: 
29: export function encrypt(text) {
30:   const iv = crypto.randomBytes(12); // 96‑bit IV recommended for GCM
```

## Root

### index.js
<a id="indexjs"></a>

**Path:** `backend/src/index.js`

**Description:** Component in Root module.

#### Constant: `app`
- **Purpose:** Exported or module-level variable `app`.
- **Snippet:**
```javascript
30: const app = express();
31: app.use(cors());
32: app.use(express.json());
33: app.use(requestId);
```

#### Constant: `PORT`
- **Purpose:** Exported or module-level variable `PORT`.
- **Snippet:**
```javascript
58: const PORT = process.env.PORT || 8080;
59: app.listen(PORT, '0.0.0.0', () => {
60:   console.log(`🚀 Niyro Backend listening on port ${PORT} (0.0.0.0)`);
61: });
```

