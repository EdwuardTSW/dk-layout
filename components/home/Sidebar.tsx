"use client";

import Link from "next/link";
import {
  Archive,
  Crown,
  FileText,
  FolderKanban,
  History,
  Home,
  LayoutTemplate,
  Presentation,
  ScrollText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { label: "Inicio", href: "/", icon: Home, active: true },
  { label: "Documentos", href: "/documents", icon: FileText },
  { label: "Plantillas", href: "/templates", icon: LayoutTemplate },
  { label: "Proyectos", href: "#", icon: FolderKanban, disabled: true },
  { label: "Historial", href: "#", icon: History, disabled: true },
  { label: "Papelera", href: "#", icon: Trash2, disabled: true },
];

const formatItems = [
  { label: "Documento", icon: FileText, meta: "DOCX" },
  { label: "PDF", icon: Archive, meta: "PDF" },
  { label: "Informe", icon: ScrollText, meta: "Pronto", disabled: true },
  { label: "Presentacion", icon: Presentation, meta: "Pronto", disabled: true },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-zinc-950/70 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
      <Link href="/" className="group flex items-center gap-3" aria-label="DkLayout inicio">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-zinc-950 shadow-lg shadow-blue-950/40">
          <span className="text-lg font-black tracking-tighter">Dk</span>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">DkLayout</p>
          <p className="text-xs text-zinc-500">Documentos con Duke</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1" aria-label="Navegacion principal">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                item.active
                  ? "bg-white text-zinc-950 shadow-lg shadow-white/5"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
                item.disabled && "pointer-events-none opacity-50",
              )}
              aria-disabled={item.disabled ? "true" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
          Formatos
        </p>
        <div className="mt-3 space-y-1">
          {formatItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm text-zinc-300",
                  item.disabled ? "opacity-50" : "bg-white/[0.03]",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                  {item.meta}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-zinc-950">
            <Crown className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Plan Free</p>
            <p className="text-xs text-emerald-100/70">Fase 1 local</p>
          </div>
        </div>
        <button className="mt-4 w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
          Actualizar luego
        </button>
      </div>
    </aside>
  );
}
