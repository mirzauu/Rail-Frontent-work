import { useState, useEffect } from "react";
import mammoth from "mammoth";
import { Loader2, AlertCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocalWordExternalViewerProps {
    url: string;
    title: string;
}

export function LocalWordExternalViewer({ url, title }: LocalWordExternalViewerProps) {
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const fetchDocx = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch the external URL buffer to pass to mammoth
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const arrayBuffer = await response.arrayBuffer();

                // Convert to HTML
                const result = await mammoth.convertToHtml({ arrayBuffer });

                if (active) {
                    setHtmlContent(result.value);
                    if (result.messages && result.messages.length > 0) {
                        console.warn("Mammoth messages:", result.messages);
                    }
                }
            } catch (err: any) {
                if (active) {
                    console.error("Local Word Viewer Error:", err);
                    setError("This document format (.doc / .docx) could not be parsed automatically or is unavailable. You can click the download button below to view it natively on your computer.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchDocx();
        return () => { active = false; };
    }, [url]);

    return (
        <div className="flex-1 w-full bg-background relative overflow-y-auto">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Parsing Document...</span>
                </div>
            ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-muted/10 gap-4">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Unable to Preview Local File</h3>
                    <p className="text-sm text-muted-foreground max-w-[300px]">
                        {error}
                    </p>
                    <Button
                        variant="default"
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = title;
                            a.click();
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" /> Download File
                    </Button>
                </div>
            ) : (
                <div className="p-8 lg:p-12 mb-10 w-full flex justify-center">
                    {/* White paper effect */}
                    <div
                        className="bg-white text-black min-h-[1056px] w-[816px] max-w-full shadow-lg border border-slate-200 p-12 lg:p-16 prose prose-slate max-w-none hover:shadow-xl transition-shadow duration-300"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            )}
        </div>
    );
}
