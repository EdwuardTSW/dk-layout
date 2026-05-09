"use client";

import Link from "next/link";
import { Clock3, FileText } from "lucide-react";
import { useEffect } from "react";
import { useDocumentsStore } from "@/stores/documents-store";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export function RecentDocuments() {
  const documents = useDocumentsStore((state) => state.documents);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const hydrateDocuments = useDocumentsStore((state) => state.hydrateDocuments);

  useEffect(() => {
    void hydrateDocuments();
  }, [hydrateDocuments]);

  const recentDocuments = documents.slice(0, 4);

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Documentos recientes</h2>
          <p className="text-sm text-zinc-500">Guardados localmente en este navegador</p>
        </div>
        <Clock3 className="h-5 w-5 text-zinc-500" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
            Cargando documentos...
          </div>
        ) : recentDocuments.length > 0 ? (
          recentDocuments.map((document) => (
            <Link
              key={document.id}
              href={`/editor/${document.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-3 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-zinc-950">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{document.title}</span>
                  <span className="block text-xs text-zinc-500">
                    {document.metadata.wordCount} palabras · {document.format.toUpperCase()}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-xs text-zinc-500">{formatDate(document.updatedAt)}</span>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-400">
            Aun no hay documentos. Crea uno con IA o empieza desde cero.
          </div>
        )}
      </div>
    </section>
  );
}
