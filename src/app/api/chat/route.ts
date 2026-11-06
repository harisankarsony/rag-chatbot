// Phase 2 — D7 & D8: API route + streaming with Vercel AI SDK
// Accepts a conversation, converts UI messages to model messages,
// and streams a Gemini response back via createUIMessageStreamResponse().
// Model: gemini-3.5-flash-lite (free-tier default). Override via GEMINI_MODEL env var.
//
// RAG wiring (embed → vector search → context injection) is added in D15.
// For now the system prompt uses a placeholder context so the bot works as
// a general Sreedhareeyam assistant until the vector index is populated.

import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "@/lib/prompts";

// Opt out of Next.js static caching — this route streams dynamic content.
export const dynamic = "force-dynamic";

interface IncomingMessage {
  id?: string;
  role?: "system" | "user" | "assistant";
  parts?: UIMessage["parts"];
  content?: string;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // D15 will replace this with real retrieved chunks from Upstash Vector.
    const placeholderContext =
      "No context available yet. Answer based on general Ayurvedic knowledge " +
      "about Sreedhareeyam and politely note that the knowledge base is still " +
      "being set up.";

    // Ensure messages array is well-formed with parts for convertToModelMessages
    const normalizedMessages: UIMessage[] = (messages ?? []).map(
      (m: IncomingMessage): UIMessage => ({
        id: m.id || String(Date.now()),
        role: m.role || "user",
        parts:
          Array.isArray(m.parts) && m.parts.length > 0
            ? m.parts
            : [{ type: "text", text: m.content ?? "" }],
      }),
    );

    const modelMessages = await convertToModelMessages(normalizedMessages);

    const result = streamText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite"),
      system: buildSystemPrompt(placeholderContext),
      messages: modelMessages,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (err) => {
          console.error("Stream generation error:", err);
          return err instanceof Error
            ? err.message
            : "An error occurred during generation.";
        },
      }),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred in /api/chat";
    console.error("API /api/chat error:", error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
