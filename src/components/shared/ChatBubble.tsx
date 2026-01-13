import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Code, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { useState } from "react";

export interface ToolCall {
  call_id: string;
  event_type: string;
  tool_name: string;
  tool_response?: string;
  tool_call_details?: any;
}

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  avatar?: string;
  name?: string;
  timestamp?: string;
  tool_calls?: ToolCall[];
  showToolPanel?: boolean;
}

const ToolCallItem = ({ toolCall }: { toolCall: ToolCall }) => {
  const isThink = toolCall.tool_name === "think";
  const isCompleted = toolCall.event_type === "ToolCallEventType.RESULT" || 
                     (toolCall.tool_response && toolCall.tool_response.includes("Completed tool think"));
  
  const [isOpen, setIsOpen] = useState(isThink && !isCompleted);
  
  // Auto-collapse when completed
  React.useEffect(() => {
    if (isThink && isCompleted) {
      setIsOpen(false);
    }
  }, [isThink, isCompleted]);

  const title = isThink ? (isCompleted ? "Thought Completed" : "Thinking...") : `Tool: ${toolCall.tool_name}`;
  
  // Extract content to show
  let content = "";
  if (isThink) {
     const details = toolCall.tool_call_details;
     // Check for thought in args (this is the "Running tool think" part)
     const args = details?.summary?.args;
     if (args?.thought) {
        content = args.thought;
     } else if (typeof args === 'string') {
        content = args;
     }
     
     // NOTE: We intentionally DO NOT show the 'result' here for think tools,
     // because the user wants to hide the summary of the "Completed tool think" response.
     // We only show the input thought (args).
  } else {
     content = JSON.stringify(toolCall.tool_call_details, null, 2);
  }
  
  // If content is empty, try to fallback to tool_response
  if (!content && toolCall.tool_response) {
      content = toolCall.tool_response;
  }
  
  // Debug fallback: if still empty, show raw details
  if (!content && toolCall.tool_call_details) {
      content = JSON.stringify(toolCall.tool_call_details, null, 2);
  }

  // Ensure content is not undefined
  content = content || "";

  const status = toolCall.tool_response;

  return (
    <div className={cn(
      "w-full max-w-full mb-1",
      isThink ? "pl-2 border-l-2 border-muted-foreground/20" : "border border-border rounded-md bg-muted/30 overflow-hidden"
    )}>
        <button 
           onClick={() => setIsOpen(!isOpen)}
           className={cn(
             "flex items-center justify-between w-full px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors",
             isThink ? "hover:text-foreground pl-0" : "hover:bg-muted/50"
           )}
        >
            <div className="flex items-center gap-1.5">
                {isThink ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground/70">
                        <Brain className="h-3 w-3" />
                        <span className="font-semibold">{title}</span>
                    </div>
                ) : (
                    <>
                        <Code className="h-3 w-3" />
                        <span>{title}</span>
                        <span className="opacity-70 font-normal truncate max-w-[200px]">
                           {status && `- ${status}`}
                        </span>
                    </>
                )}
            </div>
            {!isThink && (isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </button>
        {isOpen && (
            <div className={cn(
              "text-[12px] text-foreground/90 overflow-x-auto max-h-[200px] overflow-y-auto",
              isThink ? "pl-0 py-1" : "px-3 py-2 border-t border-border bg-background/50"
            )}>
                {isThink ? (
                     <div className="prose prose-xs dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-mono">
                        {content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        ) : (
                            <div className="flex items-center gap-2 italic opacity-70">
                                {!isCompleted && <span className="animate-pulse">Thinking...</span>}
                            </div>
                        )}
                     </div>
                ) : (
                    <pre className="whitespace-pre-wrap font-mono">{content}</pre>
                )}
            </div>
        )}
    </div>
  )
}

export function ChatBubble({ content, role, avatar, name, timestamp, tool_calls, showToolPanel }: ChatBubbleProps) {
  const isUser = role === "user";

  const normalizeTables = (text: string): string => {
    // 1. Convert literal \n to real newlines first
    const processed = text.replace(/\\n/g, "\n");
    
    // 2. Helper to check if a line is part of a table
    // A table line typically starts with |
    const isTableLine = (s: string) => s.trim().startsWith("|");
    
    const lines = processed.split("\n");
    const out: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // If it's a table line, ensure it's on its own line and trimmed properly
      if (isTableLine(line)) {
        // Check if previous line was NOT a table line and NOT empty
        // If so, we need a blank line before this table to ensure MD renders it
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
  const processedContent = normalizeTables(content
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\n")
    // Fix: Handle escaped bold markers which might cause **Text** to appear literally
    .replace(/\\\*\\\*/g, "**")
    // Ensure headers have a blank line before them
    .replace(/([^\n])\n(#+\s)/g, "$1\n\n$2")
    // Ensure code blocks have a blank line before them
    .replace(/([^\n])\n(```)/g, "$1\n\n$2"));

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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Override specific elements if needed
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
                  <pre className="rounded-md p-3 my-2 overflow-x-auto w-full">
                    <code className={cn("text-[10px] font-mono", className)} {...props}>
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
                  <div className="overflow-x-auto my-4 border rounded-md block w-full">
                    <table className="text-xs text-left border-collapse table-auto">
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children }) {
                return <thead className="bg-muted/50 border-b">{children}</thead>;
              },
              th({ children }) {
                return <th className="px-2 py-1.5 font-medium border-r last:border-r-0 whitespace-nowrap">{children}</th>;
              },
              td({ children }) {
                return <td className="px-2 py-1.5 border-t border-r last:border-r-0 min-w-[100px]">{children}</td>;
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
          </div>
        </div>
      </div>
    </div>
  );
}
