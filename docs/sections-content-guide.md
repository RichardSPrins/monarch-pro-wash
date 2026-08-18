# Sections → Pages → Content — a mapping guide

**Audience:** the SEO / content-writing agent. Use this to plan a page as an
**ordered list of sections**, then write the copy each section needs. You are not
touching code — you are choosing section *types* and producing their *content*.

## How the site is built (the one thing to understand)

A page is **data, not code**. It's an ordered array of sections:

```json
[
  { "type": "hero:image-overlay", "theme": "inverse", "data": { "heading": "…", "ctas": [...] } },
  { "type": "trust-bar:badges",   "theme": "default", "data": { ... } },
  { "type": "services:grid",      "theme": "alt",     "data": { "limit": 6 } }
]
```

- **`type`** = `group:variant` (e.g. `hero:split-form`). Pick from the catalog below.
- **`theme`** = the color surface it renders on — `default` · `alt` · `muted` ·
  `inverse` · `primary` · `brand-secondary`. See
  [branding-variants.md](branding-variants.md) for what each looks like and how to
  alternate them for rhythm. **Rule of thumb:** alternate `default` (navy) and
  `alt` (white) down the page; use `primary`/`inverse` for a hero or a closing CTA.
- **`data`** = the copy + assets *you* write for that section.

Your deliverable per page = **the section list (types + themes) + the `data` copy**.

> **Collection-backed sections.** `services`, `reviews`, `faqs`, `service-areas`,
> and `team` can auto-pull items from CMS **collections** (you fill the collection
> once; the section shows N of them via a `limit`/`filter`) *or* take inline items.
> Prefer collections for anything reused across pages (a service, a review) so it
> stays consistent site-wide.

The live visual catalog of every variant is the **`/components`** preview page —
point to it when you need to *see* a variant.

---

## The 22 section groups — role, content, SEO job

Ordered roughly by how often they appear top-to-bottom on a page.

### 1. `hero` (16 variants) — the above-the-fold opener
- **Role:** first screen of every page. Carries the **H1**, the value promise, and the primary CTA.
- **Content you write:** eyebrow (kicker), **H1 heading** (put the primary keyword here), subheading, 1–2 CTAs, optionally a background image or a lead form.
- **SEO job:** the page's single H1 + primary keyword + intent match.
- **Pick a variant by intent:** `split-form` / `stacked-form` (capture a lead immediately — home/landing) · `image-overlay` (photo-led service & geo pages) · `split-content` / `split-checklist` (benefit-led) · `minimal` (interior/legal/about headers) · `full` / `centered-card` (bold brand landing) · `video` (high-production) · `split-stats` / `badge-row` (lead with proof).
- **Emphasis:** wrap a word in `==double equals==` to color it with the accent (e.g. `Exterior cleaning that ==transforms==`).

### 2. `trust-bar` (11) — thin credibility strip
- **Role:** a slim band right under the hero: rating, years in business, licensed/insured, review count, "as featured in" logos.
- **Content:** rating + review count, founding year, license/insured flags, partner/press logos.
- **SEO/CRO job:** instant trust signals; supports E-E-A-T. `badges` · `ratings` · `stats` · `as-featured-in` · `guarantee-strip`.

### 3. `services` (18) — what you offer
- **Role:** the menu of services, each linking to its own page.
- **Content:** per service — name, 1-line description, icon, link. (Best sourced from the **services collection**.)
- **SEO job:** internal links + keyword coverage to service pages. `grid` / `cards` / `list` (straight menus) · `featured-split` (spotlight one) · `by-category` / `category-tabs` / `category-cards` (when services group into categories) · `icon-grid` · `bento`.

### 4. `service-areas` (12) — where you work
- **Role:** geographic coverage; links to per-area/city pages.
- **Content:** city/neighborhood names (+ optional map). (Source from the **service-areas collection**.)
- **SEO job:** local/geo keyword coverage + internal links to area pages. `grid` / `list` / `chips` / `columns` (simple) · `map-split` / `map-full` / `map-chips` (with map) · `directory` (many areas).

### 5. `location` (6) — map, directions, NAP
- **Role:** where you're based / service radius, embedded map, hours, directions.
- **Content:** address (NAP), map embed URL, hours, directions CTA.
- **SEO job:** local SEO / NAP consistency. `map-embed` · `map-hours-cta` · `directions-cta` · `service-area` · `multi` (multiple locations).

### 6. `about` (15) — who you are / the story
- **Role:** company story, mission, values, owner note, credentials.
- **Content:** origin story, mission/promise, values, owner letter/video, years, "why us".
- **SEO/E-E-A-T job:** experience + trust; supports an About page and a home "about" band. `split` / `stacked` (story + image) · `why-choose-us` · `mission` / `values` · `owner-letter` / `owner-video` · `timeline` (history) · `credentials` · `promise`.

### 7. `team` (11) — the people
- **Role:** real faces behind the work.
- **Content:** names, roles, photos, short bios; owner spotlight; hiring panel.
- **E-E-A-T job:** real people = trust. `grid` / `cards-detailed` · `owner-spotlight` · `crew-group` · `roster-strip` · `hiring-panel` (recruiting).

### 8. `process` (11) — how it works
- **Role:** the steps of working with you; sets expectations, removes friction.
- **Content:** 3–6 numbered steps, each a short heading + description ("what to expect").
- **SEO/CRO job:** answers "how does it work", earns dwell time. `numbered` / `stepper` / `big-number` · `horizontal` / `vertical` / `zigzag` · `timeline` · `checklist`.

### 9. `benefits` (8) — why it matters (outcomes)
- **Role:** the outcomes/payoffs, often framed problem→solution.
- **Content:** benefit statements (outcome-led), problem→solution pairs, supporting stats.
- **CRO job:** connect features to what the customer *gets*. `grid` / `icon-list` · `problem-solution` · `stat-cards` · `alternating` · `big-icon-trio`.

### 10. `feature` (11) — what you get (capabilities)
- **Role:** concrete features/inclusions, often with icons or alternating media.
- **Content:** feature list — icon, title, short body, optional bullets/media.
- **SEO job:** detail + keyword depth on service pages. `alternating` / `media-rail` · `cards` / `bento` · `checklist` · `spotlight` / `highlight` · `sticky-list`.

### 11. `reviews` (16) — testimonials
- **Role:** social proof in customers' words.
- **Content:** quote, author, rating, source (Google/Facebook), optional photo/video. (Source from the **reviews collection**.)
- **E-E-A-T/CRO job:** trust + conversion; can carry Review/AggregateRating schema. `cards` / `masonry` / `wall` (many) · `featured` / `spotlight` (one strong quote) · `carousel` / `marquee` · `video` / `video-duo` · `summary` (rating rollup) · `verified` / `band`.

### 12. `faqs` (10) — questions & answers
- **Role:** answer objections and long-tail questions.
- **Content:** Q/A pairs (write questions the way people search). (Source from the **faqs collection**.)
- **SEO job:** long-tail keywords, **FAQPage schema**, featured-snippet capture. `accordion` / `disclosure` (compact) · `two-column` / `grid` (many) · `categorized` · `numbered` · `contact-split` (FAQ + contact).

### 13. `cta` (14) — conversion prompts
- **Role:** the ask. Every page needs at least one; put a strong one near the end.
- **Content:** heading, subheading, **button label + link** (always include a CTA), optional phone.
- **CRO job:** the conversion. `banner` (standard mid/end band) · `centered` / `gradient` / `card` · `phone-focused` (call-first) · `split` / `split-image` · `urgency-band` / `stat-backed` / `guarantee` (persuasion-backed) · `choose-path` (segment visitors) · `newsletter` (list-building) · `sticky-bar` (persistent).

### 14. `pricing` (12) — cost / estimates
- **Role:** price transparency; captures commercial-intent visitors.
- **Content:** tiers/packages (name, price, what's included), or "starting at" ranges, or an estimate table.
- **SEO job:** "cost/price" keyword intent. `tiers` / `cards` / `packages` · `estimate` / `quote` · `starting-at` / `price-list` · `table` · `financing`.

### 15. `gallery` (13) — proof of work
- **Role:** visual evidence — especially **before/after** for cleaning/exterior work.
- **Content:** project images with captions; before/after pairs; categories for filtering.
- **CRO/engagement job:** proof + dwell time. `before-after` / `before-after-grid` (highest value here) · `grid` / `masonry` · `filterable` (by service) · `project-cards` / `recent-jobs` · `carousel` · `instagram`.

### 16. `guarantee` (7) — risk reversal
- **Role:** your warranty/promise, badged.
- **Content:** guarantee terms, seal/badge, signature.
- **CRO job:** removes purchase risk. `callout` / `card-grid` · `seal-spotlight` / `pledge-banner` · `promise-signature` · `image-split`.

### 17. `certifications` (7) — credentials & partners
- **Role:** licenses, insurance, brand/partner certifications.
- **Content:** cert logos, license numbers, partner brands.
- **E-E-A-T job:** authority/trust. `grid` / `logos-row` · `detail-cards` / `credential-list` · `partner-showcase`.

### 18. `comparison` (6) — differentiation
- **Role:** us-vs-them, DIY-vs-pro, cost-of-cutting-corners.
- **Content:** comparison rows (feature → us vs them).
- **CRO job:** persuasion + differentiation. `us-vs-them` / `us-vs-them-cards` · `diy-vs-pro` · `what-sets-us-apart` · `cost-of-cutting-corners` · `before-hiring-checklist`.

### 19. `stats` (8) — numbers
- **Role:** credibility via metrics (jobs completed, years, homes served).
- **Content:** stat value + label (+ optional description).
- **CRO job:** at-a-glance credibility. `counters` (animated) · `cards` / `band` / `bar` · `spotlight` · `comparison`.

### 20. `content` (11) — prose / article blocks
- **Role:** long-form body copy — the backbone of blog posts and content-rich pages.
- **Content:** rich text, headings, callouts, pull-quotes, inline stats, Q&A.
- **SEO job:** the indexable body content + keyword depth. `rich-text` / `lead-article` · `two-column` / `sidebar` · `image-text` · `callout` / `quote` / `quote-band` · `stat-interrupt` · `qa`.

### 21. `contact` (12) — contact forms & info
- **Role:** the contact page surface — form + NAP + hours + map.
- **Content:** form fields, address/phone/email, hours, map.
- **CRO job:** the primary conversion on a contact page. `form` / `inline-form` · `map-form` / `hours-map-form` · `split` / `cards` · `emergency` / `callback` · `form-trust` (form + trust signals).

### 22. `banner` (6) — announcement / promo strips
- **Role:** thin, page-top or floating promo/alert strips.
- **Content:** short message, offer, phone; seasonal or urgent notices.
- **CRO job:** promotions, seasonal offers, alerts. `announcement` · `promo-strip` / `financing` · `phone-cta` · `weather-alert` · `review-rating`.

---

## Page recipes — which sections build which page

Recommended section order per page type (local-services / exterior-cleaning).
Adjust length to intent; **every page gets exactly one H1 (the hero) and at least
one `cta`.** Theme column shows a sensible surface for rhythm.

### Home
| # | Section | Theme | Content focus |
| --- | --- | --- | --- |
| 1 | `hero:split-form` or `hero:image-overlay` | inverse | H1 + primary promise + lead form/CTA |
| 2 | `trust-bar:badges` | default | rating · years · licensed/insured |
| 3 | `services:grid` (or `by-category`) | alt | 4–8 services, each linking out |
| 4 | `benefits:problem-solution` or `feature:alternating` | default | why it matters / what you get |
| 5 | `process:numbered` | alt | 3–4 steps |
| 6 | `gallery:before-after` | default | proof of work |
| 7 | `reviews:cards` or `wall` | alt | 3–6 testimonials |
| 8 | `faqs:accordion` | default | 5–8 top questions |
| 9 | `cta:banner` | primary | strong closing ask |

### Service page (one service, e.g. "House Washing")
| # | Section | Theme | Content focus |
| --- | --- | --- | --- |
| 1 | `hero:image-overlay` | inverse | H1 = "{Service} in {City}" + CTA |
| 2 | `trust-bar:ratings` | default | proof |
| 3 | `content:rich-text` or `feature:checklist` | alt | what's included / the service explained (keyword depth) |
| 4 | `process:horizontal` | default | how this service works |
| 5 | `benefits:grid` | alt | outcomes |
| 6 | `gallery:before-after` | default | results for *this* service |
| 7 | `pricing:estimate` or `starting-at` | alt | cost/commercial intent |
| 8 | `reviews:featured` | default | a strong relevant quote |
| 9 | `faqs:accordion` | alt | service-specific questions (FAQ schema) |
| 10 | `cta:banner` | primary | book/quote |

### Service-area / location page (e.g. "Pressure Washing in Meridian")
| # | Section | Theme | Content focus |
| --- | --- | --- | --- |
| 1 | `hero:image-overlay` | inverse | H1 = "{Service} in {City}, {State}" |
| 2 | `trust-bar:badges` | default | local trust |
| 3 | `services:grid` | alt | services offered in this area |
| 4 | `location:map-hours-cta` or `service-areas:map-split` | default | map + coverage + neighborhoods |
| 5 | `reviews:cards` | alt | **local** reviews if possible |
| 6 | `faqs:accordion` | default | area-specific Qs (parking, HOAs, seasons) |
| 7 | `cta:banner` | primary | local ask |

### About
`hero:minimal` (inverse) → `about:split` (story) → `about:values` or `mission` (alt) → `team:grid` (default) → `stats:band` (primary) → `certifications:logos-row` (alt) → `guarantee:seal-spotlight` (default) → `reviews:spotlight` (alt) → `cta:banner` (primary).

### Contact
`hero:minimal` (inverse) → `contact:hours-map-form` (default) → `faqs:contact-split` (alt) → `cta:phone-focused` (primary).

### Pricing
`hero:minimal` (inverse) → `pricing:tiers` or `estimate` (default) → `guarantee:callout` (alt) → `comparison:diy-vs-pro` (default) → `faqs:accordion` (alt) → `cta:banner` (primary).

### Gallery / Portfolio
`hero:minimal` (inverse) → `gallery:filterable` or `before-after-grid` (default) → `reviews:marquee` (alt) → `cta:banner` (primary).

### Reviews / Testimonials
`hero:minimal` (inverse) → `reviews:wall` (default) → `trust-bar:ratings` (alt) → `cta:banner` (primary).

### Blog post
`hero:minimal` (inverse, H1 = post title) → `content:lead-article` → `content:rich-text` blocks (with `callout` / `quote` / `stat-interrupt` for rhythm) → `cta:banner` (primary). Keep the body in `content:*` sections so it's clean indexable prose.

---

## SEO checklist per page (agent must enforce)

- **One H1** — only the hero. All other headings are H2/H3 within sections.
- **Primary keyword** in the hero H1 + first content block; geo modifier on area pages.
- **FAQ schema** — use a `faqs:*` section on money pages; write questions in real search phrasing.
- **Internal links** — `services:*` links to service pages; `service-areas:*` links to area pages. Every page should link out via at least one of these.
- **E-E-A-T** — pair `about` + `team` + `reviews` + `certifications`/`guarantee` on trust-sensitive pages.
- **Local SEO** — consistent NAP via `location:*`/`contact:*`; geo keywords via `service-areas:*`.
- **One clear CTA path** — at least one `cta:*` per page; the CTA must always have a button (label + link), not just body copy.
- **Media** — before/after galleries carry alt text describing the work + location.

## Related
- Colors & when to use each `theme` surface: [branding-variants.md](branding-variants.md)
- Live visual catalog of every variant: **`/components`**
- Registry (source of truth for valid `type` keys): [src/lib/sectionRegistry.ts](../src/lib/sectionRegistry.ts)
