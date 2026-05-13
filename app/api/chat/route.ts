import { getGroqClient, getGroqModel } from "@/lib/ai/groq-client";
import { DUKE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: ChatMessage[];
  documentContext?: string;
};

function normalizeMessages(messages: ChatMessage[] = []) {
  return messages.slice(-16).map((message) => ({
    role: message.role === "duke" ? "assistant" as const : "user" as const,
    content: message.content,
  }));
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = await request.json() as ChatRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON invalido." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!body.messages?.length) {
    return new Response(
      JSON.stringify({ error: "Debes enviar al menos un mensaje." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let groq: ReturnType<typeof getGroqClient>;
  try {
    groq = getGroqClient();
  } catch {
    return new Response(
      JSON.stringify({ error: "Falta configurar GROQ_API_KEY en .env.local." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const stream = await groq.chat.completions.create({
      model: getGroqModel(),
      temperature: 0.2,
      max_tokens: 4096,
      stream: true,
      messages: [
        { role: "system", content: DUKE_SYSTEM_PROMPT },
        {
          role: "system",
          content: `Contexto del documento actual:\n${body.documentContext || "Documento sin contexto disponible."}`,
        },
        ...normalizeMessages(body.messages),
      ],
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (streamError) {
          // Enviar señal de error en el stream para que el cliente lo detecte
          controller.enqueue(
            new TextEncoder().encode("\n[STREAM_ERROR]No se pudo completar la respuesta.[/STREAM_ERROR]"),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "No se pudo contactar a Duke.";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
