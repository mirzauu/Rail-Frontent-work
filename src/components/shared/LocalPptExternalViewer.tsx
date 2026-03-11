import { Presentation, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocalPptExternalViewerProps {
    url: string;
    title: string;
}

export function LocalPptExternalViewer({ url, title }: LocalPptExternalViewerProps) {
    return (
        <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-8 relative">
            <div className="absolute top-4 right-4 bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-orange-200 shadow-sm font-medium">
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                Localhost Limitation Active
            </div>

            <div className="max-w-md w-full text-center space-y-6 flex flex-col items-center">
                <div className="h-24 w-24 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg border border-orange-400">
                    <Presentation className="h-12 w-12 text-white" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">PowerPoint Ready</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-slate-600 dark:text-slate-400 text-left space-y-3">
                    <p>
                        You are currently running this application locally. Because your machine isn't accessible to the public internet, Microsoft's Web Viewer cannot embed this presentation directly in your browser.
                    </p>
                    <p>
                        Please download the generated presentation to view your slides on your computer using PowerPoint, Keynote, or Google Slides.
                    </p>
                </div>

                <Button
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700 shadow-md transition-all text-white font-medium"
                    onClick={() => {
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = title;
                        a.click();
                    }}
                >
                    <Download className="mr-2 h-5 w-5" /> Download (.pptx)
                </Button>
            </div>
        </div>
    );
}
