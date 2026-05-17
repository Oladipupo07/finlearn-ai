"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
          glass && "glass",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const AnimatedCard = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div"> & { glass?: boolean }>(
  ({ className, glass = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.4 }}
        className={cn(
          "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
          glass && "glass",
          className
        )}
        {...props}
      />
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";
