/**
 * Transcodes the gallery masters in `public/Pics and vids/` into web-ready
 * assets in `public/media/`.
 *
 *   node scripts/build-media.mjs
 *
 * Why this exists: anything under `public/` is served byte-for-byte. Next.js
 * optimises images on request but does nothing at all for video, so the 69MB
 * master would ship as 69MB. The masters are gitignored; only the output here
 * is committed, which is why a fresh clone cannot re-run this without them.
 *
 * Video settings worth not "simplifying":
 *   -an              gallery clips are silent by design, and dropping the audio
 *                    track saves ~15% for something no one can hear.
 *   -pix_fmt yuv420p Safari refuses to decode 4:2:2/4:4:4 H.264 in <video>.
 *   -movflags +faststart
 *                    moves the moov atom to the front so playback can start
 *                    before the file finishes downloading. Without it a hover
 *                    stalls until the whole clip lands.
 *   SCALE            2.mp4 is anamorphic: 1440x1080 stored, 16:9 on display via
 *                    a 4:3 sample aspect ratio. `setsar=1` alone is a trap - it
 *                    squares the pixels at the *stored* size and hands you a
 *                    squashed 4:3 picture. Multiply width by SAR first, then
 *                    reset SAR, then cap. Verified: without this the deck clip
 *                    encoded to 1280x960 instead of 1280x720.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import ffmpeg from "ffmpeg-static";

const SRC = "public/Pics and vids";
const OUT = "public/media";

/**
 * Normalise anamorphic sources to square pixels at their true display size,
 * then cap the long edge at 1280. `-2` keeps dimensions even, which H.264
 * requires.
 */
const SCALE = "scale=iw*sar:ih,setsar=1,scale='min(1280,iw)':-2";

/** Posters are pulled a beat into the trim, never frame 0 — cuts often open black. */
const VIDEOS = [
  { in: "Untitled.mov", out: "booth-performance", start: 0.5, duration: 6, posterAt: 1.5 },
  { in: "2.mp4", out: "deck-closeup", start: 6, duration: 10, posterAt: 2 },
  { in: "showcase.m4v", out: "club-set", start: 4, duration: 10, posterAt: 2 },
];

const IMAGES = [
  { in: "40763_667689627583_11200957_35243909_3224304_n.jpg", out: "branded-event.jpg" },
  { in: "746647511.383508.jpg", out: "archival-booth.jpg" },
];

const run = (args) => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const mb = (p) => (statSync(p).size / 1048576).toFixed(2);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let before = 0;
let after = 0;

for (const v of VIDEOS) {
  const src = join(SRC, v.in);
  const mp4 = join(OUT, `${v.out}.mp4`);
  const poster = join(OUT, `${v.out}.jpg`);
  before += statSync(src).size;

  // -ss before -i seeks fast; the filter chain caps the long edge at 1280 and
  // forces even dimensions, which H.264 requires.
  run([
    "-ss", String(v.start), "-i", src, "-t", String(v.duration),
    "-an",
    "-vf", SCALE,
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "27",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    mp4,
  ]);
  run([
    "-ss", String(v.start + v.posterAt), "-i", src, "-vframes", "1",
    "-vf", SCALE, "-q:v", "6",
    poster,
  ]);

  after += statSync(mp4).size + statSync(poster).size;
  console.log(`  ${v.in.padEnd(14)} ${mb(src).padStart(6)} MB -> ${mb(mp4)} MB + ${mb(poster)} MB poster`);
}

for (const img of IMAGES) {
  const src = join(SRC, img.in);
  const dst = join(OUT, img.out);
  before += statSync(src).size;
  // Long edge to 1600: next/image resizes per request, but a smaller source
  // keeps the repo small and the optimiser fast.
  run([
    "-i", src,
    "-vf", "scale='if(gt(iw,ih),min(1600,iw),-2)':'if(gt(iw,ih),-2,min(1600,ih))'",
    "-q:v", "4",
    dst,
  ]);
  after += statSync(dst).size;
  console.log(`  ${img.in.slice(0, 14).padEnd(14)} ${mb(src).padStart(6)} MB -> ${mb(dst)} MB`);
}

const total = readdirSync(OUT).reduce((n, f) => n + statSync(join(OUT, f)).size, 0);
console.log(`\n  sources ${(before / 1048576).toFixed(1)} MB -> output ${(after / 1048576).toFixed(2)} MB`);
console.log(`  ${OUT}: ${readdirSync(OUT).length} files, ${(total / 1048576).toFixed(2)} MB`);
