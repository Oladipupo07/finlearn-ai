"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  MessageSquare,
  BrainCircuit,
  ShieldAlert,
  Settings,
  PieChart,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/contexts/StreakContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget Planner", href: "/budget", icon: Wallet },
  { name: "AI Tutor", href: "/chatbot", icon: MessageSquare },
  { name: "Finance Quiz", href: "/quiz", icon: BrainCircuit },
  { name: "Scam Checker", href: "/scam-checker", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { streak } = useStreak();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm h-screen fixed top-0 left-0 pt-6 z-30">
      <div className="px-6 mb-8 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex flex-col items-center justify-center shadow-lg shadow-primary/30">
          <PieChart className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">AtlasLearn <span className="text-primary">AI</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Dynamic daily streak card */}
        {user && (
          <div className="pt-6 mt-6 border-t border-border/50 px-2">
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3 relative group overflow-hidden hover:border-orange-500/30 transition-all shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Streak</p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {streak?.currentStreak ?? 0} {streak?.currentStreak === 1 ? "Day" : "Days"}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-border mt-auto flex flex-col gap-2">
        {/* User Avatar & Name */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 mb-1">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">{user.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { streak } = useStreak();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex flex-col items-center justify-center shadow-md shadow-primary/30">
            <PieChart className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">AtlasLearn <span className="text-primary">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 px-3 py-1 rounded-full text-xs font-bold text-orange-500">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak?.currentStreak ?? 0}</span>
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-foreground">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-16 bg-background/95 backdrop-blur-xl z-30 flex flex-col"
          >
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Dynamic streak card for mobile navigation */}
              {user && (
                <div className="pt-4 mt-4 border-t border-border/50 px-1">
                  <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Streak</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {streak?.currentStreak ?? 0} {streak?.currentStreak === 1 ? "Day" : "Days"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {(user.displayName || user.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-400/10 transition-all w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all text-foreground"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
