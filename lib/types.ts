export type DocumentFormat = "docx" | "pdf" | "report" | "presentation";

export type PageSize = "letter" | "a4" | "legal";

export type DocumentStatus = "draft" | "completed" | "trashed";

export type TemplateCategory =
  | "academic"
  | "business"
  | "school"
  | "professional"
  | "custom";

export type TiptapJSON = {
  type: string;
  content?: TiptapJSON[];
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

export type DukeAction = {
  type: "insert" | "replace" | "modify" | "restructure";
  target?: string;
  position?: "cursor" | "end" | "start" | string;
  content?: TiptapJSON;
};

export type ChatMessage = {
  id: string;
  role: "user" | "duke";
  content: string;
  timestamp: number;
  action?: DukeAction;
};

export type DocumentMetadata = {
  wordCount: number;
  pageCount: number;
  language: "es" | "en";
};

export type DocumentPageSetup = {
  size: PageSize;
};

export type Document = {
  id: string;
  title: string;
  content: TiptapJSON;
  format: DocumentFormat;
  templateId?: string;
  status: DocumentStatus;
  createdAt: number;
  updatedAt: number;
  metadata: DocumentMetadata;
  pageSetup?: DocumentPageSetup;
  chatHistory: ChatMessage[];
};

export type Template = {
  id: string;
  name: string;
  description: string;
  icon: string;
  format: DocumentFormat;
  category: TemplateCategory;
  isCustom: boolean;
  isComingSoon: boolean;
  structure: TiptapJSON;
  thumbnailColor: string;
};

export type User = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark";
    language: "es" | "en";
  };
};
