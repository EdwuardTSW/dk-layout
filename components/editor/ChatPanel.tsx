"use client";

import { Bot, MessageCircle, PanelLeftClose, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChatPanelProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onSendMessage: (message: string) => Promise<void>;
};

const QUICK_SUGGESTIONS = [
  "Crea un formato de carta profesional",
  "Hazme una portada con titulo, autor y fecha",
  "Agrega una introduccion al documento",
  "Organiza todo el contenido con secciones claras",
  "Crea una tabla de contenidos",
];

export function ChatPanel({
  messages,
  isLoading,
  isStreaming,
  error,
  isCollapsed,
  onToggleCollapsed,
  onSendMessage,
}: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isBusy = isLoading || isStreaming;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isBusy) return;
    setMessage("");
    await onSendMessage(trimmed);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || isBusy) return;
      setMessage("");
      void onSendMessage(trimmed);
    }
  }

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="fixed bottom-16 left-24 z-40 hidden max-w-72 items-center gap-3 rounded-full border border-blue-300/30 bg-blue-500 px-4 py-3 text-left text-white shadow-2xl shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 lg:flex"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue-600">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold">Duke</span>
          <span className="block text-xs text-blue-50/90">En que te ayudo?</span>
        </span>
        <Sparkles className="h-4 w-4 text-blue-100" aria-hidden="true" />
      </button>
    );
  }

  return (
    <aside className="flex min-h-0 border-b border-white/10 bg-zinc-950/70 p-3 lg:border-b-0 lg:border-r">
      <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06] shadow-panel">

        {/* Header del panel */}
        <div className="shrink-0 border-b border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500 text-white">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold">Duke</h2>
                <p className="text-sm text-emerald-300">
                  {isBusy ? "Escribiendo..." : "En linea"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Colapsar Duke"
            >
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Dame contenido o instrucciones y estructuro tu documento.
          </p>
        </div>

        {/* Area de mensajes */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 [scrollbar-color:rgba(255,255,255,.22)_transparent] [scrollbar-width:thin]">

          {/* Chips de acciones rapidas — solo cuando el chat esta vacio */}
          {messages.length === 0 && !isBusy && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Prueba pedirle a Duke:</p>
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => { void onSendMessage(suggestion); }}
                  className="block w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2 text-left text-xs text-zinc-400 transition hover:border-blue-400/40 hover:bg-blue-400/10 hover:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Mensajes */}
          {messages.map((chatMessage, index) => {
            const isLastDuke =
              chatMessage.role === "duke" &&
              index === messages.length - 1;
            const showCursor = isLastDuke && isStreaming;

            return (
              <div
                key={chatMessage.id}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-6",
                  chatMessage.role === "user"
                    ? "ml-6 bg-white text-zinc-950"
                    : "mr-6 border border-white/10 bg-zinc-950/70 text-zinc-200",
                )}
              >
                {chatMessage.content || (showCursor ? null : "...")}
                {showCursor && (
                  <span
                    className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-blue-400 align-middle"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}

          {/* Indicador de carga (antes del primer chunk) */}
          {isLoading && (
            <div className="mr-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
              </span>
              Duke esta pensando...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="shrink-0 border-t border-white/10 p-3">
          <label htmlFor="duke-message" className="sr-only">
            Mensaje para Duke
          </label>
          <div
            className={cn(
              "flex gap-2 rounded-2xl border bg-zinc-950/70 p-2 transition",
              isBusy ? "border-blue-400/30" : "border-white/10",
            )}
          >
            <textarea
              id="duke-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={isBusy}
              className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
              placeholder={
                isBusy
                  ? "Duke esta escribiendo..."
                  : "Pidele a Duke que estructure contenido... (Enter para enviar)"
              }
            />
            <button
              type="submit"
              disabled={isBusy || !message.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-zinc-950 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Duke puede cometer errores. Verifica la informacion.
          </p>
        </form>
      </div>
    </aside>
  );
}
