"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Flame, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const [income, setIncome] = useState(0);
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
          setSavingsGoal(data.savingsGoal ?? 100000);
        }
      });

      const unsubExpenses = onSnapshot(q, (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
      });

      return () => { unsubBudget(); unsubExpenses(); };
    } else {
      const si = localStorage.getItem("atlaslearn_income");
      const sg = localStorage.getItem("atlaslearn_goal");
      const se = localStorage.getItem("atlaslearn_expenses");
      if (si) setIncome(Number(si));
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
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="font-bold text-sm">7 Day Streak!</span>
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
            <h2 className="text-muted-foreground font-medium text-sm">Monthly Income</h2>
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
          <motion.div variants={itemVariants} className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm" style={{ height: 260 }}>
            <h2 className="text-lg font-semibold mb-2">Spending Categories</h2>
            {categoryData.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center">
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
    </motion.div>
  );
}
