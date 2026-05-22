"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Copy, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SUGGESTED_PROMPTS = [
  "How do I create my first budget?",
  "Explain index funds to a beginner.",
  "Which credit card is best for students?",
  "How much of my income should I save?"
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AtlasLearn AI Tutor. I can help you understand personal finance, budgeting, investing, and more. What would you like to learn about today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.message || "I couldn't process that right now.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: "Oops! I'm having trouble connecting right now.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    // Full-height container that fits within the dashboard shell — accounts for mobile top bar (pt-16)
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)]">

      {/* Desktop sidebar with suggested prompts */}
      <div className="hidden md:flex md:w-64 flex-col gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-muted-foreground text-sm mt-1">Ask any finance question.</p>
        </div>

        <div className="flex-1 bg-card border border-border p-4 rounded-2xl shadow-sm glass">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Suggested Topics</h2>
          <div className="space-y-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="w-full text-left text-sm p-3 bg-muted/50 hover:bg-muted border border-border rounded-xl transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="mt-8 flex items-center justify-center space-x-2 w-full p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm glass flex flex-col overflow-hidden min-h-0">

        {/* Mobile header row — title + clear button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">AI Tutor</h1>
            <p className="text-muted-foreground text-xs">Ask any finance question.</p>
          </div>
          <button
            onClick={() => setMessages([messages[0]])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        {/* Chat History — scrollable region */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex gap-2 md:gap-3 w-full max-w-[92%] md:max-w-[85%]",
                  message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Avatar — smaller on mobile */}
                <div className={cn(
                  "w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                )}>
                  {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "flex flex-col gap-1 min-w-0",
                  message.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-3 py-2 md:px-5 md:py-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/50 backdrop-blur-sm border border-border rounded-tl-sm text-foreground prose dark:prose-invert prose-sm max-w-none"
                  )}>
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Timestamp + copy */}
                  <div className="flex items-center space-x-2 opacity-60 text-xs mt-0.5">
                    <span suppressHydrationWarning>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {copiedId === message.id
                          ? <CheckCircle2 size={12} className="text-primary" />
                          : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                key="typing-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 md:gap-3 w-full max-w-[85%] mr-auto"
              >
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="bg-muted/50 border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-1.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Mobile horizontal suggestion chips — above input */}
        <div className="md:hidden flex overflow-x-auto px-3 py-2 gap-2 border-t border-border/50 shrink-0 no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap bg-muted/60 border border-border px-3 py-1.5 text-xs rounded-full hover:bg-muted shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-3 py-3 md:p-4 bg-background border-t border-border shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-end gap-2 bg-card border border-border rounded-2xl p-1.5 md:p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-sm"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask about finance..."
              className="w-full max-h-28 min-h-[40px] bg-transparent resize-none outline-none py-2 px-2 md:px-3 text-sm flex-1 leading-relaxed"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} className="translate-x-[1px] translate-y-[-1px]" />
            </button>
          </form>
          <div className="text-center mt-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Powered by Gemini</span>
          </div>
        </div>
      </div>
    </div>
  );
}
