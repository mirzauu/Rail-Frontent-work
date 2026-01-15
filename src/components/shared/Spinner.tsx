import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
  thickness?: number;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Spinner({ size = 24, thickness = 3, className, ...props }: SpinnerProps) {
  const border = `${thickness}px`;
  return (
    <div
      aria-label="Loading"
      role="status"
      className={cn("inline-block animate-spin rounded-full border-muted-foreground/30 border-t-primary", className)}
      style={{ width: size, height: size, borderWidth: border }}
      {...props}
    />
  );
}

type FullscreenLoaderProps = {
  text?: string;
  className?: string;
};

export function FullscreenLoader({ text = "Loading...", className }: FullscreenLoaderProps) {
  return (
    <div className={cn("fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm", className)}>
      <div className="flex items-center gap-3">
        <Spinner size={28} thickness={3} />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

