"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Wallet, PiggyBank, ReceiptText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
};

const CATEGORIES = ["Housing", "Food", "Transport", "Entertainment", "Utilities", "Other"];

export default function BudgetPage() {
  const [mounted, setMounted] = useState(false);
  const [income, setIncome] = useState(500000);
  const [savingsGoal, setSavingsGoal] = useState(100000);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Form states
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const savedIncome = localStorage.getItem("finlearn_income");
    const savedGoal = localStorage.getItem("finlearn_goal");
    const savedExpenses = localStorage.getItem("finlearn_expenses");

    if (savedIncome) setIncome(Number(savedIncome));
    if (savedGoal) setSavingsGoal(Number(savedGoal));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("finlearn_income", income.toString());
    localStorage.setItem("finlearn_goal", savingsGoal.toString());
    localStorage.setItem("finlearn_expenses", JSON.stringify(expenses));
  }, [income, savingsGoal, expenses, mounted]);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = income - totalExpenses;
  const savingsProgress = income > 0 ? Math.min((remainingBalance / savingsGoal) * 100, 100) : 0;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
    
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      amount: Number(newAmount),
      category: newCategory,
    };

    setExpenses([newExpense, ...expenses]);
    setNewName("");
    setNewAmount("");
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
        <p className="text-muted-foreground mt-1">Plan your spending and hit your savings goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm glass">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="w-5 h-5" />
             </div>
             <h2 className="text-muted-foreground font-medium">Monthly Income</h2>
          </div>
          <input 
            type="number"
            value={income || ''}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="text-4xl font-bold bg-transparent border-none focus:ring-0 w-full outline-none text-foreground"
          />
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm glass relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <ReceiptText className="w-5 h-5" />
             </div>
             <h2 className="text-muted-foreground font-medium">Total Expenses</h2>
          </div>
          <p className="text-4xl font-bold">₦{totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm glass relative">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <PiggyBank className="w-5 h-5" />
             </div>
             <h2 className="text-muted-foreground font-medium">Remaining Balance</h2>
          </div>
          <p className={cn("text-4xl font-bold", remainingBalance < 0 ? "text-destructive" : "")}>
            ₦{remainingBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Planner & Goals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm glass">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Savings Goal
            </h2>
            <div className="space-y-4">
               <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Target Amount (₦)</label>
                  <input 
                    type="number" 
                    value={savingsGoal || ''}
                    onChange={(e) => setSavingsGoal(Number(e.target.value))}
                    className="w-full border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  />
               </div>
               <div className="pt-2">
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
                        className={cn("h-full transition-all duration-500", savingsProgress >= 100 ? "bg-primary" : "bg-blue-500")}
                     />
                  </div>
                  {savingsProgress >= 100 && (
                     <p className="text-sm text-primary mt-2 flex items-center gap-1 font-medium">
                        Goal achieved! You're saving great! 🎉
                     </p>
                  )}
               </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm glass">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Expense Name (e.g. Netflix)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none flex-1"
                  required
                />
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border border-border bg-background p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none w-[140px]"
                >
                  {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition shadow-md"
              >
                Add to Budget
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Expense List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl shadow-sm glass min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Transaction History</h2>
            </div>
            
            <div className="p-6 flex-1">
              {expenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-10">
                   <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <ReceiptText className="w-10 h-10 opacity-50" />
                   </div>
                   <p className="text-lg font-medium">No expenses recorded yet.</p>
                   <p className="text-sm">Add your first expense using the form to start tracking.</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <AnimatePresence>
                     {expenses.map((expense) => (
                       <motion.div 
                         key={expense.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:shadow-md transition-shadow group"
                       >
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                               {expense.category === "Food" && '🍔'}
                               {expense.category === "Transport" && '🚗'}
                               {expense.category === "Housing" && '🏠'}
                               {expense.category === "Entertainment" && '🎮'}
                               {expense.category === "Utilities" && '⚡'}
                               {expense.category === "Other" && '📦'}
                            </div>
                            <div>
                               <h3 className="font-semibold text-lg">{expense.name}</h3>
                               <p className="text-sm text-muted-foreground">{expense.category}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">₦{expense.amount.toLocaleString()}</span>
                            <button 
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete expense"
                            >
                               <Trash2 className="w-5 h-5" />
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
