#!/usr/bin/env node
/**
 * Builds a single browsable HTML report of every staged copy change:
 * what is live in D1 today versus what the drafts in .emdash/ingest/ would
 * publish. Nothing here touches the database.
 *
 *   node scripts/copy-review-report.mjs
 *   open .emdash/copy-review/review.html
 */
import fs from "node:fs";

const live = JSON.parse(fs.readFileSync("/tmp/claude-501/live-pages.json", "utf8"));
const OUT = ".emdash/copy-review/review.html";

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Render prose for reading: keep paragraph breaks, drop the rest of the tags. */
const prose = (v) =>
  String(v ?? "")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<\/?p>/gi, "")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();

/** Every prose-bearing path inside a section's data, flattened to dotted keys. */
function proseFields(data, prefix = "", out = {}) {
  if (!data || typeof data !== "object") return out;
  for (const [k, v] of Object.entries(data)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      if (/^(heading|subheading|headline|subheadline|body|text|label|title|badge|seal|coverageNote|footnote|question|answer|name|role|bio|signature|signatureName|signatureRole|submitLabel|placeholder)$/.test(k))
        out[key] = v;
    } else if (Array.isArray(v) || (v && typeof v === "object")) {
      proseFields(v, key, out);
    }
  }
  return out;
}

const groups = { "Home / About / Contact / Services": [], "Service pages": [], "Service-in-area pages": [] };
let totalFields = 0, totalPages = 0;

for (const row of live) {
  const f = `.emdash/ingest/${row.slug}.json`;
  if (!fs.existsSync(f)) continue;
  const draft = JSON.parse(fs.readFileSync(f, "utf8"));
  const liveSections = JSON.parse(row.sections);
  const rows = [];

  if (draft.title !== row.title)
    rows.push({ loc: "page title", type: "", before: row.title, after: draft.title });

  for (let i = 0; i < Math.max(liveSections.length, draft.sections.length); i++) {
    const L = liveSections[i], D = draft.sections[i];
    if (!L || !D) continue;
    const lf = proseFields(L.data), df = proseFields(D.data);
    for (const key of new Set([...Object.keys(lf), ...Object.keys(df)])) {
      const a = prose(lf[key]), b = prose(df[key]);
      if (a === b) continue;
      rows.push({ loc: `[${i}] ${key}`, type: D.type, before: lf[key] ?? "", after: df[key] ?? "" });
    }
  }
  if (!rows.length) continue;
  totalPages++; totalFields += rows.length;

  const g = row.slug.startsWith("sia-") ? "Service-in-area pages"
    : row.slug.startsWith("svc-") ? "Service pages"
    : "Home / About / Contact / Services";
  groups[g].push({ slug: row.slug, rows });
}

const card = (p) => `
<details class="pg" id="${esc(p.slug)}">
  <summary><span class="slug">${esc(p.slug)}</span><span class="n">${p.rows.length} change${p.rows.length === 1 ? "" : "s"}</span></summary>
  ${p.rows.map((r) => `
  <div class="fld">
    <div class="loc">${esc(r.loc)}${r.type ? ` <em>${esc(r.type)}</em>` : ""}</div>
    <div class="cols">
      <div class="before"><div class="lbl">BEFORE</div><pre>${esc(prose(r.before)) || "<em>(unset)</em>"}</pre></div>
      <div class="after"><div class="lbl">AFTER</div><pre>${esc(prose(r.after)) || "<em>(removed)</em>"}</pre></div>
    </div>
  </div>`).join("")}
</details>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Monarch Pro Wash copy review</title>
<style>
:root{--bg:#0e2a3f;--card:#13344c;--fg:#e7eef2;--muted:#9fb3c0;--red:#5a2320;--green:#13402f;--line:rgba(255,255,255,.12)}
*{box-sizing:border-box}
body{margin:0;padding:24px 16px 80px;background:var(--bg);color:var(--fg);font:15px/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.wrap{max-width:1180px;margin:0 auto}
h1{font-size:24px;margin:0 0 4px}
.sub{color:var(--muted);margin:0 0 24px}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:32px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
.pg{background:var(--card);border:1px solid var(--line);border-radius:10px;margin:8px 0;overflow:hidden}
summary{cursor:pointer;padding:12px 16px;display:flex;justify-content:space-between;gap:12px;align-items:center;user-select:none}
summary::-webkit-details-marker{display:none}
summary:hover{background:rgba(255,255,255,.04)}
.slug{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13.5px}
.n{color:var(--muted);font-size:12.5px;white-space:nowrap}
.fld{border-top:1px solid var(--line);padding:14px 16px}
.loc{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);margin-bottom:8px}
.loc em{opacity:.7}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:860px){.cols{grid-template-columns:1fr}}
.before,.after{border-radius:8px;padding:10px 12px;min-width:0}
.before{background:var(--red)}.after{background:var(--green)}
.lbl{font-size:10.5px;letter-spacing:.1em;color:var(--muted);margin-bottom:6px}
pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:inherit}
.tot{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-bottom:8px}
code{background:rgba(255,255,255,.08);padding:1px 5px;border-radius:4px;font-size:13px}
</style></head><body><div class="wrap">
<h1>Monarch Pro Wash copy review</h1>
<p class="sub">Left is what is live on monarchprowashidaho.com right now. Right is what the drafts would publish. Nothing has been written to the CMS.</p>
<div class="tot"><strong>${totalPages} pages</strong> with <strong>${totalFields} changed copy fields</strong>. Click any page to expand. Bold inside copy shows as <code>**like this**</code>.</div>
${Object.entries(groups).filter(([, v]) => v.length).map(([name, v]) =>
  `<h2>${esc(name)} (${v.length})</h2>${v.map(card).join("")}`).join("")}
</div></body></html>`;

fs.writeFileSync(OUT, html);
console.log(`${totalPages} pages, ${totalFields} changed fields`);
console.log(`wrote ${OUT}`);
