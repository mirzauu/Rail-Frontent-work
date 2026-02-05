import { useState, useEffect, useRef } from "react";
import { FileText, Download, Maximize2, Minimize2, Play, X, List, PanelLeftClose, PanelLeftOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";

export interface PDFSection {
    title: string;
    content: string;
    section_type: string;
}

export interface PDF {
    title: string;
    sections: PDFSection[];
}

interface PDFViewerProps {
    pdf: PDF;
    isLargeView?: boolean;
    onToggleLargeView?: () => void;
}

export function PDFViewer({ pdf, isLargeView = false, onToggleLargeView }: PDFViewerProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<number>(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const exportAreaRef = useRef<HTMLDivElement>(null);
    const documentRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

    const docSections = pdf.sections || [];

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
        console.log("PDF download started...");

        try {
            const container = documentRef.current;
            if (!container) {
                throw new Error("Document container not found");
            }

            const pages = Array.from(container.querySelectorAll('.pdf-page'));
            console.log(`Found ${pages.length} pages to export`);

            if (pages.length === 0) {
                throw new Error("No pages found to export");
            }

            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            for (let i = 0; i < pages.length; i++) {
                const originalPage = pages[i] as HTMLElement;
                console.log(`Capturing page ${i + 1}/${pages.length}...`);

                // Manually clone the element to bypass html2canvas internal cloning issues
                const clone = originalPage.cloneNode(true) as HTMLElement;

                // Style the clone to ensure it captures correctly
                Object.assign(clone.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '794px', // A4 width at 96 DPI (approx)
                    height: 'auto',
                    zIndex: '-9999',
                    visibility: 'visible',
                    margin: '0',
                    transform: 'none'
                });

                document.body.appendChild(clone);

                try {
                    const canvas = await html2canvas(clone, {
                        scale: 1.5,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        windowWidth: 794,
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = doc.internal.pageSize.getHeight();

                    if (i > 0) {
                        doc.addPage();
                    }

                    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    console.log(`Page ${i + 1} captured`);
                } finally {
                    // Always clean up the clone
                    document.body.removeChild(clone);
                }
            }

            console.log("Saving PDF...");
            doc.save(`${pdf.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert(`Failed to generate PDF. Using fallback print mode.`);
            window.print();
        } finally {
            setIsDownloading(false);
        }
    };

    const DocumentContent = ({ full = false }: { full?: boolean }) => (
        <div className={cn(
            "flex-1 relative flex bg-slate-100 dark:bg-slate-950 overflow-hidden",
            full && "fixed inset-0 z-[100] h-screen w-screen"
        )}>
            {/* Table of Contents Sidebar */}
            <div className={cn(
                "border-r border-border/50 bg-background/50 backdrop-blur-md hidden lg:flex flex-col transition-all duration-300",
                showSidebar ? (full ? "w-72" : "w-64") : "w-0 opacity-0 border-none"
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
                        ref={documentRef}
                        className={cn(
                            "mx-auto space-y-8",
                            full ? "max-w-4xl" : "max-w-3xl"
                        )}
                    >
                        {/* Cover Page Simulation */}
                        <div className="pdf-page bg-white dark:bg-slate-900 shadow-2xl rounded-sm p-12 lg:p-20 aspect-[1/1.41] flex flex-col justify-center border border-border/50 relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                            <div className="space-y-6">
                                <FileText className="h-16 w-16 text-red-600 mb-8" />
                                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {pdf.title}
                                </h1>
                                <div className="h-1 w-24 bg-red-600/30" />
                                <div className="space-y-4 pt-12">
                                    <p className="text-lg text-muted-foreground font-medium">RailVision Strategy Brief</p>
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
                                className="pdf-page bg-white dark:bg-slate-900 shadow-xl rounded-sm border border-border/50 aspect-[1/1.41] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex-shrink-0"
                            >
                                {/* Page Header */}
                                <div className="px-8 py-6 border-b border-border/30 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    <span>{pdf.title}</span>
                                    <span>RailVision Strategic Analysis</span>
                                </div>

                                {/* Page Content */}
                                <div className="flex-1 p-10 lg:p-16 overflow-hidden">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-b-2 border-red-600/10">
                                        {section.title}
                                    </h2>
                                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-red-600/80">
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

                {/* Hidden Export Area */}
                <div className="fixed top-0 left-0 pointer-events-none opacity-0 -z-50" ref={exportAreaRef}>
                    <div className="pdf-page-export bg-white w-[794px] h-[1123px] p-20 flex flex-col justify-center border border-slate-200 relative overflow-hidden flex-shrink-0" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                        <div className="space-y-6">
                            <FileText className="h-16 w-16 text-red-600 mb-8" />
                            <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                                {pdf.title}
                            </h1>
                            <div className="h-1 w-24 bg-red-600/30" />
                            <div className="space-y-4 pt-12">
                                <p className="text-lg text-slate-500 font-medium">RailVision Strategy Brief</p>
                                <div className="flex items-center gap-4 text-sm text-slate-400 border-t border-slate-100 pt-4">
                                    <span>Confidential</span>
                                    <span>•</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {docSections.map((section, index) => (
                        <div
                            key={index}
                            className="pdf-page-export bg-white w-[794px] h-[1123px] flex flex-col border border-slate-200 overflow-hidden flex-shrink-0"
                            style={{ fontFamily: 'system-ui, sans-serif' }}
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                <span>{pdf.title}</span>
                                <span>RailVision Strategic Analysis</span>
                            </div>
                            <div className="flex-1 p-16 overflow-hidden">
                                <h2 className="text-3xl font-bold text-slate-800 mb-8 pb-4 border-b-2 border-red-600/10">
                                    {section.title}
                                </h2>
                                <div className="prose prose-slate max-w-none prose-lg prose-headings:text-red-700">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {section.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            <div className="px-8 py-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>RAILVISION CONFIDENTIAL</span>
                                <span>PAGE {(index + 2).toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn("flex flex-col h-full bg-background overflow-hidden relative")}>
            {isFullScreen && <DocumentContent full={true} />}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                        <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold truncate max-w-[250px] text-foreground">{pdf.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono uppercase font-bold tracking-tighter">PDF Report</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{docSections.length} Sections</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
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
