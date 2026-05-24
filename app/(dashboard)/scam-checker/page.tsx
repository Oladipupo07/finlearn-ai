"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, ScanSearch, FileText, CheckCircle2, ChevronRight, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "@/contexts/GamificationContext";

type ScamAnalysis = {
  riskLevel: "Low" | "Medium" | "High";
  confidence: number;
  suspiciousKeywords: string[];
  explanation: string;
  tips: string[];
};

const TEMPLATES = [
  "URGENT: Your account has been suspended! Please click this link immediately to verify your identity and restore access.",
  "Congratulations! You've been selected to receive a $500 Amazon Gift card. Click here to claim your prize.",
  "Hey, it's your boss. I'm in a meeting right now and need you to buy 5 Apple gift cards for a client presentation urgently."
];

const RED_FLAGS = ["urgent", "suspended", "immediately", "verify", "gift card", "boss", "claim", "prize", "selected", "click here", "password", "ssn", "wire", "crypto"];

export default function ScamDetectorPage() {
  const { incrementScamCount, triggerAction } = useGamification();
  const [text, setText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);

  const analyzeText = () => {
    if (!text.trim()) return;
    setIsScanning(true);
    setAnalysis(null);

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const foundKeywords = RED_FLAGS.filter(flag => lowerText.includes(flag));

      let risk: "Low" | "Medium" | "High" = "Low";
      let confidence = 90;
      let exp = "This message seems relatively safe. We couldn't find major red flags, but always verify the sender's identity.";
      let tips = [
        "Never share passwords or OTPs.",
        "Verify the email address domain, not just the display name."
      ];

      if (foundKeywords.length > 3) {
        risk = "High";
        confidence = 98;
        exp = "This message strongly resembles common phishing or scam patterns. It uses urgency and requests immediate action or money/gift cards.";
        tips = [
          "Do NOT click any links inside the message.",
          "If it claims to be from your bank/boss, contact them directly via a known phone number.",
          "Report and block the sender immediately."
        ];
      } else if (foundKeywords.length > 0) {
        risk = "Medium";
        confidence = 75;
        exp = "This message contains potentially suspicious language like requests to claim prizes or urgent actions. Proceed with high caution.";
        tips = [
          "Think twice before clicking links.",
          "Check for poor grammar or unusual sender addresses."
        ];
      }

      setAnalysis({ riskLevel: risk, confidence, suspiciousKeywords: foundKeywords, explanation: exp, tips });
      setIsScanning(false);
      incrementScamCount();
      triggerAction("scam");
    }, 2000);
  };

  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "High": return "text-destructive bg-destructive/10 border-destructive/20";
    }
  };

  const getRiskIcon = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low": return <ShieldCheck className="w-7 h-7 md:w-10 md:h-10" />;
      case "Medium": return <AlertTriangle className="w-7 h-7 md:w-10 md:h-10" />;
      case "High": return <ShieldAlert className="w-7 h-7 md:w-10 md:h-10" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 md:space-y-8 pb-10">

      {/* Page Header — compact on mobile */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <ScanSearch size={28} className="md:hidden" />
          <ScanSearch size={40} className="hidden md:block" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 md:mb-4">AI Scam Detector</h1>
        <p className="text-muted-foreground text-sm md:text-lg leading-relaxed px-2">
          Paste any suspicious email, SMS, or DM below. Our AI will detect phishing attempts, fraud, and common scams instantly.
        </p>
      </div>

      {/* Main grid — stacked on mobile, side-by-side on large screens */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-8">

        {/* Input Area */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">

          {/* Textarea card */}
          <div className="bg-card border border-border p-2 rounded-2xl md:rounded-3xl shadow-sm glass">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the suspicious message here..."
              className="w-full h-44 md:h-64 bg-transparent resize-none outline-none p-3 md:p-6 text-sm md:text-lg placeholder:text-muted-foreground leading-relaxed"
            />
            <div className="bg-muted border border-border p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1 self-center">
                {text.length} characters
              </span>
              <button
                onClick={analyzeText}
                disabled={!text.trim() || isScanning}
                className="w-full sm:w-auto justify-center bg-primary text-primary-foreground px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm md:text-base"
              >
                {isScanning ? (
                  <>
                    <ScanSearch className="w-4 h-4 animate-pulse" />
                    Scanning...
                  </>
                ) : (
                  <>
                    Analyze Risk <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example templates */}
          <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm glass">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground text-sm">
              <FileText className="w-4 h-4" /> Try an example:
            </h3>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => setText(tmpl)}
                  className="text-left text-xs md:text-sm p-3 rounded-xl border border-border bg-background hover:bg-muted hover:border-border/80 transition-all line-clamp-2"
                >
                  &ldquo;{tmpl}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!analysis && !isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border border-dashed rounded-2xl md:rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 md:p-10 text-center min-h-[220px] md:min-h-[400px]"
              >
                <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground opacity-20 mb-3" />
                <h2 className="text-lg md:text-xl font-semibold text-muted-foreground mb-1">Awaiting Input</h2>
                <p className="text-xs md:text-sm text-muted-foreground/80">Enter a message and hit &ldquo;Analyze Risk&rdquo; to see the safety breakdown.</p>
              </motion.div>
            ) : isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-2xl md:rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 md:p-10 text-center min-h-[220px] md:min-h-[400px] glass"
              >
                <div className="relative mb-5">
                  <ScanSearch className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
                  <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                </div>
                <h2 className="text-lg md:text-xl font-bold mb-2">Analyzing Patterns...</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Checking against known phishing databases and linguistic red flags.</p>
              </motion.div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col"
              >
                {/* Risk level header */}
                <div className={cn("p-4 md:p-8 border-b", getRiskColor(analysis.riskLevel))}>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{analysis.riskLevel} RISK</h2>
                    {getRiskIcon(analysis.riskLevel)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-background/20 px-3 py-1 rounded-full text-xs md:text-sm font-bold backdrop-blur-sm">
                      {analysis.confidence}% Confidence
                    </div>
                  </div>
                </div>

                {/* Analysis details */}
                <div className="p-4 md:p-8 flex-1 bg-background">
                  <h3 className="font-semibold text-base md:text-lg mb-2">Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                    {analysis.explanation}
                  </p>

                  {analysis.suspiciousKeywords.length > 0 && (
                    <div className="mb-4 md:mb-6">
                      <h3 className="font-semibold text-xs mb-2 md:mb-3 uppercase tracking-wider text-muted-foreground">Suspicious Triggers</h3>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {analysis.suspiciousKeywords.map((kw, i) => (
                          <span key={i} className="inline-flex bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[11px] md:text-xs font-bold uppercase">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-muted p-3 md:p-5 rounded-xl md:rounded-2xl border border-border">
                    <h3 className="font-semibold text-xs mb-2 md:mb-3 uppercase tracking-wider text-foreground flex items-center gap-2">
                      Protect Yourself <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    </h3>
                    <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                      {analysis.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="p-3 md:p-4 border-t border-border bg-card flex justify-end gap-2">
                  <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition" title="Copy Report">
                    <Copy className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition" title="Share Report">
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
