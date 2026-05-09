"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { TemplateCard } from "@/components/home/TemplateCard";
import { PREDEFINED_TEMPLATES } from "@/lib/templates/definitions";
import type { Template } from "@/lib/types";
import { useDocumentsStore } from "@/stores/documents-store";

export function TemplatesScreen() {
  const router = useRouter();
  const createDocument = useDocumentsStore((state) => state.createDocument);
  const [isPending, startTransition] = useTransition();

  function handleSelectTemplate(template: Template) {
    if (template.isComingSoon || isPending) {
      return;
    }

    startTransition(async () => {
      const document = await createDocument({
        title: template.name,
        format: template.format,
        templateId: template.id,
      });
      router.push(`/editor/${document.id}`);
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
        <div className="mt-4">
          <h1 className="text-4xl font-semibold tracking-tight">Plantillas</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Galeria inicial de plantillas predefinidas. Las plantillas DOCX subidas por el usuario entran en Sprint 4.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREDEFINED_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
          ))}
        </section>
      </div>
    </main>
  );
}
