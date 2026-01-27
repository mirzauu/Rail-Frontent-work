import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Code, ChevronDown, ChevronUp, Brain, Search, Globe, Activity, CheckCircle2, Loader2, Info, FileText, Database, Server } from "lucide-react";
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
  attachments?: File[];
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
  const isKnowledgeBase = toolName.includes("knowledge") || toolName.includes("kb") || toolName === "knowledge_base";
  const isCompleted = toolCall.event_type === "ToolCallEventType.RESULT" || (toolCall as any).status === "completed" || !!toolCall.tool_response;

  const [isOpen, setIsOpen] = useState(isThink ? !isCompleted : false);

  // Auto-collapse think tool when completed
  React.useEffect(() => {
    if (isThink && isCompleted) {
      setIsOpen(false);
    }
  }, [isThink, isCompleted]);

  // Extract info from summary or direct properties
  const details = toolCall.tool_call_details?.summary;
  const args = (details?.args as any) || (toolCall as any).args || {};
  const result = (details?.result as any) || (toolCall as any).result || {};

  const title = isThink
    ? (isCompleted ? "Analysis Complete" : "Thinking...")
    : isSearch
      ? (isCompleted ? "Search Results" : "Searching...")
      : isKnowledgeBase
        ? (isCompleted ? "Knowledge Base Insights" : "Consulting Knowledge Base...")
        : `Tool: ${toolCall.tool_name}`;

  const icon = isThink
    ? <Brain className="h-3 w-3" />
    : isSearch
      ? <Globe className="h-3 w-3" />
      : isKnowledgeBase
        ? <Database className="h-3 w-3" />
        : <Code className="h-3 w-3" />;

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
    const content = result.content || (typeof result === 'string' ? result : '');
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
  } else if (isKnowledgeBase) {
    const query = args.query || args.q;
    const rawResult = toolCall.tool_response || result.content || (typeof result === 'string' ? result : '');

    // Parse the strategic facts if present
    let facts: any[] = [];
    try {
      if (rawResult) {
        // More robust JSON array extraction
        const start = rawResult.indexOf('[');
        const end = rawResult.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end >= start) {
          const jsonPart = rawResult.substring(start, end + 1);
          facts = JSON.parse(jsonPart);
        } else if (start !== -1) {
          // Fallback: try to see if it's just a raw JSON array string that didn't have brackets in the index search correctly (unlikely but safe)
          try {
            const parsed = JSON.parse(rawResult);
            if (Array.isArray(parsed)) facts = parsed;
          } catch (e) { }
        }
      }
    } catch (e) {
      console.error("Failed to parse KB facts", e, rawResult);
    }

    bodyContent = (
      <div className="space-y-3 py-2 font-sans">
        {query && (
          <div className="flex items-center gap-2 text-[10px] font-medium opacity-70 bg-muted/50 px-2 py-1 rounded w-fit">
            <Search className="h-2.5 w-2.5" />
            Query: {query}
          </div>
        )}
        {isCompleted ? (
          facts.length > 0 ? (
            <div className="grid gap-3 mt-2">
              {facts.map((fact, idx) => (
                <div key={idx} className="bg-card/50 border border-border/40 rounded-lg p-3 shadow-sm hover:shadow-md transition-all group/fact">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-primary/10 text-primary">
                        <Server className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 leading-none mb-0.5">
                          {fact.type || 'Entity'}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{fact.name}</span>
                      </div>
                    </div>
                    {fact.properties?.confidence && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {Math.round(fact.properties.confidence * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-2 border-t border-border/30">
                    {Object.entries(fact.properties || {}).map(([key, value]) => {
                      if (['confidence', 'name', 'normalized_name', 'source_doc_id', 'segment_ids', 'source_versions', 'created_at', 'type'].includes(key)) return null;
                      if (value === null || value === undefined || value === "") return null;

                      const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                      const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

                      return (
                        <div key={key} className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">{displayKey}</span>
                          <span className="text-[11px] text-foreground/80 leading-snug">
                            {displayValue}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-muted-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border flex items-center gap-2">
              <Info className="h-3.3 w-3.5" />
              {rawResult ? (
                <div className="prose prose-xs dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawResult}</ReactMarkdown>
                </div>
              ) : (
                "No relevant facts found in the knowledge base."
              )}
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse py-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Scanning database indexes...
          </div>
        )}
      </div>
    );
  } else {
    bodyContent = (
      <pre className="text-[10px] font-mono whitespace-pre-wrap py-1">
        {JSON.stringify(details || toolCall.tool_call_details || toolCall, null, 2)}
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

export const ChatBubble = React.memo(({ content, role, avatar, name, timestamp, tool_calls, showToolPanel, isLoading, attachments }: ChatBubbleProps) => {
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
            {attachments && attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 not-prose">
                {attachments.map((file, index) => (
                  <div key={index} className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs max-w-full",
                    isUser ? "bg-white/20 text-primary-foreground" : "bg-muted border border-border"
                  )}>
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="opacity-70 text-[10px]">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}
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
