import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { FontSize } from "@/lib/tiptap/font-size";

export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    // Strike ya viene en StarterKit
  }),

  // Formato de texto
  Underline,
  TextStyle,
  Color,
  FontFamily,
  FontSize,
  Superscript,
  Subscript,
  Highlight.configure({ multicolor: true }),

  // Alineación
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),

  // Enlace
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),

  // Imagen
  Image.configure({
    inline: false,
    allowBase64: true,
  }),

  // Tablas
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,

  // Utilidades
  Placeholder.configure({
    placeholder: "Empieza a escribir o pidele a Duke que estructure tu informacion...",
  }),
  CharacterCount,
];
