import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { downloadPDF, downloadDOCX } from "@/lib/downloadMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Code, ChevronDown, ChevronUp, Brain, Search, Globe, Activity, CheckCircle2, Loader2, Info, FileText, Database, Server, Presentation, Copy, Download, ThumbsUp, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
  attachments?: (File | { name: string; size: number })[];
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
  const toolName = (toolCall.tool_name || "").toLowerCase();
  const isThink = toolName === "think";
  const isSearch = toolName.includes("search") || toolName.includes("web");
  const isKnowledgeBase = toolName.includes("knowledge") || toolName.includes("kb") || toolName === "knowledge_base";
  const isPPT = toolName.includes("ppt") || toolName.includes("slide");
  const isPDF = toolName.includes("pdf");
  const isDoc = toolName.includes("word") || toolName.includes("doc");
  const isCallEvent = toolCall.event_type === "ToolCallEventType.CALL";
  const isCompleted = !isCallEvent && (toolCall.event_type === "ToolCallEventType.RESULT" || (toolCall as any).status === "completed" || !!toolCall.tool_response);

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
    ? (isCompleted ? "Thought" : "Thinking...")
    : isSearch
      ? (isCompleted ? "Search Results" : "Searching...")
      : isKnowledgeBase
        ? (isCompleted ? "Knowledge Base Insights" : "Consulting Knowledge Base...")
        : isPPT
          ? (toolName.includes("create") ? "Creating Presentation" : "Adding Slide")
          : isPDF
            ? (toolName.includes("create") ? "Generating Strategy Brief" : "Adding Brief Section")
            : isDoc
              ? (toolName.includes("create") ? "Creating Word Document" : "Adding Document Section")
              : `Tool: ${toolCall.tool_name}`;

  const icon = isThink
    ? <Brain className="h-3 w-3" />
    : isSearch
      ? <Globe className="h-3 w-3" />
      : isKnowledgeBase
        ? <Database className="h-3 w-3" />
        : isPPT
          ? (Presentation ? <Presentation className="h-3 w-3" /> : <FileText className="h-3 w-3" />)
          : isPDF
            ? <FileText className="h-3 w-3" />
            : isDoc
              ? <FileText className="h-3 w-3 text-blue-500" />
              : <Code className="h-3 w-3" />;

  // Normalized content extracting
  let bodyContent: React.ReactNode = null;
  if (isThink) {
    const thought = args?.thought || (toolCall.tool_response !== "Running tool think" ? toolCall.tool_response : null);
    const analysis = result?.analysis;
    bodyContent = (
      <div className="space-y-2 py-1">
        {thought ? (
          <div className="text-muted-foreground italic text-[11px] leading-relaxed">"{thought}"</div>
        ) : (
          !isCompleted && (
            <div className="flex items-center gap-2 text-muted-foreground italic text-[11px]">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Analyzing context...</span>
            </div>
          )
        )}
        {isCompleted && analysis && (
          <div className="text-foreground/80 border-t border-border/40 pt-2 mt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  } else if (isSearch) {
    const query = args?.query;
    const content = result?.content || (typeof result === 'string' ? result : '');
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
    const query = args?.query || args?.q;
    // Prioritize the detailed result content over the status message in tool_response
    const resultString = typeof result === 'string' ? result : result?.content;
    const rawResult = resultString || toolCall.tool_response || "";

    // Parse the strategic facts if present
    let facts: any[] = [];
    let textContent = rawResult;

    try {
      if (rawResult) {
        // More robust JSON array extraction
        const start = rawResult.indexOf('[');
        const end = rawResult.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end >= start) {
          const jsonPart = rawResult.substring(start, end + 1);
          try {
            const parsed = JSON.parse(jsonPart);
            if (Array.isArray(parsed)) {
              facts = parsed;
              // Remove the JSON part from textContent to avoid massive duplication
              textContent = rawResult.substring(0, start) + rawResult.substring(end + 1);
            }
          } catch (e) {
            // If parse fails, keep textContent as is
          }
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
          <div className="space-y-4">
            {facts.length > 0 && (
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
            )}

            {textContent && textContent.trim().length > 0 && (
              <div className={cn(
                "text-[12px] text-muted-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border flex flex-col gap-2",
                facts.length === 0 && "items-center flex-row"
              )}>
                {facts.length === 0 && <Info className="h-3.3 w-3.5 flex-shrink-0" />}
                <div className="prose prose-xs dark:prose-invert w-full max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
                </div>
              </div>
            )}

            {!facts.length && !textContent.trim() && (
              <div className="text-[12px] text-muted-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border flex items-center gap-2">
                <Info className="h-3.3 w-3.5" />
                No relevant insights found.
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground animate-pulse py-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Scanning database indexes...
          </div>
        )}
      </div>
    );
  } else if (isPPT || isPDF || isDoc) {
    const titleVal = args?.title || details?.title || "";
    bodyContent = (
      <div className="py-1 space-y-1">
        {titleVal && <div className="text-[11px] font-medium text-foreground/80">{titleVal}</div>}
        {args?.content && (
          <div className="text-[10px] text-muted-foreground line-clamp-2 italic">
            {args.content.substring(0, 100)}...
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <div className={cn("h-1.5 w-1.5 rounded-full", isDoc ? "bg-blue-500" : "bg-green-500")} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Document Updated</span>
        </div>
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
          <div className={cn(!isCompleted && "animate-spin-slow")}>
            {isThink && !isCompleted ? <Loader2 className="h-3 w-3" /> : icon}
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
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleThumbsUp = () => {
    // Placeholder for thumbs up action
    console.log("Thumbs up clicked");
  };

  const handleDownload = (format: 'pdf' | 'docx') => {
    if (!content) return;
    const filename = `message_${new Date().toISOString().slice(0, 10)}`;
    if (format === 'pdf') {
      downloadPDF(content, filename);
    } else {
      downloadDOCX(content, filename);
    }
  };

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

  const processContent = (rawContent: string): string => {
    const raw = (rawContent || "")
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n");

    // Unwrap tables from markdown code blocks
    const unwrapped = raw.replace(/```(?:markdown)?\s*?\n\s*(\|[\s\S]*?\|)\s*?\n\s*?```/g, (match, table) => {
      return "\n" + table + "\n";
    });

    return normalizeTables(unwrapped
      .replace(/\\\*\\\*/g, "**")
      .replace(/([^\n])\n(#+\s)/g, "$1\n\n$2")
      .replace(/([^\n])\n(```)/g, "$1\n\n$2"));
  };

  const showTyping = role === "assistant" && isLoading && (!content || content.trim().length === 0);

  // Parse content to find interleaved tool calls
  const { segments, hasMarkers, orphanedToolCalls } = React.useMemo(() => {
    const toolCallRegex = /(?:\n|^):::tool_call:([^:]+):::(?:\n|$)/g;
    const parts = (content || "").split(toolCallRegex);
    const resultSegments: { type: 'text' | 'tool'; content?: string; id?: string }[] = [];
    const usedToolCallIds = new Set<string>();

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i % 2 === 0) {
        // Text segment
        if (part) resultSegments.push({ type: 'text', content: part });
      } else {
        // Tool call ID segment
        const callId = part.trim();
        resultSegments.push({ type: 'tool', id: callId });
        usedToolCallIds.add(callId);
      }
    }

    const orphans = (tool_calls || []).filter(tc => !usedToolCallIds.has(tc.call_id));
    return { segments: resultSegments, hasMarkers: parts.length > 1, orphanedToolCalls: orphans };
  }, [content, tool_calls]);

  return (
    <div className={cn("flex mb-6 w-full min-w-0 overflow-hidden group", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col min-w-0 overflow-hidden", isUser ? "items-end max-w-[85%]" : "items-start max-w-full")}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {name}
          </span>
          {timestamp && <span className="text-xs text-muted-foreground/60">{timestamp}</span>}
        </div>

        {/* Legacy behavior: if no markers found, render all tool calls at the top */}
        {!hasMarkers && tool_calls && tool_calls.length > 0 && (
          <div className="w-full mb-2 space-y-2">
            {tool_calls.map((tc, idx) => (
              <ToolCallItem key={tc.call_id || idx} toolCall={tc} />
            ))}
          </div>
        )}

        {/* If markers exist, render any orphaned tool calls at the top (or could be bottom) */}
        {hasMarkers && orphanedToolCalls.length > 0 && (
          <div className="w-full mb-2 space-y-2">
            {orphanedToolCalls.map((tc, idx) => (
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
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs max-w-full border",
                    isUser
                      ? "bg-white/10 text-primary-foreground border-white/20"
                      : "bg-muted border-border"
                  )}>
                    <FileText className="h-4 w-4 flex-shrink-0 opacity-80" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="opacity-60 text-[10px]">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {segments.map((segment, idx) => {
              if (segment.type === 'tool' && segment.id) {
                const tc = tool_calls?.find(t => t.call_id === segment.id);
                if (tc) return <div key={`tool-${segment.id}-${idx}`} className="not-prose my-2"><ToolCallItem toolCall={tc} /></div>;
                return null;
              } else if (segment.type === 'text' && segment.content) {
                const processed = processContent(segment.content);
                // If checking for empty processed content to avoid empty paragraphs? 
                // ReactMarkdown handles it mostly.
                if (!processed.trim()) return null;
                return (
                  <ReactMarkdown
                    key={`text-${idx}`}
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
                    {processed}
                  </ReactMarkdown>
                );
              }
              return null;
            })}

            {showTyping ? (
              <TypingDots />
            ) : null}

            {!isUser && !isLoading && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleDownload('pdf')} className="text-xs">
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('docx')} className="text-xs">
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      Download Word
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                  onClick={handleCopy}
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                  onClick={handleThumbsUp}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
