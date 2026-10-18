#!/usr/bin/env node
/**
 * Generates branded cover images for the blog.
 *
 * There is no real job photography yet, and the standing rule on this site is
 * no stock photos. So rather than dress the blog in someone else's pictures,
 * each post gets a generated cover built from the brand palette: navy ground,
 * a soft colour wash, and a geometric motif that varies per post.
 *
 * These are placeholders with intent. Replace them with real before/after
 * photography as jobs come in; the filenames stay the same, so nothing else
 * needs to change.
 *
 *   node scripts/make-post-covers.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const OUT = "public/images/blog";
fs.mkdirSync(OUT, { recursive: true });

const NAVY = "#0e2a3f";
const DEEP = "#0a1f2e";
const ORANGE = "#e85c2b";
const TEAL = "#2fa8b5";
const LIGHT = "#6fc4cd";

const W = 1200, H = 630;

/** One cover. `variant` picks the motif, `accent` the dominant brand colour. */
function svg({ variant, accent, label }) {
  const second = accent === ORANGE ? TEAL : ORANGE;
  const motifs = [
    // sweeping water arc
    `<path d="M-50 520 C 260 400, 520 560, 780 430 S 1150 330, 1300 400" stroke="${accent}" stroke-width="46" fill="none" opacity="0.85" stroke-linecap="round"/>
     <path d="M-50 585 C 300 470, 560 620, 820 495 S 1160 405, 1300 470" stroke="${second}" stroke-width="22" fill="none" opacity="0.7" stroke-linecap="round"/>`,
    // rooflines
    `<path d="M-40 560 L 180 360 L 400 560 Z" fill="${accent}" opacity="0.9"/>
     <path d="M300 560 L 560 320 L 820 560 Z" fill="${second}" opacity="0.75"/>
     <path d="M700 560 L 940 390 L 1180 560 Z" fill="${accent}" opacity="0.55"/>
     <rect x="-40" y="552" width="1280" height="90" fill="${DEEP}"/>`,
    // concentric spray rings
    `<g opacity="0.85">
       <circle cx="980" cy="330" r="70" fill="none" stroke="${accent}" stroke-width="26"/>
       <circle cx="980" cy="330" r="140" fill="none" stroke="${second}" stroke-width="16" opacity="0.7"/>
       <circle cx="980" cy="330" r="215" fill="none" stroke="${accent}" stroke-width="9" opacity="0.45"/>
       <circle cx="980" cy="330" r="295" fill="none" stroke="${second}" stroke-width="5" opacity="0.25"/>
     </g>`,
    // diagonal bands
    `<g opacity="0.9">
       <rect x="640" y="-260" width="140" height="1160" transform="rotate(24 700 315)" fill="${accent}"/>
       <rect x="830" y="-260" width="68" height="1160" transform="rotate(24 860 315)" fill="${second}" opacity="0.8"/>
       <rect x="940" y="-260" width="26" height="1160" transform="rotate(24 950 315)" fill="${LIGHT}" opacity="0.6"/>
     </g>`,
    // droplets
    `<g opacity="0.9">
       ${[[880, 250, 54], [1010, 390, 34], [790, 430, 26], [1090, 230, 20], [930, 470, 16]]
         .map(([x, y, r], i) =>
           `<path d="M${x} ${y - r * 1.5} C ${x + r} ${y - r * 0.2}, ${x + r} ${y + r}, ${x} ${y + r} C ${x - r} ${y + r}, ${x - r} ${y - r * 0.2}, ${x} ${y - r * 1.5} Z" fill="${i % 2 ? second : accent}" opacity="${1 - i * 0.12}"/>`)
         .join("")}
     </g>`,
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/><stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="30%" r="62%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g clip-path="url(#frame)">
    ${motifs[variant % motifs.length]}
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
  </g>
  <rect x="0" y="0" width="10" height="${H}" fill="${accent}"/>
  <text x="56" y="${H - 54}" font-family="Oswald, Impact, sans-serif" font-size="25"
        letter-spacing="4" fill="#e7eef2" opacity="0.62">${label.toUpperCase()}</text>
</svg>`;
}

export const COVERS = [
  { file: "pressure-washing-cost", variant: 0, accent: ORANGE, label: "Pressure Washing" },
  { file: "soft-wash-vs-pressure", variant: 1, accent: TEAL, label: "Soft Washing" },
  { file: "roof-cleaning-cost", variant: 1, accent: ORANGE, label: "Roof Cleaning" },
  { file: "gutter-cleaning-timing", variant: 2, accent: TEAL, label: "Gutter Cleaning" },
  { file: "hard-water-windows", variant: 4, accent: LIGHT, label: "Window Cleaning" },
  { file: "concrete-sealing", variant: 3, accent: ORANGE, label: "Concrete Sealing" },
  { file: "roof-black-streaks", variant: 2, accent: TEAL, label: "Roof Cleaning" },
  { file: "post-construction", variant: 3, accent: TEAL, label: "Post-Construction" },
  { file: "house-wash-frequency", variant: 0, accent: TEAL, label: "House Washing" },
  { file: "graffiti-removal", variant: 4, accent: ORANGE, label: "Graffiti Removal" },
];

if (process.argv[1]?.endsWith("make-post-covers.mjs")) {
  const run = async () => {
    for (const c of COVERS) {
      await sharp(Buffer.from(svg(c))).png({ compressionLevel: 9 }).toFile(`${OUT}/${c.file}.png`);
      console.log(`  ${OUT}/${c.file}.png`);
    }
    console.log(`\n${COVERS.length} covers written.`);
  };
  run();
}
