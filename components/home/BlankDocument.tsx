"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useDocumentsStore } from "@/stores/documents-store";

export function BlankDocument() {
  const router = useRouter();
  const createDocument = useDocumentsStore((state) => state.createDocument);
  const [isPending, startTransition] = useTransition();

  function handleCreateBlank() {
    startTransition(async () => {
      const document = await createDocument({ title: "Documento sin titulo", format: "docx" });
      router.push(`/editor/${document.id}`);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCreateBlank}
      disabled={isPending}
      className="group flex min-h-48 flex-col justify-between rounded-[1.75rem] border border-dashed border-white/20 bg-white/[0.04] p-5 text-left transition hover:border-blue-300/50 hover:bg-blue-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-70"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-zinc-950 transition group-hover:rotate-3 group-hover:scale-105">
        <Plus className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Empieza desde cero</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Abre un documento en blanco y usa Duke cuando necesites estructura, estilo o correccion.
        </p>
      </div>
    </button>
  );
}
