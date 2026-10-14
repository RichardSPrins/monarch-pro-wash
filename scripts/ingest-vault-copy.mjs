#!/usr/bin/env node
/**
 * Ingest the content-vault copy into EmDash `sections` JSON.
 *
 *   node scripts/ingest-vault-copy.mjs            # write .emdash/ingest/*.json
 *   node scripts/ingest-vault-copy.mjs --report   # summarise only, write nothing
 *
 * The vault at ~/Documents/brain/second-brain/output/monarch-pro-wash/website-copy
 * already holds every page written to the 14-section rich template. This turns
 * that markdown into the `[{type, theme, data}]` array the render contract wants.
 * It writes FILES ONLY — pushing them into the CMS is a separate, deliberate step.
 *
 * Four deliberate deviations from what the vault markdown declares:
 *
 *  1. `about:why-choose-us` → `about:values`. The former needs a non-optional
 *     image we don't have and renders `body` as plain text, so the vault's
 *     bold-led bullets would not render as a list at all.
 *  2. `service-areas:columns` → `service-areas:neighborhoods`. The former
 *     self-fetches the service-areas collection, so it would print the same 13
 *     towns on every page instead of that town's neighbourhoods.
 *  3. `services:grid` keeps its collection pull. The vault hand-lists services
 *     per town; that's 40x maintenance and would drift from launchScope.
 *  4. Themes are reassigned light-first. The vault alternates default/alt, but
 *     in this dark-first brand `default` is deep navy — alternating gives a
 *     mostly-dark page. Pages read light with navy as a deliberate accent.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

const VAULT = join(
  homedir(),
  "Documents/brain/second-brain/output/monarch-pro-wash/website-copy",
);
const OUT_DIR = ".emdash/ingest";
const REPORT_ONLY = process.argv.includes("--report");

// Keep in step with src/config/launchScope.ts.
const PUBLISHED_SERVICES = [
  "pressure-washing", "soft-washing", "roof-cleaning", "gutter-cleaning",
  "window-cleaning", "concrete-sealing-staining", "post-construction-cleanup",
  "graffiti-removal",
];
const SIA_AREAS = ["boise", "meridian", "nampa", "eagle", "caldwell"];

/** Vault filenames don't always match service slugs. */
const FILE_ALIASES = { "christmas-light-installation": "christmas-lights" };
const slugFromFile = (f) => {
  const s = basename(f, ".md");
  return FILE_ALIASES[s] ?? s;
};

/**
 * Light-first surface rhythm, keyed by the vault's §N. `alt` is the WHITE
 * surface in this theme; default/muted are navy accents; primary is the CTA.
 */
const THEME_BY_SECTION = {
  1: "inverse",   // hero — full bleed, outside the rail region
  14: "primary",  // CTA  — full bleed, outside the rail region
  // Everything between lives beside the sticky rail, so it shares ONE light
  // surface. A navy band here would be sliced by the rail; PageRenderer varies
  // the tone instead (see .page-main > .section-wrapper.theme-alt:nth-of-type).
};
const RAIL_BODY_THEME = "alt";

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `**bold**` and `[text](href)` → HTML. Escapes everything else. */
function inline(md) {
  return esc(md)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

const isReserved = (body) => /^\s*\*\[Reserved/i.test(body.trim());

/** Split a body into its bullet lines and its plain paragraphs. */
function partition(body) {
  const bullets = [];
  const paras = [];
  let buf = [];
  const flush = () => {
    const t = buf.join(" ").trim();
    if (t) paras.push(t);
    buf = [];
  };
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t) { flush(); continue; }
    if (/^[-*]\s+/.test(t)) { flush(); bullets.push(t.replace(/^[-*]\s+/, "")); continue; }
    if (/^\d+\.\s+/.test(t)) { flush(); bullets.push(t.replace(/^\d+\.\s+/, "")); continue; }
    buf.push(t);
  }
  flush();
  return { bullets, paras };
}

/** `**Title.** Rest of the sentence.` → { title, body } */
function splitBoldLead(line) {
  const m = line.match(/^\*\*(.+?)\*\*[.:]?\s*(.*)$/);
  if (m) return { title: m[1].replace(/[.:]$/, "").trim(), body: m[2].trim() || undefined };
  // `Plain — description` also appears.
  const dash = line.split(/\s+[—–]\s+/);
  if (dash.length > 1) return { title: dash[0].trim(), body: dash.slice(1).join(" — ").trim() };
  return { title: line.trim(), body: undefined };
}

/** `**Key:** value` lines → { key: value } */
function keyedLines(body) {
  const out = {};
  for (const line of body.split("\n")) {
    const m = line.trim().match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (m) out[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return out;
}

const eyebrow = (text) => ({ text, variant: "text" });

/**
 * Vault labels that name the SLOT rather than the content. "## §2 · Intro" is a
 * structural marker, not a heading anyone should read on the page.
 */
const GENERIC_TITLES = new Set([
  "intro", "hero", "cta", "reviews", "before & after", "before and after",
  "faqs", "trust bar", "service areas", "guarantee",
]);
const realTitle = (t) => (t && !GENERIC_TITLES.has(t.trim().toLowerCase()) ? t.trim() : undefined);

// ---------------------------------------------------------------------------
// Section parser
// ---------------------------------------------------------------------------

/** Both heading shapes the vault uses. */
const HEADING_RE =
  /^##\s*§(\d+)\s*[·|-]?\s*(.*?)\s*$/;

function parseHeading(line) {
  const m = line.match(HEADING_RE);
  if (!m) return null;
  const num = Number(m[1]);
  let rest = m[2];
  const reserved = /🔲/.test(rest);
  const typeM = rest.match(/`([a-z-]+:[a-z-]+)`/);
  if (!typeM) return null;
  const type = typeM[1];
  // theme: either "· theme: alt" or "(`type` · alt)"
  let theme = null;
  const t1 = rest.match(/theme:\s*([a-z-]+)/i);
  const t2 = rest.match(/`[a-z-]+:[a-z-]+`\s*[·]\s*([a-z-]+)\s*\)/i);
  theme = (t1 && t1[1]) || (t2 && t2[1]) || null;
  // Title = everything before the first ` or (
  let title = rest.split(/[`(]/)[0].replace(/[·|-]\s*$/, "").trim();
  title = title.replace(/\s*[·]\s*$/, "").trim();
  return { num, type, theme, title, reserved };
}

function parseFile(path) {
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const h = parseHeading(line);
    if (h) {
      if (cur) sections.push(cur);
      cur = { ...h, body: [] };
      continue;
    }
    // A non-§ h2 ends the section run (Notes / Status trailers).
    if (/^##\s+/.test(line) && cur) { sections.push(cur); cur = null; continue; }
    if (cur) cur.body.push(line);
  }
  if (cur) sections.push(cur);
  return sections.map((s) => ({ ...s, body: s.body.join("\n").trim() }));
}

// ---------------------------------------------------------------------------
// Section -> {type, theme, data}
// ---------------------------------------------------------------------------

function build(sec, ctx) {
  const { type, title, body, num } = sec;
  const theme = THEME_BY_SECTION[num] ?? RAIL_BODY_THEME;
  const { bullets, paras } = partition(body);
  const kv = keyedLines(body);

  const mk = (t, data) => ({ type: t, theme, data });

  switch (type) {
    case "hero:split-form":
    case "hero:image-overlay": {
      const heading = kv["h1"] || ctx.defaultHeading;
      if (!heading) return null;
      return {
        type,
        theme: "inverse",
        data: {
          eyebrow: eyebrow(ctx.eyebrow),
          heading,
          subheading: kv["subheading"] || undefined,
          trustBadges: [{ text: "Fully Insured" }, { text: "Owner-Operated" }, { text: "Free Quotes" }],
          showPhone: true,
        },
      };
    }

    case "content:rich-text": {
      const html = paras.map((p) => `<p>${inline(p)}</p>`).join("");
      if (!html) return null;
      return mk("content:rich-text", {
        eyebrow: eyebrow(ctx.eyebrow),
        heading: realTitle(title),
        body: html,
      });
    }

    case "feature:checklist": {
      const items = bullets.map(splitBoldLead).filter((i) => i.title);
      if (!items.length) return null;
      return mk("feature:checklist", {
        eyebrow: eyebrow("What We Do"),
        heading: realTitle(title),
        subheading: paras[0] || undefined,
        items,
      });
    }

    // DEVIATION 1 — see header.
    case "about:why-choose-us":
    case "about:values": {
      const items = bullets.map(splitBoldLead).filter((i) => i.title);
      if (!items.length) return null;
      return mk("about:values", {
        eyebrow: eyebrow("Why Monarch"),
        heading: realTitle(title),
        items,
      });
    }

    case "process:horizontal": {
      const steps = bullets
        .map(splitBoldLead)
        .filter((s) => s.title)
        .map((s) => ({ heading: s.title, body: s.body }));
      if (!steps.length) return null;
      return mk("process:horizontal", {
        eyebrow: eyebrow("The Process"),
        heading: realTitle(title) || "How It Works",
        steps,
      });
    }

    // DEVIATION 3 — collection pull, not the vault's hand list.
    case "services:grid": {
      return mk("services:grid", {
        eyebrow: eyebrow("More Services"),
        heading: realTitle(title),
        subheading: paras[0] || undefined,
        ...(ctx.areaSlug ? { hrefBase: `/${ctx.areaSlug}` } : {}),
      });
    }

    // DEVIATION 2 — see header.
    case "service-areas:columns":
    case "service-areas:neighborhoods": {
      const places = bullets.map((b) => splitBoldLead(b).title).filter(Boolean);
      if (!places.length) return null;
      return mk("service-areas:neighborhoods", {
        eyebrow: eyebrow("Service Areas"),
        heading: realTitle(title),
        subheading: paras[0] || undefined,
        places,
        footnote: paras[1] || undefined,
      });
    }

    case "service-areas:chips":
      return mk("service-areas:chips", {
        eyebrow: eyebrow("Service Areas"),
        heading: realTitle(title) || "Serving the Treasure Valley",
      });

    case "faqs:accordion":
      // Questions live in the faqs collection, tagged by `topics` term; passing
      // the term is required because the filter is exclusionary.
      return mk("faqs:accordion", {
        eyebrow: eyebrow("FAQs"),
        heading: realTitle(title) || "Common Questions",
        ...(ctx.faqTopic ? { service: ctx.faqTopic } : {}),
      });

    case "reviews:cards":
      return mk("reviews:cards", {
        eyebrow: eyebrow("Reviews"),
        heading: realTitle(title) || "What Our Customers Say",
        filter: "all",
        limit: 3,
        ...(ctx.areaName ? { area: ctx.areaName } : {}),
      });

    case "gallery:before-after":
      // No real photos yet. An empty pairs[] fails validation, so omit it; it
      // comes back when there are real before/afters to show.
      return null;

    case "guarantee:callout":
      return {
        type: "guarantee:callout",
        theme: RAIL_BODY_THEME,
        data: {
          eyebrow: eyebrow("Our Guarantee"),
          heading: realTitle(title) || "The Monarch Standard",
          body: paras.join(" ") || undefined,
          badge: "Make It Right",
        },
      };

    case "cta:banner": {
      return {
        type: "cta:banner",
        theme: "primary",
        data: {
          heading: kv["heading"] || realTitle(title) || "Ready for a Cleaner Property?",
          subheading: kv["subheading"] || undefined,
          ctas: [{ label: "Get My Free Quote", href: "/contact", variant: "primary" }],
          showPhone: true,
        },
      };
    }

    case "trust-bar:badges":
      return mk("trust-bar:badges", { foundingYear: 2026, familyOwned: true, insured: true });

    default:
      return { __unhandled: type };
  }
}

// ---------------------------------------------------------------------------
// Page builders
// ---------------------------------------------------------------------------

function buildSia(areaSlug, areaName, serviceSlug, serviceTitle) {
  const file = join(VAULT, "service-in-area", areaSlug, `${serviceSlug}.md`);
  const alt = join(VAULT, "service-in-area", areaSlug, "christmas-light-installation.md");
  const path = existsSync(file) ? file : existsSync(alt) ? alt : null;
  if (!path) return { error: "no vault file" };

  const ctx = {
    eyebrow: `${serviceTitle} · ${areaName}`,
    defaultHeading: `${serviceTitle} in ${areaName}, ID`,
    areaSlug,
    areaName,
    faqTopic: `${areaSlug}-${serviceSlug}`,
  };

  const unhandled = [];
  const sections = [];
  for (const sec of parseFile(path)) {
    if (sec.reserved && sec.type === "gallery:before-after") continue;
    const built = build(sec, ctx);
    if (!built) continue;
    if (built.__unhandled) { unhandled.push(built.__unhandled); continue; }
    sections.push(built);
  }
  return { sections, unhandled, source: path };
}

function buildService(serviceSlug, serviceTitle) {
  // Service-detail copy lives per CATEGORY, with an `# Service Name` block each.
  const dir = join(VAULT, "service-pages");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  for (const f of files) {
    const text = readFileSync(join(dir, f), "utf8");
    const re = new RegExp(`^# ${serviceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
    const m = text.match(re);
    if (!m) continue;
    const start = m.index;
    const nextH1 = text.slice(start + 1).search(/^# /m);
    const block = nextH1 === -1 ? text.slice(start) : text.slice(start, start + 1 + nextH1);

    const grab = (h) => {
      const r = new RegExp(`^### ${h}\\s*$([\\s\\S]*?)(?=^### |\\Z)`, "m");
      const mm = block.match(r);
      return mm ? mm[1].trim() : "";
    };
    const hero = keyedLines(grab("Hero"));
    const explained = grab("The Service Explained");
    const concerns = grab("Top Concerns");

    const rows = [];
    for (const para of concerns.split(/\n{2,}/)) {
      const t = para.trim();
      if (!t) continue;
      const lead = t.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)$/);
      if (lead) rows.push({ heading: lead[1].replace(/\.$/, "").trim(), body: lead[2].trim() });
    }

    return { hero, explained, rows, source: join(dir, f) };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const services = JSON.parse(readFileSync(".emdash/ingest-services.json", "utf8"));
const areas = JSON.parse(readFileSync(".emdash/ingest-areas.json", "utf8"));
const svcTitle = Object.fromEntries(services.map((s) => [s.slug, s.title]));
const svcDesc = Object.fromEntries(services.map((s) => [s.slug, s.description]));

if (!REPORT_ONLY) mkdirSync(OUT_DIR, { recursive: true });

const report = { sia: [], service: [], problems: [] };

// --- service-in-area pages -------------------------------------------------
for (const area of areas.filter((a) => SIA_AREAS.includes(a.slug))) {
  for (const slug of PUBLISHED_SERVICES) {
    const r = buildSia(area.slug, area.city, slug, svcTitle[slug]);
    if (r.error) { report.problems.push(`${area.slug}/${slug}: ${r.error}`); continue; }
    if (r.unhandled.length) report.problems.push(`${area.slug}/${slug}: unhandled ${[...new Set(r.unhandled)].join(",")}`);
    const name = `sia-${area.slug}--${slug}`;
    report.sia.push({ name, sections: r.sections.length });
    if (!REPORT_ONLY) {
      writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify({
        slug: name,
        title: `${svcTitle[slug]} in ${area.city}, ID | Monarch Pro Wash`,
        sections: r.sections,
      }, null, 2));
    }
  }
}

// --- service detail pages --------------------------------------------------
for (const slug of PUBLISHED_SERVICES) {
  const v = buildService(slug, svcTitle[slug]);
  if (!v) { report.problems.push(`svc-${slug}: no vault block for "${svcTitle[slug]}"`); continue; }
  const title = svcTitle[slug];
  const sections = [
    { type: "hero:image-overlay", theme: "inverse", data: {
      eyebrow: eyebrow("Treasure Valley · Fully Insured"),
      heading: v.hero["h1"] || `${title} in the Treasure Valley`,
      subheading: v.hero["subheading"] || svcDesc[slug],
      showPhone: true,
      ctas: [{ label: "Get a Free Quote", href: "/contact", variant: "primary" }],
    } },
    { type: "trust-bar:badges", theme: "alt", data: { foundingYear: 2026, familyOwned: true, insured: true } },
    v.explained && { type: "content:rich-text", theme: "alt", data: {
      eyebrow: eyebrow(title),
      heading: "The Service Explained",
      body: v.explained.split(/\n{2,}/).map((p) => `<p>${inline(p.trim())}</p>`).join(""),
    } },
    v.rows.length && { type: "feature:alternating", theme: "alt", data: {
      eyebrow: eyebrow("What to Know"),
      heading: "Top Concerns",
      rows: v.rows,
    } },
    { type: "process:horizontal", theme: "alt", data: {
      eyebrow: eyebrow("The Process"), heading: "How It Works",
      steps: [
        { heading: "Get your free quote", body: "A clear price up front, with no guessing." },
        { heading: "We match the method to the surface", body: "Real pressure where it helps, a gentle soft wash where it protects." },
        { heading: "We clean, protect, and inspect", body: "Stains treated, landscaping protected, and the job checked before we leave." },
      ],
    } },
    { type: "about:values", theme: "alt", data: {
      eyebrow: eyebrow("Why Monarch"), heading: "Why Monarch",
      items: [
        { title: "Surface-matched every time", body: "The method fits the material, so you get a deep clean with zero damage." },
        { title: "Soft wash, not just power wash", body: "The safe method for anything delicate is standard here, not an upsell." },
        { title: "Owner-run and insured", body: "The person accountable for the work is the person doing it." },
        { title: "One vendor for the whole property", body: "Wash, seal, windows, and gutters under one roof." },
      ],
    } },
    { type: "reviews:cards", theme: "alt", data: {
      eyebrow: eyebrow("Reviews"), heading: "What Our Customers Say",
      filter: "all", service: slug, limit: 3,
    } },
    { type: "guarantee:callout", theme: "alt", data: {
      eyebrow: eyebrow("Our Guarantee"), heading: "The Monarch Standard",
      body: "We aim for a full, thorough clean on the first visit. If any surface we cleaned is not right, tell us and we come back to make it right. No fine print and no runaround.",
      badge: "Make It Right",
    } },
    { type: "faqs:accordion", theme: "alt", data: {
      eyebrow: eyebrow("FAQs"), heading: `${title}: Common Questions`, service: slug,
    } },
    { type: "service-areas:grid", theme: "alt", data: {
      eyebrow: eyebrow("Service Areas"), heading: "Serving the Treasure Valley",
    } },
    { type: "cta:banner", theme: "primary", data: {
      heading: "Ready for a Cleaner Property?",
      subheading: "Get a free quote with your price up front and a clean that is safe for every surface.",
      ctas: [{ label: "Get My Free Quote", href: "/contact", variant: "primary" }],
      showPhone: true,
    } },
  ].filter(Boolean);

  report.service.push({ name: `svc-${slug}`, sections: sections.length, source: basename(v.source) });
  if (!REPORT_ONLY) {
    writeFileSync(join(OUT_DIR, `svc-${slug}.json`), JSON.stringify({
      slug: `svc-${slug}`,
      title: `${title} | Monarch Pro Wash`,
      sections,
    }, null, 2));
  }
}

console.log(`service-in-area pages : ${report.sia.length}`);
console.log(`service detail pages  : ${report.service.length}`);
const counts = report.sia.map((r) => r.sections);
if (counts.length) {
  console.log(`sections per SIA page : min ${Math.min(...counts)} / max ${Math.max(...counts)}`);
}
console.log(`service page sections : ${report.service.map((r) => r.sections).join(", ")}`);
if (report.problems.length) {
  console.log(`\nproblems (${report.problems.length}):`);
  for (const p of report.problems.slice(0, 25)) console.log("  " + p);
} else {
  console.log("\nno problems");
}
if (!REPORT_ONLY) console.log(`\nwrote ${report.sia.length + report.service.length} files to ${OUT_DIR}/`);
