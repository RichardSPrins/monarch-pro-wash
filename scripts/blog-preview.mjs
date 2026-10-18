#!/usr/bin/env node
/**
 * Renders the draft posts to a single browsable HTML file so they can be read
 * before anything is published.
 *
 * The posts are in the CMS as drafts, which means the live site correctly does
 * not serve them, which in turn means there is nowhere to read them. This fills
 * that gap. It renders from .emdash/posts/*.json, the same Portable Text that
 * was pushed to D1, laid out roughly as the real post template will.
 *
 *   node scripts/blog-preview.mjs
 *   open .emdash/copy-review/blog-preview.html
 */
import fs from "node:fs";

const DIR = ".emdash/posts";
const OUT = ".emdash/copy-review/blog-preview.html";

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Portable Text -> HTML, matching what the live renderer produces. */
function render(blocks) {
  const out = [];
  let list = null;
  const inline = (b) => {
    const defs = Object.fromEntries((b.markDefs ?? []).map((d) => [d._key, d]));
    return (b.children ?? [])
      .map((c) => {
        let t = esc(c.text);
        for (const m of c.marks ?? []) {
          if (m === "strong") t = `<strong>${t}</strong>`;
          else if (m === "em") t = `<em>${t}</em>`;
          else if (m === "code") t = `<code>${t}</code>`;
          else if (defs[m]?._type === "link") t = `<a href="${esc(defs[m].href)}">${t}</a>`;
        }
        return t;
      })
      .join("");
  };
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  for (const b of blocks) {
    if (b.listItem) {
      const tag = b.listItem === "number" ? "ol" : "ul";
      if (list !== tag) { closeList(); out.push(`<${tag}>`); list = tag; }
      out.push(`<li>${inline(b)}</li>`);
      continue;
    }
    closeList();
    const s = b.style ?? "normal";
    if (s === "blockquote") out.push(`<blockquote>${inline(b)}</blockquote>`);
    else if (/^h[1-6]$/.test(s)) out.push(`<${s}>${inline(b)}</${s}>`);
    else out.push(`<p>${inline(b)}</p>`);
  }
  closeList();
  return out.join("\n");
}

const posts = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(`${DIR}/${f}`, "utf8")))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

const words = (p) =>
  p.body.reduce((n, b) => n + (b.children ?? []).map((c) => c.text ?? "").join(" ").split(/\s+/).filter(Boolean).length, 0);

const toc = posts.map((p, i) =>
  `<li><a href="#p${i}"><span>${esc(p.title)}</span><em>${esc(p.category)} · ${words(p)} words</em></a></li>`).join("");

const body = posts.map((p, i) => `
<article class="post" id="p${i}">
  <img class="cover" src="../../public${p.cover}" alt="${esc(p.cover_alt)}">
  <span class="cat">${esc(p.category)}</span>
  <h1>${esc(p.title)}</h1>
  <p class="stand">${esc(p.description)}</p>
  <div class="meta">${esc(p.author)} · ${esc(p.date)} · ${p.read_minutes} min read · ${words(p)} words · <code>/blog/${esc(p.slug)}</code></div>
  <div class="prose">${render(p.body)}</div>
  <a class="top" href="#top">Back to top</a>
</article>`).join("");

fs.writeFileSync(OUT, `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Monarch Pro Wash blog drafts</title>
<style>
:root{--bg:#0e2a3f;--card:#13344c;--fg:#e7eef2;--muted:#9fb3c0;--line:rgba(255,255,255,.12);--pri:#e85c2b}
*{box-sizing:border-box}
body{margin:0;padding:28px 16px 100px;background:var(--bg);color:var(--fg);
 font:16.5px/1.72 ui-serif,Georgia,Cambria,serif}
.wrap{max-width:820px;margin:0 auto}
h1,h2,h3,.ui{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.hd{margin-bottom:28px}
.hd h1{font-size:25px;margin:0 0 4px}
.hd p{color:var(--muted);margin:0;font-size:15px}
.toc{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 8px;margin-bottom:40px;list-style:none}
.toc li{margin:0}
.toc a{display:flex;justify-content:space-between;gap:14px;padding:9px 12px;border-radius:7px;
 color:var(--fg);text-decoration:none;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14.5px}
.toc a:hover{background:rgba(255,255,255,.06)}
.toc em{color:var(--muted);font-style:normal;font-size:12.5px;white-space:nowrap}
.post{border-top:1px solid var(--line);padding-top:40px;margin-top:48px}
.cover{width:100%;height:auto;border-radius:12px;display:block;margin-bottom:22px}
.cat{display:inline-block;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;font-weight:700;
 letter-spacing:.1em;text-transform:uppercase;color:var(--pri);border:1px solid currentColor;
 border-radius:999px;padding:3px 10px;margin-bottom:12px}
.post h1{font-size:31px;line-height:1.2;margin:0 0 10px}
.stand{font-size:18px;color:var(--muted);margin:0 0 14px}
.meta{font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px;color:var(--muted);
 padding-bottom:22px;border-bottom:1px solid var(--line);margin-bottom:26px}
.prose h2{font-size:23px;margin:36px 0 12px;line-height:1.25}
.prose h3{font-size:18.5px;margin:28px 0 8px}
.prose p{margin:0 0 18px}
.prose ul,.prose ol{margin:0 0 18px;padding-left:24px}
.prose li{margin-bottom:8px}
.prose blockquote{margin:0 0 18px;padding-left:16px;border-left:3px solid var(--pri);color:var(--muted)}
.prose a{color:var(--pri)}
code{background:rgba(255,255,255,.09);padding:1px 6px;border-radius:4px;
 font:13px ui-monospace,Menlo,monospace}
.top{display:inline-block;margin-top:26px;font-family:ui-sans-serif,system-ui,sans-serif;
 font-size:13px;color:var(--muted)}
</style></head><body id="top"><div class="wrap">
<div class="hd">
  <h1>Blog drafts: ${posts.length} articles</h1>
  <p>All are in the CMS as drafts, so the live site is not serving them. This is a read-through copy.</p>
</div>
<ul class="toc">${toc}</ul>
${body}
</div></body></html>`);

console.log(`${posts.length} posts, ${posts.reduce((n, p) => n + words(p), 0)} words total`);
console.log(`wrote ${OUT}`);
