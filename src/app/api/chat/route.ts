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
    // For D9, calling buildSystemPrompt() without context enables the authentic
    // Sreedhareeyam Guide persona and foundational Ayurvedic consultation mode.
    const context = undefined;

    // Ensure messages array is well-formed with parts for convertToModelMessages
    const rawList: IncomingMessage[] = Array.isArray(messages) ? messages : [];

    // Sliding window: keep the last 20 messages to manage context length & free-tier tokens
    const recentMessages = rawList.slice(-20);

    // Ensure the message history starts with a user turn if possible
    const firstUserIndex = recentMessages.findIndex((m) => m.role === "user");
    const trimmedList =
      firstUserIndex !== -1 ? recentMessages.slice(firstUserIndex) : recentMessages;

    const normalizedMessages: UIMessage[] = trimmedList.map(
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
      system: buildSystemPrompt(context),
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
