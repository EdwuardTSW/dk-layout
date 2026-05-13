import { FileX, Home, Plus } from "lucide-react";
import Link from "next/link";

export default function EditorNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.06]">
          <FileX className="h-8 w-8 text-zinc-400" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Documento no encontrado</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Este documento no existe o fue eliminado. Los documentos se guardan localmente en este
          navegador.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Crear nuevo documento
          </Link>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Ver mis documentos
          </Link>
        </div>
      </div>
    </main>
  );
}
