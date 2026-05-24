"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame, Star, Trophy, Sparkles, Check, X } from "lucide-react";

export interface ProgressData {
  xp: number;
  level: number;
  aiQuestionsCount: number;
  scamChecksCount: number;
  budgetsCreatedCount: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string; // YYYY-MM-DD
}

export interface BadgeData {
  unlocked: Record<string, string>; // badgeId -> unlockedDate (YYYY-MM-DD)
}

export interface ChallengeData {
  date: string; // YYYY-MM-DD
  challengeId: string;
  completed: boolean;
  completionDate: string | null;
}

export interface ChallengeDef {
  id: string;
  text: string;
  icon: string;
  category: string;
}

export const CHALLENGES_LIST: ChallengeDef[] = [
  { id: "save_500", text: "Save ₦500 today", icon: "PiggyBank", category: "savings" },
  { id: "track_expenses", text: "Track all expenses today", icon: "Wallet", category: "budget" },
  { id: "complete_quiz", text: "Complete one finance quiz", icon: "BrainCircuit", category: "quiz" },
  { id: "ask_ai", text: "Ask Atlas AI one finance question", icon: "Bot", category: "ai" },
  { id: "detect_scam", text: "Detect one scam example", icon: "ShieldAlert", category: "scam" },
  { id: "review_spending", text: "Review monthly spending", icon: "PieChart", category: "budget" },
];

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const BADGES_LIST: BadgeDef[] = [
  {
    id: "budget_beginner",
    title: "Budget Beginner",
    description: "Create first budget",
    icon: "Wallet",
    color: "text-green-500 border-green-500/20",
    bgColor: "bg-green-500/10",
  },
  {
    id: "finance_explorer",
    title: "Finance Explorer",
    description: "Ask AI 5 questions",
    icon: "Bot",
    color: "text-blue-500 border-blue-500/20",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "quiz_master",
    title: "Quiz Master",
    description: "Score 80%+",
    icon: "Trophy",
    color: "text-amber-500 border-amber-500/20",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "scam_spotter",
    title: "Scam Spotter",
    description: "Analyze 5 scam messages",
    icon: "ShieldAlert",
    color: "text-red-500 border-red-500/20",
    bgColor: "bg-red-500/10",
  },
  {
    id: "consistency_champion",
    title: "Consistency Champion",
    description: "Maintain 7-day streak",
    icon: "Flame",
    color: "text-purple-500 border-purple-500/20",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "savings_hero",
    title: "Savings Hero",
    description: "Reach savings goal",
    icon: "PiggyBank",
    color: "text-orange-500 border-orange-500/20",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "atlas_scholar",
    title: "Atlas Scholar",
    description: "Unlock all badges",
    icon: "GraduationCap",
    color: "text-indigo-500 border-indigo-500/20",
    bgColor: "bg-indigo-500/10",
  },
];

interface GamificationContextType {
  progress: ProgressData;
  streak: StreakData;
  badges: BadgeData;
  challenge: ChallengeData;
  loading: boolean;
  completeChallenge: () => Promise<void>;
  addXP: (amount: number, reason: string) => Promise<void>;
  incrementAICount: () => Promise<void>;
  incrementScamCount: () => Promise<void>;
  incrementBudgetCount: () => Promise<void>;
  checkSavingsGoalReached: () => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  triggerAction: (actionType: "quiz" | "ai" | "scam" | "budget" | "savings") => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error("useGamification must be used within a GamificationProvider");
  return context;
};

export function getLevelFromXP(xp: number): { level: number; name: string; nextXP: number; prevXP: number } {
  if (xp >= 2000) return { level: 6, name: "Atlas Master", nextXP: 2000, prevXP: 2000 };
  if (xp >= 1000) return { level: 5, name: "Wealth Strategist", nextXP: 2000, prevXP: 1000 };
  if (xp >= 500) return { level: 4, name: "Finance Explorer", nextXP: 1000, prevXP: 500 };
  if (xp >= 250) return { level: 3, name: "Budget Builder", nextXP: 500, prevXP: 250 };
  if (xp >= 100) return { level: 2, name: "Smart Saver", nextXP: 250, prevXP: 100 };
  return { level: 1, name: "Money Starter", nextXP: 100, prevXP: 0 };
}

function getDailyChallengeDef(dateStr: string): ChallengeDef {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CHALLENGES_LIST.length;
  return CHALLENGES_LIST[index];
}

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [progress, setProgress] = useState<ProgressData>({
    xp: 0,
    level: 1,
    aiQuestionsCount: 0,
    scamChecksCount: 0,
    budgetsCreatedCount: 0,
  });

  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: "",
  });

  const [badges, setBadges] = useState<BadgeData>({
    unlocked: {},
  });

  const [challenge, setChallenge] = useState<ChallengeData>({
    date: "",
    challengeId: "",
    completed: false,
    completionDate: null,
  });

  const [loading, setLoading] = useState(true);

  // Celebrations
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [unlockedBadgeId, setUnlockedBadgeId] = useState<string | null>(null);
  const [xpRewardText, setXpRewardText] = useState<{ amount: number; reason: string } | null>(null);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  // Load Initial Data
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Load from localStorage fallback
      const localProgress = localStorage.getItem("atlaslearn_progress");
      const localStreak = localStorage.getItem("atlaslearn_streaks");
      const localBadges = localStorage.getItem("atlaslearn_badges");
      const localChallenge = localStorage.getItem("atlaslearn_challenges");

      let parsedProgress: ProgressData = localProgress
        ? JSON.parse(localProgress)
        : { xp: 0, level: 1, aiQuestionsCount: 0, scamChecksCount: 0, budgetsCreatedCount: 0 };
      
      let parsedStreak: StreakData = localStreak
        ? JSON.parse(localStreak)
        : { currentStreak: 0, longestStreak: 0, lastCompletionDate: "" };

      let parsedBadges: BadgeData = localBadges ? JSON.parse(localBadges) : { unlocked: {} };
      
      let parsedChallenge: ChallengeData | null = localChallenge ? JSON.parse(localChallenge) : null;

      // Handle daily streak check/reset on load
      if (parsedStreak.lastCompletionDate && parsedStreak.lastCompletionDate !== todayStr && parsedStreak.lastCompletionDate !== yesterdayStr) {
        parsedStreak.currentStreak = 0;
        localStorage.setItem("atlaslearn_streaks", JSON.stringify(parsedStreak));
      }

      // Handle daily challenge check/generation on load
      const challengeDef = getDailyChallengeDef(todayStr);
      if (!parsedChallenge || parsedChallenge.date !== todayStr) {
        parsedChallenge = {
          date: todayStr,
          challengeId: challengeDef.id,
          completed: false,
          completionDate: null,
        };
        localStorage.setItem("atlaslearn_challenges", JSON.stringify(parsedChallenge));
      }

      setProgress(parsedProgress);
      setStreak(parsedStreak);
      setBadges(parsedBadges);
      setChallenge(parsedChallenge);
      setLoading(false);
      return;
    }

    // Load from Firestore
    setLoading(true);
    const progressRef = doc(firestore, "progress", user.uid);
    const streaksRef = doc(firestore, "streaks", user.uid);
    const badgesRef = doc(firestore, "badges", user.uid);
    const challengesRef = doc(firestore, "challenges", user.uid);

    const unsubProgress = onSnapshot(progressRef, (snap) => {
      if (snap.exists()) {
        setProgress(snap.data() as ProgressData);
      } else {
        const initial = { xp: 0, level: 1, aiQuestionsCount: 0, scamChecksCount: 0, budgetsCreatedCount: 0 };
        setDoc(progressRef, initial);
        setProgress(initial);
      }
    });

    const unsubStreaks = onSnapshot(streaksRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as StreakData;
        // Check reset
        if (data.lastCompletionDate && data.lastCompletionDate !== todayStr && data.lastCompletionDate !== yesterdayStr && data.currentStreak > 0) {
          const resetStreak = { ...data, currentStreak: 0 };
          setDoc(streaksRef, resetStreak);
          setStreak(resetStreak);
        } else {
          setStreak(data);
        }
      } else {
        const initial = { currentStreak: 0, longestStreak: 0, lastCompletionDate: "" };
        setDoc(streaksRef, initial);
        setStreak(initial);
      }
    });

    const unsubBadges = onSnapshot(badgesRef, (snap) => {
      if (snap.exists()) {
        setBadges(snap.data() as BadgeData);
      } else {
        const initial = { unlocked: {} };
        setDoc(badgesRef, initial);
        setBadges(initial);
      }
    });

    const unsubChallenges = onSnapshot(challengesRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ChallengeData;
        if (data.date !== todayStr) {
          const challengeDef = getDailyChallengeDef(todayStr);
          const newChallenge = {
            date: todayStr,
            challengeId: challengeDef.id,
            completed: false,
            completionDate: null,
          };
          setDoc(challengesRef, newChallenge);
          setChallenge(newChallenge);
        } else {
          setChallenge(data);
        }
      } else {
        const challengeDef = getDailyChallengeDef(todayStr);
        const initial = {
          date: todayStr,
          challengeId: challengeDef.id,
          completed: false,
          completionDate: null,
        };
        setDoc(challengesRef, initial);
        setChallenge(initial);
      }
      setLoading(false);
    });

    return () => {
      unsubProgress();
      unsubStreaks();
      unsubBadges();
      unsubChallenges();
    };
  }, [user, authLoading]);

  // Sync state helpers
  const saveProgress = async (newProgress: ProgressData) => {
    setProgress(newProgress);
    if (user) {
      await setDoc(doc(firestore, "progress", user.uid), newProgress, { merge: true });
    } else {
      localStorage.setItem("atlaslearn_progress", JSON.stringify(newProgress));
    }
  };

  const saveStreak = async (newStreak: StreakData) => {
    setStreak(newStreak);
    if (user) {
      await setDoc(doc(firestore, "streaks", user.uid), newStreak, { merge: true });
      // Sync back to users collection to keep old code compatible
      await setDoc(doc(firestore, "users", user.uid), {
        streak: {
          currentStreak: newStreak.currentStreak,
          longestStreak: newStreak.longestStreak,
          lastActiveDate: newStreak.lastCompletionDate
        }
      }, { merge: true });
    } else {
      localStorage.setItem("atlaslearn_streaks", JSON.stringify(newStreak));
    }
  };

  const saveBadges = async (newBadges: BadgeData) => {
    setBadges(newBadges);
    if (user) {
      await setDoc(doc(firestore, "badges", user.uid), newBadges, { merge: true });
    } else {
      localStorage.setItem("atlaslearn_badges", JSON.stringify(newBadges));
    }
  };

  const saveChallenge = async (newChallenge: ChallengeData) => {
    setChallenge(newChallenge);
    if (user) {
      await setDoc(doc(firestore, "challenges", user.uid), newChallenge, { merge: true });
    } else {
      localStorage.setItem("atlaslearn_challenges", JSON.stringify(newChallenge));
    }
  };

  // Add XP and level up
  const addXP = async (amount: number, reason: string) => {
    const updatedProgress = { ...progress };
    const oldXP = updatedProgress.xp;
    const newXP = oldXP + amount;
    
    updatedProgress.xp = newXP;
    
    // Check level up
    const oldLvlInfo = getLevelFromXP(oldXP);
    const newLvlInfo = getLevelFromXP(newXP);
    
    if (newLvlInfo.level > oldLvlInfo.level) {
      updatedProgress.level = newLvlInfo.level;
      setLevelUpData({ oldLevel: oldLvlInfo.level, newLevel: newLvlInfo.level });
      
      // Fire confetti for leveling up
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#8b5cf6", "#a78bfa", "#f59e0b", "#3b82f6"]
      });
    }

    // Trigger visual XP feedback
    setXpRewardText({ amount, reason });
    setTimeout(() => setXpRewardText(null), 3000);

    await saveProgress(updatedProgress);
  };

  // Unlock Badge
  const unlockBadge = async (badgeId: string) => {
    if (badges.unlocked[badgeId]) return; // already unlocked

    const updatedBadges = {
      unlocked: {
        ...badges.unlocked,
        [badgeId]: todayStr,
      },
    };

    // Auto unlock Scholar if other 6 unlocked
    const otherBadges = BADGES_LIST.filter(b => b.id !== "atlas_scholar");
    const allOthersUnlocked = otherBadges.every(b => updatedBadges.unlocked[b.id]);
    
    if (allOthersUnlocked && !updatedBadges.unlocked["atlas_scholar"]) {
      updatedBadges.unlocked["atlas_scholar"] = todayStr;
    }

    setUnlockedBadgeId(badgeId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#e0f2fe"]
    });

    await saveBadges(updatedBadges);
  };

  // Complete Daily Challenge
  const completeChallenge = async () => {
    if (challenge.completed) return;

    const newChallenge: ChallengeData = {
      ...challenge,
      completed: true,
      completionDate: todayStr,
    };

    await saveChallenge(newChallenge);

    // Update streak
    const updatedStreak = { ...streak };
    if (updatedStreak.lastCompletionDate === yesterdayStr) {
      updatedStreak.currentStreak += 1;
    } else if (updatedStreak.lastCompletionDate === todayStr) {
      // already completed today (shouldn't really happen since challenge.completed checks)
    } else {
      updatedStreak.currentStreak = 1;
    }

    updatedStreak.longestStreak = Math.max(updatedStreak.longestStreak, updatedStreak.currentStreak);
    updatedStreak.lastCompletionDate = todayStr;
    await saveStreak(updatedStreak);

    // Reward XP
    await addXP(20, "Daily Challenge");

    // Check streak-based badge
    if (updatedStreak.currentStreak >= 7) {
      await unlockBadge("consistency_champion");
    }
  };

  // Action Counters
  const incrementAICount = async () => {
    const nextProgress = {
      ...progress,
      aiQuestionsCount: progress.aiQuestionsCount + 1,
    };
    await saveProgress(nextProgress);
    await addXP(5, "AI Tutor Question");

    if (nextProgress.aiQuestionsCount >= 5) {
      await unlockBadge("finance_explorer");
    }
  };

  const incrementScamCount = async () => {
    const nextProgress = {
      ...progress,
      scamChecksCount: progress.scamChecksCount + 1,
    };
    await saveProgress(nextProgress);
    await addXP(15, "Scam Detector Run");

    if (nextProgress.scamChecksCount >= 5) {
      await unlockBadge("scam_spotter");
    }
  };

  const incrementBudgetCount = async () => {
    const nextProgress = {
      ...progress,
      budgetsCreatedCount: progress.budgetsCreatedCount + 1,
    };
    await saveProgress(nextProgress);
    await addXP(30, "Budget Created");

    if (nextProgress.budgetsCreatedCount >= 1) {
      await unlockBadge("budget_beginner");
    }
  };

  const checkSavingsGoalReached = async () => {
    await unlockBadge("savings_hero");
  };

  // Action dispatcher for easy auto-challenge completion
  const triggerAction = async (actionType: "quiz" | "ai" | "scam" | "budget" | "savings") => {
    // Check if it matches today's challenge
    if (!challenge.completed) {
      const def = getDailyChallengeDef(todayStr);
      
      const isMatch = 
        (actionType === "quiz" && def.id === "complete_quiz") ||
        (actionType === "ai" && def.id === "ask_ai") ||
        (actionType === "scam" && def.id === "detect_scam") ||
        (actionType === "budget" && def.id === "track_expenses") ||
        (actionType === "savings" && def.id === "save_500");

      if (isMatch) {
        await completeChallenge();
      }
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        progress,
        streak,
        badges,
        challenge,
        loading,
        completeChallenge,
        addXP,
        incrementAICount,
        incrementScamCount,
        incrementBudgetCount,
        checkSavingsGoalReached,
        unlockBadge,
        triggerAction,
      }}
    >
      {children}

      {/* Floating XP Gain Notice */}
      <AnimatePresence>
        {xpRewardText && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-50 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 px-4 py-2.5 rounded-xl shadow-xl shadow-purple-500/10 text-white"
          >
            <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
            <span className="font-extrabold text-sm font-mono text-amber-300">+{xpRewardText.amount} XP</span>
            <span className="text-xs opacity-90">({xpRewardText.reason})</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Celebration Screen */}
      <AnimatePresence>
        {levelUpData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-card/95 border border-purple-500/30 max-w-sm w-full p-8 rounded-3xl shadow-2xl text-center overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-purple-500/20 rounded-full blur-[60px]" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 scale-125 bg-purple-500/20 rounded-full blur-md animate-pulse" />
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/40 relative">
                    <Star className="w-9 h-9 fill-current animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight mb-2 text-purple-400">Level Up!</h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  Incredible effort! You reached Level <span className="font-extrabold text-foreground text-base">{levelUpData.newLevel}</span>!
                </p>

                {/* Level Display */}
                <div className="flex items-center gap-6 w-full justify-center bg-muted/40 border border-border/50 p-4 rounded-2xl mb-6">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Before</p>
                    <p className="text-lg font-black text-muted-foreground mt-1">Lvl {levelUpData.oldLevel}</p>
                  </div>
                  <div className="text-xl font-bold">➔</div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Now</p>
                    <p className="text-xl font-black text-purple-400 mt-1">Lvl {levelUpData.newLevel} ✨</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-6 italic">
                  Keep completing challenges to build wealth and level up!
                </p>

                <button
                  onClick={() => setLevelUpData(null)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Keep Learning!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badge Unlock Celebration Screen */}
      <AnimatePresence>
        {unlockedBadgeId && (() => {
          const badge = BADGES_LIST.find((b) => b.id === unlockedBadgeId);
          if (!badge) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative bg-card/95 border border-amber-500/30 max-w-sm w-full p-8 rounded-3xl shadow-2xl text-center overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-amber-500/20 rounded-full blur-[60px]" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 scale-125 bg-amber-500/20 rounded-full blur-md animate-pulse" />
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/40 relative">
                      <Award className="w-9 h-9" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight mb-2 text-amber-500">Badge Unlocked!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-6">
                    Congratulations! You unlocked the **{badge.title}** achievement badge!
                  </p>

                  <div className="bg-muted/40 border border-border/50 p-4 rounded-2xl mb-6 w-full">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Requirement Completed</p>
                    <p className="text-sm font-bold text-foreground mt-1">{badge.description}</p>
                  </div>

                  <button
                    onClick={() => setUnlockedBadgeId(null)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Awesome!
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </GamificationContext.Provider>
  );
};
