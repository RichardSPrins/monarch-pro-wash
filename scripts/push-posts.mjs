#!/usr/bin/env node
/**
 * Pushes the built post drafts in .emdash/posts/*.json into the EmDash `posts`
 * collection in D1, as DRAFTS.
 *
 * They go in unpublished on purpose: the blog is empty today, and ten articles
 * appearing live without being read first is not a review. Publishing is a
 * separate, deliberate step once they have been approved.
 *
 *   node scripts/push-posts.mjs            # show what would happen
 *   node scripts/push-posts.mjs --apply
 *   node scripts/push-posts.mjs --apply --publish   # insert as published
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DB = "monarch-pro-wash-db";
const DIR = ".emdash/posts";
const APPLY = process.argv.includes("--apply");
const STATUS = process.argv.includes("--publish") ? "published" : "draft";

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid() {
  let t = Date.now(), time = "";
  for (let i = 9; i >= 0; i--) { time = B32[t % 32] + time; t = Math.floor(t / 32); }
  let r = "";
  for (let i = 0; i < 16; i++) r += B32[Math.floor(Math.random() * 32)];
  return time + r;
}

const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined || v === "" ? "NULL" : Number(v));

const run = (sql) =>
  execFileSync("npx", ["wrangler", "d1", "execute", DB, "--remote", "--command", sql], {
    encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"],
  });

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
let done = 0;

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(`${DIR}/${f}`, "utf8"));
  const id = ulid();
  const now = new Date().toISOString();
  const body = JSON.stringify(d.body);

  // Delete-then-insert keeps the script re-runnable while the posts are still
  // drafts nobody has edited in the admin. Do not use this once an editor has
  // touched them; it would discard their changes.
  const del = `DELETE FROM ec_posts WHERE slug = ${q(d.slug)};`;
  const ins =
    `INSERT INTO ec_posts (id, slug, status, created_at, updated_at, published_at, version, locale, translation_group, ` +
    `title, description, date, featured, body, cover, cover_alt, category, author, read_minutes) VALUES (` +
    `${q(id)}, ${q(d.slug)}, ${q(STATUS)}, ${q(now)}, ${q(now)}, ${STATUS === "published" ? q(now) : "NULL"}, 1, 'en', ${q(id)}, ` +
    `${q(d.title)}, ${q(d.description)}, ${q(d.date)}, ${n(d.featured)}, ${q(body)}, ${q(d.cover)}, ${q(d.cover_alt)}, ` +
    `${q(d.category)}, ${q(d.author)}, ${n(d.read_minutes)});`;

  if (!APPLY) { console.log(`would insert ${d.slug}  (${STATUS}, ${d.body.length} blocks)`); continue; }
  try {
    run(del); run(ins);
    console.log(`ok   ${d.slug}  (${STATUS})`);
    done++;
  } catch (e) {
    console.error(`FAIL ${d.slug}\n${String(e.stderr || e.message).slice(0, 400)}`);
    process.exit(1);
  }
}

console.log(APPLY ? `\n${done} post(s) written as ${STATUS}.` : `\n${files.length} post(s) ready. Re-run with --apply.`);
