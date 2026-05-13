"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { PageSize } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tipos                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

type EditorToolbarProps = {
  editor: Editor | null;
  pageSize: PageSize;
  onPageSizeChange: (pageSize: PageSize) => void;
  onInsertImage: () => void;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Constantes                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

const fontFamilies = [
  { label: "Sans", value: "var(--font-geist-sans), Arial, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "var(--font-geist-mono), 'Courier New', monospace" },
  { label: "Calibri", value: "Calibri, Arial, sans-serif" },
];

const fontSizes = ["10pt", "11pt", "12pt", "14pt", "16pt", "18pt", "24pt", "32pt"];

const textColors = [
  { label: "Negro", value: "#18181b" },
  { label: "Gris", value: "#71717a" },
  { label: "Azul", value: "#2563eb" },
  { label: "Rojo", value: "#dc2626" },
  { label: "Verde", value: "#16a34a" },
  { label: "Ambar", value: "#d97706" },
  { label: "Morado", value: "#7c3aed" },
  { label: "Rosa", value: "#db2777" },
];

const highlightColors = [
  { label: "Amarillo", value: "#fef08a" },
  { label: "Verde", value: "#bbf7d0" },
  { label: "Azul", value: "#bfdbfe" },
  { label: "Rosa", value: "#fbcfe8" },
  { label: "Naranja", value: "#fed7aa" },
  { label: "Morado", value: "#e9d5ff" },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Boton base de toolbar                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-7 flex-none items-center justify-center rounded-md text-zinc-400 transition",
        "hover:bg-white/10 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        "disabled:pointer-events-none disabled:opacity-30",
        active && "bg-blue-500/20 text-blue-400",
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Separador                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

function Sep() {
  return <span className="mx-1 h-5 w-px flex-none bg-white/[0.08]" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Hook: sincronizar selects con el estado del editor                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

function useEditorState(editor: Editor | null) {
  const [, forceUpdate] = useState(0);
  const onUpdate = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", onUpdate);
    editor.on("transaction", onUpdate);
    return () => {
      editor.off("selectionUpdate", onUpdate);
      editor.off("transaction", onUpdate);
    };
  }, [editor, onUpdate]);

  const attrs = editor?.getAttributes("textStyle") ?? {};
  return {
    activeFontFamily: (attrs.fontFamily as string) ?? "",
    activeFontSize: (attrs.fontSize as string) ?? "",
    activeColor: (attrs.color as string) ?? "",
    activeHighlight: (editor?.getAttributes("highlight")?.color as string) ?? "",
  };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Hook: popover con overlay (patron robusto)                                */
/*                                                                            */
/*  En vez de mousedown listeners, usamos un overlay invisible (z-998)        */
/*  detras del popover (z-999). Cualquier clic fuera del popover cae en       */
/*  el overlay y lo cierra. Clics dentro del popover funcionan porque          */
/*  tiene z-index mayor.                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

function usePopover(popoverWidth = 160) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (prev) return false;
      if (!btnRef.current) return false;
      const r = btnRef.current.getBoundingClientRect();
      const maxLeft = window.innerWidth - popoverWidth - 12;
      setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, maxLeft)) });
      return true;
    });
  }, [popoverWidth]);

  const close = useCallback(() => setOpen(false), []);

  // Escape cierra
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return { open, pos, btnRef, toggle, close };
}

/** Overlay + contenedor del popover. Renderiza como portal visual. */
function PopoverPanel({
  open,
  pos,
  close,
  width,
  children,
}: {
  open: boolean;
  pos: { top: number; left: number };
  close: () => void;
  width?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      {/* Overlay invisible que cierra el popover al hacer clic fuera */}
      <div className="fixed inset-0 z-[998]" onClick={close} aria-hidden="true" />
      {/* Popover real */}
      <div
        className={cn(
          "fixed z-[999] rounded-xl border border-white/10 bg-zinc-900/95 p-2.5 shadow-[0_20px_60px_rgb(0,0,0,0.6)] backdrop-blur-xl",
          width,
        )}
        style={{ top: pos.top, left: pos.left }}
      >
        {children}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ColorPopover                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

type ColorPopoverProps = {
  disabled: boolean;
  activeColor: string;
  colors: { label: string; value: string }[];
  icon: ReactNode;
  label: string;
  onSelect: (value: string) => void;
  onClear: () => void;
};

function ColorPopover({ disabled, activeColor, colors, icon, label, onSelect, onClear }: ColorPopoverProps) {
  const { open, pos, btnRef, toggle, close } = usePopover(170);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "inline-flex h-7 flex-none items-center gap-1 rounded-md px-1.5 text-zinc-400 transition",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          "disabled:pointer-events-none disabled:opacity-30",
          open && "bg-white/10 text-white",
        )}
        aria-label={label}
      >
        <span
          className="h-3 w-3 rounded-full ring-1 ring-white/20"
          style={{ background: activeColor || "currentColor" }}
        />
        {icon}
        <ChevronDown className="h-2.5 w-2.5 opacity-50" aria-hidden="true" />
      </button>

      <PopoverPanel open={open} pos={pos} close={close} width="w-40">
        <div className="grid grid-cols-4 gap-1.5">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => { onSelect(c.value); close(); }}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform hover:scale-125",
                activeColor === c.value
                  ? "border-blue-400 ring-2 ring-blue-400/30"
                  : "border-transparent hover:border-white/30",
              )}
              style={{ background: c.value }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => { onClear(); close(); }}
          className="mt-2 w-full rounded-lg px-2 py-1 text-left text-[11px] text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
        >
          Quitar color
        </button>
      </PopoverPanel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TablePopover                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function TablePopover({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
  const { open, pos, btnRef, toggle, close } = usePopover(200);
  const [hover, setHover] = useState({ row: 0, col: 0 });
  const ROWS = 6;
  const COLS = 6;

  function insertTable(rows: number, cols: number) {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    close();
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "inline-flex h-7 w-7 flex-none items-center justify-center rounded-md text-zinc-400 transition",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          "disabled:pointer-events-none disabled:opacity-30",
          open && "bg-white/10 text-white",
        )}
        aria-label="Insertar tabla"
      >
        <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <PopoverPanel open={open} pos={pos} close={close}>
        <p className="mb-1.5 text-center text-[11px] font-medium text-zinc-400">
          {hover.row > 0 ? `${hover.row} x ${hover.col}` : "Selecciona tamano"}
        </p>
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1.25rem)` }}
          onMouseLeave={() => setHover({ row: 0, col: 0 })}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onMouseEnter={() => setHover({ row: r + 1, col: c + 1 })}
                onClick={() => insertTable(r + 1, c + 1)}
                className={cn(
                  "h-[1.15rem] w-[1.15rem] rounded-[3px] border transition-colors",
                  r < hover.row && c < hover.col
                    ? "border-blue-400 bg-blue-500/30"
                    : "border-white/10 bg-white/[0.04]",
                )}
                aria-label={`Tabla ${r + 1} x ${c + 1}`}
              />
            )),
          )}
        </div>
      </PopoverPanel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  LinkPopover                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function LinkPopover({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
  const { open, pos, btnRef, toggle, close } = usePopover(260);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = editor?.isActive("link") ?? false;

  useEffect(() => {
    if (!open) return;
    setUrl((editor?.getAttributes("link").href as string) ?? "");
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, editor]);

  function apply() {
    if (!url.trim()) {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: url.trim() }).run();
    }
    close();
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "inline-flex h-7 w-7 flex-none items-center justify-center rounded-md text-zinc-400 transition",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          "disabled:pointer-events-none disabled:opacity-30",
          isActive && "bg-blue-500/20 text-blue-400",
          open && "bg-white/10 text-white",
        )}
        aria-label="Insertar enlace"
      >
        <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <PopoverPanel open={open} pos={pos} close={close} width="w-64">
        <p className="mb-2 text-[11px] font-medium text-zinc-400">URL del enlace</p>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
          placeholder="https://..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/50"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            Aplicar
          </button>
          {isActive && (
            <button
              type="button"
              onClick={() => { editor?.chain().focus().unsetLink().run(); close(); }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              Quitar
            </button>
          )}
        </div>
      </PopoverPanel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Toolbar principal                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

export function EditorToolbar({ editor, pageSize, onPageSizeChange, onInsertImage }: EditorToolbarProps) {
  const off = !editor;
  const { activeFontFamily, activeFontSize, activeColor, activeHighlight } = useEditorState(editor);

  const matchedFont =
    fontFamilies.find((f) =>
      activeFontFamily.includes(f.value.split(",")[0].replace(/'/g, "").trim()),
    )?.value ?? activeFontFamily ?? "";

  const selectClass =
    "h-7 flex-none appearance-none rounded-md bg-white/[0.06] px-2 pr-6 text-[11px] font-medium text-zinc-300 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-white/[0.06] bg-zinc-950 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      {/* ── Pagina ─────────────────────────────── */}
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(e.target.value as PageSize)}
        className={selectClass}
        style={{ width: "5rem" }}
        aria-label="Tamano de hoja"
      >
        <option value="letter">Carta</option>
        <option value="a4">A4</option>
        <option value="legal">Legal</option>
      </select>

      <Sep />

      {/* ── Fuente ─────────────────────────────── */}
      <select
        disabled={off}
        value={matchedFont}
        onChange={(e) => {
          e.target.value
            ? editor?.chain().focus().setFontFamily(e.target.value).run()
            : editor?.chain().focus().unsetFontFamily().run();
        }}
        className={selectClass}
        style={{ width: "5.5rem" }}
        aria-label="Fuente"
      >
        <option value="">Fuente</option>
        {fontFamilies.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* ── Tamano ─────────────────────────────── */}
      <select
        disabled={off}
        value={activeFontSize}
        onChange={(e) => {
          e.target.value
            ? editor?.chain().focus().setFontSize(e.target.value).run()
            : editor?.chain().focus().unsetFontSize().run();
        }}
        className={selectClass}
        style={{ width: "4.5rem" }}
        aria-label="Tamano de fuente"
      >
        <option value="">Tam.</option>
        {fontSizes.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <Sep />

      {/* ── Color de texto ─────────────────────── */}
      <ColorPopover
        disabled={off}
        activeColor={activeColor}
        colors={textColors}
        label="Color de texto"
        icon={<span className="text-[10px] font-bold leading-none">A</span>}
        onSelect={(v) => editor?.chain().focus().setColor(v).run()}
        onClear={() => editor?.chain().focus().unsetColor().run()}
      />

      {/* ── Resaltado ──────────────────────────── */}
      <ColorPopover
        disabled={off}
        activeColor={activeHighlight}
        colors={highlightColors}
        label="Resaltar texto"
        icon={<Highlighter className="h-3 w-3" aria-hidden="true" />}
        onSelect={(v) => editor?.chain().focus().setHighlight({ color: v }).run()}
        onClear={() => editor?.chain().focus().unsetHighlight().run()}
      />

      <Sep />

      {/* ── Historial ──────────────────────────── */}
      <ToolbarButton label="Deshacer" disabled={off || !editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Rehacer" disabled={off || !editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>

      <Sep />

      {/* ── Estilos de bloque ──────────────────── */}
      <ToolbarButton label="Parrafo" active={editor?.isActive("paragraph")} disabled={off} onClick={() => editor?.chain().focus().setParagraph().run()}>
        <Pilcrow className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Titulo 1" active={editor?.isActive("heading", { level: 1 })} disabled={off} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Titulo 2" active={editor?.isActive("heading", { level: 2 })} disabled={off} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Titulo 3" active={editor?.isActive("heading", { level: 3 })} disabled={off} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>

      <Sep />

      {/* ── Formato inline ─────────────────────── */}
      <ToolbarButton label="Negrita" active={editor?.isActive("bold")} disabled={off} onClick={() => editor?.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Cursiva" active={editor?.isActive("italic")} disabled={off} onClick={() => editor?.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Subrayado" active={editor?.isActive("underline")} disabled={off} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
        <Underline className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Tachado" active={editor?.isActive("strike")} disabled={off} onClick={() => editor?.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>

      <Sep />

      {/* ── Listas y bloques ───────────────────── */}
      <ToolbarButton label="Lista con vinetas" active={editor?.isActive("bulletList")} disabled={off} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Lista numerada" active={editor?.isActive("orderedList")} disabled={off} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Cita" active={editor?.isActive("blockquote")} disabled={off} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>

      <Sep />

      {/* ── Alineacion ─────────────────────────── */}
      <ToolbarButton label="Alinear izquierda" active={editor?.isActive({ textAlign: "left" })} disabled={off} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Centrar" active={editor?.isActive({ textAlign: "center" })} disabled={off} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Alinear derecha" active={editor?.isActive({ textAlign: "right" })} disabled={off} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Justificar" active={editor?.isActive({ textAlign: "justify" })} disabled={off} onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>

      <Sep />

      {/* ── Insertar ───────────────────────────── */}
      <LinkPopover editor={editor} disabled={off} />
      <TablePopover editor={editor} disabled={off} />
      <ToolbarButton label="Insertar imagen" disabled={off} onClick={onInsertImage}>
        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Linea horizontal" disabled={off} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>

      <Sep />

      {/* ── Limpiar ────────────────────────────── */}
      <ToolbarButton label="Limpiar formato" disabled={off} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}
