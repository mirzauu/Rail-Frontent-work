import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { BarChart3, Download, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Spreadsheet {
    url: string;
    title: string;
}

interface SpreadsheetViewerProps {
    spreadsheet: Spreadsheet;
    isLargeView?: boolean;
    onToggleLargeView?: () => void;
}

type SheetData = {
    headers: string[];
    rows: string[][];
};

export function SpreadsheetViewer({ spreadsheet, isLargeView = false, onToggleLargeView }: SpreadsheetViewerProps) {
    const [sheetData, setSheetData] = useState<SheetData | null>(null);
    const [activeSheet, setActiveSheet] = useState(0);
    const [allSheets, setAllSheets] = useState<{ name: string; data: SheetData }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        setSheetData(null);
        setAllSheets([]);
        setActiveSheet(0);

        const load = async () => {
            try {
                const res = await fetch(spreadsheet.url);
                if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);

                const arrayBuffer = await res.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: "array" });

                const sheets = workbook.SheetNames.map((name) => {
                    const ws = workbook.Sheets[name];
                    const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];
                    const headers = raw.length > 0 ? raw[0].map(String) : [];
                    const rows = raw.slice(1).map((r) => headers.map((_, i) => String(r[i] ?? "")));
                    return { name, data: { headers, rows } };
                });

                if (!cancelled) {
                    setAllSheets(sheets);
                    setSheetData(sheets[0]?.data ?? null);
                    setIsLoading(false);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e.message || "Failed to load spreadsheet");
                    setIsLoading(false);
                }
            }
        };

        void load();
        return () => { cancelled = true; };
    }, [spreadsheet.url]);

    const handleSheetChange = (idx: number) => {
        setActiveSheet(idx);
        setSheetData(allSheets[idx]?.data ?? null);
    };

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = spreadsheet.url;
        a.download = spreadsheet.title;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const { headers, rows } = sheetData ?? { headers: [], rows: [] };

    return (
        // Key: overflow-hidden on the outer wrapper keeps everything inside the sidebar bounds
        // The header and tabs are flex-shrink-0 so they never get squeezed away
        // Only the table area scrolls (both axes) via overflow: auto on a native div
        <div className="flex flex-col h-full w-full bg-background" style={{ minHeight: 0 }}>

            {/* ── Header ── always visible, never affected by table width */}
            <div
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background flex-shrink-0 z-20 shadow-sm"
                style={{ minWidth: 0 }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate text-foreground">{spreadsheet.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono uppercase font-bold tracking-tighter">
                                Spreadsheet
                            </span>
                            {sheetData && (
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    {rows.length} rows · {headers.length} cols
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Buttons always on the right – flex-shrink-0 prevents them from disappearing */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-emerald-600 transition-colors"
                        onClick={handleDownload}
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={onToggleLargeView}
                        title={isLargeView ? "Exit full view" : "Full view"}
                    >
                        {isLargeView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* ── Sheet Tabs ── flex-shrink-0, own horizontal scroll */}
            {allSheets.length > 1 && (
                <div className="flex gap-1 px-4 pt-2 border-b border-border/40 flex-shrink-0 overflow-x-auto">
                    {allSheets.map((s, i) => (
                        <button
                            key={s.name}
                            onClick={() => handleSheetChange(i)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-t-md border border-border/40 transition-colors whitespace-nowrap",
                                activeSheet === i
                                    ? "bg-background text-foreground border-b-background"
                                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Content area ── takes remaining height, scrolls both axes */}
            <div className="flex-1 relative" style={{ minHeight: 0, overflow: "hidden" }}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            <span className="text-sm">Loading spreadsheet…</span>
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="text-center text-sm text-muted-foreground bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-xs">
                            <p className="font-semibold text-destructive mb-1">Failed to load</p>
                            <p>{error}</p>
                            <Button variant="outline" size="sm" className="mt-3" onClick={handleDownload}>
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Download instead
                            </Button>
                        </div>
                    </div>
                )}

                {!isLoading && !error && sheetData && (
                    // Native scroll container — handles BOTH horizontal and vertical overflow
                    <div
                        className="absolute inset-0 overflow-auto"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        <table className="text-[12px] border-collapse" style={{ minWidth: "100%" }}>
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    {/* Row number col */}
                                    <th className="bg-muted/80 border border-border/50 px-2 py-2 text-[10px] text-muted-foreground font-mono w-8 min-w-[2rem] text-right select-none sticky left-0 z-20" />
                                    {headers.map((h, i) => (
                                        <th
                                            key={i}
                                            className="bg-muted/80 border border-border/50 px-3 py-2 text-left font-semibold text-foreground/80 whitespace-nowrap text-[11px]"
                                        >
                                            {h || <span className="text-muted-foreground italic text-[10px]">Column {i + 1}</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, ri) => (
                                    <tr key={ri} className={cn("group", ri % 2 === 0 ? "bg-background" : "bg-muted/10")}>
                                        <td className="sticky left-0 z-10 bg-muted/40 group-hover:bg-emerald-500/5 border border-border/40 px-2 py-1.5 text-[10px] text-muted-foreground font-mono text-right select-none">
                                            {ri + 1}
                                        </td>
                                        {row.map((cell, ci) => (
                                            <td
                                                key={ci}
                                                className="border border-border/40 px-3 py-1.5 text-foreground/80 whitespace-nowrap group-hover:bg-emerald-500/5"
                                                style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={headers.length + 1} className="py-12 text-center text-muted-foreground text-sm border border-border/40">
                                            No data rows found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
