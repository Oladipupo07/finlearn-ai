import {
  LayoutDashboard,
  Wallet,
  Brain,
  ShieldAlert,
  Trophy,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-white border-r min-h-screen p-5">
      <h1 className="text-2xl font-bold text-green-600 mb-10">
        FinLearn AI
      </h1>

      <nav className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer">
          <Wallet size={20} />
          <span>Budget Planner</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer">
          <Brain size={20} />
          <span>AI Tutor</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer">
          <ShieldAlert size={20} />
          <span>Scam Checker</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 cursor-pointer">
          <Trophy size={20} />
          <span>Finance Quiz</span>
        </div>
      </nav>
    </aside>
  );
}
