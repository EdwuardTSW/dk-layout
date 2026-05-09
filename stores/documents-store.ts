import { nanoid } from "nanoid";
import { create } from "zustand";
import { BLANK_DOCUMENT, getTemplateById } from "@/lib/templates/definitions";
import { listDocuments, saveDocument } from "@/lib/storage/indexed-db";
import type { Document, DocumentFormat, TiptapJSON } from "@/lib/types";

type DocumentsState = {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  hydrateDocuments: () => Promise<void>;
  createDocument: (input?: {
    title?: string;
    format?: DocumentFormat;
    templateId?: string;
    content?: TiptapJSON;
    prompt?: string;
  }) => Promise<Document>;
};

function countWords(content: TiptapJSON): number {
  if (content.text) {
    return content.text.trim().split(/\s+/).filter(Boolean).length;
  }

  return content.content?.reduce((total, child) => total + countWords(child), 0) ?? 0;
}

function buildInitialContent(prompt?: string, fallback?: TiptapJSON): TiptapJSON {
  if (!prompt?.trim()) {
    return fallback ?? BLANK_DOCUMENT;
  }

  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Borrador creado con IA" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: prompt.trim() }],
      },
    ],
  };
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  hydrateDocuments: async () => {
    set({ isLoading: true, error: null });

    try {
      const documents = await listDocuments();
      set({ documents, isLoading: false });
    } catch {
      set({ error: "No se pudieron cargar los documentos.", isLoading: false });
    }
  },
  createDocument: async (input) => {
    const now = Date.now();
    const template = input?.templateId ? getTemplateById(input.templateId) : undefined;
    const content = buildInitialContent(input?.prompt, input?.content ?? template?.structure);
    const title = input?.title?.trim() || template?.name || "Documento sin titulo";
    const format = input?.format ?? template?.format ?? "docx";
    const document: Document = {
      id: nanoid(),
      title,
      content,
      format,
      templateId: template?.id,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      metadata: {
        wordCount: countWords(content),
        pageCount: 1,
        language: "es",
      },
      chatHistory: [],
    };

    await saveDocument(document);
    set({ documents: [document, ...get().documents] });

    return document;
  },
}));
