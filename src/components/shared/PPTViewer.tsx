import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Presentation, Maximize2, Minimize2, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import pptxgen from "pptxgenjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// imports removed
import { FileDown } from "lucide-react";

export interface Slide {
    title: string;
    content: string;
    slide_type: string;
}

export interface PPT {
    title: string;
    slides: Slide[];
}

interface PPTViewerProps {
    ppt: PPT;
    isLargeView?: boolean;
    onToggleLargeView?: () => void;
}

export function PPTViewer({ ppt, isLargeView = false, onToggleLargeView }: PPTViewerProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const slideRef = useRef<HTMLDivElement>(null);
    const allSlidesRef = useRef<HTMLDivElement>(null);

    const nextSlide = useCallback(() => {
        if (currentSlideIndex < ppt.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    }, [currentSlideIndex, ppt.slides.length]);

    const prevSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    }, [currentSlideIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                nextSlide();
            } else if (e.key === "ArrowLeft") {
                prevSlide();
            } else if (e.key === "Escape" && isFullScreen) {
                setIsFullScreen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide, isFullScreen]);

    const handleDownloadPPTX = () => {
        const pres = new pptxgen();
        pres.layout = 'LAYOUT_16x9';

        ppt.slides.forEach((slide) => {
            const s = pres.addSlide();
            s.background = { color: 'FFFFFF' };

            // Title
            s.addText(slide.title, {
                x: 0.5,
                y: 0.3,
                w: 9.0,
                h: 0.7,
                fontSize: 24,
                bold: true,
                color: '2D3748',
            });

            // Content - Clean formatting for PPTX
            // Remove markdown bullet points, bold markers, etc for the raw text version
            const cleanContent = slide.content
                .replace(/^[-*]\s+/gm, '') // Remove bullets
                .replace(/\*\*/g, '')      // Remove bold markers
                .replace(/#/g, '');        // Remove heading markers

            s.addText(cleanContent, {
                x: 0.5,
                y: 1.2,
                w: 9.0,
                h: 3.8,
                fontSize: 14,
                color: '4A5568',
                valign: pres.AlignV.top,
                wrap: true
            });

            // Footer
            s.addText("RAILVISION STRATEGY", {
                x: 0.5,
                y: 5.2,
                w: 4.0,
                h: 0.3,
                fontSize: 9,
                color: 'A0AEC0',
                bold: true,
            });

            s.addText(`SLIDE ${pres.slides.length}`, {
                x: 8.5,
                y: 5.2,
                w: 1.0,
                h: 0.3,
                fontSize: 9,
                color: 'A0AEC0',
                align: pres.AlignH.right,
            });
        });

        pres.writeFile({ fileName: `${ppt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
    };

// handleDownloadPDF removed

    const presentationSlides = ppt.slides || [];
    const activePresentationSlide = presentationSlides[currentSlideIndex];

    const PresentationContent = ({ full = false }: { full?: boolean }) => (
        <div className={cn(
            "flex-1 min-h-0 relative flex flex-col bg-white dark:bg-slate-900 overflow-hidden select-none",
            full && "fixed inset-0 z-[100] h-screen w-screen"
        )}>
            {presentationSlides.length > 0 && activePresentationSlide ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
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

                    {/* Slide Content */}
                    <div className={cn(
                        "flex-1 flex flex-col min-h-0",
                        full ? "p-12 lg:p-16" : (isLargeView ? "p-8 lg:p-10" : "p-5 lg:p-6")
                    )}>
                        <h2 className={cn(
                            "font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-orange-500/20 pb-2 flex-shrink-0",
                            full ? "text-2xl lg:text-3xl" : (isLargeView ? "text-lg lg:text-xl" : "text-base lg:text-lg")
                        )}>
                            {activePresentationSlide.title}
                        </h2>
                        <div className={cn(
                            "flex-1 overflow-auto text-slate-600 dark:text-slate-300",
                            full ? "text-base lg:text-lg" : (isLargeView ? "text-sm lg:text-base" : "text-[12px]")
                        )}>
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-orange-600/80">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {activePresentationSlide.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Slide Footer */}
                    <div className={cn(
                        "px-8 py-4 border-t border-border/30 bg-muted/5 flex justify-between items-center flex-shrink-0",
                        full && "px-16 py-4"
                    )}>
                        <span className={cn("font-medium text-muted-foreground uppercase tracking-widest", full ? "text-base" : "text-xs")}>
                            RailVision Strategy
                        </span>
                        <span className={cn("font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded", full ? "text-base px-4 py-2" : "text-xs")}>
                            SLIDE {currentSlideIndex + 1}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <Presentation className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-sm text-muted-foreground">Initializing presentation...</p>
                    </div>
                </div>
            )}

            {/* Floating Navigation Controls - Only show when NOT in full screen */}
            {!full && presentationSlides.length > 1 && (
                <div className={cn(
                    "absolute bottom-20 left-0 right-0 flex justify-center gap-6 px-4 pointer-events-none z-10",
                )}>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={prevSlide}
                        disabled={currentSlideIndex === 0}
                        className={cn(
                            "rounded-full shadow-2xl border border-border bg-background/80 backdrop-blur-lg pointer-events-auto hover:scale-110 active:scale-95 transition-all text-primary",
                            isLargeView ? "h-14 w-14" : "h-12 w-12"
                        )}
                    >
                        <ChevronLeft className={isLargeView ? "h-8 w-8" : "h-7 w-7"} />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={nextSlide}
                        disabled={currentSlideIndex >= ppt.slides.length - 1}
                        className={cn(
                            "rounded-full shadow-2xl border border-border bg-background/80 backdrop-blur-lg pointer-events-auto hover:scale-110 active:scale-95 transition-all text-primary",
                            isLargeView ? "h-14 w-14" : "h-12 w-12"
                        )}
                    >
                        <ChevronRight className={isLargeView ? "h-8 w-8" : "h-7 w-7"} />
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className={cn("flex flex-col h-full bg-background overflow-hidden relative")}>
            {isFullScreen && <PresentationContent full={true} />}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Presentation className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold truncate max-w-[250px]">{ppt.title}</h3>
                        <p className="text-xs text-muted-foreground">
                            Slide {ppt.slides.length > 0 ? currentSlideIndex + 1 : 0} of {ppt.slides.length}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-orange-600"
                        onClick={(e) => { e.stopPropagation(); handleDownloadPPTX(); }}
                        title="Download as PPTX"
                    >
                        <FileDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsFullScreen(true)}
                        title="Start Presentation"
                    >
                        <Play className="h-4 w-4 fill-current" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onToggleLargeView}
                    >
                        {isLargeView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <PresentationContent full={false} />

            {/* Thumbnail Ribbon */}
            <div className={cn("border-t border-border/50 bg-background p-4 flex-shrink-0", isLargeView ? "h-48" : "h-36")}>
                <ScrollArea className="h-full w-full">
                    <div className="flex gap-4 h-full pb-2">
                        {presentationSlides.map((slide, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlideIndex(index)}
                                className={cn(
                                    "flex-shrink-0 aspect-[16/9] rounded-lg border text-left p-3 transition-all overflow-hidden relative group",
                                    isLargeView ? "w-64" : "w-40",
                                    currentSlideIndex === index
                                        ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/5 shadow-md"
                                        : "border-border hover:border-orange-300 bg-card hover:bg-muted/50"
                                )}
                            >
                                <div className={cn("font-bold truncate mb-1 text-slate-800 dark:text-slate-200", isLargeView ? "text-sm" : "text-[11px]")}>
                                    {slide.title}
                                </div>
                                <div className={cn(
                                    "text-muted-foreground line-clamp-3 leading-tight",
                                    isLargeView ? "text-xs" : "text-[9px]"
                                )}>
                                    {slide.content}
                                </div>
                                <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Hidden Export Container */}
            <div className="fixed top-0 left-0 pointer-events-none opacity-0 -z-50" ref={allSlidesRef}>
                {presentationSlides.map((slide, index) => (
                    <div
                        key={index}
                        className="ppt-slide-export w-[1123px] h-[794px] bg-white p-16 flex flex-col border border-border"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                        <h2 className="text-4xl font-bold text-slate-800 mb-8 border-b-2 border-orange-500 pb-4">
                            {slide.title}
                        </h2>
                        <div className="flex-1 overflow-hidden text-slate-700 text-xl">
                            <div className="prose prose-slate max-w-none prose-xl prose-headings:text-orange-600">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {slide.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-400 font-medium">
                            <span>RAILVISION STRATEGY</span>
                            <span>SLIDE {(index + 1).toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
