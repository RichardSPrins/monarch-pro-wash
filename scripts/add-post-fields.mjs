#!/usr/bin/env node
/**
 * Adds the fields a real blog needs to the EmDash `posts` collection.
 *
 * Posts shipped with only Title, Description, Date, Featured and Body, so there
 * was nowhere to put a cover image, an alt text, a category or an author.
 *
 * Two things have to happen together for EmDash to see a new field: the column
 * must exist on ec_posts, and a row must exist in _emdash_fields describing it.
 * The shape is copied from services.image, which is the existing convention for
 * an image on this site (a `string` holding a path, not a media reference).
 *
 *   node scripts/add-post-fields.mjs            # show the SQL, change nothing
 *   node scripts/add-post-fields.mjs --apply    # run it
 */
import { execFileSync } from "node:child_process";

const DB = "monarch-pro-wash-db";
const APPLY = process.argv.includes("--apply");
const COLLECTION_ID = "01KZ7JG3GNPN1JHC9X68EXKY04"; // posts

/** Crockford base32, as ULID uses. */
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid(seed) {
  let t = Date.now(), time = "";
  for (let i = 9; i >= 0; i--) { time = B32[t % 32] + time; t = Math.floor(t / 32); }
  let rand = "";
  for (let i = 0; i < 16; i++) rand += B32[(seed * 31 + i * 17 + Math.floor(Math.random() * 32)) % 32];
  return time + rand;
}

const FIELDS = [
  { slug: "cover", label: "Cover Image", type: "string", sort: 5 },
  { slug: "cover_alt", label: "Cover Alt Text", type: "string", sort: 6 },
  { slug: "category", label: "Category", type: "string", sort: 7 },
  { slug: "author", label: "Author", type: "string", sort: 8 },
  { slug: "read_minutes", label: "Read Time (minutes)", type: "number", sort: 9, col: "INTEGER" },
];

const q = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);

const sql = [];
for (const f of FIELDS) {
  sql.push(`ALTER TABLE ec_posts ADD COLUMN ${f.slug} ${f.col ?? "TEXT"};`);
}
for (const [i, f] of FIELDS.entries()) {
  sql.push(
    `INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, "unique", default_value, validation, widget, options, sort_order, created_at, searchable, translatable) ` +
      `VALUES (${q(ulid(i))}, ${q(COLLECTION_ID)}, ${q(f.slug)}, ${q(f.label)}, ${q(f.type)}, ${q(f.col ?? "TEXT")}, 0, 0, NULL, NULL, NULL, NULL, ${f.sort}, datetime('now'), 0, 1);`,
  );
}

console.log(sql.join("\n"));

if (!APPLY) {
  console.log("\n(dry run. re-run with --apply)");
  process.exit(0);
}

for (const stmt of sql) {
  try {
    execFileSync("npx", ["wrangler", "d1", "execute", DB, "--remote", "--command", stmt], {
      stdio: ["ignore", "ignore", "pipe"], encoding: "utf8",
    });
    console.log("ok   " + stmt.slice(0, 72));
  } catch (e) {
    const msg = String(e.stderr || e.message);
    // Re-running should be harmless, so an existing column is not a failure.
    if (/duplicate column|already exists|UNIQUE constraint/i.test(msg)) {
      console.log("skip " + stmt.slice(0, 72) + "   (already present)");
    } else {
      console.error("FAIL " + stmt.slice(0, 72) + "\n" + msg.slice(0, 400));
      process.exit(1);
    }
  }
}
console.log("\ndone");
