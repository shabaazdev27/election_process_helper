"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RotateCcw, 
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Info,
  X,
  LogIn,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

/** Maximum messages allowed for guest users (premium limit) */
const GUEST_MESSAGE_LIMIT = 5;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string; url: string }[];
}

/**
 * Upsell modal component shown when guests reach message limit
 * @param isOpen - Whether the modal is visible
 * @param onSignIn - Callback when Sign In is clicked
 * @param onContinue - Callback to continue as guest
 * @param messageCount - Current message count for display
 */
function UpsellModal({ 
  isOpen, 
  onSignIn, 
  onContinue,
  messageCount 
}: { 
  isOpen: boolean; 
  onSignIn: () => Promise<void>; 
  onContinue: () => void;
  messageCount: number;
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await onSignIn();
    setIsSigningIn(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-card border border-border rounded-2xl shadow-lg max-w-sm w-full p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Bot className="h-6 w-6" />
            </div>
          </div>

          {/* Title and Message */}
          <h2 className="text-xl font-bold text-foreground mb-2">Unlock Premium Features</h2>
          <p className="text-sm text-foreground/70 mb-6">
            You've used {messageCount} of {GUEST_MESSAGE_LIMIT} guest messages. Sign in for unlimited history and personalized voting timelines.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              <LogIn className="h-4 w-4" />
              {isSigningIn ? "Signing In..." : "Sign In with Google"}
            </button>
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 text-foreground rounded-lg hover:bg-neutral-200 transition-all font-medium"
            >
              Continue as Guest
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Benefits List */}
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Premium Benefits</p>
            <ul className="text-sm text-foreground/70 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Unlimited message history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Personalized voting timelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Saved preferences</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AssistantPage() {
  const { user, signInWithGoogle, isGuest } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm ElectionGuide, your AI assistant for voting and election processes. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Calculate the number of user messages sent in current session
   */
  const userMessageCount = useCallback(() => {
    return messages.filter(m => m.role === "user").length;
  }, [messages]);

  /**
   * Check if guest has reached message limit
   */
  const hasReachedGuestLimit = useCallback(() => {
    return isGuest && userMessageCount() >= GUEST_MESSAGE_LIMIT;
  }, [isGuest, userMessageCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if guest has reached limit before sending
    if (hasReachedGuestLimit()) {
      setShowUpsellModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
          userId: user?.uid,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last.role === "assistant") {
              return [...prev.slice(0, -1), { ...last, content: fullContent }];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle upsell modal sign in button
   */
  const handleSignInFromUpsell = async () => {
    await signInWithGoogle();
    setShowUpsellModal(false);
  };

  /**
   * Handle continuing as guest after upsell
   */
  const handleContinueAsGuest = () => {
    setShowUpsellModal(false);
  };

  const guestMessageCount = userMessageCount();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background relative">
      {/* Upsell Modal */}
      <UpsellModal 
        isOpen={showUpsellModal}
        onSignIn={handleSignInFromUpsell}
        onContinue={handleContinueAsGuest}
        messageCount={guestMessageCount}
      />

      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold font-poppins">AI Assistant</h1>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-success">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Online & Ready
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isGuest && (
            <div className="text-xs font-bold text-foreground/50 bg-neutral-100 px-3 py-1 rounded-lg">
              {guestMessageCount}/{GUEST_MESSAGE_LIMIT} messages
            </div>
          )}
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-foreground/40"
            title="Reset Conversation"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === "assistant" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-600"
                }`}>
                  {m.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                
                <div className={`flex flex-col gap-2 max-w-[80%] ${m.role === "user" ? "items-end" : ""}`}>
                  <div className={`p-4 rounded-2xl ${
                    m.role === "assistant" 
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
                    <span className="text-[10px] text-foreground/40 font-medium">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.role === "assistant" && (
                      <div className="flex items-center gap-2">
                        <button className="text-foreground/20 hover:text-success transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="text-foreground/20 hover:text-secondary transition-colors">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
              <Info className="h-3 w-3" />
              Suggested: "How do I register to vote?"
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
              className="w-full pl-4 pr-14 py-4 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[60px]"
              rows={1}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-[10px] text-center text-foreground/40">
            AI responses are generated based on official government records. Always verify with your local election office.
          </p>
        </div>
      </div>
    </div>
  );
}
