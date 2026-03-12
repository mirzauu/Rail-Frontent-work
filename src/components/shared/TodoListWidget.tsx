import React, { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2, ArrowRightCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./ChatBubble";

interface TodoItem {
    id: string; // from tool_id or parsed result
    call_id: string; // original create_todo call_id
    title: string;
    description: string;
    priority: string;
    status: "pending" | "in_progress" | "completed" | "failed";
    note?: string;
}

interface TodoListWidgetProps {
    toolCalls: ToolCall[];
}

export function TodoListWidget({ toolCalls }: TodoListWidgetProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const todos = useMemo(() => {
        const todoMap = new Map<string, TodoItem>();
        const idToCallId = new Map<string, string>();

        for (const call of toolCalls) {
            const toolName = (call.tool_name || "").toLowerCase().trim();
            const details = call.tool_call_details?.summary || (call as any).summary || {};
            const args = details.args || (call as any).args || {};
            const result = details.result || (call as any).result || call.tool_response;

            if (toolName === "create_todo") {
                let todo = todoMap.get(call.call_id);
                if (!todo) {
                    todo = {
                        id: call.call_id,
                        call_id: call.call_id,
                        title: args.title || "Initializing task...",
                        description: args.description || "",
                        priority: args.priority || "normal",
                        status: "pending",
                    };
                    todoMap.set(call.call_id, todo);
                } else {
                    if (args.title) todo.title = args.title;
                    if (args.description) todo.description = args.description;
                    if (args.priority) todo.priority = args.priority;
                }

                const isResult = call.event_type === "ToolCallEventType.RESULT" || (call as any).status === "completed" || !!result;

                if (isResult) {
                    const resultStr = typeof result === "string" ? result : JSON.stringify(result || "");
                    const match = resultStr.match(/with ID:\s*([a-f0-9]+)/i);
                    if (match && match[1]) {
                        const realId = match[1];
                        todo.id = realId;
                        idToCallId.set(realId, call.call_id);
                    }
                }
            }
        }

        for (const call of toolCalls) {
            const toolName = (call.tool_name || "").toLowerCase().trim();
            if (toolName === "update_todo_status" || toolName === "add_todo_note") {
                const details = call.tool_call_details?.summary || (call as any).summary || {};
                const args = details.args || (call as any).args || {};
                const todoId = args.todo_id || (toolName === "add_todo_note" ? args.id : undefined);

                if (todoId) {
                    const callId = idToCallId.get(todoId) || todoId;
                    let todo = todoMap.get(callId);

                    if (!todo) {
                        todo = {
                            id: todoId,
                            call_id: callId,
                            title: `Task Update...`,
                            description: "",
                            priority: "normal",
                            status: "pending",
                        };
                        todoMap.set(callId, todo);
                    }

                    if (args.status && toolName === "update_todo_status") {
                        todo.status = args.status;
                    }
                    if (args.note) {
                        todo.note = args.note;
                    }
                }
            }
        }

        return Array.from(todoMap.values());
    }, [toolCalls]);

    const allCompleted = todos.length > 0 && todos.every((t) => t.status === "completed");

    useEffect(() => {
        if (allCompleted) {
            setIsCollapsed(true);
        }
    }, [allCompleted]);

    if (todos.length === 0 && toolCalls.length > 0) {
        return (
            <div className="mb-2 p-4 rounded-xl border border-dashed border-border/60 bg-muted/20 flex items-center gap-3 w-full max-w-2xl mx-auto shadow-sm backdrop-blur-sm z-30">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Preparing task list...</span>
            </div>
        );
    }

    if (todos.length === 0) return null;

    return (
        <div className="z-30 w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-border/60 shadow-xl bg-card/95 backdrop-blur-sm font-sans animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2">
            <div
                className="bg-primary/5 px-4 py-3 border-b border-border/60 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                    Action Items
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {todos.filter(t => t.status === "completed").length} / {todos.length} Done
                    </span>
                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                </div>
            </div>

            {!isCollapsed && (
                <div className="p-0 divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {todos.map((todo) => {
                        const isCompleted = todo.status === "completed";
                        const isInProgress = todo.status === "in_progress";

                        return (
                            <div
                                key={todo.call_id}
                                className={cn(
                                    "p-3 sm:p-4 transition-all flex gap-3 sm:gap-4 items-start",
                                    isCompleted ? "bg-muted/10 opacity-60" : "bg-card hover:bg-muted/5"
                                )}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />
                                    ) : isInProgress ? (
                                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-semibold text-[14px] leading-tight",
                                                isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                                            )}>
                                                {todo.title}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/50 font-mono mt-1 tracking-tighter">
                                                {todo.id.startsWith('toolu_') ? 'ID: Pending' : `ID: ${todo.id}`}
                                            </span>
                                        </div>
                                        {todo.priority === "high" && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-red-500 px-1.5 py-0.5 rounded shadow-sm">
                                                High
                                            </span>
                                        )}
                                    </div>

                                    {todo.description && (
                                        <p className={cn(
                                            "text-[12px] mt-2 leading-relaxed font-normal",
                                            isCompleted ? "text-muted-foreground/50" : "text-muted-foreground/90"
                                        )}>
                                            {todo.description}
                                        </p>
                                    )}

                                    {todo.note && !isCompleted && (
                                        <div className="mt-3 flex items-start gap-2 bg-primary/5 text-primary p-2.5 rounded-lg border border-primary/10 text-[11px] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                            <ArrowRightCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-80" />
                                            <span className="italic font-medium leading-snug">{todo.note}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
