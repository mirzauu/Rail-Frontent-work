import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Code, ChevronDown, ChevronUp, Brain, Search, Globe, Activity, CheckCircle2, Loader2, Info } from "lucide-react";
import { useState } from "react";

export interface ToolCall {
  call_id: string;
  event_type: string;
  tool_name: string;
  tool_response?: string;
  tool_call_details?: ToolCallDetails;
}

export type ToolCallSummary = {
  args?: unknown;
  result?: unknown;
} & Record<string, unknown>;

export type ToolCallDetails = {
  summary?: ToolCallSummary;
} & Record<string, unknown>;

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  avatar?: string;
  name?: string;
  timestamp?: string;
  tool_calls?: ToolCall[];
  showToolPanel?: boolean;
  isLoading?: boolean;
}

const TypingDots = () => {
  return (
    <div className="flex items-center gap-1 py-2">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
    </div>
  );
};

const ToolCallItem = ({ toolCall }: { toolCall: ToolCall }) => {
  const toolName = toolCall.tool_name.toLowerCase();
  const isThink = toolName === "think";
  const isSearch = toolName.includes("search") || toolName.includes("web");
  const isCompleted = toolCall.event_type === "ToolCallEventType.RESULT";

  const [isOpen, setIsOpen] = useState(isThink ? !isCompleted : false);

  // Auto-collapse think tool when completed
  React.useEffect(() => {
    if (isThink && isCompleted) {
      setIsOpen(false);
    }
  }, [isThink, isCompleted]);

  // Extract info from summary
  const details = toolCall.tool_call_details?.summary;
  const args = (details?.args as any) || {};
  const result = (details?.result as any) || {};

  const title = isThink
    ? (isCompleted ? "Analysis Complete" : "Thinking...")
    : isSearch
      ? (isCompleted ? "Search Results" : "Searching...")
      : `Tool: ${toolCall.tool_name}`;

  const icon = isThink ? <Brain className="h-3 w-3" /> : isSearch ? <Globe className="h-3 w-3" /> : <Code className="h-3 w-3" />;

  // Normalized content extracting
  let bodyContent: React.ReactNode = null;
  if (isThink) {
    const thought = args.thought || toolCall.tool_response;
    const analysis = result.analysis;
    bodyContent = (
      <div className="space-y-2 py-1">
        {thought && <div className="text-muted-foreground italic text-[11px] leading-relaxed">"{thought}"</div>}
        {isCompleted && analysis && (
          <div className="text-foreground/80 border-t border-border/40 pt-2 mt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  } else if (isSearch) {
    const query = args.query;
    const content = result.content;
    bodyContent = (
      <div className="space-y-2 py-1 font-sans">
        {query && <div className="text-[11px] opacity-70">Query: {query}</div>}
        {isCompleted && content && (
          <div className="text-[12px] leading-relaxed border-t border-border/40 pt-2 mt-2 prose prose-xs dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  } else {
    bodyContent = (
      <pre className="text-[10px] font-mono whitespace-pre-wrap py-1">
        {JSON.stringify(details || toolCall.tool_call_details || {}, null, 2)}
      </pre>
    );
  }

  return (
    <div className="w-full mb-2 group transition-all pl-3 border-l-2 border-muted-foreground/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-muted-foreground transition-colors py-1 text-[10px] hover:text-foreground"
      >
        <div className="flex items-center gap-2">
          <div className={cn(!isCompleted && !isThink && "animate-spin-slow")}>
            {icon}
          </div>
          <span className="font-semibold tracking-tight uppercase">{title}</span>
          {!isCompleted && <span className="flex h-1 w-1 rounded-full bg-primary animate-pulse ml-1" />}
        </div>
        {isOpen ? <ChevronUp className="h-3 w-3 opacity-50" /> : <ChevronDown className="h-3 w-3 opacity-50" />}
      </button>

      {isOpen && (
        <div className="text-[12px] leading-relaxed transition-all animate-in fade-in slide-in-from-top-1 duration-200">
          {bodyContent}
        </div>
      )}
    </div>
  );
}

export const ChatBubble = React.memo(({ content, role, avatar, name, timestamp, tool_calls, showToolPanel, isLoading }: ChatBubbleProps) => {
  const isUser = role === "user";

  const normalizeTables = (text: string): string => {
    // 1. Convert literal \n to real newlines first
    const processed = text.replace(/\\n/g, "\n");

    // 2. Helper to check if a line is part of a table
    const isTableLine = (s: string) => s.trim().startsWith("|");

    const lines = processed.split("\n");
    const out: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isTableLine(line)) {
        if (out.length > 0 && out[out.length - 1].trim() !== "" && !isTableLine(out[out.length - 1])) {
          out.push("");
        }
        out.push(line.trim());
      } else {
        out.push(line);
      }
    }
    return out.join("\n");
  };

  // Preprocess content to ensure better markdown rendering
  const processedContent = React.useMemo(() => {
    let raw = content
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n");

    // Unwrap tables from markdown code blocks
    // This allows tables wrapped in ```markdown or ``` to render as actual tables instead of raw code
    raw = raw.replace(/```(?:markdown)?\s*?\n\s*(\|[\s\S]*?\|)\s*?\n\s*?```/g, (match, table) => {
      return "\n" + table + "\n";
    });

    return normalizeTables(raw
      .replace(/\\\*\\\*/g, "**")
      .replace(/([^\n])\n(#+\s)/g, "$1\n\n$2")
      .replace(/([^\n])\n(```)/g, "$1\n\n$2"));
  }, [content]);

  const showTyping = role === "assistant" && isLoading && processedContent.trim().length === 0;

  return (
    <div className={cn("flex mb-6 w-full min-w-0 overflow-hidden", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col min-w-0 overflow-hidden", isUser ? "items-end max-w-[85%]" : "items-start max-w-full")}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {name}
          </span>
          {timestamp && <span className="text-xs text-muted-foreground/60">{timestamp}</span>}
        </div>

        {tool_calls && tool_calls.length > 0 && (
          <div className="w-full mb-2 space-y-2">
            {tool_calls.map((tc, idx) => (
              <ToolCallItem key={tc.call_id || idx} toolCall={tc} />
            ))}
          </div>
        )}

        <div
          className={cn(
            "text-sm overflow-hidden inline-block max-w-full",
            isUser
              ? "rounded-lg p-4 shadow-sm bg-primary text-primary-foreground"
              : "text-foreground w-full"
          )}
        >
          <div
            className={cn(
              "prose prose-sm dark:prose-invert max-w-none break-words overflow-x-auto",
              isUser ? "prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground" : ""
            )}
          >
            {showTyping ? (
              <TypingDots />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  strong({ children, ...props }) {
                    return (
                      <strong className={cn("font-bold", isUser ? "text-primary-foreground" : "text-foreground")} {...props}>
                        {children}
                      </strong>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4">
                        {children}
                      </blockquote>
                    );
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-6 my-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-6 my-2 space-y-1">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="pl-1">{children}</li>;
                  },
                  hr() {
                    return <hr className="my-6 border-border" />;
                  },
                  code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
                    const text = String(children ?? "");
                    const isBlock =
                      inline === false ||
                      (inline === undefined && ((className && className.includes("language-")) || text.includes("\n")));

                    return isBlock ? (
                      <pre className="rounded-md p-4 my-4 overflow-x-auto w-full bg-muted/20 border border-border/50 text-foreground">
                        <code className={cn("text-[11px] font-mono", className)} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className={cn("bg-background/30 rounded px-1 py-0.5 font-mono text-xs", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-6 border border-border/60 rounded-lg shadow-sm block w-full bg-card">
                        <table className="text-[12px] text-left border-collapse table-auto w-full">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-muted/40 border-b border-border/60">{children}</thead>;
                  },
                  th({ children }) {
                    return <th className="px-4 py-2.5 font-semibold border-r border-border/40 last:border-r-0 whitespace-nowrap text-foreground/80">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-4 py-2.5 border-t border-border/40 border-r border-border/40 last:border-r-0 min-w-[120px] text-foreground/70 leading-relaxed">{children}</td>;
                  },
                  a({ children, href }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-blue-500">
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {processedContent}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
