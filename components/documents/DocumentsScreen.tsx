"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useDocumentsStore } from "@/stores/documents-store";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export function DocumentsScreen() {
  const router = useRouter();
  const documents = useDocumentsStore((state) => state.documents);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const hydrateDocuments = useDocumentsStore((state) => state.hydrateDocuments);
  const createDocument = useDocumentsStore((state) => state.createDocument);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void hydrateDocuments();
  }, [hydrateDocuments]);

  function handleNewDocument() {
    startTransition(async () => {
      const document = await createDocument({ title: "Documento sin titulo", format: "docx" });
      router.push(`/editor/${document.id}`);
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al inicio
            </Link>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Documentos</h1>
            <p className="mt-2 text-zinc-400">Tus archivos locales guardados en IndexedDB.</p>
          </div>
          <button
            type="button"
            onClick={handleNewDocument}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-70"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo documento
          </button>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-panel">
          {isLoading ? (
            <p className="p-6 text-zinc-400">Cargando documentos...</p>
          ) : documents.length > 0 ? (
            <div className="divide-y divide-white/10">
              {documents.map((document) => (
                <Link
                  key={document.id}
                  href={`/editor/${document.id}`}
                  className="flex flex-col gap-3 rounded-2xl p-4 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-zinc-950">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-semibold text-white">{document.title}</span>
                      <span className="text-sm text-zinc-500">
                        {document.metadata.wordCount} palabras · {document.format.toUpperCase()}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm text-zinc-500">Actualizado {formatDate(document.updatedAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-zinc-600" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">Aun no tienes documentos</h2>
              <p className="mt-2 text-sm text-zinc-500">Crea uno desde el inicio o empieza con una plantilla.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
