// Next.js 16 removed the "First Load JS" metric from `next build` output (deemed
// inaccurate for RSC architectures — see the v16 upgrade guide). This is a coarse
// stand-in: total gzipped size of shipped client JS, checked against a budget.
// For real Core Web Vitals data, use Lighthouse or Vercel Analytics instead.
import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 350 * 1024; // 350KB gzipped, starting budget — raise deliberately as features land
const CHUNKS_GLOB = ".next/static/chunks/**/*.js";

let totalBytes = 0;
for await (const file of glob(CHUNKS_GLOB)) {
  totalBytes += gzipSync(readFileSync(file)).length;
}

const totalKB = (totalBytes / 1024).toFixed(1);
const budgetKB = (BUDGET_BYTES / 1024).toFixed(0);

if (totalBytes > BUDGET_BYTES) {
  console.error(`Bundle size ${totalKB}KB (gzipped) exceeds budget of ${budgetKB}KB.`);
  process.exit(1);
}

console.log(`Bundle size OK: ${totalKB}KB (gzipped) / ${budgetKB}KB budget.`);
