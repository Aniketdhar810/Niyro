import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, HeadingLevel } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brutalBorder = {
    style: BorderStyle.SINGLE,
    size: 24, // 3pt
    color: "000000",
};

const tableBorders = {
    top: brutalBorder,
    bottom: brutalBorder,
    left: brutalBorder,
    right: brutalBorder,
};

function createBrutalistCard(title, paragraphs) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { fill: "FFFFFF" },
                        margins: { top: 300, bottom: 300, left: 300, right: 300 },
                        children: [
                            new Paragraph({
                                heading: HeadingLevel.HEADING_2,
                                children: [
                                    new TextRun({
                                        text: title.toUpperCase(),
                                        font: "Courier New",
                                        bold: true,
                                        shading: {
                                            type: "clear",
                                            fill: "C4B5FD",
                                        },
                                    }),
                                ],
                            }),
                            new Paragraph({ text: "" }),
                            ...paragraphs
                        ],
                    }),
                ],
            }),
        ],
    });
}

const doc = new Document({
    sections: [{
        properties: {
            page: {
                margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
            }
        },
        children: [
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [
                    new TextRun({
                        text: "NIYRO",
                        font: "Arial",
                        bold: true,
                        size: 72,
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "PROJECT SUBMISSION DOCUMENT",
                        font: "Courier New",
                        bold: true,
                        size: 24,
                    })
                ]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "(Please drag and drop your project screenshot image here)",
                        font: "Arial",
                        italics: true,
                        color: "888888"
                    })
                ]
            }),
            new Paragraph({ text: "" }),
            
            createBrutalistCard("Important Links & Platform", [
                new Paragraph({ children: [new TextRun({ text: "• Project Link (Live): https://niyro-e3ddb.web.app", font: "Arial", bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: "• GitHub Link: https://github.com/Aniketdhar810/Niyro", font: "Arial", bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: "• Presentation Link: Niyro project description", font: "Arial", bold: true })] }),
                new Paragraph({ text: "" }),
                new Paragraph({ children: [new TextRun({ text: "• Platform: Web Application (Responsive Desktop & Mobile)", font: "Arial" })] }),
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            createBrutalistCard("Problem It Solves", [
                new Paragraph({
                    children: [new TextRun({ text: "In today's fast-paced digital work environment, professionals are overwhelmed by context switching and scattered communication. Tasks, deadlines, and critical updates are fragmented across emails, chat applications, and manual to-do lists.", font: "Arial" })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "This leads to missed deadlines, increased burnout, and a lack of deep, uninterrupted focus. Niyro solves this by being a centralized intelligence layer that automatically prioritizes what matters and actively blocks out distractions so you can execute without burning out.", font: "Arial" })]
                })
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            createBrutalistCard("Challenges Faced", [
                new Paragraph({ children: [new TextRun({ text: "1. Unifying Asynchronous Data Streams: Handling incoming webhooks from Telegram, Slack, and Gmail simultaneously required building a robust, idempotent ingestion pipeline so tasks wouldn't be duplicated or lost.", font: "Arial" })] }),
                new Paragraph({ text: "" }),
                new Paragraph({ children: [new TextRun({ text: "2. Deterministic LLM Output: Relying on Gemini 3.5 to process natural language into actionable calendar commands meant we had to heavily engineer our prompts and use LangChain-style function calling to ensure it didn't hallucinate dates or times.", font: "Arial" })] }),
                new Paragraph({ text: "" }),
                new Paragraph({ children: [new TextRun({ text: "3. High-Performance RAG: Keeping the vector search fast using Vertex AI and Firestore meant we had to structure our database carefully, ensuring that the AI only retrieved contextually relevant tasks for the specific user requesting them.", font: "Arial" })] }),
                new Paragraph({ text: "" }),
                new Paragraph({ children: [new TextRun({ text: "4. Implementing Neo-Brutalism: Moving away from standard component libraries to build a purely custom, high-contrast, brutalist interface using Tailwind CSS took significant design effort to ensure it remained accessible and readable.", font: "Arial" })] }),
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            createBrutalistCard("Solution Overview", [
                new Paragraph({
                    children: [new TextRun({ text: "Niyro is an AI-powered, context-aware productivity assistant designed to unify task management. By automatically ingesting tasks from multiple communication channels, Niyro acts as a centralized intelligence layer.", font: "Arial" })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "It uses advanced AI models to assess deadline risks, prioritize daily workloads, and provide a conversational interface for users to query their schedules. Furthermore, Niyro actively combats burnout through a dedicated, customizable Focus Mode that encourages deep work.", font: "Arial" })]
                })
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            createBrutalistCard("Key Features", [
                new Paragraph({ children: [new TextRun({ text: "• Multi-Channel Task Ingestion: Automatically aggregates tasks and deadlines via webhooks from Gmail, Telegram, and Slack.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Conversational AI Assistant: A context-aware chat interface utilizing Retrieval-Augmented Generation (RAG) over their personal task data.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Predictive Risk Engine: Continuously analyzes pending tasks and deadlines, flagging items below critical thresholds.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Automated Daily Briefings: Synthesizes the day's priorities into a concise summary delivered via Telegram.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Customizable Focus Mode: A dedicated environment with visual countdown timers designed to block out distractions.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Autonomous Actions: Capability to enforce deep work by intelligently managing calendars (e.g., auto-declining meetings).", font: "Arial" })] }),
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            createBrutalistCard("Technologies Used", [
                new Paragraph({ children: [new TextRun({ text: "• Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Backend: Node.js, Express.js", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Architecture: Serverless API architecture with webhook integration for external platforms.", font: "Arial" })] }),
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            
            createBrutalistCard("Google Technologies Utilized", [
                new Paragraph({ children: [new TextRun({ text: "• Google Gemini API: Powers the core conversational intelligence, reasoning, and automated task summarization.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Google Vertex AI: Provides high-quality text embeddings to power the vector search and RAG architecture.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Google Cloud Run: Serverless compute platform used to host and scale the Express backend securely.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Firebase Suite (Auth, Firestore, Hosting): Handles secure user onboarding, scalable NoSQL data storage, and frontend hosting.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Google Workspace APIs: Integrates directly with Gmail and Google Calendar.", font: "Arial" })] }),
                new Paragraph({ children: [new TextRun({ text: "• Google Cloud Scheduler: Triggers the backend cron routes reliably for the Automated Daily Briefings.", font: "Arial" })] }),
            ]),
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path.join(__dirname, '..', 'Niyro_Project_Submission.docx'), buffer);
    console.log("Document created successfully");
});
