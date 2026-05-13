import type { PageSize } from "@/lib/types";

const PAGE_FORMAT: Record<PageSize, string> = {
  letter: "letter",
  a4: "a4",
  legal: "legal",
};

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\n\r]/g, "").trim() || "documento";
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToPdf(
  title: string,
  pageSize: PageSize = "letter",
): Promise<void> {
  const element = document.querySelector(".ProseMirror") as HTMLElement | null;
  if (!element) throw new Error("No se encontró el contenido del documento.");

  // Clonar para no modificar el DOM real
  const clone = element.cloneNode(true) as HTMLElement;

  // Estilos base para la exportación
  clone.style.cssText = `
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #18181b;
    background: #ffffff;
    padding: 0;
    margin: 0;
  `;

  // Contenedor temporal invisible
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;left:-9999px;top:0;background:#fff;";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Import dinámico — html2pdf.js no funciona en SSR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf = (await import("html2pdf.js" as string)) as any;
    const lib = html2pdf.default ?? html2pdf;

    await lib()
      .set({
        margin: [40, 50, 40, 50],
        filename: `${sanitizeFilename(title)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: {
          unit: "pt",
          format: PAGE_FORMAT[pageSize],
          orientation: "portrait",
        },
      })
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(wrapper);
  }
}

export { triggerDownload };
