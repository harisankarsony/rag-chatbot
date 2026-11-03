// Phase 2 — D7: API route + streaming
// Accepts a conversation, streams a Gemini response back via Vercel AI SDK.
//
// RAG wiring (embed → vector search → context injection) is added in D15.
// For now the system prompt uses a placeholder context so the bot works as
// a general Sreedhareeyam assistant until the vector index is populated.

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/lib/prompts";

// Opt out of Next.js static caching — this route streams dynamic content.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { messages } = await request.json();

  // D15 will replace this with real retrieved chunks from Upstash Vector.
  const placeholderContext =
    "No context available yet. Answer based on general Ayurvedic knowledge " +
    "about Sreedhareeyam and politely note that the knowledge base is still " +
    "being set up.";

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: buildSystemPrompt(placeholderContext),
    messages,
  });

  return result.toTextStreamResponse();
}
