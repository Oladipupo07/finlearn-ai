"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { 
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Flame, Activity,
  BrainCircuit, Bot, ShieldAlert, PieChart as PieChartIcon, GraduationCap, Award, CheckCircle, Lock, Trophy, Sparkles, Check
} from "lucide-react";
import { useGamification, getLevelFromXP, BADGES_LIST } from "@/contexts/GamificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/contexts/StreakContext";
import { doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";

type Expense = { id: string; name: string; amount: number; category: string };

const COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { streak } = useStreak();
  const { progress, streak: gamificationStreak, challenge, completeChallenge, badges } = useGamification();
  const [income, setIncome] = useState(0);
  const [incomePeriod, setIncomePeriod] = useState("Monthly");
  const [savingsGoal, setSavingsGoal] = useState(100000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load from Firestore if signed in, else from localStorage
  useEffect(() => {
    if (!mounted) return;

    if (user) {
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

      return () => { unsubBudget(); unsubExpenses(); };
    } else {
      const si = localStorage.getItem("atlaslearn_income");
      const sp = localStorage.getItem("atlaslearn_income_period");
      const sg = localStorage.getItem("atlaslearn_goal");
      const se = localStorage.getItem("atlaslearn_expenses");
      if (si) setIncome(Number(si));
      if (sp) setIncomePeriod(sp);
      if (sg) setSavingsGoal(Number(sg));
      if (se) setExpenses(JSON.parse(se));
    }
  }, [user, mounted]);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remainingBalance = income - totalExpenses;
  const savingsProgress = savingsGoal > 0 ? Math.min((remainingBalance / savingsGoal) * 100, 100) : 0;
  const budgetUsedPct = income > 0 ? Math.min((totalExpenses / income) * 100, 100) : 0;

  // Build category breakdown for pie chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  });
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  // Health score based on savings progress
  const healthScore = savingsProgress >= 100 ? "A+" : savingsProgress >= 75 ? "A" : savingsProgress >= 50 ? "B+" : savingsProgress >= 25 ? "B" : "C";

  // Mini cashflow: show current month summary
  const cashFlowData = [
    { name: "Income", income: income, expenses: 0 },
    { name: "Expenses", income: 0, expenses: totalExpenses },
    { name: "Balance", income: remainingBalance > 0 ? remainingBalance : 0, expenses: 0 },
  ];

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! Here is your financial summary.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-help group relative">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse fill-orange-500" />
            <span className="font-bold text-sm">{streak?.currentStreak ?? 0} Day Streak!</span>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-xs font-normal">
              <p className="font-bold mb-1 text-foreground">🔥 Daily Streak</p>
              <p className="text-muted-foreground mb-2">Keep learning daily to maintain your streak!</p>
              <div className="border-t border-border/50 pt-2 flex justify-between">
                <span>Personal Best:</span>
                <span className="font-bold text-primary">{streak?.longestStreak ?? 0} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
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
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
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
          <div className="mt-3 flex items-center text-sm text-muted-foreground font-medium">
            <span>{budgetUsedPct.toFixed(0)}% of budget used</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-muted-foreground font-medium text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" /> Financial Health
            </h2>
            <span className="text-2xl font-bold text-primary">{healthScore}</span>
          </div>
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Savings Goal</span>
                <span className="font-medium">{savingsProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${savingsProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Budget Control</span>
                <span className="font-medium">{(100 - budgetUsedPct).toFixed(0)}% left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${budgetUsedPct > 90 ? "bg-destructive" : "bg-blue-500"}`}
                  style={{ width: `${Math.max(100 - budgetUsedPct, 0)}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
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
          {income === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              <Link href="/budget" className="text-primary hover:underline">Set your budget</Link> to see live data
            </p>
          )}
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm min-h-[260px] flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Spending Categories</h2>
            {categoryData.length > 0 ? (
              <>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                        formatter={(v) => [`₦${Number(v).toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {categoryData.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">₦{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <div className="text-center text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No expenses yet</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/20 to-blue-500/10 border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <PiggyBank className="w-28 h-28" />
            </div>
            <h2 className="text-base font-bold mb-1">Savings Progress</h2>
            <p className="text-sm text-muted-foreground mb-3">Goal: ₦{savingsGoal.toLocaleString()}</p>
            <div className="relative w-full h-2 bg-muted rounded-full mb-2">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-700"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₦{Math.max(remainingBalance, 0).toLocaleString()} saved</span>
              <span>{savingsProgress.toFixed(0)}%</span>
            </div>
            <Link href="/budget">
              <button className="mt-4 bg-primary text-white font-medium text-sm px-4 py-2 rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                Manage Budget →
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Gamification & Engagement Widgets */}
      <div className="mt-12 border-t border-border/50 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Learning Journey</h2>
            <p className="text-muted-foreground text-sm">Build daily finance habits, level up, and unlock achievements.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Challenge & Level Progress (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Challenge Widget */}
            <motion.div
              variants={itemVariants}
              className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[180px]"
            >
              {/* Decorative radial background */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-primary font-black uppercase tracking-wider bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                    Daily Challenge
                  </span>
                  {challenge.completed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-500 font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed (+20 XP)
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Expires Today
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                    {(() => {
                      const icons: Record<string, React.ComponentType<any>> = {
                        PiggyBank: PiggyBank,
                        Wallet: Wallet,
                        BrainCircuit: BrainCircuit,
                        Bot: Bot,
                        ShieldAlert: ShieldAlert,
                        PieChart: PieChartIcon,
                      };
                      const IconComp = icons[challenge.challengeId === "save_500" ? "PiggyBank" : challenge.challengeId === "track_expenses" ? "Wallet" : challenge.challengeId === "complete_quiz" ? "BrainCircuit" : challenge.challengeId === "ask_ai" ? "Bot" : challenge.challengeId === "detect_scam" ? "ShieldAlert" : "PieChart"] || PiggyBank;
                      return <IconComp className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {challenge.challengeId === "save_500" ? "Save ₦500 today" : challenge.challengeId === "track_expenses" ? "Track all expenses today" : challenge.challengeId === "complete_quiz" ? "Complete one finance quiz" : challenge.challengeId === "ask_ai" ? "Ask Atlas AI one finance question" : challenge.challengeId === "detect_scam" ? "Detect one scam example" : "Review monthly spending"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Earn +20 XP and advance your daily learning streak!
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-4 mt-2">
                <div className="flex-1 max-w-[200px]">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                    <span>Progress</span>
                    <span>{challenge.completed ? "1/1" : "0/1"}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: challenge.completed ? "100%" : "0%" }}
                    />
                  </div>
                </div>
                {!challenge.completed ? (
                  <button
                    onClick={completeChallenge}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Mark Complete
                  </button>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/25 text-green-500 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 select-none">
                    <Check className="w-4 h-4" /> Challenge Done!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Level & XP Progress Card */}
            <motion.div
              variants={itemVariants}
              className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden"
            >
              {/* Decorative radial background */}
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-purple-500/30">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 leading-none mb-0.5">Lvl</span>
                    <span className="text-xl font-black leading-none">{progress.level}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                      {getLevelFromXP(progress.xp).name}
                      <span className="text-xs font-semibold px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full uppercase tracking-wider">
                        Level {progress.level}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Accumulated <span className="font-semibold text-foreground">{progress.xp} XP</span> since joining.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 shrink-0 bg-muted/40 border border-border/50 p-4 rounded-2xl min-w-[200px]">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Daily Streak</p>
                    <p className="text-lg font-black text-orange-500 mt-0.5 flex items-center justify-center gap-1 animate-pulse" style={{ animationDuration: '2s' }}>
                      {gamificationStreak.currentStreak} 🔥
                    </p>
                  </div>
                  <div className="w-px bg-border/50" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Longest Streak</p>
                    <p className="text-lg font-black text-primary mt-0.5">
                      {gamificationStreak.longestStreak} 🏆
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar to next level */}
              <div className="relative z-10 mt-6">
                {(() => {
                  const lvlInfo = getLevelFromXP(progress.xp);
                  const range = lvlInfo.nextXP - lvlInfo.prevXP;
                  const currentInLevel = progress.xp - lvlInfo.prevXP;
                  const pct = range > 0 ? Math.min((currentInLevel / range) * 100, 100) : 100;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progress to Next Level</span>
                        <span className="font-mono text-foreground font-bold">
                          {progress.xp >= 2000 ? "MAX LEVEL" : `${progress.xp} / ${lvlInfo.nextXP} XP (${pct.toFixed(0)}%)`}
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden border border-border/20 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-inner"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Badge Gallery */}
          <div className="lg:col-span-1">
            <motion.div
              variants={itemVariants}
              className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-3xl shadow-sm flex flex-col h-full justify-between"
            >
              <div>
                <h3 className="text-lg font-extrabold text-foreground mb-1 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Achievement Badges
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Complete tasks, use AI, build savings, and unlock premium badges.
                </p>

                <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                  {BADGES_LIST.map((badge) => {
                    const isUnlocked = !!badges.unlocked[badge.id];
                    const unlockedDate = badges.unlocked[badge.id];

                    return (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                          isUnlocked
                            ? "bg-background border-border/80"
                            : "bg-muted/10 border-dashed border-border/60 opacity-60"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUnlocked 
                            ? `${badge.bgColor} ${badge.color}` 
                            : "bg-muted/40 text-muted-foreground border-border/50"
                        }`}>
                          {(() => {
                            const icons: Record<string, React.ComponentType<any>> = {
                              Wallet: Wallet,
                              Bot: Bot,
                              Trophy: Trophy,
                              ShieldAlert: ShieldAlert,
                              Flame: Flame,
                              PiggyBank: PiggyBank,
                              GraduationCap: GraduationCap,
                            };
                            const IconComp = icons[badge.icon] || Award;
                            return <IconComp className="w-5.5 h-5.5" />;
                          })()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm font-bold truncate ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                              {badge.title}
                            </h4>
                            {isUnlocked ? (
                              <span className="text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full select-none shrink-0 border border-amber-500/15">
                                Unlocked
                              </span>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {badge.description}
                          </p>
                          {isUnlocked && unlockedDate && (
                            <p className="text-[9px] text-muted-foreground opacity-60 mt-1 font-semibold">
                              Unlocked on {unlockedDate}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
