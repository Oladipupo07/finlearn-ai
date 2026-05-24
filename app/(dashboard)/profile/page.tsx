"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Flame, Trophy, Star, Award, Lock,
  Wallet, Bot, ShieldAlert, PiggyBank, GraduationCap,
  BrainCircuit, TrendingUp, CheckCircle, Sparkles,
  Calendar, Shield, Target, ChevronRight, PieChart,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGamification,
  getLevelFromXP,
  BADGES_LIST,
  CHALLENGES_LIST,
} from "@/contexts/GamificationContext";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<number, string> = {
  1: "from-slate-500 to-slate-600",
  2: "from-green-500 to-emerald-600",
  3: "from-blue-500 to-indigo-600",
  4: "from-purple-500 to-violet-600",
  5: "from-amber-500 to-orange-600",
  6: "from-rose-500 to-pink-600",
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Bot,
  Trophy,
  ShieldAlert,
  Flame,
  PiggyBank,
  GraduationCap,
  BrainCircuit,
  PieChart,
};

const STATS = [
  { label: "Quizzes Taken", icon: BrainCircuit, color: "text-primary bg-primary/10", key: "quizzes" },
  { label: "AI Questions", icon: Bot, color: "text-blue-500 bg-blue-500/10", key: "aiQuestionsCount" },
  { label: "Scams Detected", icon: ShieldAlert, color: "text-red-500 bg-red-500/10", key: "scamChecksCount" },
  { label: "Budgets Created", icon: Wallet, color: "text-green-500 bg-green-500/10", key: "budgetsCreatedCount" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { progress, streak, badges, challenge, loading } = useGamification();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"journey" | "badges">("journey");

  useEffect(() => setMounted(true), []);

  const levelInfo = getLevelFromXP(progress.xp);
  const range = levelInfo.nextXP - levelInfo.prevXP;
  const currentInLevel = progress.xp - levelInfo.prevXP;
  const levelPct = range > 0 ? Math.min((currentInLevel / range) * 100, 100) : 100;

  const unlockedCount = Object.keys(badges.unlocked).length;
  const totalBadges = BADGES_LIST.length;

  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  if (!mounted || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
            <User className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8 pb-16"
    >
      {/* ─── Profile Hero Card ─── */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl overflow-hidden border border-border shadow-xl"
      >
        {/* Gradient Banner */}
        <div
          className={cn(
            "h-36 w-full bg-gradient-to-br",
            LEVEL_COLORS[progress.level] ?? "from-primary to-indigo-600"
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.2),transparent_60%)]" />
        </div>

        {/* Content below banner */}
        <div className="bg-card/90 backdrop-blur-sm px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
            {/* Avatar */}
            <div className="relative w-fit">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl border-4 border-card shadow-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-card shadow-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-3xl font-black select-none">
                  {(user?.displayName || user?.email || "A")[0].toUpperCase()}
                </div>
              )}
              {/* Level badge on avatar */}
              <div
                className={cn(
                  "absolute -bottom-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg border-2 border-card bg-gradient-to-br",
                  LEVEL_COLORS[progress.level]
                )}
              >
                {progress.level}
              </div>
            </div>

            {/* Level Pill */}
            <div
              className={cn(
                "self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white text-sm font-bold shadow-md bg-gradient-to-r",
                LEVEL_COLORS[progress.level]
              )}
            >
              <Star className="w-4 h-4 fill-current" />
              {levelInfo.name}
            </div>
          </div>

          {/* Name & Email */}
          <div className="mt-4">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {user?.displayName || "Atlas Learner"}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email ?? "Not signed in"}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 opacity-70">
              <Calendar className="w-3 h-3" />
              Joined {joinDate}
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "XP Earned", value: `${progress.xp}`, icon: Sparkles, color: "text-purple-400" },
              { label: "Day Streak", value: `${streak.currentStreak}🔥`, icon: Flame, color: "text-orange-400" },
              { label: "Best Streak", value: `${streak.longestStreak}🏆`, icon: Trophy, color: "text-amber-400" },
              { label: "Badges", value: `${unlockedCount}/${totalBadges}`, icon: Award, color: "text-green-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-muted/30 border border-border/60 rounded-2xl p-3 flex flex-col items-center text-center gap-1"
              >
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-lg font-black text-foreground leading-none">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── XP Progress Bar ─── */}
      <motion.div
        variants={itemVariants}
        className="bg-card/70 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Level Progress
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {progress.xp >= 2000
                ? "Maximum level reached — you're an Atlas Master!"
                : `${levelInfo.nextXP - progress.xp} XP to Level ${progress.level + 1}`}
            </p>
          </div>
          <div
            className={cn(
              "flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-white font-black shadow-lg bg-gradient-to-br",
              LEVEL_COLORS[progress.level]
            )}
          >
            <span className="text-[9px] uppercase font-bold opacity-80 tracking-widest leading-none">Lvl</span>
            <span className="text-xl leading-none">{progress.level}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>{levelInfo.prevXP} XP</span>
            <span>{progress.xp >= 2000 ? "MAX" : `${levelInfo.nextXP} XP`}</span>
          </div>
          <div className="h-5 bg-muted rounded-full overflow-hidden border border-border/30 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full bg-gradient-to-r shadow-inner relative overflow-hidden",
                LEVEL_COLORS[progress.level]
              )}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-semibold">
            <span>{levelInfo.name}</span>
            <span>{levelPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* All levels roadmap */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { lvl: 1, name: "Money Starter", xp: 0 },
            { lvl: 2, name: "Smart Saver", xp: 100 },
            { lvl: 3, name: "Budget Builder", xp: 250 },
            { lvl: 4, name: "Finance Explorer", xp: 500 },
            { lvl: 5, name: "Wealth Strategist", xp: 1000 },
            { lvl: 6, name: "Atlas Master", xp: 2000 },
          ].map((lvl) => {
            const isReached = progress.xp >= lvl.xp;
            const isCurrent = progress.level === lvl.lvl;
            return (
              <div
                key={lvl.lvl}
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-sm",
                  isCurrent
                    ? "border-primary bg-primary/10"
                    : isReached
                    ? "border-border/80 bg-background"
                    : "border-dashed border-border/50 opacity-50 bg-muted/10"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 bg-gradient-to-br",
                    isReached ? LEVEL_COLORS[lvl.lvl] : "from-muted-foreground to-muted-foreground"
                  )}
                >
                  {lvl.lvl}
                </div>
                <div className="min-w-0">
                  <p className={cn("font-bold text-xs truncate", isReached ? "text-foreground" : "text-muted-foreground")}>
                    {lvl.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{lvl.xp} XP</p>
                </div>
                {isCurrent && (
                  <span className="ml-auto shrink-0 text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                    You
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Tabs: Learning Journey / Badges ─── */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-2 bg-muted/40 border border-border rounded-2xl p-1 w-fit mb-6">
          {(["journey", "badges"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                activeTab === tab
                  ? "bg-card border border-border shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "journey" ? "🗺️ Learning Journey" : "🏅 Badges"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "journey" && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Activity Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map((stat) => {
                  const val = (progress as any)[stat.key] ?? 0;
                  return (
                    <div
                      key={stat.key}
                      className="bg-card/70 backdrop-blur-sm border border-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-foreground">{val}</span>
                      <span className="text-xs text-muted-foreground font-semibold">{stat.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Today's Challenge Status */}
              <div className="bg-card/70 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  Today's Challenge
                </h3>

                {challenge.challengeId ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">
                        {CHALLENGES_LIST.find((c) => c.id === challenge.challengeId)?.text ?? challenge.challengeId}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {challenge.completed
                          ? `Completed on ${challenge.completionDate}`
                          : "Pending — complete to earn +20 XP"}
                      </p>
                    </div>
                    {challenge.completed ? (
                      <div className="shrink-0 w-9 h-9 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="shrink-0 w-9 h-9 rounded-full bg-muted border border-dashed border-border flex items-center justify-center text-muted-foreground">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No challenge loaded yet.</p>
                )}
              </div>

              {/* Streak Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                    <Flame className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Current Streak</p>
                    <p className="text-3xl font-black text-orange-500 mt-0.5">{streak.currentStreak} <span className="text-base">days</span></p>
                    {streak.lastCompletionDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">Last activity: {streak.lastCompletionDate}</p>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-indigo-500/5 border border-primary/20 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Personal Best</p>
                    <p className="text-3xl font-black text-primary mt-0.5">{streak.longestStreak} <span className="text-base">days</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Keep going to break the record!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Badges summary */}
              <div className="bg-card/70 backdrop-blur-sm border border-border rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-foreground">
                    {unlockedCount} of {totalBadges} Badges Unlocked
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>
                <span className="text-2xl font-black text-amber-500 shrink-0">
                  {Math.round((unlockedCount / totalBadges) * 100)}%
                </span>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGES_LIST.map((badge) => {
                  const isUnlocked = !!badges.unlocked[badge.id];
                  const unlockedDate = badges.unlocked[badge.id];
                  const IconComp = ICON_MAP[badge.icon] ?? Award;

                  return (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: isUnlocked ? 1.02 : 1.01 }}
                      className={cn(
                        "relative overflow-hidden bg-card/70 backdrop-blur-sm border rounded-3xl p-5 shadow-sm flex items-center gap-4 transition-all",
                        isUnlocked
                          ? "border-border hover:border-border/80 hover:shadow-md"
                          : "border-dashed border-border/50 opacity-60"
                      )}
                    >
                      {/* Glow for unlocked */}
                      {isUnlocked && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -translate-y-6 translate-x-6" />
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border relative z-10",
                          isUnlocked
                            ? `${badge.bgColor} ${badge.color}`
                            : "bg-muted/40 text-muted-foreground border-border/50"
                        )}
                      >
                        {isUnlocked ? (
                          <IconComp className="w-7 h-7" />
                        ) : (
                          <Lock className="w-6 h-6 opacity-60" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="relative z-10 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn("font-extrabold text-sm", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                            {badge.title}
                          </h4>
                          {isUnlocked && (
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">
                              Earned
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                        {isUnlocked && unlockedDate ? (
                          <p className="text-[10px] text-muted-foreground opacity-60 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Unlocked {unlockedDate}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground opacity-50 mt-1">
                            Complete the requirement to unlock
                          </p>
                        )}
                      </div>

                      {/* Status indicator */}
                      <div className="relative z-10 shrink-0">
                        {isUnlocked ? (
                          <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted/50 border border-dashed border-border flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
