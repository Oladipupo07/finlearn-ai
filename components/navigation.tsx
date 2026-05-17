"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, MessageSquare, BrainCircuit, ShieldAlert, Settings, PieChart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget Planner", href: "/budget", icon: Wallet },
  { name: "AI Tutor", href: "/chatbot", icon: MessageSquare },
  { name: "Finance Quiz", href: "/quiz", icon: BrainCircuit },
  { name: "Scam Checker", href: "/scam-checker", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-card h-screen fixed top-0 left-0 pt-6">
      <div className="px-6 mb-8 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex flex-col items-center justify-center">
           <PieChart className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">FinLearn<span className="text-primary">AI</span></span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
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
      </nav>

      <div className="p-4 border-t border-border mt-auto flex flex-col gap-2">
        <Link
           href="/settings"
           className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <div className="flex items-center justify-between px-3 py-2.5 mt-2">
           <span className="text-sm font-medium text-muted-foreground">Theme</span>
           <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
         <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex flex-col items-center justify-center">
             <PieChart className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">FinLearn<span className="text-primary">AI</span></span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-foreground">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-16 bg-background z-30 flex flex-col border-b"
          >
             <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all group",
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
