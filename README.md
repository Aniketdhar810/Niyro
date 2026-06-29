<div align="center">
  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBThgg8duXCR4tjOWnKo8XOkdAjjYGOGzlbJDkDmv9OsFWukILTxOGj4FQai-oaTYe2ExYuL1tqukHWm1INHjBVBWk3OmmQZW1YaxAU2_FalIFNfu-kpjYK6WV3_6aqISqg76qAJy3KT8qwcTf1TJ0Ax_aFO1kwXi2HPNDh6rBy6F-yDv5uQUOqhfFup7VINRFSMiP-YSl9oL_KK6ak3ntRX-zX5XKKI4RWKOHfoRKpPJP-LX-uF6PHqUQxuakUGC8Qc9M" alt="Niyro Logo" width="100%" />
  
  # Niyro
  **Get More Done. Stress Less. Live Better.**
  
  <p align="center">
    Your AI co-pilot that plans your day, manages tasks across all platforms, and saves you from last-minute chaos.
  </p>

  ### 🔗 Important Links
  **[Live Project](https://niyro-e3ddb.web.app)** | **[GitHub Repository](https://github.com/Aniketdhar810/Niyro)** | **[Presentation / Project Description](#)**

  **Platform:** Web Application (Responsive Desktop & Mobile)
</div>

---

## 📸 Project Showcase
*(Upload your screenshot to `frontend/public/screenshot.png` or replace this link!)*
<div align="center">
  <img src="https://raw.githubusercontent.com/Aniketdhar810/Niyro/main/frontend/public/screenshot.png" alt="Niyro Dashboard" width="100%" onerror="this.style.display='none'"/>
</div>

---

## 🚀 Problem It Solves

In today's hyper-connected workflow, professionals are drowning in context switching. Deadlines and actionable tasks are scattered across **Gmail, Slack, and Telegram**, leading to overwhelming anxiety and a reactive—rather than proactive—work style. The constant noise makes deep, focused work almost impossible.

Niyro solves this by being a centralized intelligence layer that automatically prioritizes what matters and actively blocks out distractions so you can execute without burning out.

## 💡 Our Solution

**Niyro** is a context-aware AI productivity assistant that acts as your centralized intelligence layer. It silently ingests tasks from all your communication channels, analyzes deadline risks using advanced AI, and organizes your day. Instead of manually tracking what's due, you simply ask Niyro, or let its automated morning briefings guide you. When it's time to work, Niyro's dedicated Focus Mode blocks out the noise so you can execute.

---

## 🌟 The User Experience (How it Flows)

1. **Silent Ingestion:** You connect your Gmail, Slack, and Telegram accounts. Niyro's webhooks securely monitor incoming data and extract actionable tasks in the background without any manual data entry.
2. **The Morning Briefing:** At 8:00 AM, you receive a curated "Daily Briefing" straight to your Telegram, outlining your most critical tasks and warning you of any deadlines whose completion probability has dropped below 70%.
3. **Conversational Planning:** Throughout the day, you open the Niyro dashboard. Instead of scrolling through endless lists, you simply ask the AI Assistant: *"What's at risk this week?"* or *"Draft a deferral for my math project."* The AI responds instantly using context-aware Retrieval-Augmented Generation (RAG).
4. **Deep Work Execution:** You launch **Focus Mode**, setting your preferred session duration. The brutalist, distraction-free UI keeps you locked in, while Niyro can autonomously decline non-essential calendar invites during this block.
5. **AI Recommendations:** Niyro tracks your task completion patterns and provides highly personalized productivity recommendations to optimize your workflow.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Multi-Channel Sync** | Auto-extracts tasks from Gmail, Slack, and Telegram. |
| **Conversational AI** | Chat interface powered by Google Gemini to query your workload. |
| **Predictive Risk Engine** | Calculates deadline failure probabilities and sends push alerts. |
| **Automated Briefings** | Daily AI-synthesized summaries delivered via Cloud Scheduler. |
| **Custom Focus Mode** | A heavy, brutalist deep-work timer customizable to your preferred duration. |
| **Autonomous Action** | Smart calendar management that protects your focus blocks. |

---

## 🧗 Challenges Faced

Building Niyro came with several intense technical challenges:
1. **Unifying Asynchronous Data Streams:** Handling incoming webhooks from Telegram, Slack, and Gmail simultaneously required building a robust, idempotent ingestion pipeline so tasks wouldn't be duplicated or lost.
2. **Deterministic LLM Output:** Relying on Gemini 3.5 to process natural language into actionable calendar commands meant we had to heavily engineer our prompts and use LangChain-style function calling to ensure it didn't hallucinate dates or times.
3. **High-Performance RAG:** Keeping the vector search fast using Vertex AI and Firestore meant we had to structure our database carefully, ensuring that the AI only retrieved contextually relevant tasks for the specific user requesting them.
4. **Implementing Neo-Brutalism:** Moving away from standard component libraries (like Material UI) to build a purely custom, high-contrast, brutalist interface using Tailwind CSS took significant design effort to ensure it remained accessible and readable.

---

## 🏗️ Architecture & Project Structure

Niyro is structured as a modern monorepo, cleanly separating the client interface from the intelligent backend services.

```text
📦 Niyro
 ┣ 📂 frontend               # React, Vite, Tailwind CSS (Brutalist UI)
 ┃ ┣ 📂 src/pages            # Dashboard, Focus Mode, AI Assistant, Settings
 ┃ ┣ 📂 src/components       # Reusable brutalist UI components
 ┃ ┗ 📂 src/hooks            # Firebase & State management hooks
 ┃
 ┗ 📂 backend                # Node.js, Express (API & AI Intelligence)
   ┣ 📂 src/agents           # LangChain-style AI agents (Chat, Executor)
   ┣ 📂 src/cron             # Cloud Scheduler endpoints (Daily Briefings)
   ┣ 📂 src/lib              # Google Cloud clients (Gemini, Vertex AI)
   ┗ 📂 src/routes           # REST API endpoints & Webhooks
```

### 🔄 How Ingestion Works

Niyro's ingestion pipeline silently pulls actionable tasks from your communication channels so you never have to manually enter a to-do item again.

1. **Gmail Sync:** Niyro monitors your inbox for a specific "Niyro" label. When you label an email, a background chron job triggers the `gmailIngestionService`, fetches the email body, strips out HTML noise, and passes it to the AI.
2. **AI Extraction:** The raw text is passed to the `ingestionAgent` powered by Gemini. The AI reads the context, determines if it's an actionable task, estimates the time required, and extracts deadlines.
3. **Task Creation & Cleanup:** If a task is found, it is saved directly to your Firestore database. Niyro then reaches back to Gmail and removes the "Niyro" label so the email isn't ingested twice.
4. **Slack & Telegram:** Similar webhook-based endpoints securely receive payloads from messaging platforms, routing the raw text through the same intelligent `ingestionAgent` pipeline.

### 🗺️ Project Architecture & Flow Diagram

Here is a visual breakdown of how Niyro's internal modules communicate:

```mermaid
flowchart TD
    %% Users and Interfaces
    User([User])
    FrontEnd[Frontend (React / Vite)]
    
    %% Third-party platforms
    Gmail[Gmail API]
    Telegram[Telegram Webhooks]
    Slack[Slack Webhooks]
    
    %% Backend Node.js
    subgraph Backend [Node.js Express Backend]
        Router[API Routes / Controllers]
        
        subgraph Agents [AI Agents]
            IngestAgent(Ingestion Agent)
            ChatAgent(Chat / RAG Agent)
            RiskAgent(Risk Calculation Engine)
            RecAgent(Recommendations Agent)
        end
        
        Scheduler[Cloud Scheduler / Cron]
    end
    
    %% Databases
    DB[(Firestore Database)]
    LLM{Google Gemini AI}
    
    %% Relationships
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
```

### Data Architecture (RAG Workflow)
1. **Ingest:** Webhooks receive payloads from Telegram/Slack/Gmail.
2. **Embed:** Text data is processed by **Google Vertex AI** to generate high-dimensional embeddings.
3. **Store:** Embeddings and task metadata are persisted in **Firebase Firestore**.
4. **Retrieve & Generate:** User queries hit the AI Assistant, which searches the vector space for relevant context and prompts **Google Gemini 3.5** for an intelligent response.

---

## 🛠️ Technologies Used

### Core Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database & Auth:** Firebase Firestore, Firebase Authentication

### Google Cloud Ecosystem
| Technology | Role in Niyro |
| :--- | :--- |
| **Google Gemini API** | Core LLM powering reasoning, chat, and summarization. |
| **Google Vertex AI** | Text embeddings for the vector search RAG pipeline. |
| **Google Cloud Run** | Serverless hosting for the Express backend. |
| **Firebase Hosting** | High-speed global CDN for the React frontend application. |
| **Google Workspace APIs** | OAuth integration for Gmail extraction and Calendar mutation. |
| **Google Cloud Scheduler** | Reliable trigger execution for the automated Daily Briefings. |

---

## 📊 Project Status & Metrics

| Component | Status | Next Milestone |
| :--- | :--- | :--- |
| **Frontend UI/UX** | 🟢 Production Ready | Add advanced charts to Dashboard |
| **Backend & AI Logic** | 🟢 Production Ready | Fine-tune Gemini prompts |
| **Firebase Infrastructure** | 🟢 Production Ready | Optimize Firestore indexing |
| **Slack Integration** | 🟡 In Development | Handle threaded context extraction |

---

<div align="center">
  <i>Built with ❤️ to end burnout.</i>
</div>
