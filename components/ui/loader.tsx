import * as React from "react";
import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin",
        className
      )}
    />
  );
};

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
       <div className="flex space-x-2">
         <div className="w-3 h-3 rounded-full bg-primary animate-bounce flex-shrink-0" style={{ animationDelay: '0ms' }} />
         <div className="w-3 h-3 rounded-full bg-primary animate-bounce flex-shrink-0" style={{ animationDelay: '150ms' }} />
         <div className="w-3 h-3 rounded-full bg-primary animate-bounce flex-shrink-0" style={{ animationDelay: '300ms' }} />
       </div>
       <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Loading</p>
    </div>
  );
}
