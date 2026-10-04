/**
 * Data ingestion script — runs locally via: npx tsx scripts/ingest.ts
 *
 * Pipeline:
 *  1. Crawl https://www.sreedhareeyam.com/ with Firecrawl
 *  2. Split each page's markdown into chunks (RecursiveCharacterTextSplitter)
 *  3. Embed each chunk with Gemini text-embedding-004
 *  4. Upsert vectors + metadata into Upstash Vector
 *
 * TODO (Phase 3 — D11 to D13): Implement this script
 */

import "dotenv/config";

const TARGET_URL = "https://www.sreedhareeyam.com/";
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 10;

async function main() {
  console.log("🚀 Ingestion script placeholder");
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Chunk size: ${CHUNK_SIZE}, overlap: ${CHUNK_OVERLAP}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log("\n📌 Full implementation coming in Phase 3 (Days 11–13)");
}

main().catch(console.error);
