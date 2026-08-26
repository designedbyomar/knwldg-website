/**
 * Generates the printable QR assets for the /links hub into `public/qr/`.
 *
 *   npm run qr
 *
 * Three outputs, one payload:
 *   knwldg-links-qr.svg    plain vector, for a printer who wants scalable art
 *   knwldg-links-qr.png    plain raster at 2048px
 *   knwldg-links-card.png  the branded "SCAN TO BOOK" card for signage/stories
 *
 * Decisions that look arbitrary and are not:
 *
 * - **The payload is read out of data/contact.ts**, never retyped here. A code
 *   that has been printed cannot be re-issued, so the page and the code must
 *   not be able to drift apart. tests/links-page.test.tsx asserts they match.
 * - **Black modules on white, on every output.** Every brand stop is
 *   oklch(0.78 0.19 H) - about 2.5:1 on white, far below what a phone camera
 *   needs. Brand colour goes around the code, never in it.
 * - **No logo punched into the middle**, so error correction level M is enough
 *   and the code stays coarse - fewer, larger modules scan from further away.
 * - **A 4-module quiet zone** is part of the spec, not padding. Cropping it is
 *   the most common way a printed code stops scanning.
 * - The card is HTML rendered in headless Chrome (scripts/qr-card.html) rather
 *   than composed here, because that is what gets it real Anton and Sora.
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "qr");
const CARD_TEMPLATE = join(ROOT, "scripts", "qr-card.html");
const WORDMARK = join(ROOT, "public", "brand", "knwldg-mark-gradient.svg");

const HEADLINE = "Scan to book";
const TAGLINE = "Open-format DJ · CT · NYC Metro · Northeast";

/**
 * Level M plus a full quiet zone. See the header for why neither moves.
 * Exported so tests/links-page.test.tsx can re-derive the committed SVG and
 * catch an asset that was never regenerated after the URL changed.
 */
export const QR_OPTIONS = {
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: "#000000ff", light: "#ffffffff" },
};

const CARD = { width: 1080, height: 1350, scale: 2 };

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

/**
 * The single source of truth for what the code encodes. Parsed rather than
 * imported because this is plain Node and contact.ts is TypeScript.
 */
export function readLinksUrl(root = ROOT) {
  const source = readFileSync(join(root, "data", "contact.ts"), "utf8");
  const match = source.match(/linksUrl:\s*"([^"]+)"/);
  if (!match) {
    throw new Error(
      "data/contact.ts no longer exports a linksUrl string literal",
    );
  }
  return match[1];
}

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      execFileSync(candidate, ["--version"], { stdio: "ignore" });
      return candidate;
    } catch {
      // Try the next one. Chrome is only needed for the card.
    }
  }
  return null;
}

/**
 * Renders the branded card. Returns false rather than throwing when no Chrome
 * is installed: the plain code is the load-bearing artefact, and a machine
 * without a browser should still be able to regenerate it.
 */
async function renderCard(url, outFile, log) {
  const chrome = findChrome();
  if (!chrome) {
    log(`  card    skipped - no Chrome found (set CHROME_PATH)`);
    return false;
  }

  const qrSvg = await QRCode.toString(url, {
    ...QR_OPTIONS,
    type: "svg",
    width: 620,
  });
  const wordmark = readFileSync(WORDMARK).toString("base64");
  const printed = url.replace(/^https?:\/\//, "");

  const html = readFileSync(CARD_TEMPLATE, "utf8")
    .replace("__WORDMARK__", `data:image/svg+xml;base64,${wordmark}`)
    .replace("__HEADLINE__", HEADLINE)
    .replace("__QR__", qrSvg)
    .replace("__CAPTION__", printed)
    .replace("__TAGLINE__", TAGLINE);

  const stage = mkdtempSync(join(tmpdir(), "knwldg-qr-card-"));
  try {
    const page = join(stage, "card.html");
    writeFileSync(page, html);
    execFileSync(
      chrome,
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--default-background-color=00000000",
        `--force-device-scale-factor=${CARD.scale}`,
        `--window-size=${CARD.width},${CARD.height}`,
        // Google Fonts has to land before the shot, or the card renders in a
        // system fallback and no one notices until it is printed.
        "--virtual-time-budget=10000",
        `--screenshot=${outFile}`,
        `file://${page}`,
      ],
      { stdio: "ignore" },
    );
    return true;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

export async function generateQr({ outDir = OUT_DIR, quiet = false } = {}) {
  const log = quiet ? () => {} : (line) => process.stdout.write(`${line}\n`);
  const url = readLinksUrl();

  mkdirSync(outDir, { recursive: true });
  log(`\n  payload ${url}\n`);

  const svgFile = join(outDir, "knwldg-links-qr.svg");
  const pngFile = join(outDir, "knwldg-links-qr.png");
  const cardFile = join(outDir, "knwldg-links-card.png");

  writeFileSync(
    svgFile,
    await QRCode.toString(url, { ...QR_OPTIONS, type: "svg" }),
  );
  log(`  svg     ${svgFile}`);

  await QRCode.toFile(pngFile, url, {
    ...QR_OPTIONS,
    type: "png",
    width: 2048,
  });
  log(`  png     ${pngFile}`);

  const card = await renderCard(url, cardFile, log);
  if (card) log(`  card    ${cardFile}`);

  return { url, svgFile, pngFile, cardFile: card ? cardFile : null };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await generateQr();
}
