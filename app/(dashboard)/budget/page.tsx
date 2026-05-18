"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Wallet, PiggyBank, ReceiptText, Target, Loader2, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  createdAt: number;
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

export default function BudgetPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [income, setIncome] = useState(500000);
  const [savingsGoal, setSavingsGoal] = useState(100000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If auth user: use Firestore; else fall back to localStorage
  useEffect(() => {
    if (!mounted) return;

    if (user) {
      const budgetRef = doc(firestore, "budgets", user.uid);
      const expensesRef = collection(firestore, "budgets", user.uid, "expenses");
      const q = query(expensesRef, orderBy("createdAt", "desc"));

      // Listen to budget doc
      const unsubBudget = onSnapshot(budgetRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIncome(data.income ?? 500000);
          setSavingsGoal(data.savingsGoal ?? 100000);
        }
        setLoadingData(false);
      });

      // Listen to expenses
      const unsubExpenses = onSnapshot(q, (snap) => {
        const data: Expense[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
        setExpenses(data);
      });

      return () => {
        unsubBudget();
        unsubExpenses();
      };
    } else {
      // Fallback: localStorage
      const si = localStorage.getItem("atlaslearn_income");
      const sg = localStorage.getItem("atlaslearn_goal");
      const se = localStorage.getItem("atlaslearn_expenses");
      if (si) setIncome(Number(si));
      if (sg) setSavingsGoal(Number(sg));
      if (se) setExpenses(JSON.parse(se));
      setLoadingData(false);
    }
  }, [user, mounted]);

  // Sync income/goal to Firestore or localStorage on change
  useEffect(() => {
    if (!mounted || loadingData) return;
    if (user) {
      const budgetRef = doc(firestore, "budgets", user.uid);
      setDoc(budgetRef, { income, savingsGoal }, { merge: true });
    } else {
      localStorage.setItem("atlaslearn_income", income.toString());
      localStorage.setItem("atlaslearn_goal", savingsGoal.toString());
    }
  }, [income, savingsGoal, user, mounted, loadingData]);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = income - totalExpenses;
  const savingsProgress = income > 0 ? Math.min((remainingBalance / savingsGoal) * 100, 100) : 0;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
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
        const expRef = doc(collection(firestore, "budgets", user.uid, "expenses"), newExpense.id);
        await setDoc(expRef, newExpense);
      } else {
        const updated = [newExpense, ...expenses];
        setExpenses(updated);
        localStorage.setItem("atlaslearn_expenses", JSON.stringify(updated));
      }
      setNewName("");
      setNewAmount("");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (user) {
      await deleteDoc(doc(firestore, "budgets", user.uid, "expenses", id));
    } else {
      const updated = expenses.filter((exp) => exp.id !== id);
      setExpenses(updated);
      localStorage.setItem("atlaslearn_expenses", JSON.stringify(updated));
    }
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
          <p className="text-muted-foreground mt-1">Plan your spending and hit your savings goals.</p>
        </div>
        {!user && (
          <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <CloudOff className="w-3.5 h-3.5" />
            <span>Sign in to sync across devices</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-muted-foreground font-medium text-sm">Monthly Income</h2>
          </div>
          <input
            type="number"
            value={income || ""}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="text-3xl font-bold bg-transparent border-none focus:ring-0 w-full outline-none text-foreground"
          />
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
        {/* Left Col: Planner & Goals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card/60 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Savings Goal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Target Amount (₦)</label>
                <input
                  type="number"
                  value={savingsGoal || ""}
                  onChange={(e) => setSavingsGoal(Number(e.target.value))}
                  className="w-full border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
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
              <div className="flex gap-3">
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
                  className="border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none w-[130px] text-sm"
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
                  <p className="text-lg font-medium">No expenses recorded yet.</p>
                  <p className="text-sm">Add your first expense using the form.</p>
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
                        <div className="flex items-center gap-3">
                          <span className="font-bold">₦{expense.amount.toLocaleString()}</span>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
    </motion.div>
  );
}
