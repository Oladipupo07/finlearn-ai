"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Target, RotateCcw, AlertTriangle, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useGamification } from "@/contexts/GamificationContext";

type Question = {
  id: number;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export default function QuizPage() {
  const { addXP, unlockBadge, triggerAction } = useGamification();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizOver, setIsQuizOver] = useState(false);
  
  // Generating State
  const [isGenerating, setIsGenerating] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25);
  const [timerActive, setTimerActive] = useState(false);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (timerActive && timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
  }, [timeLeft, timerActive, isAnswered]);

  const startGame = async () => {
    setIsGenerating(true);
    setTimerActive(false);

    try {
      const res = await fetch("/api/quiz");
      const data = await res.json();
      setQuestions(data.questions || []);
      
      setCurrentIdx(0);
      setScore(0);
      setIsQuizOver(false);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(25);
      setTimerActive(true);
    } catch (e) {
      console.error(e);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    setSelectedOption(-1); // specific indicator for timeout
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    
    setSelectedOption(idx);
    setIsAnswered(true);
    
    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(25);
    } else {
      setIsQuizOver(true);
      setTimerActive(false);
      triggerConfetti();
      addXP(10, "Quiz Completed");
      triggerAction("quiz");
      if (score / questions.length >= 0.8) {
        unlockBadge("quiz_master");
      }
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      const timeLeftConfetti = animationEnd - Date.now();
      if (timeLeftConfetti <= 0) return;
      
      confetti({
        particleCount: 5,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
      requestAnimationFrame(frame);
    };
    frame();
  };

  if (isGenerating) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center pt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border p-12 rounded-3xl text-center shadow-xl glass max-w-xl w-full flex flex-col items-center justify-center"
        >
          <div className="relative mb-6">
             <Trophy size={48} className="text-primary opacity-50" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-16 h-16 text-primary animate-spin" />
             </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Generating Questions...</h1>
          <p className="text-muted-foreground text-sm">
            Tapping into Gemini to generate brand new financial scenarios for you.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!timerActive && !isQuizOver && questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center pt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border p-12 rounded-3xl text-center shadow-xl glass max-w-xl w-full"
        >
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <Trophy size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Financial IQ Challenge</h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Test your knowledge of investing, budgeting, and credit. AI will generate brand new questions every time. Can you get a perfect score?
          </p>
          <button 
            onClick={startGame}
            className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition shadow-lg hover:shadow-primary/25"
          >
            Start Dynamic Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <Target className="w-6 h-6 text-primary" /> Daily Challenge
        </h1>
        {timerActive && (
          <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-2">
             <Clock className={cn("w-5 h-5", timeLeft <= 5 ? "text-destructive animate-pulse" : "text-muted-foreground")} />
             <span className={cn("font-bold text-lg font-mono", timeLeft <= 5 ? "text-destructive" : "")}>
               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
             </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isQuizOver && currentQ ? (
          <motion.div 
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Progress Bar Container */}
            <div className="bg-card border border-border rounded-full h-3 overflow-hidden">
               <motion.div 
                 initial={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                 animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                 className="h-full bg-primary"
                 transition={{ duration: 0.5 }}
               />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
               <span>Question {currentIdx + 1} of {questions.length}</span>
               <span>{questions.length - currentIdx - 1} remaining</span>
            </div>

            {/* Question Card */}
            <div className="bg-card border border-border p-8 py-12 rounded-3xl shadow-sm glass relative overflow-hidden">
               <div className="absolute top-0 right-0 m-6 flex gap-2">
                 {currentQ.difficulty === "Easy" && <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Easy</span>}
                 {currentQ.difficulty === "Medium" && <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Medium</span>}
                 {currentQ.difficulty === "Hard" && <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Hard</span>}
               </div>

               <h2 className="text-2xl md:text-3xl font-semibold leading-tight pt-4 w-[90%] mb-10">
                 {currentQ.question}
               </h2>

               <div className="space-y-3">
                 {currentQ.options.map((option, idx) => {
                   let stateClass = "border-border bg-background hover:bg-muted font-medium";
                   
                   if (isAnswered) {
                     if (idx === currentQ.correctIndex) {
                       stateClass = "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-opacity-20";
                     } else if (idx === selectedOption) {
                       stateClass = "border-destructive bg-destructive/10 text-destructive";
                     } else {
                       stateClass = "border-border bg-background opacity-50";
                     }
                   }

                   return (
                     <button
                       key={idx}
                       disabled={isAnswered}
                       onClick={() => handleOptionSelect(idx)}
                       className={cn(
                         "w-full text-left p-4 md:p-5 rounded-2xl border transition-all text-sm md:text-base flex items-center justify-between group",
                         stateClass,
                         !isAnswered && "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
                       )}
                     >
                       <span className="flex items-center gap-3">
                          <span className={cn(
                            "w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs font-bold",
                            isAnswered && idx === currentQ.correctIndex && "bg-primary text-white border-primary",
                            isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && "bg-destructive text-white border-destructive",
                            !isAnswered && "group-hover:border-primary/50"
                          )}>
                             {String.fromCharCode(65 + idx)}
                          </span>
                          {option}
                       </span>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Explanation & Next Button */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className="bg-card border border-border p-6 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="flex gap-4">
                     <div className={cn(
                       "w-12 h-12 rounded-full shrink-0 flex items-center justify-center",
                       selectedOption === currentQ.correctIndex ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                     )}>
                        {selectedOption === currentQ.correctIndex ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                     </div>
                     <div className="flex-1">
                        <h3 className={cn(
                          "text-lg font-bold mb-1",
                          selectedOption === currentQ.correctIndex ? "text-primary" : "text-destructive"
                        )}>
                          {selectedOption === -1 ? "Out of time!" : (selectedOption === currentQ.correctIndex ? "Perfectly correct!" : "Not quite right.")}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                           {currentQ.explanation}
                        </p>
                        <div className="flex justify-end">
                           <button 
                             onClick={nextQuestion}
                             className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition hover:translate-x-1"
                           >
                              Next Question <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border p-12 rounded-3xl text-center shadow-xl glass"
          >
            <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 outline outline-8 outline-primary/20">
               <Trophy size={48} />
            </div>
            <h2 className="text-3xl font-black mb-2">Quiz Completed!</h2>
            <p className="text-xl text-muted-foreground mb-8">You scored {score} out of {questions.length}</p>
            
             <div className="bg-background rounded-2xl p-6 border border-border mb-8 inline-flex flex-col mx-auto min-w-[250px]">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Final Grade</span>
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                  {Math.round((score / questions.length) * 100)}%
                </span>
             </div>
             
             {score === questions.length ? (
               <p className="text-lg text-primary font-bold mb-10 selection:bg-background">Flawless Victory! You're a finance wizard! 🧙‍♂️</p>
             ) : (
               <p className="text-lg text-foreground mb-10">Good job! Review the concepts and try again to improve.</p>
             )}

            <button 
              onClick={startGame}
              className="bg-muted text-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto border border-border hover:bg-border/50 transition-colors"
            >
               <RotateCcw className="w-5 h-5" /> Generate New Quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
