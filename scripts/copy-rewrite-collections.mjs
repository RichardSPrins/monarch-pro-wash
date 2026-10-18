#!/usr/bin/env node
/**
 * Copy rewrite for the D1 COLLECTIONS: ec_services, ec_service_categories and
 * ec_faqs. These are separate columns from the page `sections` JSON, so the
 * page rewrite in copy-rewrite.mjs does not reach them. They surface in service
 * grids, category listings and FAQ accordions across the site, which is why em
 * dashes kept rendering on pages whose own copy was already clean.
 *
 *   node scripts/copy-rewrite-collections.mjs [--write]
 *
 * Reads the exports in /tmp/claude-501/, writes drafts to
 * .emdash/copy-review/collections/ and a diff. Never touches the database.
 */
import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const SRC = "/tmp/claude-501";
const OUT = ".emdash/copy-review/collections";

const load = (t) => JSON.parse(fs.readFileSync(path.join(SRC, `${t}.json`), "utf8"))[0].results;
const loadFlat = (t) => JSON.parse(fs.readFileSync(path.join(SRC, `${t}.json`), "utf8"));

/**
 * Punctuation first. The house voice uses no em dashes at all, and the
 * categories use a spaced hyphen as a stand-in for the same thing. Both become
 * ordinary sentence punctuation. A colon is used where the dash introduced a
 * list, and a comma where it introduced a clause.
 */
const RULES = [
  // Clause-continuations first: a dash followed by a participle is joining a
  // clause, not introducing a list, so it becomes a comma. These must precede
  // the list rule below or "downspouts \u2014 protecting" wrongly takes a colon.
  [/ \u2014 protecting/g, ", protecting"],
  [/ \u2014 and can seal it to last/g, ", and can seal it to last"],
  [/ \u2014 no surface damage/g, ", with no surface damage"],
  [/ \u2014 you'?re covered/g, ". You are covered"],
  [/ \u2014 safely removes/g, ": safely removes"],

  // "Place \u2014 <list or imperative>" introduces what follows, so: colon.
  [/ [\u2014-] (driveways|concrete|roofs|storefronts|interior|fall|specialty|protect|keep|extend|lock in|erase|remove|resist|stabilize)\b/gi,
    ": $1"],

  // Generic backstops for anything the shapes above miss.
  [/ \u2014 /g, ", "],
  [/ - /g, ", "],

  // Solo operator.
  [/\bby detail-focused local pros\b/gi, "by a detail-focused local owner-operator"],
  [/\bby local pros\b/gi, "by a local owner-operator"],
  [/\bour (crew|team)\b/gi, "the owner"],

  // Insured, never licensed.
  [/\bLicensed (?:&|and) Insured\b/gi, "Fully Insured"],
  [/\blicensed and insured\b/gi, "insured"],
];

const apply = (v) => {
  if (typeof v !== "string") return v;
  let out = v;
  for (const [re, to] of RULES) out = out.replace(re, to);
  return out;
};

const PROSE = {
  ec_services: ["title", "description", "meta_title", "meta_description"],
  ec_service_categories: ["title", "description", "meta_title", "meta_description"],
  ec_faqs: ["question", "answer"],
};

fs.mkdirSync(OUT, { recursive: true });
const report = [];
let total = 0;

for (const table of Object.keys(PROSE)) {
  const rows = table === "ec_faqs" ? loadFlat("faqs-all") : load(table);
  const changed = [];
  for (const row of rows) {
    const patch = {};
    for (const col of PROSE[table]) {
      if (!(col in row)) continue;
      const next = apply(row[col]);
      if (next !== row[col]) patch[col] = { from: row[col], to: next };
    }
    if (Object.keys(patch).length) changed.push({ slug: row.slug ?? row.id, patch });
  }
  total += changed.length;
  report.push(`\n=== ${table}: ${changed.length} row(s) changed`);
  for (const c of changed) {
    report.push(`  ${c.slug}`);
    for (const [col, { from, to }] of Object.entries(c.patch)) {
      report.push(`    ${col}`);
      report.push(`      - ${from}`);
      report.push(`      + ${to}`);
    }
  }
  if (WRITE) {
    fs.writeFileSync(
      path.join(OUT, `${table}.json`),
      JSON.stringify(
        changed.map((c) => ({
          slug: c.slug,
          ...Object.fromEntries(Object.entries(c.patch).map(([k, v]) => [k, v.to])),
        })),
        null,
        2,
      ) + "\n",
    );
  }
}

const text = report.join("\n");
fs.writeFileSync(path.join(OUT, "collections-diff.txt"), text + "\n");
console.log(text);
console.log(`\n${total} row(s) changed across collections.`);
console.log(WRITE ? `Drafts in ${OUT}/` : "Dry run. Re-run with --write.");
