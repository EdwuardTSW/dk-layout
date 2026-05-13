"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { exportToDocx } from "@/lib/export/docx-generator";
import { exportToPdf } from "@/lib/export/pdf-generator";
import type { PageSize, TiptapJSON } from "@/lib/types";
import { cn } from "@/lib/utils";

type ExportMenuProps = {
  title: string;
  content: TiptapJSON;
  pageSize: PageSize;
};

type ExportState = "idle" | "pdf" | "docx";

type DropdownPos = { top: number; right: number };

export function ExportMenu({ title, content, pageSize }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isBusy = exportState !== "idle";

  // Calcular posición del dropdown relativa al viewport (para position:fixed)
  function openMenu() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
    setIsOpen(true);
  }

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  async function handleExport(type: "pdf" | "docx") {
    if (isBusy) return;
    setIsOpen(false);
    setExportState(type);

    try {
      if (type === "pdf") {
        await exportToPdf(title, pageSize);
      } else {
        await exportToDocx(title, content, pageSize);
      }
    } catch (err) {
      console.error("[ExportMenu] Error al exportar:", err);
      alert(`No se pudo exportar. ${err instanceof Error ? err.message : ""}`);
    } finally {
      setExportState("idle");
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={isBusy}
        onClick={openMenu}
        className={cn(
          "hidden items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:inline-flex",
          isBusy
            ? "cursor-wait bg-white/5 text-zinc-400"
            : "bg-white text-zinc-950 hover:bg-blue-50",
        )}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {exportState === "pdf" ? "Generando PDF..." : "Generando DOCX..."}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar
          </>
        )}
      </button>

      {/* Overlay + Dropdown montados en el viewport (escapan cualquier overflow) */}
      {isOpen && !isBusy && (
        <>
          {/* Overlay invisible para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown — position: fixed para estar siempre encima de todo */}
          <div
            className="fixed z-[999] w-52 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_24px_80px_rgb(0,0,0,0.5)] animate-[panel-in_180ms_ease-out]"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            <div className="p-1.5">
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-500/20 text-red-400">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">Descargar PDF</p>
                  <p className="text-xs text-zinc-500">Listo para imprimir</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExport("docx")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/20 text-blue-400">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">Descargar DOCX</p>
                  <p className="text-xs text-zinc-500">Compatible con Word</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
