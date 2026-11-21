import { GoogleGenerativeAI, type EmbedContentRequest } from "@google/generative-ai";

interface DimensionalEmbedRequest extends EmbedContentRequest {
  outputDimensionality?: number;
}

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generates a 768-dimensional embedding vector for the given text
 * using Gemini gemini-embedding-001 with outputDimensionality=768.
 */
export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const request: DimensionalEmbedRequest = {
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 768,
  };
  const result = await model.embedContent(request);
  return result?.embedding?.values;
}

export { genAI };
