import { Index } from "@upstash/vector";

const url = process.env.UPSTASH_VECTOR_REST_URL;
const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

if (!url || !token) {
  throw new Error(
    "UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN must be set"
  );
}

/**
 * Upstash Vector index client.
 * Metadata shape: { text, source, title, chunkIndex }
 */
export const vectorIndex = new Index({
  url,
  token,
});
