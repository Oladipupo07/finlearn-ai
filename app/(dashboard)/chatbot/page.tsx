"use client";

/* eslint-disable react-hooks/purity */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Copy, CheckCircle2, RotateCcw, Wallet, ShieldAlert, Award, TrendingUp, HelpCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "@/contexts/GamificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/contexts/StreakContext";
import { doc, getDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_ACTIONS = [
  { text: "Help Me Budget", prompt: "Help me budget based on my income and expenses.", icon: Wallet, color: "text-green-500 bg-green-500/10" },
  { text: "Improve My Score", prompt: "How can I improve my financial score?", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
  { text: "Explain Simply", prompt: "Explain personal finance concepts simply.", icon: HelpCircle, color: "text-purple-500 bg-purple-500/10" },
  { text: "Detect Scam", prompt: "Tell me how to detect scams and protect my money.", icon: ShieldAlert, color: "text-red-500 bg-red-500/10" },
  { text: "Recommend Next Step", prompt: "Recommend my next step based on my level and roadmap progress.", icon: Award, color: "text-amber-500 bg-amber-500/10" },
  { text: "Create Study Plan", prompt: "Create a 7-day study plan for me.", icon: BookOpen, color: "text-indigo-500 bg-indigo-500/10" }
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const { streak } = useStreak();
  const { progress, incrementAICount, triggerAction } = useGamification();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Atlas Coach, your personal AI finance tutor and coach. I've analyzed your financial data and am ready to help you optimize your savings, master budgeting, and avoid scams. Ask me anything or select a quick action below!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States to hold user stats
  const [income, setIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(100000);
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [latestReportScore, setLatestReportScore] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real-time budget, roadmap and report card info for coaching context
  useEffect(() => {
    if (!mounted) return;

    if (user) {
      // 1. Budget Stats
      const budgetRef = doc(firestore, "budgets", user.uid);
      const expensesRef = collection(firestore, "budgets", user.uid, "expenses");
      const unsubBudget = onSnapshot(budgetRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIncome(data.income ?? 0);
          setSavingsGoal(data.savingsGoal ?? 100000);
        }
      });
      const unsubExpenses = onSnapshot(expensesRef, (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
        setTotalExpenses(total);
      });

      // 2. Roadmap progress
      const roadmapRef = doc(firestore, "roadmaps", user.uid);
      const unsubRoadmap = onSnapshot(roadmapRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          let tot = 0;
          let done = 0;
          if (data.weeks) {
            data.weeks.forEach((w: any) => {
              w.tasks.forEach((t: any) => {
                tot += 1;
                if (t.completed) done += 1;
              });
            });
          }
          setRoadmapProgress(tot > 0 ? Math.round((done / tot) * 100) : 0);
        }
      });

      // 3. Reports
      const reportRef = doc(firestore, "reports", user.uid);
      const unsubReport = onSnapshot(reportRef, (snap) => {
        if (snap.exists()) {
          const reports = snap.data().history || [];
          if (reports.length > 0) {
            setLatestReportScore(reports[reports.length - 1].score);
          }
        }
      });

      return () => { unsubBudget(); unsubExpenses(); unsubRoadmap(); unsubReport(); };
    } else {
      // LocalStorage fallbacks
      const si = localStorage.getItem("atlaslearn_income");
      const sg = localStorage.getItem("atlaslearn_goal");
      const se = localStorage.getItem("atlaslearn_expenses");
      const rm = localStorage.getItem("atlaslearn_roadmap");
      const rh = localStorage.getItem("atlaslearn_report_history");

      if (si) setIncome(Number(si));
      if (sg) setSavingsGoal(Number(sg));
      if (se) {
        try {
          const parsedExpenses = JSON.parse(se) as { amount: number }[];
          setTotalExpenses(parsedExpenses.reduce((sum, e) => sum + e.amount, 0));
        } catch {}
      }
      if (rm) {
        try {
          const data = JSON.parse(rm);
          let tot = 0, done = 0;
          data.weeks?.forEach((w: any) => {
            w.tasks?.forEach((t: any) => {
              tot += 1;
              if (t.completed) done += 1;
            });
          });
          setRoadmapProgress(tot > 0 ? Math.round((done / tot) * 100) : 0);
        } catch {}
      }
      if (rh) {
        try {
          const data = JSON.parse(rh);
          if (data.length > 0) {
            setLatestReportScore(data[data.length - 1].score);
          }
        } catch {}
      }
    }
  }, [user, mounted]);

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
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content })),
          userData: {
            income,
            totalExpenses,
            savingsGoal,
            streak: streak?.currentStreak ?? 0,
            level: progress.level,
            xp: progress.xp,
            roadmapProgress,
            latestReportScore
          }
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
      incrementAICount();
      triggerAction("ai");
    } catch (error) {
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: "Oops! I'm having trouble connecting to Atlas Coach right now.",
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
    <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 min-h-[calc(100vh-8rem)] w-full pb-6">

      {/* Desktop sidebar with suggested prompts */}
      <div className="hidden md:flex md:w-80 flex-col gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atlas Coach</h1>
          <p className="text-muted-foreground text-sm mt-1">Your AI Personal Finance Coach.</p>
        </div>

        <div className="flex-1 bg-card border border-border p-5 rounded-3xl shadow-sm glass flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-black mb-4 uppercase tracking-wider text-muted-foreground">Coach Panel Actions</h2>
            <div className="grid grid-cols-1 gap-2.5">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="w-full text-left text-xs p-3 bg-background hover:bg-muted border border-border hover:border-primary/20 rounded-xl transition-all flex items-center gap-3 group"
                >
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-foreground/90">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="mt-6 flex items-center justify-center space-x-2 w-full p-2.5 text-xs font-semibold border border-border hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Conversation</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-card border border-border rounded-3xl shadow-sm glass flex flex-col overflow-hidden min-h-0">

        {/* Mobile header row — title + clear button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div>
            <h1 className="text-lg font-black tracking-tight leading-tight">Atlas Coach</h1>
            <p className="text-muted-foreground text-xs">AI Personal Finance Coach.</p>
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 min-h-[300px]">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex gap-2.5 md:gap-3 w-full max-w-[95%] md:max-w-[85%]",
                  message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                )}>
                  {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "flex flex-col gap-1 min-w-0",
                  message.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-2.5 md:px-5 md:py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed break-words",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/50 backdrop-blur-sm border border-border rounded-tl-sm text-foreground prose dark:prose-invert prose-sm max-w-none"
                  )}>
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="m-0 last:mb-0 mb-2 leading-relaxed">{children}</p>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Timestamp + copy */}
                  <div className="flex items-center space-x-2 opacity-60 text-xs mt-0.5 px-1">
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
                className="flex gap-2.5 md:gap-3 w-full max-w-[85%] mr-auto"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="bg-muted/50 border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-1.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Mobile horizontal quick actions row — above input */}
        <div className="md:hidden flex overflow-x-auto px-3 py-2.5 gap-2 border-t border-border/50 shrink-0 no-scrollbar bg-card/40">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action.prompt)}
              className="whitespace-nowrap bg-background border border-border hover:border-primary/20 px-3.5 py-2 text-xs rounded-full hover:bg-muted shrink-0 font-bold text-foreground/90 flex items-center gap-1.5 shadow-sm"
            >
              <action.icon className="w-3.5 h-3.5 text-primary" />
              {action.text}
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
              placeholder="Ask Atlas Coach about your finances..."
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
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Context-Aware AI Personal Coach</span>
          </div>
        </div>
      </div>
    </div>
  );
}
