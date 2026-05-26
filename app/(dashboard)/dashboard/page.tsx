"use client";

import { useState, useEffect } from "react";
import { motion as motionImport, AnimatePresence as AnimatePresenceImport } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { 
  Wallet, TrendingDown, PiggyBank, Target, Flame, Activity,
  Map, ClipboardList, Bot, AlertCircle, X, Check, ArrowRight,
  BookOpen, Star, HelpCircle, ShieldAlert, Sparkles, MessageSquare, Award
} from "lucide-react";
import { useGamification, getLevelFromXP } from "@/contexts/GamificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/contexts/StreakContext";
import { doc, collection, onSnapshot, query, orderBy, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Expense = { id: string; name: string; amount: number; category: string };
type Roadmap = { title: string; weeks: { title: string; tasks: { id: string; text: string; completed: boolean }[] }[] };
type ReportCard = { score: number; date: string; recommendations: string[] };

const COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const DAILY_TIPS = [
  "Track one expense today. Keep control over your small purchases.",
  "Check the Scam Checker before clicking on high-yield investment links.",
  "Save 10% of all unexpected income immediately.",
  "Inflation erodes cash value. Research index funds to hedge your wealth.",
  "Review your budget categorizations weekly to align with the 50/30/20 rule.",
  "Consistency is key. Answer one quiz question daily to level up your financial IQ."
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { streak } = useStreak();
  const { progress, streak: gamificationStreak, challenge, completeChallenge } = useGamification();

  // Firestore sync states
  const [income, setIncome] = useState(0);
  const [incomePeriod, setIncomePeriod] = useState("Monthly");
  const [savingsGoal, setSavingsGoal] = useState(100000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [latestReport, setLatestReport] = useState<ReportCard | null>(null);
  
  // Dashboard UI states
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [coachInput, setCoachInput] = useState("");
  const [dailyTip, setDailyTip] = useState("");

  useEffect(() => {
    setMounted(true);
    // Dynamic daily tip selection
    const day = new Date().getDate();
    setDailyTip(DAILY_TIPS[day % DAILY_TIPS.length]);
  }, []);

  // Fetch all user statistics & assets from Firestore/LocalStorage
  useEffect(() => {
    if (!mounted) return;

    if (user) {
      // 1. Budget
      const budgetRef = doc(firestore, "budgets", user.uid);
      const expensesRef = collection(firestore, "budgets", user.uid, "expenses");
      const q = query(expensesRef, orderBy("createdAt", "desc"));

      const unsubBudget = onSnapshot(budgetRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIncome(data.income ?? 0);
          setIncomePeriod(data.incomePeriod ?? "Monthly");
          setSavingsGoal(data.savingsGoal ?? 100000);
        }
      });

      const unsubExpenses = onSnapshot(q, (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
      });

      // 2. Roadmap
      const roadmapRef = doc(firestore, "roadmaps", user.uid);
      const unsubRoadmap = onSnapshot(roadmapRef, (snap) => {
        if (snap.exists()) {
          setRoadmap(snap.data() as Roadmap);
        }
      });

      // 3. Reports history
      const reportRef = doc(firestore, "reports", user.uid);
      const unsubReport = onSnapshot(reportRef, (snap) => {
        if (snap.exists()) {
          const history = snap.data().history || [];
          if (history.length > 0) {
            setLatestReport(history[history.length - 1]);
          }
        }
      });

      return () => { unsubBudget(); unsubExpenses(); unsubRoadmap(); unsubReport(); };
    } else {
      // LocalStorage Load
      const si = localStorage.getItem("atlaslearn_income");
      const sp = localStorage.getItem("atlaslearn_income_period");
      const sg = localStorage.getItem("atlaslearn_goal");
      const se = localStorage.getItem("atlaslearn_expenses");
      const rm = localStorage.getItem("atlaslearn_roadmap");
      const rh = localStorage.getItem("atlaslearn_report_history");

      if (si) setIncome(Number(si));
      if (sp) setIncomePeriod(sp);
      if (sg) setSavingsGoal(Number(sg));
      if (se) setExpenses(JSON.parse(se));
      if (rm) setRoadmap(JSON.parse(rm));
      if (rh) {
        const history = JSON.parse(rh);
        if (history.length > 0) setLatestReport(history[history.length - 1]);
      }
    }
  }, [user, mounted]);

  // Setup contextual alerts/notifications
  useEffect(() => {
    if (!mounted) return;

    const list = [];
    if (!challenge.completed) {
      list.push("Complete today's daily challenge to gain +20 XP and maintain your streak!");
    }
    if (income === 0) {
      list.push("Review your budget: Set your income and expenses to keep your calculations accurate.");
    }
    if (roadmap) {
      // check if any incomplete task exists
      let hasIncomplete = false;
      roadmap.weeks.forEach(w => {
        w.tasks.forEach(t => {
          if (!t.completed) hasIncomplete = true;
        });
      });
      if (hasIncomplete) {
        list.push("Roadmap task available: Tick off your next target on your Financial Roadmap.");
      }
    }
    if (!latestReport) {
      list.push("Financial Report card ready. Run analysis to receive your grade score.");
    }

    setNotifications(list);
  }, [mounted, challenge.completed, income, roadmap, latestReport]);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remainingBalance = income - totalExpenses;
  const savingsProgress = savingsGoal > 0 ? Math.min((remainingBalance / savingsGoal) * 100, 100) : 0;
  const budgetUsedPct = income > 0 ? Math.min((totalExpenses / income) * 100, 100) : 0;

  // Pie chart calculation
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  });
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  const healthScore = savingsProgress >= 100 ? "A+" : savingsProgress >= 75 ? "A" : savingsProgress >= 50 ? "B+" : savingsProgress >= 25 ? "B" : "C";

  const cashFlowData = [
    { name: "Income", income: income, expenses: 0 },
    { name: "Expenses", income: 0, expenses: totalExpenses },
    { name: "Balance", income: remainingBalance > 0 ? remainingBalance : 0, expenses: 0 },
  ];

  // Roadmap progress stat calculation
  const getRoadmapStats = () => {
    if (!roadmap) return { tot: 0, done: 0, pct: 0, nextTask: "" };
    let tot = 0, done = 0, nextTask = "";
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        tot += 1;
        if (t.completed) {
          done += 1;
        } else if (!nextTask) {
          nextTask = t.text;
        }
      });
    });
    const pct = tot > 0 ? Math.round((done / tot) * 100) : 0;
    return { tot, done, pct, nextTask };
  };
  const roadmapStats = getRoadmapStats();

  const handleDismissNotification = (index: number) => {
    setNotifications(notifications.filter((_, idx) => idx !== index));
  };

  const handleCoachInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim()) return;
    router.push(`/chatbot?q=${encodeURIComponent(coachInput)}`);
  };

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <motionImport.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! Here is your personal financial activity.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-help group relative">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse fill-orange-500" />
            <span className="font-bold text-sm">{streak?.currentStreak ?? 0} Day Streak!</span>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-xs font-normal">
              <p className="font-bold mb-1 text-foreground">🔥 Daily Streak</p>
              <p className="text-muted-foreground mb-2">Build daily savings habits and streaks to unlock consistency badges!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Alert List (Feature 5) */}
      <AnimatePresenceImport>
        {notifications.length > 0 && (
          <motionImport.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2 print:hidden"
          >
            {notifications.map((msg, idx) => (
              <motionImport.div
                key={idx}
                layout
                className="flex items-start justify-between gap-3 bg-gradient-to-r from-primary/10 to-card border border-border p-3.5 px-4 rounded-xl shadow-sm"
              >
                <div className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="leading-normal">{msg}</p>
                </div>
                <button
                  onClick={() => handleDismissNotification(idx)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motionImport.div>
            ))}
          </motionImport.div>
        )}
      </AnimatePresenceImport>

      {/* Core Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-muted-foreground font-medium text-sm">{incomePeriod} Income</h2>
          </div>
          <p className="text-3xl font-bold">₦{income.toLocaleString()}</p>
          {income === 0 && (
            <Link href="/budget" className="mt-3 text-xs text-primary hover:underline block">
              Set your income in Budget Planner →
            </Link>
          )}
        </motionImport.div>

        <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <TrendingDown className="w-24 h-24" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h2 className="text-muted-foreground font-medium text-sm">Total Expenses</h2>
          </div>
          <p className="text-3xl font-bold">₦{totalExpenses.toLocaleString()}</p>
          <div className="mt-3 flex items-center text-xs text-muted-foreground font-medium">
            <span>{budgetUsedPct.toFixed(0)}% of budget used</span>
          </div>
        </motionImport.div>

        <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-muted-foreground font-medium text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" /> Financial Health
            </h2>
            <span className="text-2xl font-bold text-primary">{healthScore}</span>
          </div>
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Savings Goal</span>
                <span>{savingsProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${savingsProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Budget Control</span>
                <span>{(100 - budgetUsedPct).toFixed(0)}% left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${budgetUsedPct > 90 ? "bg-destructive" : "bg-blue-500"}`}
                  style={{ width: `${Math.max(100 - budgetUsedPct, 0)}%` }}
                />
              </div>
            </div>
          </div>
        </motionImport.div>
      </div>

      {/* Two-Column Layout (Feature 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Analytics, Roadmap Progress, Report Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recharts Chart breakdown */}
          <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Financial Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    formatter={(v) => [`₦${Number(v).toLocaleString()}`, ""]}
                  />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motionImport.div>

          {/* AI Roadmap Progress Widget */}
          <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[200px] relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-[50px]" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" /> Active Growth Roadmap
                </h3>
                {roadmap && (
                  <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                    {roadmapStats.pct}% Complete
                  </span>
                )}
              </div>

              {roadmap ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-foreground">{roadmap.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Step-by-step 30-day growth target</p>
                  </div>
                  
                  {roadmapStats.nextTask ? (
                    <div className="bg-muted/40 border border-border p-3.5 rounded-xl text-xs flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground/80 truncate">**Next Step**: {roadmapStats.nextTask}</span>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 p-3.5 rounded-xl text-xs flex items-center gap-2 text-green-500 font-bold">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>All targets complete! Regenerate your roadmap to tackle new goals.</span>
                    </div>
                  )}

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-700"
                      style={{ width: `${roadmapStats.pct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">You have not created a learning roadmap yet.</p>
                  <Link href="/roadmap">
                    <button className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                      Setup AI Roadmap
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {roadmap && (
              <div className="flex justify-end mt-4">
                <Link href="/roadmap" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motionImport.div>

          {/* Financial Report Card Summary */}
          <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[200px] relative overflow-hidden">
            <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-500/5 rounded-full blur-[50px]" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" /> Latest Report Card
                </h3>
              </div>

              {latestReport ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-full relative shrink-0">
                    <span className="text-3xl font-black text-primary font-mono">{latestReport.score}%</span>
                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest absolute bottom-2">Score</span>
                  </div>
                  <div className="space-y-2 min-w-0">
                    <h4 className="text-sm font-bold text-foreground">Grade Analysis on {latestReport.date}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      **AI Tip**: {latestReport.recommendations?.[0] || "Maintain your current savings rate and complete weekly quizzes to increase your score."}
                    </p>
                    <Link href="/report">
                      <button className="bg-muted hover:bg-border text-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-border shadow-sm">
                        View Detailed Metrics
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">Generate your first report card to check your score.</p>
                  <Link href="/report">
                    <button className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                      Analyze Financial Fitness
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motionImport.div>

        </div>

        {/* RIGHT COLUMN: Streak, Level, Challenge, Atlas Coach Widget, Quick Actions */}
        <div className="space-y-6">
          
          {/* Level & XP Progress Card */}
          <motionImport.div variants={itemVariants} className="bg-gradient-to-br from-purple-600/20 to-indigo-600/10 border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Star className="w-28 h-28" />
            </div>
            
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-md shadow-purple-500/25">
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-80 leading-none mb-0.5">Lvl</span>
                <span className="text-lg font-black leading-none">{progress.level}</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground leading-snug">
                  {getLevelFromXP(progress.xp).name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  Accumulated <span className="font-bold text-foreground">{progress.xp} XP</span>
                </p>
              </div>
            </div>

            {/* Progress to next level */}
            {(() => {
              const lvlInfo = getLevelFromXP(progress.xp);
              const range = lvlInfo.nextXP - lvlInfo.prevXP;
              const currentInLevel = progress.xp - lvlInfo.prevXP;
              const pct = range > 0 ? Math.min((currentInLevel / range) * 100, 100) : 100;
              return (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Level Progress</span>
                    <span className="font-mono text-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted/60 border border-border/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </motionImport.div>

          {/* Daily Challenge Widget */}
          <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] text-primary font-black uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  Daily Challenge
                </span>
                {challenge.completed && (
                  <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Done
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mt-1">
                {challenge.challengeId === "save_500" ? "Save ₦500 today" : challenge.challengeId === "track_expenses" ? "Track all expenses today" : challenge.challengeId === "complete_quiz" ? "Complete one finance quiz" : challenge.challengeId === "ask_ai" ? "Ask Atlas AI one finance question" : challenge.challengeId === "detect_scam" ? "Detect one scam example" : "Review monthly spending"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Complete this task today to earn **+20 XP** and grow your streak.
              </p>
            </div>

            {!challenge.completed ? (
              <button
                onClick={completeChallenge}
                className="mt-4 bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all"
              >
                Mark Done (+20 XP)
              </button>
            ) : (
              <div className="mt-4 bg-green-500/10 border border-green-500/25 text-green-500 p-2 rounded-xl text-xs font-bold text-center">
                Reward claimed! Streak safe 🔥
              </div>
            )}
          </motionImport.div>

          {/* Atlas Coach Chat & Tips Widget */}
          <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Ask Atlas Coach</h3>
            </div>

            {/* Daily Tip box */}
            <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl text-xs">
              <span className="text-[9px] text-primary font-black uppercase tracking-wider block mb-1">
                Daily AI Tip
              </span>
              <p className="text-muted-foreground leading-relaxed">{dailyTip}</p>
            </div>

            {/* Fast-ask shortcut input */}
            <form onSubmit={handleCoachInputSubmit} className="flex gap-2">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="What should I improve today?"
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-3 rounded-xl transition-colors shadow-sm"
              >
                Ask
              </button>
            </form>

            <Link
              href="/chatbot?q=What%20should%20I%20improve%20today%3F"
              className="text-[11px] text-primary font-semibold hover:underline block text-center"
            >
              Suggested: &ldquo;What should I improve today?&rdquo;
            </Link>
          </motionImport.div>

          {/* Quick Actions & Recommendations Grid */}
          <motionImport.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-3">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Link href="/chatbot?q=Help%20me%20budget%20better" className="p-3 bg-background hover:bg-muted border border-border rounded-xl text-center transition-all flex flex-col items-center gap-1.5 hover:border-primary/20 shadow-sm">
                <Wallet className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-foreground/80">Help Me Budget</span>
              </Link>
              
              <Link href="/chatbot?q=Explain%20compound%20interest" className="p-3 bg-background hover:bg-muted border border-border rounded-xl text-center transition-all flex flex-col items-center gap-1.5 hover:border-primary/20 shadow-sm">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-bold text-foreground/80">Explain Simply</span>
              </Link>
              
              <Link href="/scam-checker" className="p-3 bg-background hover:bg-muted border border-border rounded-xl text-center transition-all flex flex-col items-center gap-1.5 hover:border-primary/20 shadow-sm">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold text-foreground/80">Check Scams</span>
              </Link>
              
              <Link href="/report" className="p-3 bg-background hover:bg-muted border border-border rounded-xl text-center transition-all flex flex-col items-center gap-1.5 hover:border-primary/20 shadow-sm">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-foreground/80">Get Report Card</span>
              </Link>
            </div>
          </motionImport.div>

        </div>

      </div>
    </motionImport.div>
  );
}
