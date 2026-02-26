import jsPDF from "jspdf";
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, WidthType, BorderStyle,
    LevelFormat, convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

// ── Markdown tokenizer ──────────────────────────────────────────────

interface Token {
    type: "heading" | "bullet" | "ordered" | "table" | "blockquote" | "code" | "hr" | "paragraph";
    level?: number;       // heading level or list indent
    text?: string;        // raw text (may contain inline md)
    rows?: string[][];    // table rows (first = header)
    lang?: string;        // code language
    index?: number;       // ordered-list number
}

function tokenize(md: string): Token[] {
    const lines = md.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").split("\n");
    const tokens: Token[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // blank
        if (line.trim() === "") { i++; continue; }

        // hr
        if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
            tokens.push({ type: "hr" }); i++; continue;
        }

        // heading
        const hm = line.match(/^(#{1,6})\s+(.*)/);
        if (hm) { tokens.push({ type: "heading", level: hm[1].length, text: hm[2] }); i++; continue; }

        // code block
        if (line.trim().startsWith("```")) {
            const lang = line.trim().replace(/^```/, "").trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
            i++; // skip closing ```
            tokens.push({ type: "code", text: codeLines.join("\n"), lang });
            continue;
        }

        // table
        if (line.trim().startsWith("|")) {
            const rows: string[][] = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) {
                const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
                if (!/^[\s\-:|]+$/.test(lines[i].replace(/\|/g, ""))) rows.push(cells);
                i++;
            }
            if (rows.length) tokens.push({ type: "table", rows });
            continue;
        }

        // blockquote
        if (line.trim().startsWith(">")) {
            const bqLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith(">")) {
                bqLines.push(lines[i].trim().replace(/^>\s?/, ""));
                i++;
            }
            tokens.push({ type: "blockquote", text: bqLines.join("\n") });
            continue;
        }

        // bullet list
        const bm = line.match(/^(\s*)[-*+]\s+(.*)/);
        if (bm) {
            tokens.push({ type: "bullet", text: bm[2], level: Math.floor(bm[1].length / 2) });
            i++; continue;
        }

        // ordered list
        const om = line.match(/^(\s*)(\d+)[.)]\s+(.*)/);
        if (om) {
            tokens.push({ type: "ordered", text: om[3], index: parseInt(om[2]), level: Math.floor(om[1].length / 2) });
            i++; continue;
        }

        // paragraph (accumulate consecutive non-special lines)
        const pLines: string[] = [line];
        i++;
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !lines[i].match(/^#{1,6}\s/) &&
            !lines[i].trim().startsWith("|") &&
            !lines[i].trim().startsWith(">") &&
            !lines[i].trim().startsWith("```") &&
            !lines[i].match(/^\s*[-*+]\s/) &&
            !lines[i].match(/^\s*\d+[.)]\s/)
        ) {
            pLines.push(lines[i]); i++;
        }
        tokens.push({ type: "paragraph", text: pLines.join(" ") });
    }

    return tokens;
}

// ── Inline markdown → segments ──────────────────────────────────────

interface Segment { text: string; bold?: boolean; italic?: boolean; code?: boolean }

function parseInline(text: string): Segment[] {
    const segs: Segment[] = [];
    // regex: bold+italic, bold, italic, inline code
    const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        if (m.index > last) segs.push({ text: text.slice(last, m.index) });
        if (m[2]) segs.push({ text: m[2], bold: true, italic: true });
        else if (m[3]) segs.push({ text: m[3], bold: true });
        else if (m[4]) segs.push({ text: m[4], italic: true });
        else if (m[5]) segs.push({ text: m[5], code: true });
        last = m.index + m[0].length;
    }
    if (last < text.length) segs.push({ text: text.slice(last) });
    return segs;
}

// ── PDF export ──────────────────────────────────────────────────────

export function downloadPDF(markdown: string, filename = "message") {
    const tokens = tokenize(markdown);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pw - margin * 2;
    let y = margin;
    const lineH = 5.5;

    const ensureSpace = (need: number) => {
        if (y + need > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
    };

    const drawWrapped = (text: string, x: number, w: number, fontSize: number, style: string = "normal") => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", style);
        const lines: string[] = doc.splitTextToSize(text, w);
        for (const l of lines) {
            ensureSpace(lineH);
            doc.text(l, x, y);
            y += lineH;
        }
    };

    const drawInlineSegments = (segs: Segment[], x: number, w: number, baseFontSize: number) => {
        // Simple approach: concatenate; apply bold to whole line if any segment is bold
        const full = segs.map(s => s.text).join("");
        const hasBold = segs.some(s => s.bold);
        const hasItalic = segs.some(s => s.italic);
        const style = hasBold && hasItalic ? "bolditalic" : hasBold ? "bold" : hasItalic ? "italic" : "normal";
        drawWrapped(full, x, w, baseFontSize, style);
    };

    for (const tok of tokens) {
        switch (tok.type) {
            case "heading": {
                const sizes: Record<number, number> = { 1: 18, 2: 15, 3: 13, 4: 12, 5: 11, 6: 10 };
                y += 3;
                ensureSpace(10);
                drawWrapped(tok.text!, margin, maxW, sizes[tok.level!] || 12, "bold");
                y += 2;
                break;
            }
            case "paragraph": {
                ensureSpace(lineH);
                const segs = parseInline(tok.text!);
                drawInlineSegments(segs, margin, maxW, 10);
                y += 2;
                break;
            }
            case "bullet": {
                ensureSpace(lineH);
                const indent = margin + (tok.level || 0) * 6;
                doc.setFontSize(10);
                doc.text("•", indent, y);
                const segs = parseInline(tok.text!);
                drawInlineSegments(segs, indent + 4, maxW - (indent - margin) - 4, 10);
                break;
            }
            case "ordered": {
                ensureSpace(lineH);
                const indent = margin + (tok.level || 0) * 6;
                doc.setFontSize(10);
                doc.text(`${tok.index}.`, indent, y);
                const segs = parseInline(tok.text!);
                drawInlineSegments(segs, indent + 6, maxW - (indent - margin) - 6, 10);
                break;
            }
            case "blockquote": {
                y += 2;
                ensureSpace(lineH);
                doc.setDrawColor(180);
                doc.setLineWidth(0.6);
                const qx = margin + 2;
                doc.line(qx, y - 2, qx, y + lineH * 1.5);
                drawWrapped(tok.text!, margin + 6, maxW - 6, 10, "italic");
                y += 2;
                break;
            }
            case "table": {
                if (!tok.rows || tok.rows.length === 0) break;
                y += 3;
                const cols = tok.rows[0].length;
                const colW = maxW / cols;
                const cellPad = 2;

                for (let r = 0; r < tok.rows.length; r++) {
                    ensureSpace(lineH + 4);
                    const row = tok.rows[r];
                    const isHeader = r === 0;

                    if (isHeader) {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(margin, y - 3.5, maxW, lineH + 2, "F");
                    }
                    doc.setDrawColor(200);
                    doc.line(margin, y + lineH - 1.5, margin + maxW, y + lineH - 1.5);

                    for (let c = 0; c < cols; c++) {
                        const cx = margin + c * colW + cellPad;
                        doc.setFontSize(9);
                        doc.setFont("helvetica", isHeader ? "bold" : "normal");
                        const cellText = (row[c] || "").substring(0, 40);
                        doc.text(cellText, cx, y);
                    }
                    y += lineH + 1;
                }
                y += 3;
                break;
            }
            case "code": {
                y += 2;
                doc.setFontSize(8);
                doc.setFont("courier", "normal");
                const codeLines = (tok.text || "").split("\n");
                const blockH = codeLines.length * (lineH - 1) + 6;
                ensureSpace(blockH);
                doc.setFillColor(245, 245, 245);
                doc.roundedRect(margin, y - 3, maxW, blockH, 2, 2, "F");
                y += 1;
                for (const cl of codeLines) {
                    doc.text(cl, margin + 3, y);
                    y += lineH - 1;
                }
                y += 3;
                doc.setFont("helvetica", "normal");
                break;
            }
            case "hr": {
                y += 3;
                ensureSpace(4);
                doc.setDrawColor(200);
                doc.line(margin, y, margin + maxW, y);
                y += 3;
                break;
            }
        }
    }

    doc.save(`${filename}.pdf`);
}

// ── DOCX export ─────────────────────────────────────────────────────

function inlineToRuns(text: string, baseOpts: Partial<TextRun> = {}): TextRun[] {
    return parseInline(text).map(s => new TextRun({
        text: s.text,
        bold: s.bold || (baseOpts as any).bold,
        italics: s.italic || (baseOpts as any).italics,
        font: s.code ? "Courier New" : "Calibri",
        size: (baseOpts as any).size || 22,
    }));
}

export async function downloadDOCX(markdown: string, filename = "message") {
    const tokens = tokenize(markdown);
    const children: (Paragraph | Table)[] = [];

    const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
    };

    for (const tok of tokens) {
        switch (tok.type) {
            case "heading":
                children.push(new Paragraph({
                    children: inlineToRuns(tok.text!, { bold: true } as any),
                    heading: headingMap[tok.level!] || HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 },
                }));
                break;

            case "paragraph":
                children.push(new Paragraph({
                    children: inlineToRuns(tok.text!),
                    spacing: { after: 120 },
                }));
                break;

            case "bullet":
                children.push(new Paragraph({
                    children: inlineToRuns(tok.text!),
                    bullet: { level: tok.level || 0 },
                    spacing: { after: 60 },
                }));
                break;

            case "ordered":
                children.push(new Paragraph({
                    children: inlineToRuns(tok.text!),
                    numbering: { reference: "default-numbering", level: tok.level || 0 },
                    spacing: { after: 60 },
                }));
                break;

            case "blockquote":
                children.push(new Paragraph({
                    children: inlineToRuns(tok.text!, { italics: true } as any),
                    indent: { left: convertInchesToTwip(0.5) },
                    border: {
                        left: { style: BorderStyle.SINGLE, size: 6, color: "AAAAAA", space: 8 },
                    },
                    spacing: { before: 120, after: 120 },
                }));
                break;

            case "table": {
                if (!tok.rows || tok.rows.length === 0) break;
                const tableRows = tok.rows.map((row, ri) =>
                    new TableRow({
                        children: row.map(cell =>
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: cell,
                                        bold: ri === 0,
                                        font: "Calibri",
                                        size: 20,
                                    })],
                                })],
                                width: { size: Math.floor(9000 / row.length), type: WidthType.DXA },
                                shading: ri === 0 ? { fill: "E8E8E8" } : undefined,
                            })
                        ),
                    })
                );
                children.push(new Table({
                    rows: tableRows,
                    width: { size: 9000, type: WidthType.DXA },
                }));
                children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
                break;
            }

            case "code":
                for (const line of (tok.text || "").split("\n")) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: line || " ", font: "Courier New", size: 18 })],
                        shading: { fill: "F5F5F5" },
                        spacing: { after: 20 },
                        indent: { left: convertInchesToTwip(0.25) },
                    }));
                }
                children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
                break;

            case "hr":
                children.push(new Paragraph({
                    text: "",
                    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
                    spacing: { before: 120, after: 120 },
                }));
                break;
        }
    }

    const doc = new Document({
        numbering: {
            config: [{
                reference: "default-numbering",
                levels: [{
                    level: 0,
                    format: LevelFormat.DECIMAL,
                    text: "%1.",
                    alignment: AlignmentType.LEFT,
                }, {
                    level: 1,
                    format: LevelFormat.LOWER_LETTER,
                    text: "%2.",
                    alignment: AlignmentType.LEFT,
                }],
            }],
        },
        sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
}
