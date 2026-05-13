"use client";

import type { PageSize } from "@/lib/types";

type EditorStatusBarProps = {
  wordCount: number;
  format: string;
  updatedAt: number;
  pageSize: PageSize;
};

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

const pageSizeLabels: Record<PageSize, string> = {
  letter: "Carta",
  a4: "A4",
  legal: "Legal",
};

export function EditorStatusBar({ wordCount, format, updatedAt, pageSize }: EditorStatusBarProps) {
  return (
    <footer className="flex h-10 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-zinc-950/85 px-4 text-xs text-zinc-500 backdrop-blur-xl sm:px-5">
      <span>Vista {pageSizeLabels[pageSize]}</span>
      <span>{wordCount} palabras</span>
      <span>Idioma: ES</span>
      <span>{format.toUpperCase()}</span>
      <span>Actualizado {formatTime(updatedAt)}</span>
    </footer>
  );
}
