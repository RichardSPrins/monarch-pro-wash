#!/usr/bin/env node
/**
 * Images for the About page's about:split slots.
 *
 * Those three sections declare an image position but carry no image, so
 * `hasImage` is false, the two-column grid collapses to one, and the section
 * renders as a narrow block of text with a large empty band beside and below
 * it. On "Why the Monarch?" that empty band is also where the decorative
 * butterfly motif renders oversized and runs off the right edge.
 *
 * Same rule as the blog covers: no stock photography. These are generated from
 * the brand palette and the real butterfly mark, 4:3 to match the aspect ratio
 * the component reserves. Swap them for real photos of Richard, the van and
 * actual jobs as they exist; keep the filenames and nothing else changes.
 *
 *   node scripts/make-about-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const OUT = "public/images/about";
fs.mkdirSync(OUT, { recursive: true });

const NAVY = "#0e2a3f";
const DEEP = "#0a1f2e";
const ORANGE = "#e85c2b";
const TEAL = "#2fa8b5";
const LIGHT = "#6fc4cd";

const W = 1200, H = 900; // 4:3, matching .image-wrapper

const frame = (inner, accent = TEAL) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/><stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="0"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g clip-path="url(#clip)">${inner}<rect width="${W}" height="${H}" fill="url(#glow)"/></g>
</svg>`;

/** Rolling foothills, the recurring shape in the brand illustration. */
const hills = `
  <path d="M-40 620 C 180 540, 330 640, 520 596 S 880 520, 1240 592 L1240 920 L-40 920 Z" fill="${TEAL}" opacity="0.30"/>
  <path d="M-40 690 C 220 620, 420 710, 640 672 S 980 612, 1240 668 L1240 920 L-40 920 Z" fill="${TEAL}" opacity="0.45"/>
  <path d="M-40 762 C 240 700, 470 782, 700 748 S 1030 700, 1240 742 L1240 920 L-40 920 Z" fill="${DEEP}" opacity="0.92"/>`;

const sun = `
  <circle cx="880" cy="330" r="118" fill="${ORANGE}" opacity="0.85"/>
  <circle cx="880" cy="330" r="190" fill="none" stroke="${ORANGE}" stroke-width="3" opacity="0.30"/>
  <circle cx="880" cy="330" r="262" fill="none" stroke="${ORANGE}" stroke-width="2" opacity="0.16"/>`;

/** The water arc from the brand illustration. */
const arc = `
  <path d="M-60 560 C 240 440, 520 600, 800 480 S 1160 400, 1300 470"
        stroke="${ORANGE}" stroke-width="40" fill="none" opacity="0.9" stroke-linecap="round"/>
  <path d="M-60 625 C 280 510, 560 660, 840 545 S 1180 470, 1300 540"
        stroke="${LIGHT}" stroke-width="18" fill="none" opacity="0.75" stroke-linecap="round"/>`;

async function butterflyPlate() {
  const mark = fs.readFileSync("public/brand/butterfly-full-color-white-antennae.svg");
  const markW = 560;
  const markPng = await sharp(mark, { density: 600 }).resize({ width: markW }).png().toBuffer();
  const markH = Math.round((733 / 954) * markW);
  // Hills sit lower on this plate and the mark is placed above them, so the
  // lower wings are not swallowed by the ridgeline.
  const lowHills = hills.replace(/620|690|762/g, (m) => String(Number(m) + 120));
  const base = Buffer.from(frame(lowHills, ORANGE));
  return sharp(base)
    .composite([{ input: markPng, left: Math.round((W - markW) / 2), top: Math.round((H - markH) / 2) - 70 }])
    .png({ compressionLevel: 9 });
}

const run = async () => {
  // "Our Story" — the work, abstracted: valley, sun, water arc.
  await sharp(Buffer.from(frame(hills + sun + arc, ORANGE)))
    .png({ compressionLevel: 9 }).toFile(`${OUT}/our-story.png`);

  // "Why the Monarch?" — the mark itself, contained, replacing the oversized motif.
  await (await butterflyPlate()).toFile(`${OUT}/why-the-monarch.png`);

  // "Part of This Community" — the valley alone, quieter.
  await sharp(Buffer.from(frame(hills + sun, TEAL)))
    .png({ compressionLevel: 9 }).toFile(`${OUT}/community.png`);

  for (const f of ["our-story", "why-the-monarch", "community"]) {
    const m = await sharp(`${OUT}/${f}.png`).metadata();
    console.log(`  ${OUT}/${f}.png  ${m.width}x${m.height}`);
  }
};
run();
