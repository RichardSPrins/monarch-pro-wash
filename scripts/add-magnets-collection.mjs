#!/usr/bin/env node
/**
 * Creates the `magnets` collection and the per-post field that points at it.
 *
 * A lead magnet is two things the site did not model: an OFFER (what the
 * visitor is promised) and a FILE (what they actually receive). The existing
 * magnet:cta section captures an email and shows a success message, but serves
 * nothing, so every magnet on the demo page promised a download that does not
 * exist. This gives magnets somewhere to live and something to hand over.
 *
 * Posts reference a magnet by SLUG in a plain string field rather than by a
 * reference field. That is deliberate: a reference field named `category`
 * already exists on `services`, and EmDash's where-builder resolves field
 * metadata by slug, so a same-named field of a different type on another
 * collection silently matched zero rows. A string slug sidesteps the whole
 * class of problem and is what a human would type anyway.
 *
 *   node scripts/add-magnets-collection.mjs            # print the SQL
 *   node scripts/add-magnets-collection.mjs --apply
 */
import { execFileSync } from "node:child_process";

const DB = "monarch-pro-wash-db";
const APPLY = process.argv.includes("--apply");
const POSTS_COLLECTION_ID = "01KZ7JG3GNPN1JHC9X68EXKY04";

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ulid = () => {
  let t = Date.now(), s = "";
  for (let i = 9; i >= 0; i--) { s = B32[t % 32] + s; t = Math.floor(t / 32); }
  for (let i = 0; i < 16; i++) s += B32[Math.floor(Math.random() * 32)];
  return s;
};

const COLLECTION_ID = ulid();
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

/** Mirrors the shape of the seeded collections (see ec_reviews). */
const FIELDS = [
  { slug: "title", label: "Title", type: "string", col: "TEXT", required: 1 },
  { slug: "description", label: "What they get", type: "text", col: "TEXT" },
  { slug: "bullets", label: "Bullet points (one per line)", type: "text", col: "TEXT" },
  { slug: "file", label: "Download file URL", type: "string", col: "TEXT" },
  { slug: "cta_label", label: "Button label", type: "string", col: "TEXT" },
  { slug: "image", label: "Cover image", type: "string", col: "TEXT" },
  { slug: "success_body", label: "Message after they submit", type: "text", col: "TEXT" },
];

const sql = [];

sql.push(
  `CREATE TABLE IF NOT EXISTS "ec_magnets" (` +
    `"id" text primary key, "slug" text, "status" text default 'draft', "author_id" text, ` +
    `"primary_byline_id" text, "created_at" text default (datetime('now')), ` +
    `"updated_at" text default (datetime('now')), "published_at" text, "scheduled_at" text, ` +
    `"deleted_at" text, "version" integer default 1, "live_revision_id" text, ` +
    `"draft_revision_id" text, "locale" text default 'en' not null, "translation_group" text, ` +
    FIELDS.map((f) => `"${f.slug}" ${f.col}`).join(", ") +
    `);`,
);

sql.push(
  `INSERT INTO _emdash_collections (id, slug, label, label_singular, description, icon, supports, source, created_at, updated_at, has_seo, comments_enabled, comments_moderation, comments_closed_after_days, comments_auto_approve_users) ` +
    `VALUES (${q(COLLECTION_ID)}, 'magnets', 'Lead Magnets', 'Lead Magnet', ` +
    `${q("Downloadable offers you can attach to a blog post or drop on a page.")}, 'gift', '[]', 'manual', ` +
    `datetime('now'), datetime('now'), 0, 0, 'first_time', 90, 1);`,
);

FIELDS.forEach((f, i) => {
  sql.push(
    `INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, "unique", default_value, validation, widget, options, sort_order, created_at, searchable, translatable) ` +
      `VALUES (${q(ulid())}, ${q(COLLECTION_ID)}, ${q(f.slug)}, ${q(f.label)}, ${q(f.type)}, ${q(f.col)}, ${f.required ?? 0}, 0, NULL, NULL, NULL, NULL, ${i}, datetime('now'), 0, 1);`,
  );
});

// Posts point at a magnet by slug.
sql.push(`ALTER TABLE ec_posts ADD COLUMN magnet TEXT;`);
sql.push(
  `INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, "unique", default_value, validation, widget, options, sort_order, created_at, searchable, translatable) ` +
    `VALUES (${q(ulid())}, ${q(POSTS_COLLECTION_ID)}, 'magnet', 'Lead magnet (slug)', 'string', 'TEXT', 0, 0, NULL, NULL, NULL, NULL, 10, datetime('now'), 0, 1);`,
);

console.log(sql.join("\n"));
if (!APPLY) { console.log("\n(dry run. re-run with --apply)"); process.exit(0); }

for (const stmt of sql) {
  try {
    execFileSync("npx", ["wrangler", "d1", "execute", DB, "--remote", "--command", stmt], {
      stdio: ["ignore", "ignore", "pipe"], encoding: "utf8",
    });
    console.log("ok   " + stmt.slice(0, 68));
  } catch (e) {
    const msg = String(e.stderr || e.message);
    if (/duplicate column|already exists|UNIQUE constraint/i.test(msg)) {
      console.log("skip " + stmt.slice(0, 68) + "  (already present)");
    } else {
      console.error("FAIL " + stmt.slice(0, 68) + "\n" + msg.slice(0, 400));
      process.exit(1);
    }
  }
}
console.log("\ndone — collection id " + COLLECTION_ID);
