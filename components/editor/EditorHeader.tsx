"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { ExportMenu } from "@/components/shared/ExportMenu";
import type { PageSize, TiptapJSON } from "@/lib/types";

type EditorHeaderProps = {
  title: string;
  saveStatus: "saved" | "saving" | "dirty";
  content: TiptapJSON;
  pageSize: PageSize;
  onTitleChange: (title: string) => void;
};

const saveStatusLabel = {
  saved: "Guardado",
  saving: "Guardando...",
  dirty: "Cambios pendientes",
};

export function EditorHeader({ title, saveStatus, content, pageSize, onTitleChange }: EditorHeaderProps) {
  return (
    <header className="h-18 shrink-0 border-b border-white/10 bg-zinc-950/88 px-4 py-3 backdrop-blur-xl sm:px-5">
      <div className="flex h-full min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <label htmlFor="document-title" className="sr-only">
              Titulo del documento
            </label>
            <input
              id="document-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="w-full min-w-0 rounded-xl border border-transparent bg-transparent px-1 py-0.5 text-xl font-semibold tracking-tight text-white outline-none transition focus:border-white/10 focus:bg-white/[0.04] sm:text-2xl"
              placeholder="Documento sin titulo"
            />
            <p className="mt-0.5 inline-flex items-center gap-2 text-xs text-zinc-500">
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {saveStatusLabel[saveStatus]}
            </p>
          </div>
        </div>

        <ExportMenu title={title} content={content} pageSize={pageSize} />
      </div>
    </header>
  );
}
