import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

export function SidePanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
}: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full bg-card border-l border-border shadow-lg animate-slide-in-right overflow-hidden flex flex-col",
          width === "sm" && "w-80",
          width === "md" && "w-[420px]",
          width === "lg" && "w-[560px]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">{children}</div>
      </aside>
    </>
  );
}
