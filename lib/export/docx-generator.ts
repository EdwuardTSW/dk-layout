import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import type { PageSize, TiptapJSON } from "@/lib/types";

// ─── Tamaños de página en twips (1 pulgada = 1440 twips) ────────────────────
const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  letter: { width: 12240, height: 15840 }, // 8.5" x 11"
  a4: { width: 11906, height: 16838 },     // 210mm x 297mm
  legal: { width: 12240, height: 20160 },  // 8.5" x 14"
};

const MARGIN = 1440; // 1 pulgada de margen en todos los lados

// ─── Helpers ────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\n\r]/g, "").trim() || "documento";
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Convertir marks de Tiptap a opciones de TextRun ────────────────────────

type TextRunOptions = {
  bold?: boolean;
  italics?: boolean;
  underline?: object;
  strike?: boolean;
  color?: string;
  size?: number;
};

function marksToOptions(marks: TiptapJSON["marks"] = []): TextRunOptions {
  const opts: TextRunOptions = {};
  for (const mark of marks) {
    if (mark.type === "bold") opts.bold = true;
    if (mark.type === "italic") opts.italics = true;
    if (mark.type === "underline") opts.underline = {};
    if (mark.type === "strike") opts.strike = true;
    if (mark.type === "textStyle" && mark.attrs) {
      if (mark.attrs.color) {
        opts.color = String(mark.attrs.color).replace("#", "");
      }
      if (mark.attrs.fontSize) {
        // "12pt" → 24 halfPoints
        const pt = Number.parseFloat(String(mark.attrs.fontSize));
        if (!Number.isNaN(pt)) opts.size = Math.round(pt * 2);
      }
    }
  }
  return opts;
}

// ─── Convertir nodos inline a TextRuns ──────────────────────────────────────

function inlineToRuns(content: TiptapJSON[] = []): TextRun[] {
  return content.flatMap((node) => {
    if (node.type === "text") {
      return [new TextRun({ text: node.text ?? "", ...marksToOptions(node.marks) })];
    }
    if (node.type === "hardBreak") {
      return [new TextRun({ break: 1 })];
    }
    return [];
  });
}

// ─── Convertir alineación de Tiptap a DOCX ──────────────────────────────────

function toAlignment(attrs?: Record<string, unknown>): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const align = attrs?.textAlign as string | undefined;
  const map: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
    left: AlignmentType.LEFT,
  };
  return map[align ?? "left"] ?? AlignmentType.LEFT;
}

// ─── Convertir nodos de bloque a Paragraphs ──────────────────────────────────

function nodeToDocx(node: TiptapJSON, listState?: { type: "bullet" | "ordered"; index: number }): (Paragraph | Table)[] {
  switch (node.type) {
    case "paragraph":
      return [
        new Paragraph({
          alignment: toAlignment(node.attrs),
          children: inlineToRuns(node.content),
        }),
      ];

    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      };
      return [
        new Paragraph({
          heading: headingMap[level] ?? HeadingLevel.HEADING_1,
          children: inlineToRuns(node.content),
        }),
      ];
    }

    case "bulletList": {
      return (node.content ?? []).flatMap((listItem) =>
        (listItem.content ?? []).flatMap((child) => {
          if (child.type === "paragraph") {
            return [
              new Paragraph({
                bullet: { level: 0 },
                children: inlineToRuns(child.content),
              }),
            ];
          }
          return nodeToDocx(child, { type: "bullet", index: 0 });
        }),
      );
    }

    case "orderedList": {
      return (node.content ?? []).flatMap((listItem, idx) =>
        (listItem.content ?? []).flatMap((child) => {
          if (child.type === "paragraph") {
            const runs = inlineToRuns(child.content);
            return [
              new Paragraph({
                // Numeración manual como prefijo
                children: [
                  new TextRun({ text: `${idx + 1}. `, bold: false }),
                  ...runs,
                ],
              }),
            ];
          }
          return nodeToDocx(child, { type: "ordered", index: idx });
        }),
      );
    }

    case "blockquote": {
      return (node.content ?? []).flatMap((child) => {
        const paras = nodeToDocx(child);
        // Estilo de cita: cursiva + color gris
        return paras.map((p) => {
          if (p instanceof Paragraph) {
            return new Paragraph({
              indent: { left: 720 }, // 0.5 pulgada de sangría
              children: inlineToRuns(child.content ?? []).map(
                (run) => new TextRun({ ...run, italics: true, color: "666666" }),
              ),
            });
          }
          return p;
        });
      });
    }

    case "table": {
      const rows = (node.content ?? []).map((rowNode) => {
        const cells = (rowNode.content ?? []).map((cellNode) => {
          const cellContent = (cellNode.content ?? []).flatMap((child) => nodeToDocx(child));
          return new TableCell({
            children: cellContent.filter((c): c is Paragraph => c instanceof Paragraph),
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "d4d4d8" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "d4d4d8" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "d4d4d8" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "d4d4d8" },
            },
          });
        });
        return new TableRow({ children: cells });
      });

      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        }),
      ];
    }

    case "horizontalRule":
      return [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "d4d4d8" } },
          children: [],
        }),
      ];

    default:
      // Nodo desconocido — intentar extraer texto
      if (node.content) {
        return node.content.flatMap((child) => nodeToDocx(child));
      }
      return [];
  }
}

// ─── Exportar a DOCX ─────────────────────────────────────────────────────────

export async function exportToDocx(
  title: string,
  content: TiptapJSON,
  pageSize: PageSize = "letter",
): Promise<void> {
  const size = PAGE_SIZES[pageSize];
  const children = (content.content ?? []).flatMap((node) => nodeToDocx(node));

  const doc = new Document({
    title,
    description: "Documento creado con DkLayout",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24, // 12pt en half-points
            color: "18181b",
          },
          paragraph: {
            spacing: { after: 160 },
          },
        },
        heading1: {
          run: { size: 56, bold: true, color: "18181b" }, // 28pt
          paragraph: { spacing: { before: 480, after: 240 } },
        },
        heading2: {
          run: { size: 40, bold: true, color: "18181b" }, // 20pt
          paragraph: { spacing: { before: 360, after: 160 } },
        },
        heading3: {
          run: { size: 28, bold: true, color: "18181b" }, // 14pt
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: size.width, height: size.height },
            margin: {
              top: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
              right: MARGIN,
            },
          },
        },
        children:
          children.length > 0
            ? children
            : [new Paragraph({ children: [new TextRun({ text: "" })] })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${sanitizeFilename(title)}.docx`);
}
