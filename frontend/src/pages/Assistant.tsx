import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SideNav } from '../components/SideNav';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citedTaskIds?: string[];
  isTyping?: boolean;
}

export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'I am tracking your priorities. What do you need help with?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedPrompts = [
    "What's at risk this week?",
    "Plan my Thursday",
    "Any urgent deadlines?",
    "Draft a deferral for my math project"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        let finalTranscript = '';
        recognitionRef.current.onstart = () => {
          finalTranscript = ''; // Optional: could also append to existing inputValue
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setInputValue(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading || !user) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    setMessages(prev => [...prev, { id: typingId, role: 'assistant', text: '...', isTyping: true }]);

    try {
      const token = await user.getIdToken();
      // Use standard Vite env var or fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      setMessages(prev => 
        prev.filter(m => m.id !== typingId).concat({
          id: Date.now().toString() + '-reply',
          role: 'assistant',
          text: data.reply || "I'm sorry, I couldn't process that.",
          citedTaskIds: data.citedTaskIds
        })
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => 
        prev.filter(m => m.id !== typingId).concat({
          id: Date.now().toString() + '-err',
          role: 'assistant',
          text: 'Error communicating with the backend API.'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try using Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      <main className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
        
        {/* Left Side: Conversation Thread */}
        <section className="flex-1 flex flex-col h-full border-r-0 md:border-r-[3px] border-on-surface bg-surface-container-low">
          <header className="p-6 border-b-[3px] border-on-surface bg-surface">
            <h1 className="font-display-xl text-headline-lg-mobile md:text-headline-lg uppercase font-black tracking-tighter">AI ASSISTANT</h1>
            <p className="font-label-mono text-label-mono-sm text-on-surface-variant uppercase mt-1">Context-aware conversational interface</p>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  // User Message: Black pill-rounded bubble
                  <div className="bg-on-surface text-surface px-6 py-4 rounded-t-2xl rounded-l-2xl rounded-br-sm max-w-[85%] md:max-w-[70%] font-body-lg shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    {msg.text}
                  </div>
                ) : (
                  // Assistant Message: White bordered card
                  <div className="flex flex-col gap-2 max-w-[90%] md:max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-on-primary font-label-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-on-surface">
                        Guardian
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest border-2 border-on-surface px-6 py-4 shadow-[4px_4px_0px_#0A0A0A] font-body-lg">
                      {msg.isTyping ? (
                        <div className="flex space-x-1 h-6 items-center">
                          <div className="w-2 h-2 bg-on-surface rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                      
                      {msg.citedTaskIds && msg.citedTaskIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t-2 border-on-surface border-dotted flex flex-wrap gap-2">
                          {msg.citedTaskIds.map((taskId, idx) => (
                            <span key={idx} className="bg-surface-variant text-on-surface font-label-mono text-label-mono-sm px-2 py-1 border border-on-surface flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">link</span>
                              Ref: {taskId.slice(-6)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Bar */}
          <div className="p-4 md:p-6 bg-surface border-t-[3px] border-on-surface">
            <div className="flex items-end gap-2 relative max-w-4xl mx-auto w-full">
              <div className="flex-1 relative">
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Niyro something..."
                  className="w-full bg-surface-container-lowest border-[3px] border-on-surface p-4 pr-16 font-body-md focus:outline-none focus:border-primary transition-all shadow-[4px_4px_0px_#0A0A0A] resize-none min-h-[60px] max-h-[120px]"
                  rows={1}
                />
                <button 
                  onClick={toggleRecording}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors ${isRecording ? 'text-error' : 'text-on-surface-variant hover:text-primary'}`}
                  title="Voice Input"
                >
                  {isRecording ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1 bg-error animate-[bounce_1s_infinite_0s] h-4"></div>
                      <div className="w-1 bg-error animate-[bounce_1s_infinite_0.2s] h-6"></div>
                      <div className="w-1 bg-error animate-[bounce_1s_infinite_0.4s] h-4"></div>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined">mic</span>
                  )}
                </button>
              </div>
              <button 
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-primary text-on-primary border-[3px] border-on-surface w-[60px] h-[60px] flex items-center justify-center shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined font-bold">arrow_upward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Rail: Suggested Prompts */}
        <aside className="w-full md:w-80 bg-surface flex flex-col border-t-[3px] md:border-t-0 border-on-surface overflow-y-auto">
          <div className="p-6">
            <h3 className="font-label-mono text-label-mono uppercase font-bold text-on-surface-variant mb-6">Suggested Actions</h3>
            <div className="flex flex-col gap-4">
              {suggestedPrompts.map((prompt, index) => (
                <button 
                  key={index}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-left bg-surface-container-lowest border-2 border-on-surface p-4 shadow-[4px_4px_0px_#0A0A0A] hover:bg-primary-fixed hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-body-md font-bold group disabled:opacity-50"
                >
                  <div className="flex justify-between items-center">
                    <span>{prompt}</span>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-primary">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-12 p-4 bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A]">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                <h4 className="font-label-mono font-bold uppercase">Pro Tip</h4>
              </div>
              <p className="font-label-mono text-label-mono-sm">You can ask Niyro to prioritize your tasks or summarize recent emails directly in this chat.</p>
            </div>
          </div>
        </aside>

      </main>
      </div>
    </div>
  );
};
