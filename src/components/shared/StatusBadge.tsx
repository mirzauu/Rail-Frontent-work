import { cn } from "@/lib/utils";

type Status = "active" | "idle" | "error" | "connected" | "pending";

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusConfig: Record<Status, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  active: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
    defaultLabel: "Active",
  },
  idle: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    defaultLabel: "Idle",
  },
  error: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
    defaultLabel: "Error",
  },
  connected: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
    defaultLabel: "Connected",
  },
  pending: {
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning animate-pulse-subtle",
    defaultLabel: "Pending",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {label || config.defaultLabel}
    </span>
  );
}
