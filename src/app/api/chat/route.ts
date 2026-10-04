// TODO (Phase 2 — D7): Implement the RAG chat API route
// This route will:
//  1. Extract the latest user message from the conversation
//  2. Embed it using Gemini text-embedding-004 (via src/lib/gemini.ts)
//  3. Query Upstash Vector for top-5 similar chunks (via src/lib/upstash.ts)
//  4. Assemble a system prompt with retrieved context (via src/lib/prompts.ts)
//  5. Call Gemini 2.0 Flash via Vercel AI SDK streamText()
//  6. Return the streaming response

export async function POST(request: Request) {
  // Placeholder — returns mock streaming response for Phase 1 UI testing
  const { messages } = await request.json();
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  const mockReply = `Echo (mock): "${lastMessage}"\n\n_RAG integration coming in Phase 2._`;

  return new Response(mockReply, {
    headers: { "Content-Type": "text/plain" },
  });
}
