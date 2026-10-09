# Monarch Pro Wash — Resume Context: Page-Structure Blueprint Rework (2026-10-08)

> **Why this doc exists.** The original pages were scrapped because they were built on a *lean*
> section structure. The job now is to rebuild each page type to the **extended section blueprint**
> we designed. Reconstructed from the repo + the brain-vault blueprint docs + Claude memory
> (the weeks-long build session transcript, `85242c70…`, was purged from `~/.claude/projects`).
> Hand this file to a new IDE session: open Claude Code in `monarch-pro-wash/` and say
> "Read docs/RESUME-CONTEXT-2026-10-08.md — that's where we left off."

## The mission (one line)
Rebuild the site's pages to the **extended section blueprint** — ~12–15 sections per money page
(= the Six Jobs expanded), replacing the lean lineups the scrapped pages used.

## Stack (confirmed on disk)
- **Astro SSR** on Cloudflare Workers + **D1 + R2**. CMS = **EmDash** (Decap→EmDash migration complete & merged; branch `master`). Prod-prep pass done 2026-10-08.
- **Section engine:** every section is `type = group:variant` (+ `theme` + `data`); registry `src/lib/sectionRegistry.ts` (**264 variants / 22 groups**), rendered by `src/components/PageRenderer.astro`.
- **A page = data:** an ordered JSON `sections` array `[{type,theme,data}]`. Authored pages store it in the EmDash `pages` collection (`ec_pages.sections`); template routes build it in code.

## THE BLUEPRINT (the target structure)
Three layers — authoritative sources live in the brain vault + wiki, not this repo:
- **Why:** `[[Six Jobs Page Architecture]]` — Hero · Proof · Value · Deeper Proof · Objection · Final CTA. "Real pages run 12–15 sections = the six jobs expanded." Tier counts: Launch ~7–8, Accelerate ~10–12, Velocity ~15.
- **How:** `[[Monarch Site Section Template]]` — the 22 groups, collection-backed sections, page recipes.
- **Build map:** `[[Section Mapping — LAB Content ↔ Monarch Site Sections]]` — §0 contractor scope + per-page recipes + the shared-vs-unique scalability rule.
- **Docs on disk:**
  - Vault: `~/Documents/brain/second-brain/output/monarch-pro-wash/website-copy/section-mapping.md` · `…/service-pages/_shared-service-page-scaffold.md`
  - Repo: `docs/sections-content-guide.md` (page recipes) · `docs/SECTION-MANIFEST.md` (variant catalog) · `docs/design-manifest.md` (design/layout gaps incl. the sticky-sidebar page layout)

### Target recipes — build page sections to these

**Service Details page — canonical 12 (`_shared-service-page-scaffold.md`):**
1 `hero:image-overlay` (inverse) · 2 `trust-bar:badges` (default) · 3 `content:rich-text` — The Service Explained (alt) · 4 `feature:alternating` — Top Concerns, 2–3 statement-headed (default) · 5 `process:horizontal` (alt) · 6 `about:why-choose-us` (default) · 7 `gallery:before-after` 🔲 (alt) · 8 `reviews:featured` 🔲 (default) · 9 `guarantee:callout` — The Monarch Standard (alt) · 10 `faqs:accordion` (default) · 11 `service-areas:chips` (alt) · 12 `cta:banner` (primary).
(Fuller 14-row variant with `benefits:problem-solution` + `feature:checklist` is in `section-mapping.md` §3. CTA repeats after §2/§6. No pricing, no stat band, no spotlight.)

**Service-in-Area page — ~12, ONLY §1–3 unique per town×service:**
1 `hero:split-form` + injected 3-step quiz (inverse, code-driven) — "{Service} in {City}, ID" **[unique]** · 2 `trust-bar:badges` — Location Page Trust **[unique opener]** · 3 `content:rich-text` — Location Page Service Description **[unique]** · 4 `process:horizontal` · 5 `about:why-choose-us` · 6 `gallery:before-after` 🔲 · 7 `reviews:cards` (filter: area) · 8 `guarantee:callout` · 9 `faqs:accordion` · 10 `services:grid` (other services) · 11 `service-areas:chips` (other areas) · 12 `cta:banner`. Everything after §3 is shared/collection-pulled.

**Already-authored core pages (reference — these are ON blueprint):**
Home 13 · About 12 · Services hub 7 · Contact 5.

## CURRENT STATE vs BLUEPRINT (the gap = the work)

| Page type | Route / entry | Sections sourced from | Now | Target | Action |
|---|---|---|---|---|---|
| Home `index` | authored `pages` entry | CMS `sections` | **13** ✅ | ~9–13 | none (on blueprint) |
| About | authored | CMS `sections` | **12** ✅ | ~9–12 | none |
| Services hub | authored `services` | CMS `sections` | **7** ✅ | lean recipe | none (lean by design) |
| Contact | authored | CMS `sections` | **5** ✅ | lean recipe | none |
| **Service detail** | `services/[slug].astro` → CMS entry `svc-{slug}` via PageRenderer | CMS `sections` | **absent / scrapped** (no `svc-` entries in seed) | **12** | REBUILD section arrays to the 12-section recipe |
| **Category hub** | `category/[slug].astro` → `svc-{cat}-services` | CMS `sections` | scrapped/absent | recipe | REBUILD |
| **Town hub** | `[...slug].astro` → town-slug entry | CMS `sections` | scrapped/absent | recipe | REBUILD |
| **Service-in-Area** | `[area]/[service].astro` — authored `sia-{area}--{service}` if present, **else hardcoded `fallbackSections`** | code fallback (or CMS) | **lean 7** (quiz·hero·trust·rich-text·process·guarantee·cta) | **12** | EXPAND `fallbackSections` (adds why-us, before/after, reviews, faqs, services-grid, service-areas-chips) |

## DECIDE FIRST — two ways to apply the blueprint
- **A. Code/template-driven (recommended for scale).** Expand the SIA route's `fallbackSections`
  (in `src/pages/[area]/[service].astro`, ~line 40–95) from 7 → the 12-section recipe, pulling the
  shared sections from collections (`services`, `faqs`, `reviews`, `service_areas`) and keeping only
  §1–3 unique. Give `services/[slug].astro` / `category/[slug].astro` / `[...slug].astro` a shared
  default section set the same way. One code change lifts 18 services + ~234 SIA combos at once.
  **Not CMS-gated, does not touch prod data.** Matches the blueprint's "only §1–3 unique, rest shared" rule.
- **B. CMS-authored per page.** Author each `svc-*` / `sia-*` / category / town entry's `sections`
  array in EmDash. Per-page control, but manual across 250+ entries, **CMS-GATED, and writes hit
  PRODUCTION** (see dev setup). Use only for genuinely page-unique overrides.

Recommendation: **A for the shared structure**, then B (with explicit go-ahead) only for per-page unique copy that can't come from a collection.

## Local dev setup — READ BEFORE RUNNING OR EDITING ANYTHING
- **Local dev runs against the SAME remote Cloudflare D1 + R2 as PRODUCTION** (`remote: true` on the
  `DB` and `MEDIA` bindings in `wrangler.jsonc`). `astro dev` talks to the live D1. ⇒ **any CMS data
  written locally writes to PRODUCTION.** `.wrangler/state` miniflare sqlite is stale/unused.
- **Local CMS login (dev only):** `http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin`.
- **⚠️ LANDMINE:** use the **auth** dev-bypass above. NEVER hit `/_emdash/api/setup/dev-bypass` — the
  *setup* endpoint runs `applySeed()` and overwrites PRODUCTION content with seed.
- **Homepage slug MUST be `index`** (not `home`); `[...slug].astro` resolves `/` → `getPage("index")`.

## Guardrails (carry over)
- **NO autonomous CMS data writes.** Only change CMS content when Richard says, point-blank, "change X
  in the CMS." Editing `.astro`/code files (incl. the SIA `fallbackSections`) is NOT gated. Because
  local == prod, a stray CMS write hits the live site — this is safety-critical, not preference.
- **Contractor scope:** no pricing on the site (cost → free quote), no stat/featured-number bands, no
  `feature:spotlight`, plain keyword-first voice, phone in chrome/CTA only. Real proof only (reviews, jobs).
- **Sections are theme-pure** (design tokens only); new variants go in the shared library, never forked per site.
- **No double card/heading wrappers** — a self-contained component (`FormRenderer`, review cards, Starwind
  widgets) already renders its own card/heading; don't wrap it. `HeroQuoteForm` = thin `<FormRenderer .../>` pass-through.
- **URL hierarchy:** plural `/services`; category pages carry `-services` suffix; EmDash bans slash slugs →
  `svc-` / `sia-{area}--{service}` prefixes; menu links use the flat patterns (never nested `/services/{cat}/{svc}`).
- **Shared FAQ pool:** home/contact/services FAQ sections all draw the same `faqs` collection (no per-page scoping without a service/tag field).
- **Defer deploy** to the very end: `SITE_URL=… npm run build && npx wrangler deploy` only when Richard says content is complete.

## Related — NEXT layer, not this task
Phase-2 design polish (`docs/design-manifest.md` §3): content-rich two-column + **sticky sidebar** for
service / service-in-area pages (Sol Pressure Wash ref) — a `🏗 page-level layout`, not a section.
Do this AFTER the section-structure blueprint is in, and only on explicit greenlight.

## Key files
- Section source of truth: `src/lib/sectionRegistry.ts`, `src/lib/sectionSchemas.ts`, `src/components/PageRenderer.astro`
- Routes to edit for the blueprint: `src/pages/[area]/[service].astro` (SIA fallback) · `src/pages/services/[slug].astro` · `src/pages/category/[slug].astro` · `src/pages/[...slug].astro`
- CMS seed/export: `.emdash/seed.json`
- Blueprint docs: `docs/sections-content-guide.md` · `docs/SECTION-MANIFEST.md` · `docs/design-manifest.md` · vault `section-mapping.md` + `_shared-service-page-scaffold.md`

## Suggested first step
Confirm **Option A**. Then open `src/pages/[area]/[service].astro`, and expand `fallbackSections`
from the current 7 to the 12-section SIA recipe above — keeping §1–3 (quiz-hero, trust, rich-text)
and adding why-us, before/after, reviews(filter:area), faqs, services:grid, service-areas:chips before
the CTA, pulling the shared ones from collections. Verify against `section-mapping.md` §3 before writing.
Build locally (`npm run dev`), check a page like `/boise/pressure-washing`, do NOT deploy.
