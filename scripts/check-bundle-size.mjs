// Next.js 16 removed the "First Load JS" metric from `next build` output (deemed
// inaccurate for RSC architectures — see the v16 upgrade guide). This is a coarse
// stand-in: total gzipped size of shipped client JS, checked against a budget.
// For real Core Web Vitals data, use Lighthouse or Vercel Analytics instead.
import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { gzipSync } from "node:zlib";

// 460KB gzipped — raised from the original 350KB starting budget in Story 10
// after posthog-js's session-recording engine (rrweb) pushed real usage to
// ~422KB; rrweb alone accounts for ~260KB of shipped JS. Verified this is
// real feature cost, not accidental bloat, before raising: rest of the app
// is lean. Raise deliberately as features land — don't bump reflexively.
const BUDGET_BYTES = 460 * 1024;
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
