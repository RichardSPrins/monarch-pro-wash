#!/usr/bin/env node
/**
 * Conversion-first prose rewrites, by page and section index.
 *
 * The regex passes in copy-rewrite.mjs fix defects: false claims, em dashes,
 * crew language, wall-of-text paragraphs. They cannot fix the thing that
 * actually matters, which is that the pages read as explanation rather than as
 * a structured case for hiring.
 *
 * THE PATTERN every rewrite here follows:
 *
 *   1. Open on the reader's problem, in concrete terms, in the first sentence.
 *      Never "Concrete in Meridian rarely stays clean on its own."
 *   2. Name the cost of leaving it. Stakes, not description.
 *   3. Give the fix plainly, with the specific reassurance that matters for
 *      that surface (no etching, no stripped granules, no blown-out sand).
 *   4. Close on proof: owner-run, insured, the quoter is the worker.
 *   5. Keep paragraphs to two or three sentences, and front-load each one.
 *
 * Local facts carried over from the existing copy are verified against the
 * vault's per-town reference files and must not be invented or embellished.
 * Hard-water figures stay qualitative for Meridian. American spelling. No em
 * dashes. Second person for the reader, "we" for Monarch.
 *
 *   node scripts/copy-prose.mjs [--write]
 */
import fs from "node:fs";

const WRITE = process.argv.includes("--write");
const DIR = ".emdash/ingest";

const p = (...paras) => paras.map((t) => `<p>${t}</p>`).join("");

export const PROSE = {
  // ---------------------------------------------------------------- flagship
  "svc-pressure-washing": {
    2: {
      heading: "Why Treasure Valley Concrete Goes Gray",
      _was: '"The Service Explained" opening on a feature list. Now opens on the reader\'s problem and what it is costing them.',
      body: p(
        "Your driveway is the first thing anyone sees when they pull up. Right now it is probably telling them the property is older and less cared for than it really is.",
        "Three things do the damage here. High-desert dust works into the pores all summer. Hard water and iron from sprinklers leave rust-colored mineral staining that rinsing will never touch. Freeze and thaw then drives all of it deeper every winter.",
        "Pressure washing reverses it. We lift the dirt, oil and mineral staining back out of the surface, matching pressure to the material so concrete, pavers and pool decks get a deep clean with no etching, no pitting and no blown-out joint sand.",
        "Want it to stay that way? We can seal the surface once it dries, so the clean holds for years instead of months.",
      ),
    },
  },

  // --------------------------------------------------------- SIA exemplar
  "sia-meridian--pressure-washing": {
    1: {
      _was: 'Opened "Concrete in Meridian rarely stays clean on its own", then buried the owner proof at the end of a seven-sentence block.',
      body: p(
        "Your driveway is the first thing visitors see, and in Meridian it is fighting a losing battle. Dust blows in off the valley all summer. Sprinkler runoff dries into chalky mineral lines along the edges. Oil and tire marks sink in and stay.",
        "Leave it long enough and that gray film stops being dirt and becomes the color of the slab. Concrete that is five years old starts reading as fifteen.",
        "A proper wash pulls it back out. You get an even surface, corner to corner, that looks close to the day it was poured.",
        "Monarch is owner-run and insured. The person who quotes your driveway is the person who cleans it, and that does not change between the estimate and the job.",
      ),
    },
    2: {
      heading: "What Meridian Does to Your Concrete",
      _was: 'Opened "A lot of the driveways and patios we clean sit in..." (about us, not them) and used "Then there is the weather." as a transition. Now split into two named causes so it scans.',
      body: p(
        "Two things here are harder on flatwork than most people expect.",
        "<strong>Hard water.</strong> Meridian's water is among the hardest in the Treasure Valley. Sprinklers hit the driveway every morning, that mineral-heavy water dries, and it leaves chalky white staining along the edges and low spots. Rinsing does nothing to it. We treat those areas directly so the concrete comes back to its real color.",
        "<strong>Dust and freeze-thaw.</strong> High-desert dust settles into the surface all summer. Winter freeze and thaw then works it deeper into the pores. By spring it is not sitting on the slab any more, it is in it.",
        "Most of the flatwork we clean here is in newer neighborhoods like Paramount, Bridgetower and Century Farm, where the slab is only a few years old. That changes the job. We match pressure and technique to the age of the concrete, so you get a deep clean without etching or streaking, and we work the surface evenly so you are not left with clean lanes next to dirty borders.",
      ),
    },
  },
};

// ---------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith("copy-prose.mjs")) {
  const strip = (v) => String(v).replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, "").replace(/[ \t]+/g, " ").trim();
  let n = 0;
  for (const [slug, secs] of Object.entries(PROSE)) {
    const f = `${DIR}/${slug}.json`;
    if (!fs.existsSync(f)) { console.log("MISSING", slug); continue; }
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const [idx, patch] of Object.entries(secs)) {
      const sec = j.sections[Number(idx)];
      if (!sec) { console.log("no section", slug, idx); continue; }
      console.log(`\n${"=".repeat(70)}\n${slug} [${idx}] ${sec.type}`);
      if (patch._was) console.log(`WHY: ${patch._was}`);
      for (const k of ["heading", "body"]) {
        if (!(k in patch)) continue;
        console.log(`\n--- ${k} BEFORE\n${strip(sec.data[k] ?? "(unset)")}`);
        console.log(`\n--- ${k} AFTER\n${strip(patch[k])}`);
        sec.data[k] = patch[k];
        n++;
      }
    }
    if (WRITE) fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  }
  console.log(`\n${n} field(s) rewritten. ${WRITE ? "Saved." : "Dry run."}`);
}
