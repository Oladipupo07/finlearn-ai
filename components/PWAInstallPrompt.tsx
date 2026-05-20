"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);

  useEffect(() => {
    // Only show once per session if declined
    if (sessionStorage.getItem("pwa_prompt_declined") === "true") {
      setHasDeclined(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      if (!hasDeclined) {
        setDeferredPrompt(e);
        // Delay showing the prompt slightly less aggressively
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [hasDeclined]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it up.
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const declinePrompt = () => {
    setShowPrompt(false);
    setHasDeclined(true);
    sessionStorage.setItem("pwa_prompt_declined", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && !hasDeclined && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-50 max-w-sm ml-auto mr-auto md:mr-0 md:ml-auto"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 flex gap-4 items-start relative glass">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <Download className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 pt-1 pr-4">
              <h3 className="font-bold text-foreground text-sm tracking-tight mb-1">Install AtlasLearn App</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                Add AtlasLearn AI to your home screen for quick access, offline capabilities, and a better full-screen experience.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all flex-1 shadow-md shadow-primary/20"
                >
                  Install Now
                </button>
                <button
                  onClick={declinePrompt}
                  className="text-muted-foreground bg-muted hover:text-foreground hover:bg-muted/80 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-border"
                >
                  Not Now
                </button>
              </div>
            </div>
            
            <button 
              onClick={declinePrompt} 
              className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
