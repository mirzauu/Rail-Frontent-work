import { useState, useEffect, useRef } from "react";
import { FileText, Download, Maximize2, Minimize2, Play, X, List, PanelLeftClose, PanelLeftOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import { saveAs } from 'file-saver';
import { Packer, Document as DocxDocument, Paragraph, HeadingLevel, TextRun } from "docx";

export interface DocSection {
    title: string;
    content: string;
    section_type: string;
}

export interface Doc {
    title: string;
    sections: DocSection[];
}

interface DocViewerProps {
    doc: Doc;
    isLargeView?: boolean;
    onToggleLargeView?: () => void;
}

export function DocViewer({ doc, isLargeView = false, onToggleLargeView }: DocViewerProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<number>(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

    const docSections = doc.sections || [];

    // Track scroll position to update active section (for TOC highlighting)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            let current = 0;
            sectionsRef.current.forEach((ref, index) => {
                if (ref && ref.offsetTop - 100 <= scrollTop) {
                    current = index;
                }
            });
            setActiveSectionId(current);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [docSections.length]);

    const scrollToSection = (index: number) => {
        const ref = sectionsRef.current[index];
        if (ref && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: ref.offsetTop - 20,
                behavior: "smooth"
            });
        }
    };

    const handleDownload = async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        console.log("Word Doc download started...");

        try {
            // Create a simple docx structure
            const docSections = doc.sections.map(section => {
                return [
                    new Paragraph({
                        text: section.title,
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun(section.content)
                        ],
                    }),
                    new Paragraph({
                        text: "" // spacing
                    })
                ];
            }).flat();

            const docx = new DocxDocument({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: doc.title,
                            heading: HeadingLevel.TITLE,
                        }),
                        new Paragraph({
                            text: "RailVision Document",
                            heading: HeadingLevel.SUBTITLE,
                        }),
                        ...docSections
                    ],
                }],
            });

            const blob = await Packer.toBlob(docx);
            saveAs(blob, `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
            console.log("Doc saved");

        } catch (error) {
            console.error("Doc generation failed:", error);
            alert(`Failed to generate Word Doc. Please try again.`);
        } finally {
            setIsDownloading(false);
        }
    };

    const DocumentContent = ({ full = false }: { full?: boolean }) => {
        // Determine if we are in the expanded widget mode (not fullscreen reader, but maximized widget)
        const isWidgetExpanded = !full && isLargeView;

        return (
            <div className={cn(
                "flex-1 relative flex bg-slate-100 dark:bg-slate-950 overflow-hidden",
                full && "fixed inset-0 z-[9999] h-screen w-screen"
            )}>
                {/* Table of Contents Sidebar */}
                <div className={cn(
                    "border-r border-border/50 bg-background/50 backdrop-blur-md hidden lg:flex flex-col transition-all duration-300",
                    showSidebar ? (full || isWidgetExpanded ? "w-72" : "w-64") : "w-0 opacity-0 border-none"
                )}>
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contents</span>
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {docSections.map((section, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToSection(index)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-md text-sm transition-all relative group",
                                        activeSectionId === index
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    <span className="truncate block font-semibold">{section.title}</span>
                                    <span className="text-[10px] opacity-50 block">Section {index + 1}</span>
                                    {activeSectionId === index && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Document View */}
                <div className="flex-1 flex flex-col relative min-w-0">
                    {/* Floating Sidebar Toggle - Only desktop */}
                    <div className="hidden lg:block absolute left-4 top-4 z-20">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur border border-border/50 opacity-50 hover:opacity-100 transition-opacity"
                            onClick={() => setShowSidebar(!showSidebar)}
                            title={showSidebar ? "Hide Contents" : "Show Contents"}
                        >
                            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                        </Button>
                    </div>

                    {full && (
                        <div className="absolute top-6 right-6 z-[110] flex gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-md shadow-xl border-none hover:bg-background/80"
                                onClick={() => setIsFullScreen(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-auto p-4 lg:p-12 custom-scrollbar scroll-smooth"
                    >
                        <div
                            className={cn(
                                "mx-auto space-y-8",
                                (full || isWidgetExpanded) ? "max-w-4xl" : "max-w-[800px]"
                            )}
                            style={(!full && !isWidgetExpanded) ? { transform: 'scale(0.95)', transformOrigin: 'top center' } : undefined}
                        >
                            {/* Cover Page Simulation */}
                            <div className={cn(
                                "doc-page bg-white dark:bg-slate-900 shadow-2xl rounded-sm flex flex-col justify-center border border-border/50 relative flex-shrink-0",
                                (full || isWidgetExpanded) ? "aspect-[1/1.41] p-12 lg:p-20 overflow-hidden" : "min-h-[600px] p-8 lg:p-12 overflow-visible"
                            )}>
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                                <div className="space-y-6">
                                    <FileText className={cn("text-blue-600 mb-8", (full || isWidgetExpanded) ? "h-16 w-16" : "h-10 w-10")} />
                                    <h1 className={cn("font-bold text-slate-900 dark:text-white leading-tight", (full || isWidgetExpanded) ? "text-4xl lg:text-5xl" : "text-2xl lg:text-3xl")}>
                                        {doc.title}
                                    </h1>
                                    <div className="h-1 w-24 bg-blue-600/30" />
                                    <div className="space-y-4 pt-12">
                                        <p className={cn("text-muted-foreground font-medium", (full || isWidgetExpanded) ? "text-lg" : "text-sm")}>RailVision Word Document</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground/60 border-t border-border/50 pt-4">
                                            <span>Confidential</span>
                                            <span>•</span>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Sections (Pages) */}
                            {docSections.map((section, index) => (
                                <div
                                    key={index}
                                    ref={el => sectionsRef.current[index] = el}
                                    className={cn(
                                        "doc-page bg-white dark:bg-slate-900 shadow-xl rounded-sm border border-border/50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 flex-shrink-0",
                                        (full || isWidgetExpanded) ? "aspect-[1/1.41] overflow-hidden" : "min-h-[600px] overflow-visible"
                                    )}
                                >
                                    {/* Page Header */}
                                    <div className="px-8 py-6 border-b border-border/30 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                        <span>{doc.title}</span>
                                        <span>RailVision Document</span>
                                    </div>

                                    {/* Page Content */}
                                    <div className={cn("flex-1", (full || isWidgetExpanded) ? "p-10 lg:p-16 overflow-hidden" : "p-8 lg:p-10 overflow-visible")}>
                                        <h2 className={cn("font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-b-2 border-blue-600/10", (full || isWidgetExpanded) ? "text-2xl" : "text-xl")}>
                                            {section.title}
                                        </h2>
                                        <div className={cn(
                                            "prose prose-slate dark:prose-invert max-w-none prose-headings:text-blue-600/80",
                                            (!full && !isWidgetExpanded) && "text-xs leading-relaxed prose-headings:text-lg prose-p:my-2"
                                        )}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {section.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Page Footer */}
                                    <div className="px-8 py-4 border-t border-border/10 flex justify-between items-center text-[10px] text-muted-foreground/40 font-mono">
                                        <span>RAILVISION CONFIDENTIAL</span>
                                        <span>PAGE {(index + 2).toString().padStart(2, '0')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-background overflow-hidden relative")}>
            {isFullScreen && <DocumentContent full={true} />}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold truncate max-w-[250px] text-foreground">{doc.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono uppercase font-bold tracking-tighter">WORD DOC</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{docSections.length} Sections</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-blue-600 transition-colors disabled:opacity-50"
                        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                        disabled={isDownloading}
                    >
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={() => setIsFullScreen(true)}
                        title="Reader Mode"
                    >
                        <Play className="h-4 w-4 fill-current" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={onToggleLargeView}
                    >
                        {isLargeView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <DocumentContent full={false} />
        </div>
    );
}
