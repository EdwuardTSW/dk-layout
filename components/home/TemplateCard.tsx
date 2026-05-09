"use client";

import { BarChart3, BookOpen, FileStack, FlaskConical, GraduationCap, PenLine, Presentation } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { Template } from "@/lib/types";

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  BarChart3,
  BookOpen,
  FileStack,
  FlaskConical,
  GraduationCap,
  PenLine,
  Presentation,
};

type TemplateCardProps = {
  template: Template;
  onSelect: (template: Template) => void;
};

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon = icons[template.icon] ?? FileStack;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      disabled={template.isComingSoon}
      className="group min-w-64 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 text-left shadow-panel transition hover:-translate-y-1 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      <div
        className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg transition group-hover:scale-105"
        style={{ backgroundColor: template.thumbnailColor }}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{template.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-400">{template.description}</p>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          {template.isComingSoon ? "Beta" : template.format}
        </span>
      </div>
    </button>
  );
}
