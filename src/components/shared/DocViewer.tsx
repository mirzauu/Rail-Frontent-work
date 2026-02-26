import { useState, useEffect, useRef } from "react";
import { FileText, Download, Maximize2, Minimize2, Play, X, List, PanelLeftClose, PanelLeftOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, WidthType, BorderStyle,
    Header, Footer,
    convertInchesToTwip, LevelFormat, ShadingType,
    PageNumber, NumberFormat, SectionType,
} from 'docx';
import { saveAs } from 'file-saver';

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

    // ─── Design tokens ────────────────────────────────────────────────────
    // Sizes are in half-points (docx unit). 1pt = 2 half-pts.
    // Screen uses Tailwind prose-slate at ~16px base (= 12pt = 24 half-pts).
    const SZ = {
        body: 24,   // 12pt  — prose base body text
        sm: 20,   // 10pt  — small text (footer, header labels)
        xs: 16,   // 8pt   — tiny
        code: 20,   // 10pt  — inline & block code (Consolas)
        h1: 52,   // 26pt  — prose h1 (~30px scaled)
        h2: 40,   // 20pt  — prose h2 (~24px)
        h3: 30,   // 15pt  — prose h3 (~20px)
        h4: 26,   // 13pt  — prose h4
        sectionTitle: 40,  // 20pt — the big per-page section heading
        coverTitle: 72,  // 36pt — cover page title
        coverSub: 28,  // 14pt
    } as const;

    const CLR = {
        body: '1E293B',   // slate-800 (prose-slate body)
        h1: '0F172A',   // slate-900
        h2: '1E3A5F',   // custom brand blue heading
        h3: '2C5282',   // slightly lighter blue
        muted: '64748B',   // slate-500
        lighter: '94A3B8',   // slate-400
        blue: '2563EB',   // blue-600 accent
        blueFaint: 'BFDBFE',   // blue-200 (divider)
        tblHeader: 'E8EDF5',   // blue-50 table header bg
        tblBorder: 'CBD5E1',   // slate-300 table borders
        codeBg: 'F1F5F9',   // slate-100 code background
        codeText: '0F172A',   // slate-900 code text
        coverBg: '0F172A',   // cover title
    } as const;

    const FONT_BODY = 'Calibri';
    const FONT_CODE = 'Consolas';

    // ─── Inline Markdown → TextRun[] ─────────────────────────────────────
    const inlineRuns = (text: string, sz = SZ.body): TextRun[] => {
        const runs: TextRun[] = [];
        const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|([^*`]+))/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
            if (m[2]) runs.push(new TextRun({ text: m[2], bold: true, italics: true, size: sz, font: FONT_BODY, color: CLR.body }));
            else if (m[3]) runs.push(new TextRun({ text: m[3], bold: true, size: sz, font: FONT_BODY, color: CLR.body }));
            else if (m[4]) runs.push(new TextRun({ text: m[4], italics: true, size: sz, font: FONT_BODY, color: CLR.body }));
            else if (m[5]) runs.push(new TextRun({
                text: m[5], font: FONT_CODE, size: SZ.code, color: CLR.codeText,
                shading: { type: ShadingType.SOLID, fill: CLR.codeBg, color: CLR.codeBg },
            }));
            else if (m[6]) runs.push(new TextRun({ text: m[6], size: sz, font: FONT_BODY, color: CLR.body }));
        }
        return runs.length ? runs : [new TextRun({ text, size: sz, font: FONT_BODY, color: CLR.body })];
    };

    // ─── Markdown → docx Paragraph/Table array ───────────────────────────
    const mdToChildren = (markdown: string): (Paragraph | Table)[] => {
        const children: (Paragraph | Table)[] = [];
        const lines = markdown.replace(/\r\n/g, '\n').split('\n');
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // blank line — small spacer
            if (line.trim() === '') {
                i++;
                children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
                continue;
            }

            // headings
            const hm = line.match(/^(#{1,6})\s+(.*)/);
            if (hm) {
                const lvl = hm[1].length;
                const sizMap: Record<number, number> = { 1: SZ.h1, 2: SZ.h2, 3: SZ.h3, 4: SZ.h4, 5: SZ.h4, 6: SZ.h4 };
                const colMap: Record<number, string> = { 1: CLR.h1, 2: CLR.h2, 3: CLR.h3, 4: CLR.h3, 5: CLR.h3, 6: CLR.h3 };
                const lvlMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
                    1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3,
                    4: HeadingLevel.HEADING_4, 5: HeadingLevel.HEADING_5, 6: HeadingLevel.HEADING_6,
                };
                children.push(new Paragraph({
                    children: [new TextRun({ text: hm[2], bold: true, size: sizMap[lvl], color: colMap[lvl], font: FONT_BODY })],
                    heading: lvlMap[lvl],
                    spacing: { before: lvl <= 2 ? 320 : 240, after: lvl <= 2 ? 160 : 120 },
                }));
                i++; continue;
            }

            // horizontal rule
            if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
                children.push(new Paragraph({
                    text: '', spacing: { before: 160, after: 160 },
                    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 } },
                }));
                i++; continue;
            }

            // code block — matches screen's bg-slate-100 code block
            if (line.trim().startsWith('```')) {
                const codeLines: string[] = [];
                i++;
                while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
                i++;
                // Top spacer
                children.push(new Paragraph({
                    text: '',
                    shading: { type: ShadingType.SOLID, fill: CLR.codeBg, color: CLR.codeBg },
                    border: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                    },
                    spacing: { before: 0, after: 0 },
                    indent: { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
                }));
                for (const cl of codeLines) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: cl || ' ', font: FONT_CODE, size: SZ.code, color: CLR.codeText })],
                        shading: { type: ShadingType.SOLID, fill: CLR.codeBg, color: CLR.codeBg },
                        border: {
                            left: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                        },
                        indent: { left: convertInchesToTwip(0.25), right: convertInchesToTwip(0.15) },
                        spacing: { after: 0, line: 276, lineRule: 'auto' },
                    }));
                }
                // Bottom spacer
                children.push(new Paragraph({
                    text: '',
                    shading: { type: ShadingType.SOLID, fill: CLR.codeBg, color: CLR.codeBg },
                    border: {
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1, color: CLR.tblBorder, space: 1 },
                    },
                    spacing: { before: 0, after: 160 },
                    indent: { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
                }));
                continue;
            }

            // table — matches prose-slate table with slate-300 borders & blue-50 header
            if (line.trim().startsWith('|')) {
                const rows: string[][] = [];
                while (i < lines.length && lines[i].trim().startsWith('|')) {
                    const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
                    if (!/^[\s\-:|]+$/.test(lines[i].replace(/\|/g, ''))) rows.push(cells);
                    i++;
                }
                if (rows.length) {
                    const colCount = rows[0].length;
                    const TABLE_W = 9072; // ~6.3 inches in DXA (matches text width at 1-inch margins)
                    const colW = Math.floor(TABLE_W / colCount);

                    const tableBorderDef = {
                        style: BorderStyle.SINGLE, size: 4, color: CLR.tblBorder, space: 0,
                    };
                    children.push(new Table({
                        width: { size: TABLE_W, type: WidthType.DXA },
                        rows: rows.map((row, ri) => new TableRow({
                            tableHeader: ri === 0,
                            children: row.map((cell, _ci) => new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: cell,
                                        bold: ri === 0,
                                        size: ri === 0 ? SZ.sm : SZ.body,
                                        font: FONT_BODY,
                                        color: ri === 0 ? CLR.h2 : CLR.body,
                                    })],
                                    spacing: { before: 80, after: 80 },
                                })],
                                width: { size: colW, type: WidthType.DXA },
                                shading: ri === 0
                                    ? { type: ShadingType.SOLID, fill: CLR.tblHeader, color: CLR.tblHeader }
                                    : undefined,
                                margins: {
                                    top: 60, bottom: 60,
                                    left: 100, right: 100,
                                },
                                borders: {
                                    top: tableBorderDef, bottom: tableBorderDef,
                                    left: tableBorderDef, right: tableBorderDef,
                                },
                            })),
                        })),
                    }));
                    children.push(new Paragraph({ text: '', spacing: { after: 160 } }));
                }
                continue;
            }

            // blockquote — matches screen's left blue border
            if (line.trim().startsWith('>')) {
                const bqLines: string[] = [];
                while (i < lines.length && lines[i].trim().startsWith('>')) {
                    bqLines.push(lines[i].trim().replace(/^>\s?/, '')); i++;
                }
                children.push(new Paragraph({
                    children: inlineRuns(bqLines.join(' ')),
                    indent: { left: convertInchesToTwip(0.35), right: convertInchesToTwip(0.1) },
                    border: { left: { style: BorderStyle.SINGLE, size: 12, color: CLR.blue, space: 8 } },
                    shading: { type: ShadingType.SOLID, fill: 'EFF6FF', color: 'EFF6FF' },
                    spacing: { before: 120, after: 120, line: 360, lineRule: 'auto' },
                }));
                continue;
            }

            // bullet list
            const bm = line.match(/^(\s*)[-*+]\s+(.*)/);
            if (bm) {
                children.push(new Paragraph({
                    children: inlineRuns(bm[2]),
                    bullet: { level: Math.floor(bm[1].length / 2) },
                    spacing: { after: 80, line: 360, lineRule: 'auto' },
                }));
                i++; continue;
            }

            // ordered list
            const om = line.match(/^(\s*)\d+[.)]\s+(.*)/);
            if (om) {
                children.push(new Paragraph({
                    children: inlineRuns(om[2]),
                    numbering: { reference: 'doc-numbering', level: Math.floor(om[1].length / 2) },
                    spacing: { after: 80, line: 360, lineRule: 'auto' },
                }));
                i++; continue;
            }

            // paragraph (accumulate consecutive text lines)
            const pLines = [line]; i++;
            while (i < lines.length && lines[i].trim() !== '' &&
                !lines[i].match(/^#{1,6}\s/) && !lines[i].trim().startsWith('|') &&
                !lines[i].trim().startsWith('>') && !lines[i].trim().startsWith('```') &&
                !lines[i].match(/^\s*[-*+]\s/) && !lines[i].match(/^\s*\d+[.)]\s/)
            ) { pLines.push(lines[i]); i++; }

            children.push(new Paragraph({
                children: inlineRuns(pLines.join(' ')),
                spacing: { after: 160, line: 360, lineRule: 'auto' },  // 1.5× line-height ~ leading-relaxed
            }));
        }
        return children;
    };

    // ─── Running header (matches on-screen page header) ──────────────────
    const makeHeader = (docTitle: string) => new Header({
        children: [
            new Paragraph({
                children: [
                    new TextRun({ text: docTitle.toUpperCase(), bold: true, size: SZ.sm, color: CLR.h2, font: FONT_BODY }),
                    new TextRun({ text: '\t', size: SZ.sm }),
                    new TextRun({ text: 'RailVision Document', size: SZ.sm, color: CLR.muted, font: FONT_BODY }),
                ],
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CLR.blue, space: 6 } },
                tabStops: [{ type: AlignmentType.RIGHT, position: convertInchesToTwip(6.5) }],
                spacing: { after: 80 },
            }),
        ],
    });

    // ─── Running footer (matches on-screen page footer) ──────────────────
    const makeFooter = () => new Footer({
        children: [
            new Paragraph({
                children: [
                    new TextRun({ text: 'RAILVISION CONFIDENTIAL', size: SZ.xs, color: CLR.lighter, font: FONT_CODE }),
                    new TextRun({ text: '\t', size: SZ.xs }),
                    new TextRun({ text: 'PAGE ', size: SZ.xs, color: CLR.lighter, font: FONT_CODE }),
                    new TextRun({ children: [PageNumber.CURRENT], size: SZ.xs, color: CLR.lighter, font: FONT_CODE }),
                ],
                border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0', space: 6 } },
                tabStops: [{ type: AlignmentType.RIGHT, position: convertInchesToTwip(6.5) }],
                spacing: { before: 80 },
            }),
        ],
    });

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            const pageMargins = {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
                header: convertInchesToTwip(0.4),
                footer: convertInchesToTwip(0.4),
            };

            // ── Cover page (no running header/footer) ─────────────────────
            const coverSection = {
                properties: {
                    type: SectionType.NEXT_PAGE,
                    page: {
                        margin: pageMargins,
                        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
                    },
                },
                headers: {},
                footers: {},
                children: [
                    // Blue top accent bar (simulated with thick top border)
                    new Paragraph({
                        text: '',
                        border: { top: { style: BorderStyle.SINGLE, size: 80, color: CLR.blue, space: 1 } },
                        spacing: { after: 3600 }, // push title ~2.5 inches down
                    }),
                    // Document title
                    new Paragraph({
                        children: [new TextRun({
                            text: doc.title, bold: true,
                            size: SZ.coverTitle, color: CLR.coverBg, font: FONT_BODY,
                        })],
                        spacing: { after: 280 },
                    }),
                    // Thin blue divider
                    new Paragraph({
                        text: '',
                        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: CLR.blueFaint, space: 1 } },
                        spacing: { before: 0, after: 1440 },
                    }),
                    // Subtitle
                    new Paragraph({
                        children: [new TextRun({
                            text: 'RailVision Word Document',
                            size: SZ.coverSub, color: CLR.muted, font: FONT_BODY,
                        })],
                        spacing: { after: 200 },
                    }),
                    // Confidential • date
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Confidential', size: SZ.sm, color: CLR.lighter, font: FONT_BODY }),
                            new TextRun({ text: '   \u2022   ', size: SZ.sm, color: 'CBD5E1', font: FONT_BODY }),
                            new TextRun({ text: today, size: SZ.sm, color: CLR.lighter, font: FONT_BODY }),
                        ],
                        border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0', space: 8 } },
                        spacing: { before: 120, after: 0 },
                    }),
                ],
            };

            // ── One DOCX section = one page per content section ───────────
            const contentSections = doc.sections.map((section) => ({
                properties: {
                    type: SectionType.NEXT_PAGE,
                    page: { margin: pageMargins },
                },
                headers: { default: makeHeader(doc.title) },
                footers: { default: makeFooter() },
                children: [
                    // Section heading (matches screen's bold H2 with blue underline)
                    new Paragraph({
                        children: [new TextRun({
                            text: section.title, bold: true,
                            size: SZ.sectionTitle, color: CLR.h1, font: FONT_BODY,
                        })],
                        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CLR.blueFaint, space: 8 } },
                        spacing: { before: 120, after: 360 },
                    }),
                    // Section body from Markdown
                    ...mdToChildren(section.content),
                ] as (Paragraph | Table)[],
            }));

            const docx = new Document({
                numbering: {
                    config: [{
                        reference: 'doc-numbering',
                        levels: [
                            {
                                level: 0, format: LevelFormat.DECIMAL, text: '%1.',
                                alignment: AlignmentType.LEFT,
                                style: { paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.3) } } },
                            },
                            {
                                level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.',
                                alignment: AlignmentType.LEFT,
                                style: { paragraph: { indent: { left: convertInchesToTwip(0.6), hanging: convertInchesToTwip(0.3) } } },
                            },
                        ],
                    }],
                },
                // Define heading styles to override Word defaults with brand colours
                styles: {
                    default: {
                        document: { run: { font: FONT_BODY, size: SZ.body, color: CLR.body } },
                    },
                    paragraphStyles: [
                        {
                            id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
                            run: { bold: true, size: SZ.h1, color: CLR.h1, font: FONT_BODY },
                            paragraph: { spacing: { before: 320, after: 160 } },
                        },
                        {
                            id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
                            run: { bold: true, size: SZ.h2, color: CLR.h2, font: FONT_BODY },
                            paragraph: { spacing: { before: 280, after: 140 } },
                        },
                        {
                            id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
                            run: { bold: true, size: SZ.h3, color: CLR.h3, font: FONT_BODY },
                            paragraph: { spacing: { before: 240, after: 120 } },
                        },
                        {
                            id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal',
                            run: { bold: true, size: SZ.h4, color: CLR.h3, font: FONT_BODY },
                            paragraph: { spacing: { before: 200, after: 100 } },
                        },
                    ],
                },
                sections: [coverSection, ...contentSections],
            });

            const blob = await Packer.toBlob(docx);
            saveAs(blob, `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);

        } catch (error) {
            console.error('Doc generation failed:', error);
            alert('Failed to generate Word Doc. Please try again.');
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
