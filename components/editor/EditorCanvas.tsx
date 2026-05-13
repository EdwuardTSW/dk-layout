"use client";

import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { tiptapExtensions } from "@/lib/tiptap/extensions";
import type { PageSize, TiptapJSON } from "@/lib/types";

type EditorCanvasProps = {
  content: TiptapJSON;
  wordCount: number;
  pageSize: PageSize;
  onChange: (content: TiptapJSON) => void;
  onEditorReady: (editor: Editor | null) => void;
};

function estimatePageCount(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 430));
}

const pageSizeLabels: Record<PageSize, string> = {
  letter: "8.5 x 11 in",
  a4: "210 x 297 mm",
  legal: "8.5 x 14 in",
};

export function EditorCanvas({ content, wordCount, pageSize, onChange, onEditorReady }: EditorCanvasProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-full w-full flex-1 text-zinc-950 outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON() as TiptapJSON);
    },
  });

  useEffect(() => {
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  return (
    <div className="editor-workspace">
      <div className="editor-workspace-topbar">
        <span>Documento carta</span>
        <span>{estimatePageCount(wordCount)} pag. aprox.</span>
        <span>Scroll interno</span>
      </div>
      <div className={`document-preview-stack document-size-${pageSize}`}>
        <div className="document-page-meta">
          <span>Pagina 1</span>
          <span>{pageSizeLabels[pageSize]}</span>
        </div>
        <div className="document-page-shell" aria-label="Pagina del documento">
          {editor ? (
            <EditorContent editor={editor} className="tiptap-editor-content" />
          ) : (
            <div className="document-page-loading">Preparando pagina...</div>
          )}
        </div>
      </div>
    </div>
  );
}
