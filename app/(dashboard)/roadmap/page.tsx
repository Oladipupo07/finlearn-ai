"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map, Sparkles, Plus, GraduationCap, ChevronRight, CheckCircle2, 
  RotateCcw, Save, Loader2, ArrowRight, BookOpen, AlertCircle 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import confetti from "canvas-confetti";

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type Week = {
  weekNumber: number;
  title: string;
  goal: string;
  learningRecommendation: string;
  tasks: Task[];
};

type Roadmap = {
  title: string;
  weeks: Week[];
  createdAt: string;
};

export default function RoadmapPage() {
  const { user } = useAuth();
  
  // Roadmap states
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [age, setAge] = useState<number>(21);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [monthlyIncome, setMonthlyIncome] = useState<string>("50000");
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("30000");
  const [savingsGoal, setSavingsGoal] = useState<string>("15000");
  const [financialGoal, setFinancialGoal] = useState<string>("Learn budgeting");

  const financialGoalsList = [
    "Learn budgeting",
    "Build emergency savings",
    "Improve spending habits",
    "Save for school",
    "Understand investing",
    "Avoid scams",
    "Improve financial literacy"
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load existing roadmap on mount
  useEffect(() => {
    if (!mounted) return;

    const loadRoadmap = async () => {
      setLoading(true);
      try {
        if (user) {
          const docRef = doc(firestore, "roadmaps", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRoadmap(docSnap.data() as Roadmap);
          }
        } else {
          const local = localStorage.getItem("atlaslearn_roadmap");
          if (local) {
            setRoadmap(JSON.parse(local));
          }
        }
      } catch (err) {
        console.error("Error loading roadmap:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [user, mounted]);

  // Generate roadmap
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          isStudent,
          monthlyIncome: Number(monthlyIncome),
          monthlyExpenses: Number(monthlyExpenses),
          savingsGoal: Number(savingsGoal),
          financialGoal
        })
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      const newRoadmap: Roadmap = {
        title: data.title || "Your Personalized Financial Roadmap",
        weeks: data.weeks || [],
        createdAt: new Date().toISOString()
      };

      setRoadmap(newRoadmap);

      // Save roadmap
      setSaving(true);
      if (user) {
        await setDoc(doc(firestore, "roadmaps", user.uid), newRoadmap);
      } else {
        localStorage.setItem("atlaslearn_roadmap", JSON.stringify(newRoadmap));
      }
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#6366f1", "#3b82f6", "#f59e0b", "#10b981"]
      });

    } catch (err) {
      console.error(err);
      alert("Error generating your roadmap. Please try again.");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (weekNum: number, taskId: string) => {
    if (!roadmap) return;

    const updatedWeeks = roadmap.weeks.map(week => {
      if (week.weekNumber === weekNum) {
        const updatedTasks = week.tasks.map(task => {
          if (task.id === taskId) {
            const nextCompleted = !task.completed;
            if (nextCompleted) {
              // Trigger mini confetti
              confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.8 },
                colors: ["#10b981", "#6366f1"]
              });
            }
            return { ...task, completed: nextCompleted };
          }
          return task;
        });
        return { ...week, tasks: updatedTasks };
      }
      return week;
    });

    const updatedRoadmap = { ...roadmap, weeks: updatedWeeks };
    setRoadmap(updatedRoadmap);

    // Save update
    if (user) {
      await setDoc(doc(firestore, "roadmaps", user.uid), updatedRoadmap);
    } else {
      localStorage.setItem("atlaslearn_roadmap", JSON.stringify(updatedRoadmap));
    }
  };

  // Reset roadmap state to onboarding form
  const handleRegenerate = () => {
    if (confirm("Are you sure you want to regenerate your roadmap? This will reset all your checked tasks.")) {
      setRoadmap(null);
    }
  };

  // Calculate task counts
  const getProgressStats = () => {
    if (!roadmap) return { total: 0, completed: 0, pct: 0 };
    let total = 0;
    let completed = 0;
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        total += 1;
        if (t.completed) completed += 1;
      });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  };

  const { total, completed, pct } = getProgressStats();

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
          <Map className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Financial Roadmap</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your step-by-step path to financial independence.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && !roadmap ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-border p-12 py-16 rounded-3xl text-center shadow-xl glass max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative mb-6">
              <Map className="w-12 h-12 text-primary opacity-30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Profile...</h2>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              We are analyzing your inputs and generating a custom 30-day roadmap focused on <span className="font-semibold text-primary">{financialGoal}</span>.
            </p>
          </motion.div>
        ) : !roadmap ? (
          // Onboarding Form Card
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-card/60 backdrop-blur-sm border border-border p-6 md:p-8 rounded-3xl shadow-md"
          >
            <div className="flex items-center gap-2 text-amber-500 mb-6 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-xs font-semibold max-w-max">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>AI Generates Customized 4-Week Tasks</span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Age</label>
                  <input
                    type="number"
                    required
                    min={13}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Are you a Student?</label>
                  <div className="flex gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsStudent(true)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        isStudent 
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Yes, Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStudent(false)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        !isStudent 
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      No, Working
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Monthly Income (₦)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Monthly Expenses (₦)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="e.g. 30000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Savings Goal (₦)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">What is your primary financial goal?</label>
                  <select
                    value={financialGoal}
                    onChange={(e) => setFinancialGoal(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    {financialGoalsList.map((g) => (
                      <option key={g} value={g} className="text-foreground">{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Roadmap
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          // Roadmap Timeline Display
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header progress card */}
            <div className="bg-gradient-to-r from-primary/20 via-blue-500/10 to-card border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Active Roadmap
                </span>
                <h2 className="text-xl md:text-2xl font-black text-foreground mt-2">{roadmap.title}</h2>
                <p className="text-muted-foreground text-xs font-semibold">
                  Progress: {completed} / {total} tasks completed
                </p>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 bg-background/50 border border-border/60 p-4 rounded-2xl min-w-[240px]">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Overall Completion</span>
                    <span className="font-mono text-primary">{pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 p-0.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleRegenerate}
                  className="w-10 h-10 bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm"
                  title="Regenerate Roadmap"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timeline Weeks */}
            <div className="relative border-l border-border/70 ml-4 pl-6 md:pl-8 space-y-10 py-4">
              {roadmap.weeks.map((week, idx) => {
                const isWeekCompleted = week.tasks.every(t => t.completed);

                return (
                  <motion.div
                    key={week.weekNumber}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    {/* Circle Node */}
                    <div className={`absolute -left-[35px] md:-left-[43px] top-1.5 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                      isWeekCompleted 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "bg-card border-border text-muted-foreground"
                    }`}>
                      {isWeekCompleted ? <CheckCircle2 className="w-4 h-4 md:w-5 h-5 text-white" /> : week.weekNumber}
                    </div>

                    {/* Week Card */}
                    <div className="bg-card/70 backdrop-blur-sm border border-border p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 text-foreground">
                          {week.title}
                          {isWeekCompleted && (
                            <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full select-none">
                              Completed
                            </span>
                          )}
                        </h3>
                      </div>

                      {/* Goal block */}
                      <div className="bg-background/50 border border-border/50 p-4 rounded-2xl mb-4 text-sm">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                          Goal of the Week
                        </span>
                        <p className="text-foreground/90 font-medium">{week.goal}</p>
                      </div>

                      {/* Recommendation block */}
                      <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 p-4 rounded-2xl mb-6 text-sm">
                        <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-0.5">
                            Learning Recommendation
                          </span>
                          <p className="text-muted-foreground text-xs leading-relaxed">{week.learningRecommendation}</p>
                        </div>
                      </div>

                      {/* Tasks checklist */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2">
                          Weekly Checklist
                        </span>
                        {week.tasks.map((task) => (
                          <div 
                            key={task.id}
                            onClick={() => handleToggleTask(week.weekNumber, task.id)}
                            className={`flex items-center gap-3.5 p-3.5 bg-background hover:bg-muted border rounded-2xl transition-all cursor-pointer select-none group ${
                              task.completed 
                                ? "border-green-500/30 opacity-70" 
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              task.completed 
                                ? "bg-green-500 border-green-500 text-white" 
                                : "border-muted-foreground/40 group-hover:border-primary"
                            }`}>
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            
                            <span className={`text-sm leading-relaxed transition-all ${
                              task.completed 
                                ? "line-through text-muted-foreground" 
                                : "text-foreground"
                            }`}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
