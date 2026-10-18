#!/usr/bin/env node
/**
 * Site-wide copy rewrite — draft stage.
 *
 * Reads the LIVE page rows exported from D1, applies targeted copy patches, and
 * writes the result to .emdash/ingest/{slug}.json plus a readable diff. It does
 * NOT touch the database. Applying is a separate, deliberate step.
 *
 * Patching the live JSON (rather than authoring whole files by hand) means every
 * non-copy key — theme, spacing, motif, form config, limits, hrefBase, image
 * refs — survives untouched. Only the strings named below change.
 *
 *   node scripts/copy-rewrite.mjs --pages /tmp/live-pages.json [--write]
 *
 * Without --write it prints the diff and exits, which is the default because the
 * standing rule is that Monarch content is never changed unsolicited.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const pagesArg = args[args.indexOf("--pages") + 1];
if (!pagesArg || !fs.existsSync(pagesArg)) {
  console.error("usage: node scripts/copy-rewrite.mjs --pages <live-pages.json> [--write]");
  process.exit(1);
}

const OUT_DIR = ".emdash/ingest";
const DIFF_DIR = ".emdash/copy-review";

/** Strip tags/entities so prose can be compared and printed on one line. */
const plain = (v) =>
  String(v ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// ---------------------------------------------------------------------------
// Patches, by slug. Each entry maps a section index to the data keys to replace.
// `_note` records WHY, so a future reader can tell a fix from a preference.
// ---------------------------------------------------------------------------

const PATCHES = {

  about: {
    sections: {
      3: {
        _note:
          'value 3 claimed "We publish our prices. No games." Pricing is deliberately kept OFF the site, so the site was promising something it does not do.',
        "items.2.body":
          "One clear price before we start. No hourly meter and no surprise additions at the end.",
      },
      6: {
        _note:
          'stats:band is the section type the contractor-scope rules ban outright, and it names the exact three metrics they call out (years, communities, services). Two were also false: zero communities have been served (pre-revenue) and 8 services are published, not 17. Numbers corrected to true ones; see the note in the summary about removing the section entirely.',
        "stats.1.value": "13",
        "stats.1.label": "Treasure Valley towns we cover",
        "stats.3.value": "8",
        "stats.3.label": "Services under one roof",
      },
      9: {
        _note:
          '"Real words from real Treasure Valley neighbors" was the most explicit fake-review assertion on the site, sitting above three placeholder testimonials.',
        heading: "What Customers Say",
        subheading: "Early feedback from Treasure Valley property owners.",
      },
      10: {
        _note: 'drops "a company that treats your property like its own"',
        subheading:
          "Get a free quote with your price up front, from the owner who will be doing the work.",
      },
    },
  },

  services: {
    sections: {
      0: {
        _note:
          '"Seventeen services" sat above a grid that renders the 8 published ones. Number removed rather than corrected, so the copy does not go stale as services are added.',
        subheading:
          "Pressure washing, soft washing, roof and gutter cleaning, windows, concrete sealing and more. One insured, owner-run operation for the whole property, with the price up front.",
      },
      2: {
        _note: "same stale count",
        subheading: "Grouped by the kind of work. Tap any service for the details.",
      },
    },
  },
  index: {
    title: "Pressure Washing & Exterior Cleaning in Boise, ID",
    _titleNote:
      'was "The Treasure Valley\'s Top Rated Exterior Cleaning" — "Top Rated" is false with zero reviews',
    sections: {
      0: {
        _note: "H1 already keyword-first and good; eyebrow gains the owner wedge, CTA label unified",
        "eyebrow.text": "Boise & the Treasure Valley · Insured & Owner-Operated",
        subheading:
          "Driveways, roofs, siding and windows cleaned with the right method for every surface, so nothing gets damaged. Insured, owner-run, and always a free quote with the price up front. Serving Boise, Meridian, Nampa, Eagle and the whole Treasure Valley.",
        "ctas.0.label": "Get My Free Quote",
      },
      1: {
        _note: "trust bar: insured + owner-operated + trades experience + free quotes, all true",
        insured: true,
        ownerOperated: true,
        tradeYears: 15,
        freeQuotes: true,
        familyOwned: false,
      },
      2: {
        _note:
          'replaces "Unmatched Service" / "exceptional" / "premium experience" adjective marketing. The "100% Satisfaction Guarantee" stat was both a banned manufactured metric and an overclaim of the workmanship standard.',
        "eyebrow.text": "How We Work",
        heading: "One Call for the Whole Property",
        subheading:
          "Most exterior cleaners do one thing. Monarch handles the driveway, the roof, the siding, the windows and the gutters in a single visit, with the method matched to each surface. One quote, one visit, and one person accountable for all of it.",
        "stats.0.value": "15+",
        "stats.0.label": "Years in the trades",
        "stats.1.value": "Owner",
        "stats.1.label": "On site for every job",
      },
      4: {
        _note: 'drops "Premium" and the "Trust us to deliver top-quality services" filler',
        "eyebrow.text": "Our Services",
        heading: "Exterior Cleaning Services Across the Treasure Valley",
        subheading:
          "One visit for the whole property, or just the one thing that is bothering you. Every surface gets the method that suits it, whether that means real pressure on concrete or a gentle soft wash on a roof.",
      },
      6: {
        _note:
          '"Rated 5 Stars by Your Neighbors" asserted an aggregate rating that does not exist. Heading no longer claims a rating.',
        "eyebrow.text": "Reviews",
        heading: "What Customers Say",
        subheading:
          "Early feedback from Treasure Valley property owners. More as the jobs come in.",
      },
      8: {
        "cta.label": "Meet the Owner",
        "cta.href": "/about",
        _note:
          "owner letter is the strongest copy on the site and the tonal anchor for everything else. Left alone apart from the eyebrow casing.",
        "eyebrow.text": "Meet the Owner",
      },
      9: {
        _note:
          'coverageNote was the raw placeholder "This is a coverage note", live. New note leans on route density rather than implying a local presence in edge-of-radius towns, per the binding geographic honesty flags.',
        heading: "Serving Boise and the Treasure Valley",
        body: "Monarch is based in Boise and covers the Treasure Valley, from Meridian and Eagle out to Nampa, Caldwell and Kuna. We also take work in Middleton, Star, Garden City, Emmett, Payette and Mountain Home.",
        coverageNote:
          "Outside those towns? Ask anyway. If we are already working nearby that week, we can usually fit you in.",
      },
      10: {
        _note: '"Get in Touch" gave no reason to act',
        "eyebrow.text": "Contact",
        heading: "Get Your Free Quote",
        subheading:
          "Tell us what needs cleaning and we will come back with one clear price. No obligation and no pressure to book.",
      },
      11: {
        _note: "fixes the grocer's apostrophe in the eyebrow",
        "eyebrow.text": "FAQs",
        subheading: "The questions we get asked most, answered plainly.",
      },
      12: {
        _note: 'tightens "Give us a call today for your 100% free estimate"; keeps the real 10% offer',
        "eyebrow.text": "Ready to get started?",
        subheading:
          "Free quote, a clear price up front, and the owner doing the work. New customers get 10% off their first service.",
        "ctas.0.label": "Get My Free Quote",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Cross-cutting fixes applied to EVERY page, on top of any per-slug patch.
// ---------------------------------------------------------------------------

/**
 * Monarch is a single-member LLC with no employees. Plural "crew"/"team"
 * language promises staff that does not exist, and it undercuts the
 * owner-accountability wedge that the rest of the copy leans on.
 */
const GLOBAL_REPLACEMENTS = [
  // Sentence-initial forms FIRST: the case-insensitive rules below would
  // otherwise match them and substitute a lowercase replacement mid-sentence.
  [/\bOur crew is\b/g, "The owner is"],
  [/\bOur crew\b/g, "The owner"],
  [/\bOur team is\b/g, "Monarch is"],
  [/\bOur team\b/g, "Monarch"],
  [/\bone crew that knows\b/gi, "one person who knows"],
  [/\bby one crew\b/gi, "by one person"],
  [/\bour crew is\b/gi, "the owner is"],
  [/\bour crew\b/gi, "the owner"],
  [/\brotating crews\b/gi, "rotating subcontractors"],
  [/\bReach Richard and the Monarch team directly\b/gi, "Reach Richard directly"],
  [/\bRichard and the Monarch team\b/gi, "Richard"],
  [/\bthe Monarch team\b/gi, "Richard"],
  [/\bour team\b/gi, "Monarch"],
  // Insured, never licensed. There is no Idaho contractor licence yet.
  [/\bLicensed (?:&amp;|&|and) Insured\b/gi, "Fully Insured"],
  [/\bfully licensed and insured\b/gi, "fully insured"],
  // Solo operator: "team" also appears outside the possessive forms above.
  [/\bOne local, insured team\b/gi, "One insured, owner-run operation"],
  [/\blocal, insured team\b/gi, "insured, owner-run operation"],
  [/\blicensed and insured\b/gi, "insured"],
  // ---- FALSE EXPERIENCE CLAIMS -------------------------------------------
  // The 15 years are the OWNER'S pre-Monarch background: commercial trades plus
  // residential carpet cleaning, pressure washing and surface care, done across
  // the country. The company was founded in 2026. So every construction that
  // reads "15 years of exterior cleaning", "15 years cleaning Treasure Valley
  // exteriors", or "serving {town} for 15 years" is false, and the last shape is
  // the worst: it claims local operating history that does not exist.
  //
  // Everything below normalises onto the two phrasings the vault approves:
  // "in the trades" and "hands-on surface work".
  [/\b(serving [^.,]{3,40}) for (more than|over) (15|fifteen)\+? years\b/gi,
    "$1, backed by $2 $3 years in the trades"],
  // "has served {town} ... for more than 15 years" claims local operating
  // history for a company founded in 2026.
  [/\bthat has served ([^.,]{3,40}) for (more than|over) (15|fifteen)\+? years\b/gi,
    "that serves $1, backed by $2 $3 years in the trades"],
  [/\bhas served ([^.,]{3,40}) for (more than|over) (15|fifteen)\+? years\b/gi,
    "serves $1, backed by $2 $3 years in the trades"],
  [/\b(has |have )?(been )?cleaning exteriors (in|around|across) [^.,]{3,40} for (over|more than) (15|fifteen)\+? years\b/gi,
    "backed by $4 $5 years in the trades"],
  [/\b(15|fifteen)\+? years of exterior cleaning experience\b/gi,
    "$1 years of hands-on trade experience"],
  [/\b(15|fifteen)\+? years of hands-on exterior cleaning\b/gi,
    "$1 years of hands-on surface work"],
  [/\b(15|fifteen)\+? years of (Treasure Valley )?exterior cleaning( work)?\b/gi,
    "$1 years in the trades"],
  [/\b(15|fifteen)\+? years of Treasure Valley exterior work\b/gi,
    "$1 years in the trades"],
  [/\b(15|fifteen)\+? years cleaning exteriors (across|around|in) the [^.,]{3,40}\b/gi,
    "$1 years in the trades"],
  [/\b(15|fifteen)\+? years cleaning [A-Z][a-z]+ exteriors\b/gi,
    "$1 years in the trades"],
  [/\b(15|fifteen)\+? years cleaning (Treasure Valley )?exteriors\b/gi,
    "$1 years in the trades"],
  [/\bspent (more than|over) (15|fifteen)\+? years on Treasure Valley exteriors\b/gi,
    "spent $1 $2 years in the trades"],
  [/\b(15|fifteen)\+? years of exterior work (across|around|on) [^.,]{3,40}\b/gi,
    "$1 years in the trades"],
  [/\b(15|fifteen)\+? years working on [A-Z][a-z]+ homes\b/gi,
    "$1 years in the trades"],
  [/\b(15|fifteen)\+? years of exterior work\b/gi, "$1 years in the trades"],

  // ---- SLOP --------------------------------------------------------------
  // Only the genuinely soft openers. "Whether you are near Boise State or on the
  // Basque Block" is kept: the construction reads as filler only when the
  // alternatives are vague, and on these pages they are real places.
  [/\bWe understand how mature-tree shade drives\b/g, "Mature-tree shade drives"],
  [/\bfully insured for your peace of mind\b/gi, "fully insured"],
  [/\bUnmatched Service for\b/g, "Exterior Cleaning for"],

  // Monarch claiming a crew of its own. (Phrases like "not a rotating crew"
  // describe COMPETITORS and are deliberately left alone: they are accurate and
  // they carry the owner-accountability contrast.)
  [/\bowner-run, insured local team\b/gi, "owner-run, insured local operation"],
  [/\bowner-run, insured crew\b/gi, "owner-run, insured operation"],
  [/\binsured, owner-run crew\b/gi, "insured, owner-run operation"],
  [/\bowner-run crew\b/gi, "owner-run operation"],
  [/\bhandled by one [A-Z][a-z]+ crew\b/g, "handled by the owner, start to finish"],

  // No em dashes anywhere in body copy. These four are the only ones left, and
  // each needs different punctuation, so they are handled individually rather
  // than by a blanket swap.
  [/ \u2014 protecting your roof/g, ", protecting your roof"],
  [/Treasure Valley \u2014 concrete, glass/g, "Treasure Valley: concrete, glass"],
  [/grime \u2014 and can seal/g, "grime, and can seal"],
  [/at the root \u2014 no surface damage/g, "at the root, with no surface damage"],
  // Backstop for any em dash the specific rules above miss.
  [/ \u2014 /g, ", "],

  // "local team" was in the shared CTA on nearly every page.
  [/\bfrom a local team that treats your property like its own\b/gi,
    "from the owner who will be doing the work"],
];

// ---------------------------------------------------------------------------

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
    if (cur[k] === undefined || cur[k] === null) return false; // never invent structure
    cur = cur[k];
  }
  const last = /^\d+$/.test(parts.at(-1)) ? Number(parts.at(-1)) : parts.at(-1);
  if (cur === undefined || cur === null) return false;
  cur[last] = value;
  return true;
}

function getPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o == null ? o : o[/^\d+$/.test(k) ? Number(k) : k]), obj);
}

/** Walk every string in a structure and apply the global replacements. */
function applyGlobal(node, hits) {
  if (typeof node === "string") {
    let out = node;
    for (const [re, to] of GLOBAL_REPLACEMENTS) {
      if (re.test(out)) {
        hits.push(`${plain(out).slice(0, 70)} -> ${to}`);
        out = out.replace(re, to);
      }
    }
    return out;
  }
  if (Array.isArray(node)) return node.map((n) => applyGlobal(n, hits));
  if (node && typeof node === "object") {
    const o = {};
    for (const [k, v] of Object.entries(node)) o[k] = applyGlobal(v, hits);
    return o;
  }
  return node;
}


/**
 * Break wall-of-text paragraphs.
 *
 * Eleven rendered paragraphs ran 90 to 150 words as a single block, including
 * the main explainer on all eight service pages. That is a readability problem,
 * not a wording one, so this splits at existing sentence boundaries and changes
 * no words at all. Target is roughly 55 words per paragraph, split at the
 * sentence boundary nearest each ideal break point.
 */
function splitLongParagraphs(html, target = 55, trigger = 85) {
  if (typeof html !== "string" || !/<p>/i.test(html)) return html;
  return html.replace(/<p>([\s\S]*?)<\/p>/gi, (full, inner) => {
    const text = inner.trim();
    const words = text.split(/\s+/).length;
    if (words < trigger) return full;
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length < 3) return full;

    const parts = Math.min(3, Math.max(2, Math.round(words / target)));
    const per = words / parts;
    const out = [];
    let buf = [], count = 0, made = 1;
    for (const sent of sentences) {
      buf.push(sent);
      count += sent.split(/\s+/).length;
      const remaining = sentences.length - (out.join(" ").split(/\s+/).filter(Boolean).length ? 0 : 0);
      if (made < parts && count >= per && buf.length >= 1) {
        out.push(buf.join(" ")); buf = []; count = 0; made++;
      }
    }
    if (buf.length) out.push(buf.join(" "));
    if (out.length < 2) return full;
    return out.map((p) => `<p>${p}</p>`).join("");
  });
}

/** Walk a section's data and split any long body prose. */
function applyParagraphSplit(node) {
  if (typeof node === "string") return splitLongParagraphs(node);
  if (Array.isArray(node)) return node.map(applyParagraphSplit);
  if (node && typeof node === "object") {
    const o = {};
    for (const [k, v] of Object.entries(node)) o[k] = k === "body" ? applyParagraphSplit(v) : applyParagraphSplit(v);
    return o;
  }
  return node;
}

const REVIEW_DISCLAIMER =
  "Sample reviews, shown while we collect feedback from our first customers. These are examples, not real customer reviews.";

const rows = JSON.parse(fs.readFileSync(pagesArg, "utf8"));
fs.mkdirSync(DIFF_DIR, { recursive: true });

const report = [];
let changedPages = 0;

for (const row of rows) {
  const sections = JSON.parse(row.sections);
  const before = JSON.stringify({ title: row.title, sections });
  const lines = [];

  // 1. per-slug patches
  const patch = PATCHES[row.slug];
  let title = row.title;
  if (patch) {
    if (patch.title && patch.title !== title) {
      lines.push(`  TITLE`);
      lines.push(`    - ${title}`);
      lines.push(`    + ${patch.title}`);
      if (patch._titleNote) lines.push(`    # ${patch._titleNote}`);
      title = patch.title;
    }
    for (const [idx, keys] of Object.entries(patch.sections ?? {})) {
      const sec = sections[Number(idx)];
      if (!sec) {
        lines.push(`  !! section [${idx}] does not exist — patch skipped`);
        continue;
      }
      sec.data ??= {};
      const note = keys._note;
      const changed = [];
      for (const [k, v] of Object.entries(keys)) {
        if (k.startsWith("_")) continue;
        const old = getPath(sec.data, k);
        if (old === v) continue;
        const ok = k.includes(".") ? setPath(sec.data, k, v) : ((sec.data[k] = v), true);
        if (!ok) {
          lines.push(`  !! [${idx}] ${k}: path missing in live data — skipped`);
          continue;
        }
        changed.push([k, old, v]);
      }
      if (changed.length) {
        lines.push(`  [${idx}] ${sec.type}`);
        if (note) lines.push(`    # ${note}`);
        for (const [k, old, v] of changed) {
          lines.push(`    ${k}`);
          lines.push(`      - ${plain(old) || "(unset)"}`);
          lines.push(`      + ${plain(v)}`);
        }
      }
    }
  }

  // 2. every trust bar gets the same true badge set. All 9 pages carrying one
  //    set familyOwned:true explicitly in D1, so changing the component default
  //    alone would not have reached them.
  for (const [i, sec] of sections.entries()) {
    if (sec.type !== "trust-bar:badges") continue;
    sec.data ??= {};
    const was = JSON.stringify(sec.data);
    Object.assign(sec.data, {
      insured: true,
      ownerOperated: true,
      tradeYears: 15,
      freeQuotes: true,
      familyOwned: false,
    });
    if (JSON.stringify(sec.data) !== was) {
      lines.push(`  [${i}] trust-bar:badges`);
      lines.push(`    # Insured + Owner-Operated + 15+ Years in the Trades + Free Quotes.`);
      lines.push(`    # familyOwned off: single-member LLC, no employees. About keeps the framing.`);
    }
  }

  // 3. every reviews section states that the reviews are samples.
  //    Richard asked for sample reviews with a disclaimer while real ones are
  //    collected. The disclaimer sits in the section subheading, where every
  //    visitor sees it above the cards, rather than in small print.
  for (const [i, sec] of sections.entries()) {
    if (!sec.type?.startsWith("reviews:")) continue;
    sec.data ??= {};
    if (sec.data.subheading !== REVIEW_DISCLAIMER) {
      sec.data.subheading = REVIEW_DISCLAIMER;
      lines.push(`  [${i}] ${sec.type} - sample-review disclaimer applied`);
    }
  }

  // 4. break wall-of-text paragraphs (no wording changes)
  for (const sec of sections) {
    if (!sec.data) continue;
    const before = JSON.stringify(sec.data);
    sec.data = applyParagraphSplit(sec.data);
    if (JSON.stringify(sec.data) !== before) lines.push(`  [${sections.indexOf(sec)}] ${sec.type} - long paragraph split`);
  }

  // 5. global replacements
  const hits = [];
  const patched = applyGlobal(sections, hits);
  if (hits.length) {
    lines.push(`  GLOBAL (${hits.length})`);
    for (const h of [...new Set(hits)]) lines.push(`    ~ ${h}`);
  }

  const after = JSON.stringify({ title, sections: patched });
  if (after === before) continue;
  changedPages++;
  report.push(`\n=== ${row.slug}\n${lines.join("\n")}`);

  if (WRITE) {
    fs.writeFileSync(
      path.join(OUT_DIR, `${row.slug}.json`),
      JSON.stringify({ slug: row.slug, title, sections: patched }, null, 2) + "\n",
    );
  }
}

const text = report.join("\n");
fs.writeFileSync(path.join(DIFF_DIR, "copy-diff.txt"), text + "\n");
console.log(text);
console.log(`\n${changedPages} page(s) changed. Diff: ${DIFF_DIR}/copy-diff.txt`);
console.log(WRITE ? `Drafts written to ${OUT_DIR}/` : `Dry run. Re-run with --write to save drafts.`);
