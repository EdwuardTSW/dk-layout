"use client";

import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DocumentFormat, TiptapJSON } from "@/lib/types";
import { useDocumentsStore } from "@/stores/documents-store";

type GeneratedDocumentResponse = {
  title?: string;
  content?: TiptapJSON;
  error?: string;
};

export function HeroPrompt() {
  const router = useRouter();
  const createDocument = useDocumentsStore((state) => state.createDocument);
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<DocumentFormat>("docx");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const trimmedPrompt = prompt.trim();
      setError(null);

      // Sin prompt → crear documento en blanco y navegar directamente
      if (!trimmedPrompt) {
        const document = await createDocument({ format, title: "Documento sin titulo" });
        router.push(`/editor/${document.id}`);
        return;
      }

      // Con prompt → intentar generar con IA
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmedPrompt, format }),
        });
        const data = await response.json() as GeneratedDocumentResponse;

        if (!response.ok || data.error || !data.content) {
          throw new Error(data.error || "No se pudo generar con IA.");
        }

        // Generacion exitosa → crear documento y navegar
        const document = await createDocument({
          title: data.title || "Documento creado con IA",
          format,
          content: data.content,
        });
        router.push(`/editor/${document.id}`);
      } catch (generateError) {
        // Fallo de IA → mostrar error, NO navegar para que el usuario reintente
        setError(
          generateError instanceof Error
            ? generateError.message
            : "No se pudo generar con IA. Revisa tu conexion e intenta de nuevo.",
        );
      }
    });
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-panel backdrop-blur-xl md:p-7">
      <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute -bottom-24 left-24 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-sm text-blue-100">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Duke organiza, redacta y prepara tu documento
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Que quieres crear hoy?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
          Pega informacion desordenada, una idea o una instruccion. DkLayout creara un borrador local y luego Duke podra mejorarlo dentro del editor.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-3">
          <label htmlFor="document-prompt" className="sr-only">
            Describe el documento que quieres crear
          </label>
          <textarea
            id="document-prompt"
            name="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            className="min-h-32 w-full resize-none rounded-[1.25rem] border border-transparent bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-zinc-500 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/30"
            placeholder="Ejemplo: Hazme un informe academico sobre inteligencia artificial en educacion, con portada, introduccion, desarrollo y conclusion..."
            autoComplete="off"
          />

          <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <FileText className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              Formato
              <select
                name="format"
                value={format}
                onChange={(event) => setFormat(event.target.value as DocumentFormat)}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Selecciona el formato del documento"
              >
                <option className="bg-zinc-950" value="docx">DOCX</option>
                <option className="bg-zinc-950" value="pdf">PDF</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-70"
            >
              {isPending ? "Creando..." : "Crear con IA"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {error ? (
            <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
