"use client";

import type { Editor } from "@tiptap/react";
import { FileText, Home, ImagePlus, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/editor/ChatPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorStatusBar } from "@/components/editor/EditorStatusBar";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { ImageUploadModal } from "@/components/editor/ImageUploadModal";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getDocument, saveDocument } from "@/lib/storage/indexed-db";
import type { ChatMessage, Document, DukeAction, PageSize, TiptapJSON } from "@/lib/types";
import { cn } from "@/lib/utils";

type EditorScreenProps = {
  documentId: string;
};

type SaveStatus = "saved" | "saving" | "dirty";

function countWords(content: TiptapJSON): number {
  if (content.text) {
    return content.text.trim().split(/\s+/).filter(Boolean).length;
  }

  return content.content?.reduce((total, child) => total + countWords(child), 0) ?? 0;
}

function updateDocumentContent(document: Document, content: TiptapJSON): Document {
  return {
    ...document,
    content,
    updatedAt: Date.now(),
    metadata: {
      ...document.metadata,
      wordCount: countWords(content),
    },
  };
}

function createId() {
  return globalThis.crypto?.randomUUID() ?? `${Date.now()}-${Math.random()}`;
}

function extractText(content: TiptapJSON): string {
  if (content.text) {
    return content.text;
  }

  return content.content?.map(extractText).filter(Boolean).join(" ") ?? "";
}

function buildDocumentContext(document: Document) {
  const text = extractText(document.content).replace(/\s+/g, " ").trim();

  // Texto plano para referencias rápidas
  let contextText: string;
  if (text.length > 2000) {
    contextText = `${text.slice(0, 1000)}\n[...]\n${text.slice(-1000)}`;
  } else {
    contextText = text || "Documento vacio.";
  }

  // JSON completo para que Duke pueda reconstruir el documento al hacer replace
  const jsonStr = JSON.stringify(document.content);
  const jsonContext = jsonStr.length > 8000
    ? jsonStr.slice(0, 8000) + "... (truncado)"
    : jsonStr;

  return [
    `Titulo: ${document.title}`,
    `Formato: ${document.format}`,
    `Pagina: ${document.pageSetup?.size ?? "letter"}`,
    `Palabras: ${document.metadata.wordCount}`,
    `--- Contenido (texto plano) ---`,
    contextText,
    `--- Estructura JSON actual (usa esto para reconstruir el documento en acciones replace) ---`,
    jsonContext,
  ].join("\n");
}

const toolItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "#document", label: "Documento", icon: FileText },
  { href: "#upload", label: "Subir archivo", icon: ImagePlus, disabled: true },
  { href: "#trash", label: "Eliminar", icon: Trash2, disabled: true },
  { href: "#settings", label: "Ajustes", icon: Settings, disabled: true },
];

export function EditorScreen({ documentId }: EditorScreenProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const handleEditorReady = useCallback((e: Editor | null) => setEditor(e), []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dukeError, setDukeError] = useState<string | null>(null);
  const [isDukeLoading, setIsDukeLoading] = useState(false);
  const [isDukeStreaming, setIsDukeStreaming] = useState(false);
  const [isDukeCollapsed, setIsDukeCollapsed] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const saveVersion = useRef(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      setIsLoading(true);
      setError(null);

      try {
        const storedDocument = await getDocument(documentId);

        if (!isMounted) {
          return;
        }

        if (!storedDocument) {
          setError("No se encontro este documento local.");
          setDocument(null);
          return;
        }

        setDocument(storedDocument);
        saveVersion.current = 0;
        setSaveStatus("saved");
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el documento.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  useEffect(() => {
    if (!document || saveStatus !== "dirty") {
      return;
    }

    const versionToSave = saveVersion.current;

    const timeout = window.setTimeout(async () => {
      setSaveStatus("saving");

      try {
        await saveDocument(document);
        if (saveVersion.current === versionToSave) {
          setSaveStatus("saved");
          setError(null);
        }
      } catch {
        if (saveVersion.current === versionToSave) {
          setSaveStatus("dirty");
        }
        setError("No se pudieron guardar los cambios.");
      }
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [document, saveStatus]);

  function handleContentChange(content: TiptapJSON) {
    saveVersion.current += 1;
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      return updateDocumentContent(currentDocument, content);
    });
    setSaveStatus("dirty");
  }

  function handleTitleChange(title: string) {
    saveVersion.current += 1;
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      return {
        ...currentDocument,
        title,
        updatedAt: Date.now(),
      };
    });
    setSaveStatus("dirty");
  }

  function handlePageSizeChange(size: PageSize) {
    saveVersion.current += 1;
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      return {
        ...currentDocument,
        pageSetup: { size },
        updatedAt: Date.now(),
      };
    });
    setSaveStatus("dirty");
  }

  function updateChatHistory(chatHistory: ChatMessage[]) {
    saveVersion.current += 1;
    setDocument((currentDocument) => {
      if (!currentDocument) return currentDocument;
      return { ...currentDocument, chatHistory, updatedAt: Date.now() };
    });
    setSaveStatus("dirty");
  }

  // Actualiza solo el contenido de un mensaje de Duke por su ID (para streaming)
  function patchDukeMessage(messageId: string, content: string, action?: DukeAction) {
    saveVersion.current += 1;
    setDocument((currentDocument) => {
      if (!currentDocument) return currentDocument;
      const chatHistory = currentDocument.chatHistory.map((msg) =>
        msg.id === messageId ? { ...msg, content, ...(action ? { action } : {}) } : msg,
      );
      return { ...currentDocument, chatHistory, updatedAt: Date.now() };
    });
    setSaveStatus("dirty");
  }

  function applyDukeAction(action?: DukeAction) {
    if (!action?.content || !editor) {
      return;
    }

    if (action.type === "replace" || action.type === "restructure" || action.type === "modify") {
      editor.commands.setContent(action.content);
      return;
    }

    const contentToInsert = action.content.type === "doc" ? action.content.content ?? [] : action.content;

    if (!contentToInsert || (Array.isArray(contentToInsert) && contentToInsert.length === 0)) {
      return;
    }

    if (action.position === "start") {
      editor.chain().focus().insertContentAt(0, contentToInsert).run();
      return;
    }

    if (action.position === "end") {
      editor.chain().focus().insertContentAt(editor.state.doc.content.size, contentToInsert).run();
      return;
    }

    editor.chain().focus().insertContent(contentToInsert).run();
  }

  async function handleSendDukeMessage(message: string) {
    if (!document) return;

    // 1. Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    const nextMessages = [...document.chatHistory, userMessage];

    // 2. Agregar placeholder vacío de Duke (se irá llenando con el stream)
    const dukeMessageId = createId();
    const dukePlaceholder: ChatMessage = {
      id: dukeMessageId,
      role: "duke",
      content: "",
      timestamp: Date.now(),
    };
    updateChatHistory([...nextMessages, dukePlaceholder]);
    setDukeError(null);
    setIsDukeLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          documentContext: buildDocumentContext(document),
        }),
      });

      // Si la respuesta no es stream (error JSON del servidor)
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || contentType.includes("application/json")) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || "No se pudo contactar a Duke.");
      }

      if (!response.body) throw new Error("El servidor no devolvio stream.");

      // 3. Leer el stream chunk a chunk
      setIsDukeLoading(false);
      setIsDukeStreaming(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });

        // Detectar error embebido en el stream
        if (fullText.includes("[STREAM_ERROR]")) {
          const errorMatch = fullText.match(/\[STREAM_ERROR\]([\s\S]*?)\[\/STREAM_ERROR\]/);
          throw new Error(errorMatch?.[1] ?? "Error durante la respuesta de Duke.");
        }

        // Mostrar solo el texto visible (ocultar el bloque [ACTION] mientras llega)
        const visibleText = fullText
          .replace(/\[ACTION\][\s\S]*/i, "")
          .trim();

        patchDukeMessage(dukeMessageId, visibleText || "…");
      }

      // 4. Stream terminado — parsear respuesta completa
      const { parseDukeResponse } = await import("@/lib/ai/parsers");
      const parsed = parseDukeResponse(fullText);

      patchDukeMessage(dukeMessageId, parsed.text || "Listo.", parsed.action);
      applyDukeAction(parsed.action);
    } catch (chatError) {
      const errorMsg = chatError instanceof Error ? chatError.message : "No se pudo contactar a Duke.";
      patchDukeMessage(dukeMessageId, "");
      setDukeError(errorMsg);
    } finally {
      setIsDukeLoading(false);
      setIsDukeStreaming(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-sm text-zinc-300 shadow-panel">
          Cargando documento...
        </div>
      </main>
    );
  }

  if (error && !document) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-center text-white">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-panel">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <FileText className="h-7 w-7 text-zinc-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">Documento no disponible</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{error}</p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Crear nuevo
            </Link>
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Ver mis documentos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <EditorHeader
        title={document.title}
        saveStatus={saveStatus}
        content={document.content}
        pageSize={document.pageSetup?.size ?? "letter"}
        onTitleChange={handleTitleChange}
      />

      <div
        className={cn(
          "grid min-h-0 flex-1",
          isDukeCollapsed
            ? "lg:grid-cols-[4.75rem_minmax(0,1fr)]"
            : "lg:grid-cols-[4.75rem_21rem_minmax(0,1fr)]",
        )}
      >
        <aside className="hidden min-h-0 border-r border-white/10 bg-zinc-950/80 px-3 py-4 lg:flex lg:flex-col lg:items-center">
          <nav className="flex flex-col gap-2" aria-label="Herramientas del editor">
            {toolItems.map((item) => {
              const Icon = item.icon;
              const className = "grid h-11 w-11 place-items-center rounded-2xl border border-white/10 text-zinc-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

              if (item.disabled) {
                return (
                  <span key={item.label} className={`${className} cursor-not-allowed opacity-40`} title={`${item.label} pronto`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                );
              }

              return (
                <Link key={item.label} href={item.href} className={className} aria-label={item.label}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto">
            <UserAvatar />
          </div>
        </aside>

        <ChatPanel
          messages={document.chatHistory}
          isLoading={isDukeLoading}
          isStreaming={isDukeStreaming}
          error={dukeError ?? error}
          isCollapsed={isDukeCollapsed}
          onToggleCollapsed={() => setIsDukeCollapsed((current) => !current)}
          onSendMessage={handleSendDukeMessage}
        />

        <section id="document" className="flex min-h-0 min-w-0 flex-col">
          <EditorToolbar
            editor={editor}
            pageSize={document.pageSetup?.size ?? "letter"}
            onPageSizeChange={handlePageSizeChange}
            onInsertImage={() => setShowImageModal(true)}
          />
          <EditorCanvas
            key={document.id}
            content={document.content}
            wordCount={document.metadata.wordCount}
            pageSize={document.pageSetup?.size ?? "letter"}
            onChange={handleContentChange}
            onEditorReady={handleEditorReady}
          />
          <EditorStatusBar
            wordCount={document.metadata.wordCount}
            format={document.format}
            updatedAt={document.updatedAt}
            pageSize={document.pageSetup?.size ?? "letter"}
          />
        </section>
      </div>
      </div>

      {showImageModal && (
        <ImageUploadModal
          onInsert={(src, alt) => {
            editor?.chain().focus().setImage({ src, alt: alt ?? "" }).run();
            setShowImageModal(false);
          }}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </main>
  );
}
