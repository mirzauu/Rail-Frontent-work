import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  avatar?: string;
  name?: string;
  timestamp?: string;
}

export function ChatBubble({ content, role, avatar, name, timestamp }: ChatBubbleProps) {
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
    <div className={cn("flex mb-6 w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col", isUser ? "items-end max-w-[85%]" : "items-start max-w-full")}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {name}
          </span>
          {timestamp && <span className="text-xs text-muted-foreground/60">{timestamp}</span>}
        </div>
        
        <div
          className={cn(
            "text-sm overflow-hidden inline-block",
            isUser 
              ? "rounded-lg p-4 shadow-sm bg-primary text-primary-foreground" 
              : "text-foreground w-full"
          )}
        >
          <div
            className={cn(
              "prose prose-sm dark:prose-invert max-w-none break-words",
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
                return !inline ? (
                  <div className="bg-background/50 rounded-md p-3 my-2 overflow-x-auto border border-border/50">
                    <code className={cn("text-xs font-mono", className)} {...props}>
                      {children}
                    </code>
                  </div>
                ) : (
                  <code className={cn("bg-background/30 rounded px-1 py-0.5 font-mono text-xs", className)} {...props}>
                    {children}
                  </code>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4 border rounded-md">
                    <table className="w-full text-sm text-left border-collapse">
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children }) {
                return <thead className="bg-muted/50 border-b">{children}</thead>;
              },
              th({ children }) {
                return <th className="px-4 py-2 font-medium border-r last:border-r-0">{children}</th>;
              },
              td({ children }) {
                return <td className="px-4 py-2 border-t border-r last:border-r-0">{children}</td>;
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
