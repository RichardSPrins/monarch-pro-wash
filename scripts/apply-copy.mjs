#!/usr/bin/env node
/**
 * Applies the staged copy drafts to D1.
 *
 * Writes one .sql file and runs it through `wrangler d1 execute --file`, which
 * avoids escaping multi-kilobyte JSON through a shell argument.
 *
 * This updates ec_pages.sections directly rather than going through the EmDash
 * revision API, because the CLI needs an API token this environment does not
 * have. The trade-off is no per-change entry in the admin's revision history,
 * so take a `wrangler d1 export` first. `updated_at` and `version` are still
 * bumped so the CMS sees the rows as changed.
 *
 *   node scripts/apply-copy.mjs            # write the SQL, run nothing
 *   node scripts/apply-copy.mjs --apply
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DB = "monarch-pro-wash-db";
const APPLY = process.argv.includes("--apply");
const SQL = "/tmp/claude-501/apply-copy.sql";
const LIVE = "/tmp/claude-501/live-pages.json";

const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const live = JSON.parse(fs.readFileSync(LIVE, "utf8"));
const stmts = [];
let pages = 0;

// ---- pages ---------------------------------------------------------------
for (const row of live) {
  const f = `.emdash/ingest/${row.slug}.json`;
  if (!fs.existsSync(f)) continue;
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  const sections = JSON.stringify(d.sections);
  if (sections === row.sections && d.title === row.title) continue;
  stmts.push(
    `UPDATE ec_pages SET sections = ${q(sections)}, title = ${q(d.title)}, ` +
      `updated_at = datetime('now'), version = version + 1 ` +
      `WHERE slug = ${q(row.slug)} AND deleted_at IS NULL;`,
  );
  pages++;
}

// ---- collections ---------------------------------------------------------
const COLLECTIONS = {
  ec_services: ["title", "description", "meta_title", "meta_description"],
  ec_service_categories: ["title", "description", "meta_title", "meta_description"],
  ec_faqs: ["question", "answer"],
};
let colRows = 0;
for (const [table, cols] of Object.entries(COLLECTIONS)) {
  const f = `.emdash/copy-review/collections/${table}.json`;
  if (!fs.existsSync(f)) continue;
  for (const r of JSON.parse(fs.readFileSync(f, "utf8"))) {
    const sets = cols.filter((c) => c in r).map((c) => `${c} = ${q(r[c])}`);
    if (!sets.length) continue;
    stmts.push(
      `UPDATE ${table} SET ${sets.join(", ")}, updated_at = datetime('now') ` +
        `WHERE slug = ${q(r.slug)} AND deleted_at IS NULL;`,
    );
    colRows++;
  }
}

fs.writeFileSync(SQL, stmts.join("\n") + "\n");
console.log(`pages: ${pages}   collection rows: ${colRows}   statements: ${stmts.length}`);
console.log(`sql: ${SQL} (${(fs.statSync(SQL).size / 1024).toFixed(0)} KB)`);

if (!APPLY) {
  console.log("\ndry run. re-run with --apply");
  process.exit(0);
}

try {
  const out = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", DB, "--remote", "--file", SQL, "--yes"],
    { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] },
  );
  const m = out.match(/executed\s+(\d+)\s+commands?/i);
  console.log(m ? `\napplied: ${m[1]} commands` : "\napplied");
} catch (e) {
  console.error("FAILED\n" + String(e.stderr || e.message).slice(0, 1200));
  process.exit(1);
}
