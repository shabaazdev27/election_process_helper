"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  RotateCcw,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Info
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string; url: string }[];
}

const INITIAL_MESSAGE: Message = {
  id: "initial-1",
  role: "assistant",
  content: "Hello! I'm ElectionGuide, your AI assistant for voting and election processes. How can I help you today?",
  timestamp: new Date(2026, 4, 2, 17, 0, 0), // Stable date for initial message
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Safer time formatting to avoid hydration mismatches and browser-specific errors
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (_error) {
      return "";
    }
  };

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    // Update state: React 18 batches these calls and flushes before the async
    // fetch runs, so the user message appears immediately in the DOM.
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Fetch CSRF token if needed (optimization: could be cached)
      const csrfRes = await fetch("/api/chat");
      if (!csrfRes.ok) throw new Error("Failed to initialize security session");
      const { csrfToken } = await csrfRes.json();

      // 2. Prepare history for the API
      const historyForApi = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      // 3. Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          message: messageText,
          history: historyForApi,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error || `Request failed with status ${response.status}`);
      }

      // 4. Handle streaming response
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const reader = response.body?.getReader?.();

      if (reader) {
        const decoder = new TextDecoder();
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setMessages((prev) => {
            const lastIndex = prev.findIndex(m => m.id === assistantMessageId);
            if (lastIndex !== -1) {
              const newMessages = [...prev];
              const existingMessage = newMessages[lastIndex];
              if (existingMessage) {
                newMessages[lastIndex] = { ...existingMessage, content: fullContent };
              }
              return newMessages;
            }
            return prev;
          });
        }
      } else {
        const fullContent = await response.text();
        setMessages((prev) => {
          const lastIndex = prev.findIndex(m => m.id === assistantMessageId);
          if (lastIndex !== -1) {
            const newMessages = [...prev];
            const existingMessage = newMessages[lastIndex];
            if (existingMessage) {
              newMessages[lastIndex] = { ...existingMessage, content: fullContent };
            }
            return newMessages;
          }
          return prev;
        });
      }
    } catch (error: unknown) {
      console.error("Chat Error:", error);
      const errorMessage = error instanceof Error && (error.message.includes("Rate limit") || error.message.includes("429"))
        ? "You've reached the message limit for guests. Please sign in to continue or try again in a minute."
        : error instanceof Error && error.message.includes("billing")
          ? "The AI service is temporarily unavailable due to quota or billing limits. Please try again later."
          : "I'm sorry, I'm having trouble connecting right now. Please try again later.";

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background relative">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary" aria-hidden="true">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold font-poppins">AI Assistant</h1>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-success">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" aria-hidden="true" />
              Online & Ready
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMessages([INITIAL_MESSAGE])}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-foreground/40"
            title="Reset Conversation"
            aria-label="Reset Conversation"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="message-container" data-message-count={messages.length}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              data-testid="chat-message"
              className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              role="article"
              aria-label={`${m.role === "assistant" ? "Assistant" : "You"} said:`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-600"
                }`} aria-hidden="true">
                {m.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>

              <div className={`flex flex-col gap-2 max-w-[80%] ${m.role === "user" ? "items-end" : ""}`}>
                <div className={`p-4 rounded-2xl ${m.role === "assistant"
                    ? "bg-card border border-border shadow-sm text-foreground"
                    : "bg-primary text-white"
                  }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>

                  {m.sources && (
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                      {m.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-50 border border-border rounded-md text-[10px] font-bold text-primary hover:bg-white transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 px-2">
                  <span className="text-[10px] text-foreground/40 font-medium" suppressHydrationWarning={true}>
                    {formatTime(m.timestamp)}
                  </span>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-2">
                      <button className="text-foreground/20 hover:text-success transition-colors" aria-label="Helpful">
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button className="text-foreground/20 hover:text-secondary transition-colors" aria-label="Not Helpful">
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              className="flex gap-4"
              aria-live="assertive"
              aria-label="Assistant is generating response"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center" aria-hidden="true">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
              <Info className="h-3 w-3" aria-hidden="true" />
              Suggested: &quot;How do I register to vote?&quot;
            </div>
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about the election process..."
              aria-label="Chat input"
              data-testid="chat-input"
              className="w-full pl-4 pr-14 py-4 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-15"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading}
              aria-label="Send Message"
              data-testid="chat-send-button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-[10px] text-center text-foreground/40">
            AI responses are generated based on official government records. Always verify with your local election office.
            For further assistance, contact our <a href="mailto:khanshabaaz05@gmail.com" className="text-primary hover:underline">Help Center</a>.
          </p>
        </form>
      </div>
    </div>

  );
}
