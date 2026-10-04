/**
 * Builds the system prompt injected into every Gemini request.
 * The context string is assembled from Upstash Vector query results.
 */
export function buildSystemPrompt(context: string): string {
  return `You are a helpful assistant for Sreedhareeyam Ayurvedic Medical College & Research Centre.
You answer questions based strictly on the provided context from the Sreedhareeyam website.

RULES:
- Only answer using information found in the CONTEXT below.
- If the context doesn't contain enough information to answer the question, say: "I don't have specific information about that. Please contact Sreedhareeyam directly at their website or phone."
- Keep answers clear, helpful, and concise.
- Format your responses using markdown where appropriate (bullet lists, bold text, etc.).
- Do not make up information or use knowledge outside of the provided context.

CONTEXT:
${context}`;
}

/**
 * Formats retrieved vector chunks into a single context string.
 */
export function formatContext(
  chunks: Array<{ text: string; source: string; title: string }>
): string {
  return chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: ${chunk.title} — ${chunk.source}]\n${chunk.text}`
    )
    .join("\n\n---\n\n");
}
