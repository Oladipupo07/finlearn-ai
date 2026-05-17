"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      outline: "border border-border hover:bg-muted font-medium",
      ghost: "hover:bg-muted hover:text-foreground",
    };

    const sizes = {
      default: "h-11 px-6 py-2 rounded-xl",
      sm: "h-9 px-4 text-sm rounded-lg",
      lg: "h-14 px-8 text-lg rounded-2xl",
      icon: "h-10 w-10 flex items-center justify-center rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export const AnimatedButton = React.forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
        <Button ref={ref} className={className} {...props} />
      </motion.div>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";
