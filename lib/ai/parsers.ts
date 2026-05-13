import type { DukeAction, TiptapJSON } from "@/lib/types";

type ParsedDukeResponse = {
  text: string;
  action?: DukeAction;
};

type ParsedGeneratedDocument = {
  title: string;
  content: TiptapJSON;
};

const ACTION_PATTERN = /\[ACTION\]([\s\S]*?)\[\/ACTION\]/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDukeAction(value: unknown): value is DukeAction {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.type === "insert" || value.type === "replace" || value.type === "modify" || value.type === "restructure") &&
    (!value.content || isRecord(value.content))
  );
}

function isTiptapJSON(value: unknown): value is TiptapJSON {
  return isRecord(value) && typeof value.type === "string";
}

function extractJsonObject(rawResponse: string) {
  const start = rawResponse.indexOf("{");
  const end = rawResponse.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return rawResponse;
  }

  return rawResponse.slice(start, end + 1);
}

export function parseDukeResponse(rawResponse: string): ParsedDukeResponse {
  const match = rawResponse.match(ACTION_PATTERN);

  if (!match) {
    return { text: rawResponse.trim() };
  }

  const text = rawResponse.replace(ACTION_PATTERN, "").trim();

  try {
    const parsedAction: unknown = JSON.parse(match[1].trim());

    if (!isDukeAction(parsedAction)) {
      return {
        text: text || "Duke respondio, pero la accion no tenia un formato valido.",
      };
    }

    return {
      text: text || "Listo. Prepare una accion para el documento.",
      action: parsedAction,
    };
  } catch {
    return {
      text: text || "Duke respondio, pero la accion JSON no se pudo leer.",
    };
  }
}

export function parseGeneratedDocument(rawResponse: string): ParsedGeneratedDocument | null {
  try {
    const parsed: unknown = JSON.parse(extractJsonObject(rawResponse).trim());

    if (!isRecord(parsed) || typeof parsed.title !== "string" || !isTiptapJSON(parsed.content)) {
      return null;
    }

    return {
      title: parsed.title.trim() || "Documento creado con IA",
      content: parsed.content,
    };
  } catch {
    return null;
  }
}
