import Link from "next/link";
import { ArrowLeft, Bot, FileText, Wrench } from "lucide-react";

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-white/10 bg-zinc-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Inicio
          </Link>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
            Documento {id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 text-white">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold">Duke</h1>
              <p className="text-sm text-emerald-300">Panel de chat - Sprint 3</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            El documento ya se crea y persiste localmente. En los siguientes sprints se conectara Tiptap, toolbar, autoguardado y acciones de Duke.
          </p>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-panel">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Editor base</p>
              <h2 className="text-2xl font-semibold tracking-tight">Canvas del documento</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
              <Wrench className="h-4 w-4" aria-hidden="true" />
              En construccion
            </span>
          </div>

          <div className="mt-6 flex min-h-[36rem] justify-center overflow-auto rounded-[1.5rem] bg-zinc-900/80 p-6">
            <article className="min-h-[48rem] w-full max-w-[46rem] rounded-sm bg-white px-12 py-14 text-zinc-950 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 text-zinc-500">
                <FileText className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm">Vista previa provisional</span>
              </div>
              <h3 className="mt-10 text-4xl font-semibold tracking-tight">Documento listo para editar</h3>
              <p className="mt-5 text-lg leading-8 text-zinc-700">
                Este placeholder confirma la navegacion y la creacion local del documento. El editor Tiptap completo llega en Sprint 2.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
