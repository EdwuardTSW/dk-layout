"use client";

import { Image as ImageIcon, Link, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

type ImageUploadModalProps = {
  onInsert: (src: string, alt?: string) => void;
  onClose: () => void;
};

type Tab = "upload" | "url";

export function ImageUploadModal({ onInsert, onClose }: ImageUploadModalProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInsert() {
    setError(null);
    if (tab === "upload" && preview) {
      onInsert(preview, alt || undefined);
    } else if (tab === "url" && url.trim()) {
      onInsert(url.trim(), alt || undefined);
    } else {
      setError(tab === "upload" ? "Selecciona una imagen primero." : "Ingresa una URL valida.");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-zinc-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-panel animate-[panel-in_200ms_ease-out]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
              <h2 className="font-semibold text-white">Insertar imagen</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(["upload", "url"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); }}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                  tab === t
                    ? "border-b-2 border-blue-400 text-blue-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "upload" ? <Upload className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                {t === "upload" ? "Subir archivo" : "Desde URL"}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            {tab === "upload" ? (
              <>
                {/* Zona de drop */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition ${
                    isDragging
                      ? "border-blue-400 bg-blue-400/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-40 rounded-xl object-contain" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-zinc-500" aria-hidden="true" />
                      <div className="text-center">
                        <p className="text-sm text-zinc-300">Arrastra una imagen o haz clic</p>
                        <p className="mt-1 text-xs text-zinc-600">PNG, JPG, GIF, WebP — max 5 MB</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>
                {preview && (
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Cambiar imagen
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">URL de la imagen</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.png"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
                  autoFocus
                />
              </div>
            )}

            {/* Texto alternativo */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400">Texto alternativo (opcional)</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Descripcion de la imagen"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/60"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInsert}
                className="flex-1 rounded-full bg-white py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-blue-50"
              >
                Insertar imagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
