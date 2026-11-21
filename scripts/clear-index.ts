/**
 * Utility script — wipes all vectors from the Upstash index.
 * Run with:  pnpm run clear-index
 *            (or: npx tsx --env-file=.env.local scripts/clear-index.ts)
 *
 * ⚠️  This is irreversible — you'll need to re-run ingest.ts afterwards.
 */

import { Index } from "@upstash/vector";

async function main() {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN in .env.local");
  }

  const vectorIndex = new Index({ url, token });

  console.log("🗑️   Resetting Upstash Vector index …");
  await vectorIndex.reset();
  console.log("✅  Index cleared. All vectors deleted.");
  console.log("    Re-run `pnpm run ingest` to repopulate.");
}

main().catch((err) => {
  console.error("\n❌  Clear failed:", err);
  process.exit(1);
});
