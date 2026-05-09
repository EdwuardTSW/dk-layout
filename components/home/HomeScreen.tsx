"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { BlankDocument } from "@/components/home/BlankDocument";
import { HeroPrompt } from "@/components/home/HeroPrompt";
import { RecentDocuments } from "@/components/home/RecentDocuments";
import { Sidebar } from "@/components/home/Sidebar";
import { TemplateCard } from "@/components/home/TemplateCard";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PREDEFINED_TEMPLATES } from "@/lib/templates/definitions";
import type { Template } from "@/lib/types";
import { useDocumentsStore } from "@/stores/documents-store";

export function HomeScreen() {
  const router = useRouter();
  const createDocument = useDocumentsStore((state) => state.createDocument);
  const [isPending, startTransition] = useTransition();
  const featuredTemplates = PREDEFINED_TEMPLATES.slice(0, 5);

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
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/65 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white lg:hidden"
                aria-label="Abrir navegacion"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div>
                <p className="text-sm text-zinc-500">Inicio</p>
                <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Hola, Edwuard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserAvatar />
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
          <div className="min-w-0 space-y-6">
            <HeroPrompt />

            <section className="animate-fade-up">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">Plantillas destacadas</h2>
                  <p className="mt-1 text-sm text-zinc-500">Formatos listos para empezar con estructura profesional.</p>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.22)_transparent]">
                {featuredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <BlankDocument />
            <RecentDocuments />
          </aside>
        </div>
      </main>
    </div>
  );
}
