"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

interface StreakContextType {
  streak: StreakData | null;
  loading: boolean;
  streakActiveToday: boolean;
  showCelebration: boolean;
  dismissCelebration: () => void;
}

const StreakContext = createContext<StreakContextType>({
  streak: null,
  loading: true,
  streakActiveToday: false,
  showCelebration: false,
  dismissCelebration: () => {},
});

export const useStreak = () => useContext(StreakContext);

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [streakActiveToday, setStreakActiveToday] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const dismissCelebration = () => {
    setShowCelebration(false);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStreak(null);
      setLoading(false);
      setStreakActiveToday(false);
      return;
    }

    const checkAndUpdateStreak = async () => {
      try {
        setLoading(true);
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);

        // Get local YYYY-MM-DD string
        const todayStr = new Date().toLocaleDateString("en-CA"); // Always YYYY-MM-DD
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString("en-CA");

        let currentStreak = 0;
        let longestStreak = 0;
        let lastActiveDate = "";

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.streak) {
            currentStreak = userData.streak.currentStreak ?? 0;
            longestStreak = userData.streak.longestStreak ?? 0;
            lastActiveDate = userData.streak.lastActiveDate ?? "";
          }
        }

        let updatedStreak = { currentStreak, longestStreak, lastActiveDate };
        let didIncrement = false;

        if (lastActiveDate === todayStr) {
          // Already active today, nothing to change
          setStreakActiveToday(true);
        } else if (lastActiveDate === yesterdayStr) {
          // Streak continues!
          updatedStreak.currentStreak = currentStreak + 1;
          updatedStreak.longestStreak = Math.max(longestStreak, currentStreak + 1);
          updatedStreak.lastActiveDate = todayStr;
          didIncrement = true;
          setStreakActiveToday(true);
        } else {
          // Streak broken or brand new user
          updatedStreak.currentStreak = 1;
          updatedStreak.longestStreak = Math.max(longestStreak, 1);
          updatedStreak.lastActiveDate = todayStr;
          didIncrement = true;
          setStreakActiveToday(true);
        }

        if (didIncrement) {
          await setDoc(userRef, { streak: updatedStreak }, { merge: true });
          
          // Fire confetti and show overlay celebration
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#ff4500", "#ff8c00", "#ffd700", "#3b82f6", "#10b981"]
            });
            setShowCelebration(true);
          }, 800);
        }

        setStreak(updatedStreak);
      } catch (error) {
        console.error("Error loading or updating daily streak:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAndUpdateStreak();
  }, [user, authLoading]);

  return (
    <StreakContext.Provider value={{ streak, loading, streakActiveToday, showCelebration, dismissCelebration }}>
      {children}
      
      {/* Dynamic celebratory overlay */}
      <AnimatePresence>
        {showCelebration && streak && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-card/90 border border-orange-500/30 max-w-sm w-full p-8 rounded-3xl shadow-2xl text-center overflow-hidden"
            >
              {/* Animated glowing background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/20 rounded-full blur-[60px]" />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Flame Icon with Pulsing Background */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 scale-125 bg-orange-500/20 rounded-full blur-md animate-pulse" />
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/40 relative">
                    <Flame className="w-9 h-9 fill-current animate-bounce" />
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight mb-2">Streak Active!</h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  Fantastic! You have logged in for <span className="font-extrabold text-foreground text-base">{streak.currentStreak}</span> {streak.currentStreak === 1 ? "day" : "consecutive days"}. Keep it up!
                </p>

                {/* Quick stats panel */}
                <div className="grid grid-cols-2 gap-4 w-full bg-muted/40 border border-border/50 p-4 rounded-2xl mb-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Current Streak</p>
                    <p className="text-xl font-black text-orange-500 mt-1">{streak.currentStreak} 🔥</p>
                  </div>
                  <div className="border-l border-border/50">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Personal Best</p>
                    <p className="text-xl font-black text-primary mt-1">{streak.longestStreak} 🏆</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-6 italic">
                  Complete your daily check and build financial skills!
                </p>

                <button
                  onClick={dismissCelebration}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Awesome! Let's Go
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StreakContext.Provider>
  );
};
