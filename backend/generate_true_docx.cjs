const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, HeadingLevel, ImageRun } = require('docx');

async function main() {
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

    const docChildren = [
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

        createBrutalistCard("How Ingestion Works", [
            new Paragraph({ children: [new TextRun({ text: "Niyro's ingestion pipeline silently pulls actionable tasks from your communication channels.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "1. Gmail Sync: Niyro monitors your inbox for a specific 'Niyro' label. When you label an email, a background chron job triggers the gmailIngestionService, fetches the email body, strips out HTML noise, and passes it to the AI.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "2. AI Extraction: The raw text is passed to the ingestionAgent powered by Gemini. The AI reads the context, determines if it's an actionable task, estimates the time required, and extracts deadlines.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "3. Task Creation & Cleanup: If a task is found, it is saved directly to your Firestore database. Niyro then reaches back to Gmail and removes the 'Niyro' label so the email isn't ingested twice.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "4. Slack & Telegram: Webhook-based endpoints securely receive payloads from messaging platforms, routing the raw text through the same intelligent ingestionAgent pipeline.", font: "Arial" })] }),
        ]),
        new Paragraph({ text: "" }),

        createBrutalistCard("Project Architecture & Flow", [
            new Paragraph({ children: [new TextRun({ text: "The flow diagrams are visually represented on our GitHub README.", font: "Arial", bold: true })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "1. User interacts with React Frontend.", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "2. External Platforms (Gmail, Slack, Telegram) send data via Webhooks/Polling.", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "3. API Routes pass raw text to AI Agents (Ingestion, Chat, Recommendations).", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "4. AI Agents query Google Gemini AI for structured extraction.", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "5. Extracted data is saved into Firestore.", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "6. Daily Cron Jobs trigger the Risk Engine to update priorities.", font: "Arial" })] }),
        ]),
        new Paragraph({ text: "" }),

        createBrutalistCard("Challenges Faced", [
            new Paragraph({ children: [new TextRun({ text: "1. Unifying Asynchronous Data Streams: Handling incoming webhooks from Telegram, Slack, and Gmail simultaneously required building a robust, idempotent ingestion pipeline so tasks wouldn't be duplicated or lost.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "2. Deterministic LLM Output: Relying on Gemini 3.5 to process natural language into actionable calendar commands meant we had to heavily engineer our prompts and use LangChain-style function calling to ensure it didn't hallucinate dates or times.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "3. High-Performance RAG: Keeping the vector search fast using Vertex AI and Firestore meant we had to structure our database carefully.", font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "4. Implementing Neo-Brutalism: Moving away from standard component libraries to build a purely custom, high-contrast, brutalist interface.", font: "Arial" })] }),
        ]),
        new Paragraph({ text: "" }),

        createBrutalistCard("Key Features", [
            new Paragraph({ children: [new TextRun({ text: "• Multi-Channel Task Ingestion", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Conversational AI Assistant", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Predictive Risk Engine", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Automated Daily Briefings", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Customizable Focus Mode", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Autonomous Calendar Actions", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• AI Recommendations Coaching", font: "Arial" })] }),
        ]),
        new Paragraph({ text: "" }),

        createBrutalistCard("Google Technologies Utilized", [
            new Paragraph({ children: [new TextRun({ text: "• Google Gemini API", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Google Vertex AI", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Google Cloud Run", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Firebase Suite (Auth, Firestore, Hosting)", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Google Workspace APIs", font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: "• Google Cloud Scheduler", font: "Arial" })] }),
        ]),
    ];

    const doc = new Document({
        sections: [{
            properties: {
                page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } }
            },
            children: docChildren,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(__dirname, '..', 'Niyro_Project_Submission_Final.docx'), buffer);
    console.log("True DOCX created successfully!");
}

main().catch(err => console.error(err));
