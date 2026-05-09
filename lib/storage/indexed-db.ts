import { del, get, keys, set } from "idb-keyval";
import type { Document } from "@/lib/types";

const DOCUMENT_PREFIX = "dklayout:document:";

function documentKey(id: string) {
  return `${DOCUMENT_PREFIX}${id}`;
}

export async function saveDocument(document: Document) {
  await set(documentKey(document.id), document);
}

export async function getDocument(id: string) {
  return get<Document>(documentKey(id));
}

export async function deleteDocument(id: string) {
  await del(documentKey(id));
}

export async function listDocuments() {
  const allKeys = await keys();
  const documentKeys = allKeys.filter(
    (key): key is string => typeof key === "string" && key.startsWith(DOCUMENT_PREFIX),
  );
  const documents = await Promise.all(documentKeys.map((key) => get<Document>(key)));

  return documents
    .filter((document): document is Document => Boolean(document))
    .filter((document) => document.status !== "trashed")
    .toSorted((first, second) => second.updatedAt - first.updatedAt);
}
