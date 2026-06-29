const fs = require('fs');
const path = require('path');

const mermaidCode = `
flowchart TD
    User([User])
    FrontEnd["Frontend (React / Vite)"]
    Gmail["Gmail API"]
    Telegram["Telegram Webhooks"]
    Slack["Slack Webhooks"]
    
    subgraph Backend ["Node.js Express Backend"]
        Router["API Routes / Controllers"]
        subgraph Agents ["AI Agents"]
            IngestAgent("Ingestion Agent")
            ChatAgent("Chat / RAG Agent")
            RiskAgent("Risk Calculation Engine")
            RecAgent("Recommendations Agent")
        end
        Scheduler["Cloud Scheduler / Cron"]
    end
    
    DB[("Firestore Database")]
    LLM{"Google Gemini AI"}
    
    User -->|Interacts| FrontEnd
    FrontEnd -->|REST API| Router
    Gmail -->|Polling/Sync| Router
    Telegram -->|Webhooks| Router
    Slack -->|Webhooks| Router
    Router -->|Pass raw text| IngestAgent
    IngestAgent -->|Extracts tasks| LLM
    LLM -->|Structured JSON| IngestAgent
    IngestAgent -->|Saves Task| DB
    Router -->|User Queries| ChatAgent
    ChatAgent -->|Fetches context| DB
    ChatAgent -->|Analyzes| LLM
    Scheduler -->|Triggers Nightly| RiskAgent
    Scheduler -->|Triggers Nightly| RecAgent
    RiskAgent -->|Updates Probabilities| DB
    RecAgent -->|Analyzes stats| LLM
    LLM -->|Generates Insights| RecAgent
    RecAgent -->|Saves Insights| DB
    DB -.->|Streams updates| FrontEnd
`;

const base64Mermaid = Buffer.from(mermaidCode.trim()).toString('base64');
const mermaidImageUrl = `https://mermaid.ink/img/${base64Mermaid}`;

const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>Niyro Project Submission Document</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
        h1 { font-size: 48px; color: #000; text-align: center; border-bottom: 4px solid #000; padding-bottom: 20px; }
        h2 { font-size: 24px; color: #000; margin-top: 40px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .brutalist-card { border: 3px solid #000; padding: 20px; margin-bottom: 30px; background: #fff; box-shadow: 6px 6px 0px #000; }
        .brutalist-card h2 { margin-top: 0; border: none; font-family: 'Courier New', Courier, monospace; background: #C4B5FD; display: inline-block; padding: 5px 15px; border: 2px solid #000; }
        ul { padding-left: 20px; }
        li { margin-bottom: 10px; }
        img { max-width: 100%; height: auto; border: 3px solid #000; margin-top: 20px; box-shadow: 4px 4px 0px #000; }
    </style>
</head>
<body>

    <h1>NIYRO<br><span style="font-size: 24px; font-family: 'Courier New';">PROJECT SUBMISSION DOCUMENT</span></h1>
    
    <p style="text-align: center; color: #888; font-style: italic;">(Please drag and drop your project screenshot image here)</p>

    <div class="brutalist-card">
        <h2>Important Links & Platform</h2>
        <ul>
            <li><strong>Project Link (Live):</strong> https://niyro-e3ddb.web.app</li>
            <li><strong>GitHub Link:</strong> https://github.com/Aniketdhar810/Niyro</li>
            <li><strong>Presentation Link:</strong> Niyro project description</li>
            <li><strong>Platform:</strong> Web Application (Responsive Desktop & Mobile)</li>
        </ul>
    </div>

    <div class="brutalist-card">
        <h2>Problem It Solves</h2>
        <p>In today's fast-paced digital work environment, professionals are overwhelmed by context switching and scattered communication. Tasks, deadlines, and critical updates are fragmented across emails, chat applications, and manual to-do lists.</p>
        <p>This leads to missed deadlines, increased burnout, and a lack of deep, uninterrupted focus. Niyro solves this by being a centralized intelligence layer that automatically prioritizes what matters and actively blocks out distractions so you can execute without burning out.</p>
    </div>

    <div class="brutalist-card">
        <h2>Solution Overview</h2>
        <p>Niyro is an AI-powered, context-aware productivity assistant designed to unify task management. By automatically ingesting tasks from multiple communication channels, Niyro acts as a centralized intelligence layer.</p>
        <p>It uses advanced AI models to assess deadline risks, prioritize daily workloads, and provide a conversational interface for users to query their schedules. Furthermore, Niyro actively combats burnout through a dedicated, customizable Focus Mode that encourages deep work.</p>
    </div>

    <div class="brutalist-card">
        <h2>How Ingestion Works (User Flow)</h2>
        <p>Niyro's ingestion pipeline silently pulls actionable tasks from your communication channels so you never have to manually enter a to-do item again.</p>
        <ol>
            <li><strong>Gmail Sync:</strong> Niyro monitors your inbox for a specific "Niyro" label. When you label an email, a background chron job triggers the <code>gmailIngestionService</code>, fetches the email body, strips out HTML noise, and passes it to the AI.</li>
            <li><strong>AI Extraction:</strong> The raw text is passed to the <code>ingestionAgent</code> powered by Gemini. The AI reads the context, determines if it's an actionable task, estimates the time required, and extracts deadlines.</li>
            <li><strong>Task Creation & Cleanup:</strong> If a task is found, it is saved directly to your Firestore database. Niyro then reaches back to Gmail and removes the "Niyro" label so the email isn't ingested twice.</li>
            <li><strong>Slack & Telegram:</strong> Similar webhook-based endpoints securely receive payloads from messaging platforms, routing the raw text through the same intelligent <code>ingestionAgent</code> pipeline.</li>
        </ol>
    </div>

    <div class="brutalist-card">
        <h2>Project Architecture & Flow Diagram</h2>
        <p>Here is a visual breakdown of how Niyro's internal modules communicate:</p>
        <div style="text-align: center;">
            <img src="${mermaidImageUrl}" alt="Project Architecture Flow Diagram" />
        </div>
    </div>

    <div class="brutalist-card">
        <h2>Challenges Faced</h2>
        <ul>
            <li><strong>1. Unifying Asynchronous Data Streams:</strong> Handling incoming webhooks from Telegram, Slack, and Gmail simultaneously required building a robust, idempotent ingestion pipeline so tasks wouldn't be duplicated or lost.</li>
            <li><strong>2. Deterministic LLM Output:</strong> Relying on Gemini 3.5 to process natural language into actionable calendar commands meant we had to heavily engineer our prompts and use LangChain-style function calling to ensure it didn't hallucinate dates or times.</li>
            <li><strong>3. High-Performance RAG:</strong> Keeping the vector search fast using Vertex AI and Firestore meant we had to structure our database carefully, ensuring that the AI only retrieved contextually relevant tasks for the specific user requesting them.</li>
            <li><strong>4. Implementing Neo-Brutalism:</strong> Moving away from standard component libraries to build a purely custom, high-contrast, brutalist interface using Tailwind CSS took significant design effort to ensure it remained accessible and readable.</li>
        </ul>
    </div>

    <div class="brutalist-card">
        <h2>Key Features</h2>
        <ul>
            <li><strong>Multi-Channel Task Ingestion:</strong> Automatically aggregates tasks and deadlines via webhooks from Gmail, Telegram, and Slack.</li>
            <li><strong>Conversational AI Assistant:</strong> A context-aware chat interface utilizing Retrieval-Augmented Generation (RAG) over their personal task data.</li>
            <li><strong>Predictive Risk Engine:</strong> Continuously analyzes pending tasks and deadlines, flagging items below critical thresholds.</li>
            <li><strong>Automated Daily Briefings:</strong> Synthesizes the day's priorities into a concise summary delivered via Telegram.</li>
            <li><strong>Customizable Focus Mode:</strong> A dedicated environment with visual countdown timers designed to block out distractions.</li>
            <li><strong>Autonomous Actions:</strong> Capability to enforce deep work by intelligently managing calendars (e.g., auto-declining meetings).</li>
            <li><strong>AI Recommendations:</strong> Curates personalized coaching advice in the "For You" dashboard section to iteratively optimize the user's workflow.</li>
        </ul>
    </div>

    <div class="brutalist-card">
        <h2>Technologies Used</h2>
        <ul>
            <li><strong>Frontend:</strong> React, TypeScript, Vite, Tailwind CSS, Framer Motion</li>
            <li><strong>Backend:</strong> Node.js, Express.js</li>
            <li><strong>Architecture:</strong> Serverless API architecture with webhook integration for external platforms.</li>
        </ul>
    </div>

    <div class="brutalist-card">
        <h2>Google Technologies Utilized</h2>
        <ul>
            <li><strong>Google Gemini API:</strong> Powers the core conversational intelligence, reasoning, and automated task summarization.</li>
            <li><strong>Google Vertex AI:</strong> Provides high-quality text embeddings to power the vector search and RAG architecture.</li>
            <li><strong>Google Cloud Run:</strong> Serverless compute platform used to host and scale the Express backend securely.</li>
            <li><strong>Firebase Suite (Auth, Firestore, Hosting):</strong> Handles secure user onboarding, scalable NoSQL data storage, and frontend hosting.</li>
            <li><strong>Google Workspace APIs:</strong> Integrates directly with Gmail and Google Calendar.</li>
            <li><strong>Google Cloud Scheduler:</strong> Triggers the backend cron routes reliably for the Automated Daily Briefings.</li>
        </ul>
    </div>

</body>
</html>
`;

// Save as both .html and .doc (Word can open HTML natively if saved as .doc)
fs.writeFileSync(path.join(__dirname, '..', 'Niyro_Project_Submission_Upgraded.html'), htmlContent);
fs.writeFileSync(path.join(__dirname, '..', 'Niyro_Project_Submission_Upgraded.doc'), htmlContent);

console.log('Upgraded HTML and DOC documents generated successfully in the root folder.');
