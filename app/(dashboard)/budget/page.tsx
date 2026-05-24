"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Wallet,
  PiggyBank,
  ReceiptText,
  Target,
  Loader2,
  CloudOff,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification } from "@/contexts/GamificationContext";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  createdAt: number;
};

type DailyBudgetSummary = {
  date: string; // "YYYY-MM-DD"
  income: number;
  incomePeriod: string;
  savingsGoal: number;
  totalExpenses: number;
};

const CATEGORIES = ["Housing", "Food", "Transport", "Entertainment", "Utilities", "Other"];

const CATEGORY_EMOJI: Record<string, string> = {
  Food: "🍔",
  Transport: "🚗",
  Housing: "🏠",
  Entertainment: "🎮",
  Utilities: "⚡",
  Other: "📦",
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

export default function BudgetPage() {
  const { user } = useAuth();
  const { incrementBudgetCount, checkSavingsGoalReached, triggerAction } = useGamification();
  const [mounted, setMounted] = useState(false);

  // The date being viewed (defaults to today)
  const todayKey = toDateKey(new Date());
  const [viewingDate, setViewingDate] = useState(todayKey);
  const isToday = viewingDate === todayKey;

  // Budget fields for current viewing date
  const [income, setIncome] = useState(500000);
  const [incomePeriod, setIncomePeriod] = useState("Monthly");
  const [savingsGoal, setSavingsGoal] = useState(100000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // History panel
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<DailyBudgetSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper: storage key for localStorage
  const lsKey = (suffix: string) => `atlaslearn_budget_${viewingDate}_${suffix}`;

  // Load budget for the selected date
  useEffect(() => {
    if (!mounted) return;
    setLoadingData(true);

    if (user) {
      const budgetRef = doc(firestore, "budgets", user.uid, "daily", viewingDate);
      const expensesRef = collection(firestore, "budgets", user.uid, "daily", viewingDate, "expenses");
      const q = query(expensesRef, orderBy("createdAt", "desc"));

      const unsubBudget = onSnapshot(budgetRef, async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIncome(data.income ?? 500000);
          setIncomePeriod(data.incomePeriod ?? "Monthly");
          setSavingsGoal(data.savingsGoal ?? 100000);
        } else {
          // New day — try to get the remaining balance from the previous day
          try {
            const dailyRef = collection(firestore, "budgets", user.uid, "daily");
            const snapDocs = await getDocs(query(dailyRef, orderBy("date", "desc")));
            const prevDoc = snapDocs.docs.find((d) => d.id < viewingDate);
            if (prevDoc) {
              const prevData = prevDoc.data();
              const expRef = collection(firestore, "budgets", user.uid, "daily", prevDoc.id, "expenses");
              const expSnap = await getDocs(expRef);
              const totalExp = expSnap.docs.reduce((acc, e) => acc + (e.data().amount ?? 0), 0);
              const remaining = (prevData.income ?? 0) - totalExp;
              
              setIncome(remaining >= 0 ? remaining : 0);
              setIncomePeriod(prevData.incomePeriod ?? "Monthly");
              setSavingsGoal(prevData.savingsGoal ?? 100000);
            } else {
              setIncome(500000);
              setIncomePeriod("Monthly");
              setSavingsGoal(100000);
            }
          } catch (err) {
            console.error("Error loading previous day balance:", err);
            setIncome(500000);
            setIncomePeriod("Monthly");
            setSavingsGoal(100000);
          }
        }
        setLoadingData(false);
      });

      const unsubExpenses = onSnapshot(q, (snap) => {
        const data: Expense[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
        setExpenses(data);
      });

      return () => {
        unsubBudget();
        unsubExpenses();
      };
    } else {
      // localStorage fallback keyed by date
      const si = localStorage.getItem(lsKey("income"));
      const sp = localStorage.getItem(lsKey("period"));
      const sg = localStorage.getItem(lsKey("goal"));
      const se = localStorage.getItem(lsKey("expenses"));
      if (si) {
        setIncome(Number(si));
        setIncomePeriod(sp ?? "Monthly");
        setSavingsGoal(sg ? Number(sg) : 100000);
        setExpenses(se ? JSON.parse(se) : []);
      } else {
        // No budget for today yet, find latest previous day in localStorage
        let latestPrevDate = "";
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("atlaslearn_budget_") && key.endsWith("_income")) {
            const dateKey = key.replace("atlaslearn_budget_", "").replace("_income", "");
            if (dateKey < viewingDate) {
              if (!latestPrevDate || dateKey > latestPrevDate) {
                latestPrevDate = dateKey;
              }
            }
          }
        }
        if (latestPrevDate) {
          const prevInc = Number(localStorage.getItem(`atlaslearn_budget_${latestPrevDate}_income`) ?? 0);
          const prevGoal = Number(localStorage.getItem(`atlaslearn_budget_${latestPrevDate}_goal`) ?? 100000);
          const prevPeriod = localStorage.getItem(`atlaslearn_budget_${latestPrevDate}_period`) ?? "Monthly";
          const prevExpensesRaw = localStorage.getItem(`atlaslearn_budget_${latestPrevDate}_expenses`);
          const prevExps = prevExpensesRaw ? JSON.parse(prevExpensesRaw) : [];
          const totalExp = prevExps.reduce((acc: number, e: any) => acc + (e.amount ?? 0), 0);
          const remaining = prevInc - totalExp;
          setIncome(remaining >= 0 ? remaining : 0);
          setIncomePeriod(prevPeriod);
          setSavingsGoal(prevGoal);
        } else {
          setIncome(500000);
          setIncomePeriod("Monthly");
          setSavingsGoal(100000);
        }
        setExpenses([]);
      }
      setLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mounted, viewingDate]);

  // Sync income/goal to storage when they change (only for today, history is read-only display)
  useEffect(() => {
    if (!mounted || loadingData || !isToday) return;
    if (user) {
      const budgetRef = doc(firestore, "budgets", user.uid, "daily", viewingDate);
      setDoc(budgetRef, { income, incomePeriod, savingsGoal, date: viewingDate }, { merge: true });
      incrementBudgetCount();
      triggerAction("budget");
    } else {
      localStorage.setItem(lsKey("income"), income.toString());
      localStorage.setItem(lsKey("period"), incomePeriod);
      localStorage.setItem(lsKey("goal"), savingsGoal.toString());
      incrementBudgetCount();
      triggerAction("budget");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, incomePeriod, savingsGoal, user, mounted, loadingData, isToday]);

  // Load history summaries
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      if (user) {
        const dailyRef = collection(firestore, "budgets", user.uid, "daily");
        const snap = await getDocs(dailyRef);
        const summaries: DailyBudgetSummary[] = [];
        for (const d of snap.docs) {
          const data = d.data();
          // Fetch expenses total for this day
          const expRef = collection(firestore, "budgets", user.uid, "daily", d.id, "expenses");
          const expSnap = await getDocs(expRef);
          const totalExpenses = expSnap.docs.reduce((acc, e) => acc + (e.data().amount ?? 0), 0);
          summaries.push({
            date: d.id,
            income: data.income ?? 0,
            incomePeriod: data.incomePeriod ?? "Monthly",
            savingsGoal: data.savingsGoal ?? 0,
            totalExpenses,
          });
        }
        summaries.sort((a, b) => b.date.localeCompare(a.date));
        setHistory(summaries);
      } else {
        // Read all localStorage keys matching our pattern
        const summaries: DailyBudgetSummary[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("atlaslearn_budget_") && key.endsWith("_income")) {
            const dateKey = key.replace("atlaslearn_budget_", "").replace("_income", "");
            const inc = Number(localStorage.getItem(`atlaslearn_budget_${dateKey}_income`) ?? 0);
            const period = localStorage.getItem(`atlaslearn_budget_${dateKey}_period`) ?? "Monthly";
            const goal = Number(localStorage.getItem(`atlaslearn_budget_${dateKey}_goal`) ?? 0);
            const expRaw = localStorage.getItem(`atlaslearn_budget_${dateKey}_expenses`);
            const exps: Expense[] = expRaw ? JSON.parse(expRaw) : [];
            const totalExpenses = exps.reduce((a, e) => a + e.amount, 0);
            summaries.push({ date: dateKey, income: inc, incomePeriod: period, savingsGoal: goal, totalExpenses });
          }
        }
        summaries.sort((a, b) => b.date.localeCompare(a.date));
        setHistory(summaries);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = income - totalExpenses;
  const savingsProgress = income > 0 ? Math.min((remainingBalance / savingsGoal) * 100, 100) : 0;

  // Check if savings goal achieved for Savings Hero badge
  useEffect(() => {
    if (mounted && isToday && savingsProgress >= 100 && savingsGoal > 0) {
      checkSavingsGoalReached();
      triggerAction("savings");
    }
  }, [savingsProgress, savingsGoal, isToday, mounted]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount || !isToday) return;
    setSaving(true);

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      amount: Number(newAmount),
      category: newCategory,
      createdAt: Date.now(),
    };

    try {
      if (user) {
        const expRef = doc(
          collection(firestore, "budgets", user.uid, "daily", viewingDate, "expenses"),
          newExpense.id
        );
        await setDoc(expRef, newExpense);
        // Update summary on budget doc
        const budgetRef = doc(firestore, "budgets", user.uid, "daily", viewingDate);
        await setDoc(budgetRef, { income, incomePeriod, savingsGoal, date: viewingDate }, { merge: true });
      } else {
        const updated = [newExpense, ...expenses];
        setExpenses(updated);
        localStorage.setItem(lsKey("expenses"), JSON.stringify(updated));
      }
      setNewName("");
      setNewAmount("");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!isToday) return; // can't edit past budgets
    if (user) {
      await deleteDoc(doc(firestore, "budgets", user.uid, "daily", viewingDate, "expenses", id));
    } else {
      const updated = expenses.filter((exp) => exp.id !== id);
      setExpenses(updated);
      localStorage.setItem(lsKey("expenses"), JSON.stringify(updated));
    }
  };

  const goToPrevDay = () => {
    const d = new Date(viewingDate);
    d.setDate(d.getDate() - 1);
    setViewingDate(toDateKey(d));
  };

  const goToNextDay = () => {
    const d = new Date(viewingDate);
    d.setDate(d.getDate() + 1);
    const next = toDateKey(d);
    if (next <= todayKey) setViewingDate(next);
  };

  if (!mounted || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-10"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
          <p className="text-muted-foreground mt-1">Plan your spending and hit your savings goals.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!user && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <CloudOff className="w-3.5 h-3.5" />
              <span>Sign in to sync across devices</span>
            </div>
          )}
          <button
            onClick={() => { setShowHistory(true); loadHistory(); }}
            className="flex items-center gap-2 text-sm font-medium border border-border bg-card/60 hover:bg-muted px-4 py-2 rounded-xl transition-colors"
          >
            <History className="w-4 h-4" />
            Budget History
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={goToPrevDay}
          className="p-2 rounded-xl border border-border bg-card/60 hover:bg-muted transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 bg-card/60 border border-border px-5 py-2.5 rounded-xl shadow-sm min-w-[220px] justify-center">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">
            {isToday ? "Today — " : ""}{formatDateLabel(viewingDate)}
          </span>
        </div>
        <button
          onClick={goToNextDay}
          disabled={viewingDate >= todayKey}
          className="p-2 rounded-xl border border-border bg-card/60 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {!isToday && (
        <div className="flex items-center justify-center">
          <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Viewing past budget — read-only. Switch to today to make changes.
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-muted-foreground font-medium text-sm">Income</h2>
            </div>
            {isToday ? (
              <select
                value={incomePeriod}
                onChange={(e) => setIncomePeriod(e.target.value)}
                className="text-xs bg-muted/50 border border-border text-muted-foreground rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            ) : (
              <span className="text-xs bg-muted/50 border border-border text-muted-foreground rounded-lg px-2 py-1">
                {incomePeriod}
              </span>
            )}
          </div>
          {isToday ? (
            <input
              type="number"
              value={income || ""}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="text-3xl font-bold bg-transparent border-none focus:ring-0 w-full outline-none text-foreground"
            />
          ) : (
            <p className="text-3xl font-bold">₦{income.toLocaleString()}</p>
          )}
        </div>

        <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h2 className="text-muted-foreground font-medium text-sm">Total Expenses</h2>
          </div>
          <p className="text-3xl font-bold">₦{totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h2 className="text-muted-foreground font-medium text-sm">Remaining Balance</h2>
          </div>
          <p className={cn("text-3xl font-bold", remainingBalance < 0 ? "text-destructive" : "")}>
            ₦{remainingBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Goals & Add Expense */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Savings Goal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Target Amount (₦)</label>
                {isToday ? (
                  <input
                    type="number"
                    value={savingsGoal || ""}
                    onChange={(e) => setSavingsGoal(Number(e.target.value))}
                    className="w-full border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  />
                ) : (
                  <p className="text-xl font-bold">₦{savingsGoal.toLocaleString()}</p>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>Progress</span>
                  <span className={savingsProgress >= 100 ? "text-primary" : ""}>
                    {savingsProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(savingsProgress, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", savingsProgress >= 100 ? "bg-primary" : "bg-blue-500")}
                  />
                </div>
                {savingsProgress >= 100 && (
                  <p className="text-sm text-primary mt-2 font-medium">Goal achieved! 🎉</p>
                )}
              </div>
            </div>
          </div>

          {isToday && (
            <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Expense
              </h2>
              <form onSubmit={handleAddExpense} className="space-y-3">
                <input
                  type="text"
                  placeholder="Expense Name (e.g. Netflix)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  required
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    placeholder="Amount (₦)"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="flex-1 border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                    required
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none w-full sm:w-[130px] text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add to Budget
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Col: Expense List */}
        <div className="lg:col-span-2">
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl shadow-sm min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{expenses.length} expense(s) recorded</p>
            </div>

            <div className="p-6 flex-1">
              {expenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-10">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <ReceiptText className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">No expenses recorded{!isToday ? " for this day" : " yet"}.</p>
                  {isToday && <p className="text-sm">Add your first expense using the form.</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {expenses.map((expense) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-xl">
                            {CATEGORY_EMOJI[expense.category] ?? "📦"}
                          </div>
                          <div>
                            <h3 className="font-semibold">{expense.name}</h3>
                            <p className="text-sm text-muted-foreground">{expense.category}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-3 sm:mt-0 items-end">
                          <span className="font-bold text-lg sm:text-base">₦{expense.amount.toLocaleString()}</span>
                          {isToday && (
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 -mr-2 sm:mr-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> Budget History
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Click a day to view its budget</p>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingHistory ? (
                  <div className="flex items-center justify-center pt-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-20 text-muted-foreground">
                    <CalendarDays className="w-12 h-12 opacity-30 mb-3" />
                    <p className="font-medium">No past budgets found.</p>
                    <p className="text-sm">Start adding expenses today!</p>
                  </div>
                ) : (
                  history.map((item) => {
                    const remaining = item.income - item.totalExpenses;
                    const progress = item.income > 0 ? Math.min((remaining / item.savingsGoal) * 100, 100) : 0;
                    const isSelected = viewingDate === item.date;
                    return (
                      <button
                        key={item.date}
                        onClick={() => { setViewingDate(item.date); setShowHistory(false); }}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">{formatDateLabel(item.date)}</p>
                            {item.date === todayKey && (
                              <span className="text-xs text-primary font-medium">Today</span>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            remaining >= 0
                              ? "text-green-500 bg-green-500/10"
                              : "text-destructive bg-destructive/10"
                          )}>
                            {remaining >= 0 ? "+" : ""}₦{remaining.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                          <span>Income: <strong className="text-foreground">₦{item.income.toLocaleString()}</strong></span>
                          <span>Expenses: <strong className="text-foreground">₦{item.totalExpenses.toLocaleString()}</strong></span>
                          <span>Goal: <strong className="text-foreground">₦{item.savingsGoal.toLocaleString()}</strong></span>
                          <span>Period: <strong className="text-foreground">{item.incomePeriod}</strong></span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-primary" : "bg-blue-500")}
                            style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% of savings goal</p>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
