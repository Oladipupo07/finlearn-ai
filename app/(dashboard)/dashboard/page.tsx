"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Flame, Activity } from "lucide-react";

// Mock Data
const cashFlowData = [
  { name: "Jan", income: 4000, expenses: 2400 },
  { name: "Feb", income: 3000, expenses: 1398 },
  { name: "Mar", income: 2000, expenses: 9800 },
  { name: "Apr", income: 2780, expenses: 3908 },
  { name: "May", income: 1890, expenses: 4800 },
  { name: "Jun", income: 2390, expenses: 3800 },
  { name: "Jul", income: 3490, expenses: 4300 },
];

const categoryData = [
  { name: "Housing", value: 400 },
  { name: "Food", value: 300 },
  { name: "Transport", value: 300 },
  { name: "Entertainment", value: 200 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here is your financial summary.</p>
        </div>
        <div className="flex space-x-3">
          <div className="inline-flex items-center space-x-2 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
             <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
             <span className="font-bold text-lg">7 Day Streak!</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-2xl shadow-sm glass relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="w-5 h-5" />
             </div>
             <h2 className="text-muted-foreground font-medium">Total Balance</h2>
          </div>
          <p className="text-4xl font-bold">₦124,500</p>
          <div className="mt-4 flex items-center text-sm text-primary font-medium">
             <TrendingUp className="w-4 h-4 mr-1" />
             <span>+12.5% from last month</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-2xl shadow-sm glass relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingDown className="w-24 h-24" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <TrendingDown className="w-5 h-5" />
             </div>
             <h2 className="text-muted-foreground font-medium">Monthly Expenses</h2>
          </div>
          <p className="text-4xl font-bold">₦45,200</p>
          <div className="mt-4 flex items-center text-sm text-muted-foreground font-medium">
             <span>72% of budget used</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-2xl shadow-sm glass relative overflow-hidden">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-muted-foreground font-medium flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Financial Health
              </h2>
              <span className="text-xl font-bold text-primary">A-</span>
           </div>
           
           <div className="mt-2 space-y-4">
              <div>
                 <div className="flex justify-between text-sm mb-1">
                    <span>Emergency Fund</span>
                    <span className="font-medium">65%</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-sm mb-1">
                    <span>Savings Goal</span>
                    <span className="font-medium text-primary">Completed!</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm glass">
          <h2 className="text-lg font-semibold mb-6">Cash Flow (6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
              <AreaChart data={cashFlowData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                   itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="income" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="var(--destructive)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Extra Widgets */}
        <div className="space-y-6">
           <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded-2xl shadow-sm glass h-[350px] flex flex-col">
              <h2 className="text-lg font-semibold mb-2">Spending Categories</h2>
              <div className="flex-1 w-full relative">
                 <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                   <PieChart>
                     <Pie
                       data={categoryData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {categoryData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', borderColor: 'var(--border)' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Center icon */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-muted p-3 rounded-full">
                       <Target className="w-6 h-6 text-muted-foreground" />
                    </div>
                 </div>
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/20 to-blue-500/10 border border-border p-6 rounded-2xl shadow-sm glass relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-20">
                  <PiggyBank className="w-32 h-32" />
               </div>
               <h2 className="text-lg font-bold mb-2">Daily Challenge</h2>
               <p className="text-sm text-foreground/80 mb-4 pr-10">Read one article about basic stock market investing to earn 50 XP.</p>
               <button className="bg-primary text-primary-foreground font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                  Go to Quiz
               </button>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
