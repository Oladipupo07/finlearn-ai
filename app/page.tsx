"use client";

import { motion } from "framer-motion";
import { Brain, Wallet, ShieldAlert, Trophy, ArrowRight, CheckCircle2, TrendingUp, PiggyBank } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AtlasLearn <span className="text-primary">AI</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="#why" className="hover:text-foreground transition-colors">Why AtlasLearn</Link>
            </div>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
              >
                Dashboard →
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Sign In</Link>
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center space-x-2 bg-muted/50 border border-border px-4 py-2 rounded-full mb-8 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">AtlasLearn AI V2.0 is live!</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black tracking-tight max-w-5xl leading-[1.1]"
        >
          Master your money <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            with AI brilliance.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-muted-foreground mt-8 max-w-3xl mx-auto leading-relaxed"
        >
          Your personal AI finance tutor. Budget smarter, spot scams instantly, and level up your financial literacy in minutes perfectly tailored for students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 w-full sm:w-auto"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="flex items-center justify-center space-x-2 bg-muted/50 border border-border px-8 py-4 rounded-full text-lg font-semibold hover:bg-muted transition-all w-full sm:w-auto"
          >
            <span>See Features</span>
          </Link>
        </motion.div>

        {/* Animated Dashboard Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-20 w-full max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-3xl shadow-2xl overflow-hidden p-2">
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              {/* Faux header */}
              <div className="h-10 border-b border-border/50 flex items-center px-4 space-x-2 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-primary/80" />
              </div>
              {/* Faux Content */}
              <div className="h-64 sm:h-96 w-full p-8 flex flex-col gap-4 bg-background">
                <div className="flex gap-4">
                  <div className="h-24 flex-1 rounded-xl bg-card border border-border shadow-sm p-4 flex flex-col justify-between">
                    <div className="w-16 h-4 bg-muted rounded-full" />
                    <div className="w-24 h-8 bg-primary/20 rounded-md mt-2" />
                  </div>
                  <div className="h-24 flex-1 rounded-xl bg-card border border-border shadow-sm p-4 flex flex-col justify-between hidden sm:flex">
                    <div className="w-16 h-4 bg-muted rounded-full" />
                    <div className="w-32 h-8 bg-muted rounded-md mt-2" />
                  </div>
                  <div className="h-24 flex-1 rounded-xl bg-card border border-border shadow-sm p-4 flex gap-4 items-center hidden md:flex">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="flex flex-col gap-2">
                      <div className="w-20 h-4 bg-muted rounded-full" />
                      <div className="w-16 h-4 bg-muted/60 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="h-40 flex-1 rounded-xl bg-card border border-border p-6 mt-4">
                  <div className="w-1/3 h-6 bg-muted rounded-full mb-6" />
                  <div className="flex items-end gap-2 h-full pb-4">
                    {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{ height: `${height}%`, backgroundColor: i === 6 ? 'var(--primary)' : 'var(--muted)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need to succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">AtlasLearn AI brings powerful, enterprise-grade financial tools specifically tailored to students.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Brain size={32} />}
              title="AI Finance Tutor"
              description="Get simple, instant explanations for complex financial terms directly tailored to your knowledge level."
              delay={0}
            />
            <FeatureCard
              icon={<Wallet size={32} />}
              title="Smart Budget Planner"
              description="Track spending, setup emergency funds, and watch your savings grow with intelligent categorizations."
              delay={0.1}
            />
            <FeatureCard
              icon={<ShieldAlert size={32} />}
              title="Phishing & Scam Detector"
              description="Paste suspicious emails or SMS messages and let AI instantly verify if it's a scam or safe."
              delay={0.2}
            />
            <FeatureCard
              icon={<Trophy size={32} />}
              title="Gamified Quizzes"
              description="Learn through fun quizzes, earn achievements, and build streaks to keep financial education engaging."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Why AtlasLearn AI Matters */}
      <section id="why" className="py-32 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <PiggyBank size={18} />
              <span className="text-sm font-semibold tracking-wide uppercase">The Problem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
              Why AtlasLearn AI <br /> is essential today.
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/20 p-2 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">The literacy gap</h3>
                  <p className="text-muted-foreground leading-relaxed">Most students graduate without understanding basic taxes, investing, or credit scores, leading to early debt.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/20 p-2 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Rising online scams</h3>
                  <p className="text-muted-foreground leading-relaxed">Financial scams targeting youth have increased by 400%. Our AI detector provides a necessary shield.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-primary/20 p-2 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Traditional learning is boring</h3>
                  <p className="text-muted-foreground leading-relaxed">We replace dry textbooks with interactive AI chat, personalized advice, and gamified progress tracking.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-blue-500/30 rounded-3xl blur-[80px] -z-10" />
            <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl glass">
              {/* Statistic Card layout */}
              <h3 className="text-2xl font-bold mb-8">Student Debt Realities</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-muted-foreground">Students feeling financially unprepared</span>
                    <span className="font-bold">74%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '74%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-destructive"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-muted-foreground">Scam victims aged 18-24</span>
                    <span className="font-bold">41%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '41%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-muted-foreground">Students who budget actively</span>
                    <span className="font-bold">21%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '21%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10 glass border border-border/50 rounded-3xl p-12 md:p-20 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to take control of your financial future?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students learning to budget, save, and grow wealth smartly.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-10 py-5 rounded-full text-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <TrendingUp className="text-white w-3 h-3" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">AtlasLearn <span className="text-primary">AI</span></h1>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Built for Hackathon Excellence. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 text-muted-foreground text-sm">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 glass relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
