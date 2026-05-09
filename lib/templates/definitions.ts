import type { Template, TiptapJSON } from "@/lib/types";

function paragraph(text: string): TiptapJSON {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function heading(level: number, text: string): TiptapJSON {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function doc(content: TiptapJSON[]): TiptapJSON {
  return { type: "doc", content };
}

export const BLANK_DOCUMENT: TiptapJSON = doc([
  heading(1, "Documento sin titulo"),
  paragraph("Empieza a escribir o pidele a Duke que estructure tu informacion."),
]);

export const PREDEFINED_TEMPLATES: Template[] = [
  {
    id: "academic-report",
    name: "Informe academico",
    description: "Estructura profesional para trabajos universitarios y de investigacion.",
    icon: "BookOpen",
    format: "docx",
    category: "academic",
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: "#3b82f6",
    structure: doc([
      heading(1, "Titulo del informe academico"),
      paragraph("Autor, curso, docente e institucion."),
      heading(2, "Introduccion"),
      paragraph("Presenta el tema, contexto y objetivo del informe."),
      heading(2, "Desarrollo"),
      paragraph("Organiza los argumentos, fuentes y hallazgos principales."),
      heading(2, "Conclusion"),
      paragraph("Resume los aprendizajes y resultados finales."),
      heading(2, "Referencias"),
      paragraph("Agrega las fuentes usadas con el formato solicitado."),
    ]),
  },
  {
    id: "school-work",
    name: "Trabajo escolar",
    description: "Formato claro para tareas, monografias y entregas escolares.",
    icon: "GraduationCap",
    format: "docx",
    category: "school",
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: "#10b981",
    structure: doc([
      heading(1, "Trabajo escolar"),
      paragraph("Nombre, grado, materia y fecha."),
      heading(2, "Objetivos"),
      paragraph("Define que busca demostrar o explicar este trabajo."),
      heading(2, "Contenido"),
      paragraph("Desarrolla la informacion principal de forma ordenada."),
      heading(2, "Conclusiones"),
      paragraph("Cierra con ideas finales y aprendizajes."),
    ]),
  },
  {
    id: "essay",
    name: "Ensayo",
    description: "Estructura limpia para argumentar, analizar y concluir.",
    icon: "PenLine",
    format: "docx",
    category: "academic",
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: "#a855f7",
    structure: doc([
      heading(1, "Titulo del ensayo"),
      heading(2, "Introduccion"),
      paragraph("Presenta la tesis y el enfoque del texto."),
      heading(2, "Argumentos"),
      paragraph("Desarrolla tus ideas con evidencia y transiciones claras."),
      heading(2, "Conclusion"),
      paragraph("Retoma la tesis y cierra con una reflexion final."),
    ]),
  },
  {
    id: "lab-report",
    name: "Informe de laboratorio",
    description: "Ideal para procedimiento, resultados y analisis cientifico.",
    icon: "FlaskConical",
    format: "docx",
    category: "academic",
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: "#eab308",
    structure: doc([
      heading(1, "Informe de laboratorio"),
      heading(2, "Objetivo"),
      paragraph("Describe el proposito de la practica."),
      heading(2, "Materiales"),
      paragraph("Lista los materiales, reactivos o equipos utilizados."),
      heading(2, "Procedimiento"),
      paragraph("Explica los pasos realizados de forma reproducible."),
      heading(2, "Resultados"),
      paragraph("Presenta observaciones, tablas o datos obtenidos."),
      heading(2, "Conclusion"),
      paragraph("Interpreta los resultados y responde al objetivo."),
    ]),
  },
  {
    id: "professional-report",
    name: "Reporte profesional",
    description: "Informe ejecutivo para analisis, decisiones y recomendaciones.",
    icon: "BarChart3",
    format: "pdf",
    category: "professional",
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: "#ef4444",
    structure: doc([
      heading(1, "Reporte profesional"),
      heading(2, "Resumen ejecutivo"),
      paragraph("Sintetiza el problema, hallazgos y recomendacion principal."),
      heading(2, "Analisis"),
      paragraph("Organiza datos, contexto y criterios de evaluacion."),
      heading(2, "Recomendaciones"),
      paragraph("Propone acciones concretas y siguientes pasos."),
    ]),
  },
  {
    id: "report-beta",
    name: "Informe",
    description: "Proximamente",
    icon: "FileStack",
    format: "report",
    category: "professional",
    isCustom: false,
    isComingSoon: true,
    thumbnailColor: "#22c55e",
    structure: doc([]),
  },
  {
    id: "presentation-beta",
    name: "Presentacion",
    description: "Proximamente",
    icon: "Presentation",
    format: "presentation",
    category: "professional",
    isCustom: false,
    isComingSoon: true,
    thumbnailColor: "#f97316",
    structure: doc([]),
  },
];

export function getTemplateById(templateId: string) {
  return PREDEFINED_TEMPLATES.find((template) => template.id === templateId);
}
