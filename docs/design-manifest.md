# Monarch Design Manifest — Inspiration → Status → Prototype Backlog

A catalog of design elements worth borrowing from top home-service sites (Mammoth
Plumbing, Madd Air HVAC, Pool Envy, **PV HVAC**, Baird Construction, Shattered
Vision Auto Glass, Sudsy Bins, Aqua Guys Cleaning), mapped against what Monarch
**already has** so we prototype the gaps, not rebuild the canon.

**Branding is fixed.** Palette stays exactly as-is (navy `#0e2a3f` · orange
`#e85c2b` · teal `#2fa8b5`). The only token work is *consistency*, not new values.

**Legend:** ✅ have (variant) · 🎨 have but needs polish pass · 🧩 net-new component ·
✨ cross-cutting flair (not a section) · 🏗 page-level layout · 🎯 token work

---

## 0. The headline

The registry already has **242 `group:variant` sections**. Almost every *component*
in the references maps to one. The polish these sites have comes from four layers
that are mostly **not** about adding components:

1. **Token consistency** (§1) — one source of truth for the palette.
2. **Visual flair system** (§2) — the devices that read as "designed": angular
   cuts, layered shapes, rating lockups, animated counters, slider interactions.
   **This is the highest-leverage, least-built layer.**
3. **Page-level layouts** (§3) — the sticky-sidebar service page, editorial
   alternating page, sticky sub-nav.
4. **Polish passes** (§4) on existing variants to hit the reference bar.
5. **Genuinely net-new components** (§5) — a short list.

---

## 1. 🎯 Token consistency (keep values, unify the system)

- **Two palettes stacked.** `theme.css` defines the real Monarch palette as `--t-*`.
  `global.css` correctly re-maps Starwind's semantic vars (`--primary`,
  `--background`, `--card`, `--secondary`, `--border`, …) to `--t-*` per theme
  context. **But `starwind.css` still ships defaults** (`--primary: --color-blue-700`,
  neutrals for surfaces). Any component/context `global.css` doesn't cover falls
  back to Starwind blue/neutral → drift.
  - **Fix:** make `--t-*` the single source; ensure every Starwind semantic var is
    overridden in **every** theme context (default/alt/muted/inverse + light/dark);
    strip or neutralize the leftover blue/neutral defaults in `starwind.css`.
- **Audit hardcoded hex** in section components → replace with tokens (esp. the
  scrim `rgba(0,0,0,var(--overlay))`, card `#fff`, borders).
- **Formalize the semantic scale** so every new component pulls from it:
  - Surfaces: `base / alt / muted / inverse` (+ `surface-base` reset utility ✅).
  - Ink: `fg / fg-inverse / fg-on-light` (+ `-muted` variants).
  - Accent: `primary (+light/muted)`, `secondary (+light/fg)`.
  - Lines/elevation: `border`, shadow scale (sm/md/lg), `radius` knob (✅ `--t-radius`).
  - Rhythm: container widths, `section-py-*`, gap scale, eyebrow style, focus ring.
- **Deliverable:** a one-page token reference + a lint that flags raw hex in `src/components`.

---

## 2. ✨ Visual flair & presentation system (the real "polish")

These are **cross-cutting devices**, not sections — apply across many components.
Almost none exist yet (only footer play-icon polygons found; no dividers/clip-paths).

### Section transitions & shape
- **Angular / diagonal clip-path cuts** between sections *(PV, Shattered)*. ✨🧩
- **Curved / wavy section dividers** *(Mammoth, Sudsy water-waves)*. ✨🧩
- **Layered geometric background shapes** — hex pattern, shards, offset blocks
  *(PV hexagons, Shattered glass shards)*. ✨🧩
- **Diagonal separators between stat columns** *(PV 5,000+ / 99% / 1hr)*. ✨🧩
- **Blueprint / grid-line background texture** *(Baird, Aqua Guys swirl rail)*. ✨🧩

### Cards & surfaces
- **Card system**: consistent elevation, radius, **hover-lift**, optional accent
  rail, **corner-arrow** affordance *(Mammoth, Baird service cards)*. ✨🎨
- **Image cards with gradient overlay + title + arrow** *(Mammoth, Baird)*. 🎨
- **Angular photo masks / clipped media** *(PV, Shattered)*. ✨🧩
- **Navy scrim / duotone photo treatment** for brand cohesion on imagery. ✨

### Type & labels
- **Condensed display headings** used with confidence (weight/tracking/scale) —
  *within the current font family*, no new fonts *(Baird, Shattered, PV)*. 🎨
- **Eyebrow labels** — uppercase, tracked, accent-colored, consistent everywhere. 🎨
- **Balanced headline wrapping** (`text-wrap: balance`) + intentional type scale. 🎨

### Motion & interaction
- **Animated number count-up on scroll** for stats *(PV, Shattered, Baird)*. ✨🧩
- **Before/after DRAG slider** interaction *(the pressure-wash money shot)*. ✨🎨
- **Reviews carousel** with real Google/Angi/Facebook card styling *(all)*. 🎨
- **Hover-reveal** on service cards *(services:hover-reveal exists — wire it)*. 🎨
- **Subtle scroll-reveal** entrances (respect `prefers-reduced-motion`). ✨
- **Micro-interactions**: button press, link-arrow slide, focus rings. ✨

### Trust motifs
- **Rating lockup trio**: platform logo + stars + score + "3,000+ combined
  reviews" *(PV, Shattered)*. ✨🎨
- **Guarantee seal / badge** graphic *(Sudsy 100%, Madd Air Elite Dealer)*. 🎨
- **Award / certification badge row** *(Madd Air)*. ✅ trust-bar:cert-chips / badges
- **Insurance / partner logo billing strip** *(Shattered)*. ✅ trust-bar:logos

---

## 3. 🏗 Layout & page composition (gaps — not sections)

- **Sticky right-rail service / SIA page** — content main-left, sticky sidebar
  (quote form, call, trust, "Our Services in {Town}", areas, guarantee)
  *(Aqua Guys, Madd Air service page)*. 🏗 **Primary gap.** Renderer only does flat
  stacks today; add a two-column composition at the route/layout layer so all 198
  SIA pages + service-detail pages inherit it with **zero re-authoring**.
- **Editorial alternating image/text long page** — zig-zag media blocks with
  diamond-bullet checklists *(Baird, Pool Envy service pages)*. ✅ feature:alternating /
  content:image-text exist → 🎨 sequence + polish.
- **Sticky in-page sub-nav / anchor jump** for long service pages. 🧩🏗
- **Mobile floating call/quote bar**. ✅ cta:sticky-bar → 🎨 verify + style.
- **Deliberate section rhythm** — alternation of navy → light → navy → primary
  bands, consistent spacing, divider treatment between them. ✨🏗

---

## 4. Component canon — reference → existing variant → polish target

Everything below **already exists**; the work is a polish pass (🎨) to hit the bar.

### Hero
- Rating-trio overlay hero *(PV)* → `hero:overlay-card` + `trust-bar:ratings`. 🎨
- Angular hero *(PV, Shattered)* → `hero:angled`. 🎨 (add clip-path §2)
- Form-in-hero *(Mammoth, Madd Air)* → `hero:split-form` / `hero:stacked-form`. ✅ (live on SIA)
- Full-bleed photo hero *(Baird, Pool Envy)* → `hero:full` / `hero:image-overlay`. 🎨

### Trust / stats
- Icon stat cards *(Shattered: Years/Installs/Warranty/Insured)* → `trust-bar:stats` / `stats:icon-grid`. 🎨
- Big counters w/ diagonal separators *(PV)* → `stats:counters` / `stats:band`. 🎨 + count-up §2
- Award badges *(Madd Air)* → `trust-bar:badges` / `certifications:*`. ✅
- Rating trio band *(PV)* → `banner:review-rating` / `trust-bar:ratings`. 🎨

### Services
- Image-overlay cards *(Mammoth, Baird)* → `services:cards` / `services:grid`. 🎨
- Angular icon tabs *(PV, Madd Air)* → `services:icon-grid` / `services:tabs`. 🎨
- Category filtering → `services:category-tabs/filter/cards`. ✅

### Why-us / benefits
- 2×2 icon grid *(Mammoth)* → `benefits:grid` / `benefits:icon-list`. 🎨
- "Our Promise" 3-icon card *(Madd Air)* → `benefits:big-icon-trio` / `about:promise`. 🎨
- Problem → solution cards *(Sudsy "hidden problem")* → `benefits:problem-solution` /
  `comparison:cost-of-cutting-corners`. 🎨 **High-value framing for Monarch.**

### Proof
- Google review cards / carousel / wall *(all)* → `reviews:cards/carousel/wall`. 🎨
- Video testimonial big+thumbs *(PV, Pool Envy)* → `reviews:video-duo` / `reviews:video`. 🎨
- Owner spotlight / letter *(Shattered, PV brothers)* → `about:owner-video/letter`, `team:owner-spotlight`. 🎨

### Before / after & gallery
- Labeled before/after pairs *(Sudsy)* → `gallery:before-after` / `-grid`. 🎨 + slider §2
- Recent jobs / project cards / masonry *(Mammoth, Baird)* → `gallery:recent-jobs/project-cards/masonry`. 🎨

### Pricing & comparison
- Tiered plans w/ highlighted middle *(Sudsy $79/$25★/$35)* → `pricing:tiers`. 🎨
  **Directly useful for recurring: bin cleaning, maintenance, seasonal.**
- Financing band *(Pool Envy)* → `pricing:financing` / `banner:financing`. 🎨
- DIY-vs-pro / us-vs-them *(canon)* → `comparison:diy-vs-pro/us-vs-them-cards`. 🎨

### Process
- Numbered cards 01–04 *(Baird)* → `process:numbered` / `process:big-number`. 🎨
- Icon steps w/ connector *(Sudsy)* → `process:icon-row` / `process:timeline`. 🎨

### Service area
- Map + city list *(Mammoth, Madd Air)* → `service-areas:map-split` / `location:service-area`. 🎨
- City tabs / chips *(Sudsy)* → `service-areas:tabs` / `service-areas:chips` / `map-chips`. 🎨
- City link columns *(Pool Envy)* → `service-areas:columns` / `directory`. ✅ (live on SIA)

### Team & about
- Crew carousel *(Madd Air)* → `team:carousel` / `team:crew-group`. 🎨
- Founders / family story *(PV)* → `about:team-story` / `team:owner-spotlight`. 🎨
- Stats band / numbers collage *(Baird)* → `about:stats-band` / `about:numbers-collage`. 🎨

### Guarantee & CTA
- Guarantee seal spotlight *(Sudsy)* → `guarantee:seal-spotlight` / `guarantee:badges`. 🎨
- Big-type diagonal CTA *(Shattered "One Call One Install")* → `cta:urgency-band` /
  `cta:stat-backed`. 🎨 + clip-path §2
- Phone-focused / sticky CTA *(all)* → `cta:phone-focused` / `cta:sticky-bar`. 🎨

---

## 5. 🧩 Genuinely net-new components to prototype

Short — because §4 shows the canon exists. Candidates with no clean home today:

- **Angular section-divider primitive(s)** — reusable clip-path/wave dividers as a
  wrapper utility (feeds every section). ✨🧩
- **Layered geometric background component** — hex/shard/grid-texture backdrop. ✨🧩
- **Rating-lockup trio** as a standalone, reusable element (logo+stars+count). 🧩
- **Before/after drag-slider** interactive component (upgrade of the static variant). 🧩
- **Animated stat counter** behavior (attach to existing stats variants). 🧩
- **Sticky in-page sub-nav** for long service pages. 🧩🏗
- **Financing / savings calculator** (interactive) — beyond the static `pricing:financing`
  band; optional, ties to the estimator. 🧩

---

## 6. Proposed prototyping approach

Build an internal **`/design-lab`** route (not CMS-managed) that renders, in
Monarch's real tokens/fonts on localhost:

1. **The flair system first** (§2) — dividers, layered shapes, card system, rating
   lockup, count-up, before/after slider. These compound: once built, every polish
   pass in §4 gets easier and more consistent.
2. **The sticky-sidebar page layout** (§3) — the biggest single UX/conversion win,
   applies to all 198 SIA + service-detail pages via the render layer.
3. **Polish passes** (§4) on the top-of-funnel components: hero → trust/stats →
   services → before/after → reviews → pricing.
4. **Token consolidation** (§1) underpins all of it — do first or alongside step 1.

Winners graduate from the lab straight into the section registry / route layer.
```
Priority: §1 tokens  →  §2 flair system  →  §3 sidebar layout  →  §4 polish passes
```
