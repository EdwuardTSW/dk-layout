import Groq from "groq-sdk";

let client: Groq | null = null;

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  client ??= new Groq({ apiKey });

  return client;
}

export function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}
