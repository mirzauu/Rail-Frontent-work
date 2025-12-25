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
    // 1. Convert literal \n to real newlines if they exist
    const processed = text.replace(/\\n/g, "\n");
    
    // 2. Split into lines
    const lines = processed.split("\n");
    const out: string[] = [];
    let i = 0;
    
    // Helper regexes
    const isSep = (s: string) => /^\|?\s*[-:]+(\s*\|\s*[-:]+)+\s*\|?$/.test(s.trim());
    // A line is a table part if it starts with | or looks like a separator
    const isTableLine = (s: string) => s.trim().startsWith("|") || isSep(s);
    const cellsOf = (s: string) => s.replace(/^\|/, "").replace(/\|$/, "").split("|").map(x => x.trim()).filter(x => x.length > 0);
    const colCountFromSep = (s: string) => cellsOf(s).length;

    while (i < lines.length) {
      const line = lines[i];
      
      if (!isTableLine(line)) {
        out.push(line);
        i++;
        continue;
      }
      
      // We found a table start. Collect all subsequent lines that *could* be part of this table.
      // We will skip blank lines between table lines.
      const blockLines: string[] = [];
      let j = i;
      
      while (j < lines.length) {
        const curr = lines[j];
        if (curr.trim() === "") {
            // skip blank line
        } else if (isTableLine(curr)) {
            // It's a table line, add it
            blockLines.push(curr);
        } else {
            // Non-table line. Stop.
            break;
        }
        j++;
      }
      
      // Look for a separator in the block.
      const sepIndex = blockLines.findIndex(isSep);
      
      if (sepIndex === -1) {
         // No separator found. Just output lines as is (preserving original structure somewhat)
         out.push(...blockLines);
         i = j;
         continue;
      }
      
      // We have a block with a separator. Let's reconstruct.
      const sepLine = blockLines[sepIndex];
      const colCount = Math.max(1, colCountFromSep(sepLine));
      
      // Header is everything before separator
      const headerTokens: string[] = [];
      for (let k = 0; k < sepIndex; k++) {
          headerTokens.push(...cellsOf(blockLines[k]));
      }
      
      // Construct Header Row
      const headerCells = headerTokens.slice(0, colCount);
      // If we have more header tokens than columns, they spill over? 
      // Usually header is just one row. Let's assume one row for now or valid structure.
      // If headerTokens has more, we might lose them or need multi-row header (not standard md).
      // Let's just take the first colCount tokens.
      
      const result: string[] = [];
      result.push("| " + headerCells.join(" | ") + " |");
      result.push(sepLine);
      
      // Rows are everything after separator
      let rowAccum: string[] = [];
      for (let k = sepIndex + 1; k < blockLines.length; k++) {
          const line = blockLines[k];
          if (isSep(line)) {
              // Another separator? Treat as end of current table or just another line?
              // Let's treat it as a line for now to avoid complexity
              // Or if we support multiple tables in one block, we should have stopped earlier.
              // But our block collection is greedy.
              // For safety, let's just ignore extra separators or treat as text.
              continue; 
          }
          rowAccum.push(...cellsOf(line));
          
          while (rowAccum.length >= colCount) {
              const row = rowAccum.slice(0, colCount);
              result.push("| " + row.join(" | ") + " |");
              rowAccum = rowAccum.slice(colCount);
          }
      }
      
      // Handle remaining cells
      if (rowAccum.length > 0) {
          const padded = rowAccum.concat(Array(Math.max(0, colCount - rowAccum.length)).fill(""));
          result.push("| " + padded.slice(0, colCount).join(" | ") + " |");
      }
      
      if (out.length && out[out.length - 1].trim() !== "") out.push("");
      out.push(...result);
      
      i = j;
    }
    
    return out.join("\n");
  };


  // Decode escaped newlines from backend and preprocess for markdown rendering
  const processedContent = normalizeTables(content
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\n")
    // Fix: Handle escaped bold markers which might cause **Text** to appear literally
    .replace(/\\\*\\\*/g, "**")
    // Ensure headers have a blank line before them
    .replace(/([^\n])\n?(#+\s)/g, "$1\n\n$2")
    // Ensure lists have a blank line before them
    .replace(/([^\n])\n?(\d+\.\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n?(-\s)/g, "$1\n\n$2")
    // Ensure code blocks have a blank line before them
    .replace(/([^\n])\n?(```)/g, "$1\n\n$2")
    // Ensure table starts on a new line
    .replace(/([^\n])\s+(?=\|.*\|.*\|)/g, "$1\n\n"));

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
            "rounded-lg p-4 text-sm shadow-sm overflow-hidden inline-block",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/50 border border-border text-foreground w-full"
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
