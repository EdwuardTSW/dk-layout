"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Loguear el error para debugging futuro (reemplazar con Sentry en producción)
    console.error("[DkLayout Error]", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl border border-red-400/20 bg-red-400/10">
          <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Algo salió mal</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>

        {error.message && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left font-mono text-xs text-zinc-500">
            {error.message}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
