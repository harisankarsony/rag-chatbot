/**
 * Data ingestion script — D11 · D12 · D13
 *
 * Run with:  pnpm run ingest
 *            (or: npx tsx --env-file=.env.local scripts/ingest.ts)
 *
 * Pipeline:
 *  1. Crawl https://www.sreedhareeyam.com/ with Firecrawl      (D11)
 *  2. Split each page into chunks via RecursiveCharacterTextSplitter (D12)
 *  3. Embed each chunk with Gemini text-embedding-004            (D13)
 *  4. Batch-upsert vectors + metadata into Upstash Vector        (D13)
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import Firecrawl from "@mendable/firecrawl-js";
import { Index } from "@upstash/vector";
import { GoogleGenerativeAI, type EmbedContentRequest } from "@google/generative-ai";

interface DimensionalEmbedRequest extends EmbedContentRequest {
  outputDimensionality?: number;
}

// ── Config ────────────────────────────────────────────────────────────────────
const TARGET_URL = "https://www.sreedhareeyam.com/";
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 40; // 40 chunks per batch (well within rate limits)
const CACHE_FILE = path.resolve(process.cwd(), "scripts/.cache_crawled_pages.json");

// Patterns to exclude (irrelevant/old/boilerplate content)
const EXCLUDED_PATTERNS = [
  /\/privacy-policy/i,
  /\/terms/i,
  /\/disclaimer/i,
  /\/sitemap/i,
  /\/camp/i,
  /mobile-eye-clinic/i,
  /\/gallery/i,
  /\/news/i,
  /\/events/i,
  /\/page\/\d+/i,
  /\/tag\//i,
  /\/category\//i,
  /\/author\//i,
  /\?page=/i,
];

// ── Clients ───────────────────────────────────────────────────────────────────
function getClients() {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const upstashUrl = process.env.UPSTASH_VECTOR_REST_URL;
  const upstashToken = process.env.UPSTASH_VECTOR_REST_TOKEN;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!firecrawlKey) throw new Error("Missing FIRECRAWL_API_KEY in .env.local");
  if (!upstashUrl) throw new Error("Missing UPSTASH_VECTOR_REST_URL in .env.local");
  if (!upstashToken) throw new Error("Missing UPSTASH_VECTOR_REST_TOKEN in .env.local");
  if (!googleKey) throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local");

  return {
    firecrawl: new Firecrawl({ apiKey: firecrawlKey }),
    vectorIndex: new Index({ url: upstashUrl, token: upstashToken }),
    genAI: new GoogleGenerativeAI(googleKey),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse the exact retry delay requested by Gemini API on 429, or fallback to 60s. */
function getRetryDelayMs(err: unknown): number {
  if (err instanceof Error) {
    const match =
      err.message.match(/retry in ([\d\.]+)s/i) ||
      err.message.match(/retryDelay[:\s]+'(\d+)s'/i);
    if (match) {
      const sec = Math.ceil(parseFloat(match[1]));
      return (sec + 3) * 1000; // Add 3-second safety buffer
    }
  }
  return 60 * 1000; // Default to 60s window
}

/**
 * Embed up to 50 texts in a SINGLE API call using Gemini batchEmbedContents.
 * Includes automatic retry with exact delay on 429 rate limits.
 */
async function batchEmbedTexts(
  genAI: GoogleGenerativeAI,
  texts: string[],
  maxRetries = 10
): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const requests: DimensionalEmbedRequest[] = texts.map((text) => ({
        content: { role: "user", parts: [{ text }] },
        outputDimensionality: 768,
      }));

      const result = await model.batchEmbedContents({ requests });
      return result.embeddings.map((e) => e.values);
    } catch (err: unknown) {
      const isRateLimit =
        typeof err === "object" &&
        err !== null &&
        (("status" in err && (err as { status: number }).status === 429) ||
          ("message" in err && String((err as { message: string }).message).includes("429")));

      if (!isRateLimit && attempt >= 3) {
        throw err;
      }
      if (attempt >= maxRetries) {
        throw err;
      }

      const delayMs = isRateLimit ? getRetryDelayMs(err) : Math.pow(2, attempt) * 1000;
      console.warn(
        `\n    ⏳ Per-minute rate limit (100 items/min). Pausing for ${(delayMs / 1000).toFixed(0)}s before resuming …`
      );
      await sleep(delayMs);
    }
  }
  throw new Error("Failed to batch embed texts after retries");
}

/** Clean noise, images, and nav links from scraped markdown. */
function cleanMarkdown(raw: string): string {
  return raw
    // Remove image tags: ![...](...) or [![...](...)](...)
    .replace(/\[?!\[.*?\]\(.*?\)(?:\]\(.*?\))?/g, "")
    // Remove standalone link lines (e.g. navigation items like: - [Home](...))
    .replace(/^[-*]\s+\[.*?\]\(https?:\/\/.*?\)$/gm, "")
    // Remove copyright and legal boilerplate lines
    .replace(/©\s*\d{4}.*?$/gim, "")
    .replace(/All\s+Rights\s+Reserved.*?$/gim, "")
    // Collapse excessive blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Filter out low-value chunks (navbars, pure link lists, cookie notices). */
function isValidChunk(text: string): boolean {
  const cleaned = text.trim();
  if (cleaned.length < 120) return false;

  // If >40% of the chunk is link markup, it's a menu/link list
  const linkMatches = cleaned.match(/\[.*?\]\(.*?\)/g);
  if (linkMatches) {
    const totalLinkLength = linkMatches.reduce((acc, l) => acc + l.length, 0);
    if (totalLinkLength / cleaned.length > 0.4) {
      return false;
    }
  }

  // Filter out boilerplate text
  if (/cookie policy|privacy policy|terms of use|all rights reserved/i.test(cleaned)) {
    return false;
  }

  return true;
}

/** Sleep for ms milliseconds. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Generate a unique, readable Upstash vector ID prefix from a URL. */
function urlToId(url: string): string {
  const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
  const clean = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(-35); // Keep the specific end of the path (e.g. treatment-for-glaucoma-72)
  return `${clean}_${hash}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀  Sreedhareeyam RAG Ingestion Pipeline");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const { firecrawl, vectorIndex, genAI } = getClients();

  // ── STEP 1: Crawl (or load from disk cache) ────────────────────────────────
  type ScrapedDoc = { markdown?: string; metadata?: { title?: string; url?: string } };
  let pages: ScrapedDoc[] = [];

  if (fs.existsSync(CACHE_FILE)) {
    console.log(`📂  Found cached pages at scripts/.cache_crawled_pages.json`);
    pages = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as ScrapedDoc[];
    console.log(`✅  Loaded ${pages.length} pages from cache (skipped Firecrawl crawl)\n`);
  } else {
    console.log(`📡  Crawling ${TARGET_URL} (filtering out news, camps, policies) …`);
    console.log("    (Extracting onlyMainContent to strip navbars and footers)\n");

    const crawlResult = await firecrawl.crawl(TARGET_URL, {
      limit: 120,
      excludePaths: [
        "/privacy-policy.*",
        "/terms.*",
        "/disclaimer.*",
        "/tag/.*",
        "/category/.*",
        "/author/.*",
        "/page/.*",
        ".*camp.*",
        ".*gallery.*",
        ".*news.*",
      ],
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true, // Firecrawl native: strips navbars, headers, and footers!
      },
    });

    if (crawlResult.status !== "completed" || !crawlResult.data || crawlResult.data.length === 0) {
      throw new Error(
        `Crawl failed (status: ${crawlResult.status}) or returned no pages: ${JSON.stringify(crawlResult)}`
      );
    }

    pages = crawlResult.data
      .filter((doc) => {
        if (!doc.markdown || doc.markdown.trim().length < 150) return false;
        const url = doc.metadata?.url ?? "";
        return !EXCLUDED_PATTERNS.some((pat) => pat.test(url));
      })
      .map((doc) => ({
        markdown: cleanMarkdown(doc.markdown!),
        metadata: {
          title: doc.metadata?.title,
          url: doc.metadata?.url,
        },
      }));

    // Cache locally
    fs.writeFileSync(CACHE_FILE, JSON.stringify(pages, null, 2), "utf-8");
    console.log(`✅  Crawled ${crawlResult.data.length} pages total`);
    console.log(`📄  Filtered to ${pages.length} relevant content pages\n`);
  }

  // Log sample page titles
  console.log("📋  Sample pages found:");
  pages.slice(0, 10).forEach((p) => {
    const title = p.metadata?.title ?? p.metadata?.url ?? "Untitled";
    console.log(`    • ${title}`);
  });
  if (pages.length > 10) console.log(`    … and ${pages.length - 10} more`);
  console.log();

  // ── STEP 2: Chunk ──────────────────────────────────────────────────────────
  console.log(`✂️   Chunking pages (size=${CHUNK_SIZE}, overlap=${CHUNK_OVERLAP}) …`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  type ChunkRecord = {
    id: string;
    text: string;
    source: string;
    title: string;
    chunkIndex: number;
  };

  const allChunks: ChunkRecord[] = [];

  for (const page of pages) {
    const markdown = page.markdown!;
    const source = page.metadata?.url ?? TARGET_URL;
    const title = page.metadata?.title ?? source;
    const idPrefix = urlToId(source);

    const rawChunks = await splitter.splitText(markdown);

    rawChunks.forEach((rawText, chunkIndex) => {
      const text = cleanMarkdown(rawText);
      if (isValidChunk(text)) {
        allChunks.push({
          id: `${idPrefix}__${chunkIndex}`,
          text,
          source,
          title,
          chunkIndex,
        });
      }
    });
  }

  console.log(`✅  Total chunks: ${allChunks.length}\n`);

  // Log sample chunks
  console.log("📝  Sample chunk (first chunk):");
  console.log("─".repeat(60));
  console.log(allChunks[0]?.text.slice(0, 300) + " …");
  console.log("─".repeat(60) + "\n");

  // ── STEP 3 & 4: Embed + Upsert ─────────────────────────────────────────────
  console.log(`🔢  Embedding ${allChunks.length} chunks and upserting to Upstash …`);
  console.log(`    (batch size=${BATCH_SIZE} per API call — only ~${Math.ceil(allChunks.length / BATCH_SIZE)} API requests total)\n`);

  let totalUpserted = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const chunkBatch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = chunkBatch.map((c) => c.text);

    // 1 API call embeds all chunks in this batch
    const vectors = await batchEmbedTexts(genAI, texts);

    // 1 Upstash call upserts all vectors in this batch
    const upsertBatch = chunkBatch.map((chunk, idx) => ({
      id: chunk.id,
      vector: vectors[idx],
      metadata: {
        text: chunk.text,
        source: chunk.source,
        title: chunk.title,
        chunkIndex: chunk.chunkIndex,
      },
    }));

    await vectorIndex.upsert(upsertBatch);
    totalUpserted += upsertBatch.length;
    process.stdout.write(`\r    ⬆️  Upserted ${totalUpserted} / ${allChunks.length} chunks …`);

    // Modest delay between batches
    if (i + BATCH_SIZE < allChunks.length) {
      await sleep(1500);
    }
  }

  console.log("\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎉  Ingestion complete!`);
  console.log(`    Pages crawled : ${pages.length}`);
  console.log(`    Chunks stored : ${totalUpserted}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n✅  Checkpoint: Run a test query in D14 to verify retrieval.");
}

main().catch((err) => {
  console.error("\n❌  Ingestion failed:", err);
  process.exit(1);
});
