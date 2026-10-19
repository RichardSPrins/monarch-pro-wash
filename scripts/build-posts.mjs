#!/usr/bin/env node
/**
 * Blog pipeline: markdown in content/blog/*.md -> Portable Text drafts in
 * .emdash/posts/*.json, ready to push to the EmDash `posts` collection.
 *
 * Articles are authored as markdown because that is reviewable; Portable Text
 * is a storage format, not a writing one. Supported: h2/h3, paragraphs,
 * bullet and numbered lists, blockquotes, **bold**, *italic* and [links](/x).
 *
 *   node scripts/build-posts.mjs            # build + report word counts
 *   node scripts/build-posts.mjs --check    # fail if any post is under 1500 words
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "content/blog";
const OUT = ".emdash/posts";
const MIN_WORDS = 1500;

let key = 0;
const k = () => `k${(key++).toString(36)}`;

/** Inline markdown -> Portable Text spans + link marks. */
function spans(text) {
  const out = [];
  const marksDefs = [];
  // links first so their label can still carry bold/italic
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`/g;
  let last = 0, m;
  const push = (t, marks = []) => { if (t) out.push({ _type: "span", text: t, marks }); };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    if (m[1]) {
      const key_ = k();
      marksDefs.push({ _type: "link", _key: key_, href: m[2] });
      push(m[1], [key_]);
    } else if (m[3]) push(m[3], ["strong"]);
    else if (m[4]) push(m[4], ["em"]);
    else if (m[5]) push(m[5], ["code"]);
    last = re.lastIndex;
  }
  push(text.slice(last));
  return { children: out.length ? out : [{ _type: "span", text, marks: [] }], marksDefs };
}

const block = (style, text, listItem) => {
  const { children, marksDefs } = spans(text);
  const b = { _type: "block", _key: k(), style, children, markDefs: marksDefs };
  if (listItem) { b.listItem = listItem; b.level = 1; }
  return b;
};

/** Markdown body -> Portable Text block array. */
function toPortableText(md) {
  const blocks = [];
  let para = [];
  const flush = () => { if (para.length) { blocks.push(block("normal", para.join(" "))); para = []; } };

  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    let m;
    if ((m = line.match(/^###\s+(.*)$/))) { flush(); blocks.push(block("h3", m[1])); }
    else if ((m = line.match(/^##\s+(.*)$/))) { flush(); blocks.push(block("h2", m[1])); }
    else if ((m = line.match(/^>\s?(.*)$/))) { flush(); blocks.push(block("blockquote", m[1])); }
    else if ((m = line.match(/^[-*]\s+(.*)$/))) { flush(); blocks.push(block("normal", m[1], "bullet")); }
    else if ((m = line.match(/^\d+\.\s+(.*)$/))) { flush(); blocks.push(block("normal", m[1], "number")); }
    else para.push(line.trim());
  }
  flush();
  return blocks;
}

/** Minimal frontmatter reader: key: value, one per line. */
function parse(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { fm, body: m[2] };
}

const words = (md) =>
  md.replace(/^#+\s+/gm, "").replace(/[*`>[\]()]/g, "").split(/\s+/).filter(Boolean).length;

if (!fs.existsSync(SRC)) { console.error(`no ${SRC}/`); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".md")).sort();
let fail = 0;
const rows = [];

for (const f of files) {
  const { fm, body } = parse(path.join(SRC, f));
  const slug = fm.slug ?? f.replace(/\.md$/, "");
  const w = words(body);
  if (w < MIN_WORDS) { fail++; }
  const doc = {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    topic: fm.category,
    author: fm.author ?? "Richard Prins",
    cover: fm.cover,
    cover_alt: fm.cover_alt,
    featured: fm.featured === "true" ? 1 : 0,
    read_minutes: Math.max(1, Math.round(w / 225)),
    status: "draft",
    body: toPortableText(body),
  };
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(doc, null, 2) + "\n");
  rows.push([slug, w, doc.read_minutes, doc.body.length, fm.category]);
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("slug", 42) + pad("words", 7) + pad("min", 5) + pad("blocks", 8) + "category");
for (const [s, w, m, b, c] of rows)
  console.log(pad(s, 42) + pad(w, 7) + pad(m, 5) + pad(b, 8) + (c ?? ""));
console.log(`\n${rows.length} posts -> ${OUT}/`);
console.log(fail ? `${fail} POST(S) UNDER ${MIN_WORDS} WORDS` : `all posts >= ${MIN_WORDS} words`);
if (process.argv.includes("--check") && fail) process.exit(1);
