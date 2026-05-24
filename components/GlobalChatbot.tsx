"use client";

/* eslint-disable react-hooks/purity */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Send, Loader2, Bot, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useGamification } from "@/contexts/GamificationContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "How do I start a budget?",
  "What is compound interest?",
  "How can I avoid financial scams?",
  "Best savings tips for students?",
];

/** Markdown component map — tuned for the compact chat bubble */
const markdownComponents: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-sm font-bold text-foreground mt-3 mb-1.5 first:mt-0 border-b border-border/50 pb-1">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[13px] font-bold text-foreground mt-3 mb-1 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mt-2.5 mb-1 first:mt-0">
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="space-y-1 mb-2 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-1 mb-2 pl-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed flex gap-1.5 items-start">
      <span className="text-primary mt-1 shrink-0 text-[8px]">●</span>
      <span>{children}</span>
    </li>
  ),

  // Bold & italic
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),

  // Blockquote — used for tips / warnings
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary pl-3 py-1 my-2 bg-primary/5 rounded-r-lg text-sm text-muted-foreground italic">
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ children }) => (
    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
      {children}
    </code>
  ),

  // Horizontal rule
  hr: () => <hr className="border-border/50 my-3" />,
};

export default function GlobalChatbot() {
  const pathname = usePathname();
  const { incrementAICount, triggerAction } = useGamification();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! 👋 I'm your **AtlasLearn AI Finance Tutor**.\n\nAsk me anything about **budgeting**, **investing**, or **personal finance** and I'll give you a clear, structured answer!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: Math.random().toString(), role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const assistantContent = data.message ?? data.content ?? "Sorry, I could not get a response.";
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString() + "-a", role: "assistant", content: assistantContent },
      ]);
      incrementAICount();
      triggerAction("ai");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString() + "-err",
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (pathname === "/chatbot") return null;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
            aria-label="Open AI Tutor"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatwindow"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl shadow-black/30 overflow-hidden"
            style={{ height: minimized ? "auto" : "540px", maxHeight: "calc(100vh - 6rem)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">Finance Tutor</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body — hidden when minimized */}
            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {msg.role === "user" ? (
                        /* User bubble — plain text, right-aligned */
                        <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-primary text-white">
                          {msg.content}
                        </div>
                      ) : (
                        /* AI bubble — full structured markdown report */
                        <div className="max-w-[88%] px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/60 border border-border/60 text-foreground shadow-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-muted/60 border border-border/60 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Suggested Prompts (only if single welcome message) */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-3 py-1 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-border shrink-0">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-2"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a finance question..."
                      disabled={loading}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                  <p className="text-center text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest">
                    Powered by Gemini
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
