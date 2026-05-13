import { NextResponse } from "next/server";
import { getGroqClient, getGroqModel } from "@/lib/ai/groq-client";
import { parseGeneratedDocument } from "@/lib/ai/parsers";
import { GENERATE_DOCUMENT_PROMPT } from "@/lib/ai/prompts";
import type { DocumentFormat } from "@/lib/types";

export const runtime = "nodejs";

type GenerateRequestBody = {
  prompt?: string;
  format?: DocumentFormat;
};

export async function POST(request: Request) {
  let body: GenerateRequestBody;

  try {
    body = await request.json() as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "Debes escribir que documento quieres crear." }, { status: 400 });
  }

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: getGroqModel(),
      temperature: 0.2,
      max_tokens: 2400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GENERATE_DOCUMENT_PROMPT },
        {
          role: "user",
          content: `Formato solicitado: ${body.format ?? "docx"}\nPeticion del usuario:\n${prompt}`,
        },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim();

    if (!rawResponse) {
      return NextResponse.json({ error: "Duke no devolvio contenido." }, { status: 502 });
    }

    const generated = parseGeneratedDocument(rawResponse);

    if (!generated) {
      return NextResponse.json({ error: "Duke devolvio un documento invalido." }, { status: 502 });
    }

    return NextResponse.json(generated);
  } catch (error) {
    const message = error instanceof Error && error.message === "GROQ_API_KEY is not configured"
      ? "Falta configurar GROQ_API_KEY en .env.local."
      : "No se pudo generar el documento con Duke.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
