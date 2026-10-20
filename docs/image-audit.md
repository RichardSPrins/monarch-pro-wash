# Image audit — Monarch Pro Wash

**Audited 2026-10-19** against the live CMS (52 published pages) and the codebase.

The site currently ships with **no photography at all**. Every image on it is either the logo,
the brand butterfly, or generated abstract artwork I made as deliberate placeholders. Nothing
misrepresents the business, which was the right call at launch, but it is now the single biggest
quality gap on the site: exterior cleaning is a visual trade and the one thing a visitor wants to
see is a before and after.

This document lists every slot that renders an image, what the ideal shot is, and what to use
from stock until the real thing exists.

---

## Summary

| Slot | Count | Status | Priority |
|---|---:|---|---|
| Hero backgrounds | **50** | empty | **1** |
| Before / after pairs | reserved | section hidden, no pairs | **1** |
| Owner portrait | 1 | shows "RP" initials | **2** |
| Service-page feature rows | **24** | empty | 2 |
| Home media-rail image | 1 | empty | 3 |
| About split images | 3 | generated placeholder | 4 |
| Blog covers | 10 | generated placeholder | 4 |
| Credential badges | 1 row | empty, correctly | n/a |
| `ec_services.image` | 18 | empty, **does not matter** | n/a |

**Do not source 18 service images.** None of the three live `services:*` variants render an image,
so those database fields are inert. They only matter if the design later switches to a variant
that uses them.

---

## 1. Hero backgrounds — 50 slots

The biggest single win. Every hero currently renders as flat navy. The component already supports
a background with a darkening overlay (`backgroundImage: { src, overlayOpacity }`, default 60%),
and the image is served at up to **2200px wide**, so source files need to be large.

**Spec:** 2400px wide minimum, landscape 16:9 or wider, JPG. Composition must survive a dark
overlay and have usable dead space on the left where the headline sits.

### 1a. Home page — 1 slot (`hero:angled`)
The most important photograph on the site. Ideally Richard working, mid-job, on a recognisable
Treasure Valley home. Wide, late-afternoon light, visible water or spray, person small in frame.
Not a portrait, not a posed shot by a van.

### 1b. Service pages — 9 slots (`hero:image-overlay`)
One per service, plus the services hub. Each should show **that specific service in progress**:

| Page | Shot |
|---|---|
| `/services/pressure-washing` | Surface cleaner on a driveway, clean/dirty line visible |
| `/services/soft-washing` | Low-pressure wand on siding, soft fan of spray |
| `/services/roof-cleaning` | Roof from ladder height, black streaking visible on one slope |
| `/services/gutter-cleaning` | Gloved hand pulling debris from a gutter, or water running clear from a downspout |
| `/services/window-cleaning` | Squeegee mid-pull, clean glass against dirty |
| `/services/concrete-sealing-staining` | Sealer going down, wet-look edge against dry concrete |
| `/services/post-construction-cleanup` | New build with protective film and site dust still on it |
| `/services/graffiti-removal` | Tagged wall mid-removal, half cleared |
| `/services` (hub) | Wide shot of a whole property, several surfaces visible |

### 1c. Service-in-area pages — 40 slots (`hero:split-form`)
Five towns × eight services. **Do not shoot 40 photographs.** The practical approach is one
recognisable image per town, reused across that town's eight pages: a streetscape or housing type
that reads as Boise, Meridian, Nampa, Eagle or Caldwell. North End bungalows, Meridian
subdivisions, Old Nampa brick, Eagle estates, Caldwell historic district.

That is five photographs for forty pages, and it beats a generic stock image on all of them.

---

## 2. Before / after — the highest-value images you do not have

`gallery:before-after` exists, takes `pairs: [{ before, after, label, alt }]`, and **hides itself
when empty**, which is why you have never seen it. It is not on any page right now.

This is the proof unit of the trade. One real drag-to-compare slider on a service page does more
than any amount of copy.

**Rules:** identical camera position, identical framing, same time of day. Shoot the before on
arrival every single time, even when you do not expect to use it. A misaligned pair looks worse
than no pair.

**Never use stock for this.** A fabricated before/after is a fake result claim, and unlike a
generic hero shot it is the thing a customer is actually relying on.

Start with: one driveway, one roof, one house wash. Three pairs is enough to populate the three
busiest service pages.

---

## 3. Owner portrait — 1 slot

About page, `team:owner-spotlight`, currently rendering the initials "RP" in a pale box.

**Spec:** portrait, **4:5**, 1200×1500 minimum.

Richard, outdoors, in work clothes, with equipment or the van in soft focus behind. Looking at
camera, relaxed, not folded arms. This page's whole argument is "you get me, not a rotating
crew", and it is undercut by a grey box with two letters in it.

Your own vault is blunt about this: *"real photos of Richard, family, truck, and community are
what make this page work. Stock photos would undo the whole point."* **No stock here. Ever.**

---

## 4. Service-page feature rows — 24 slots

Eight service pages × three rows, `feature:alternating`, **4:3**, 1200×900.

Each row is a specific objection, so each image should show the thing being described rather than
a generic action shot. Examples from the live copy:

- "Pressure washing strips the granules that protect your shingles" → granules collected in a gutter
- "A clogged gutter is a water problem waiting to happen" → overflow running down fascia
- "Hard-water spots do not come off with a rag" → close-up of mineral spotting on glass
- "Aggressive removal can leave a scar worse than the tag" → a clean patch standing out on old brick

These are detail shots, not wide shots, and most can be taken on a phone during normal work.

---

## 5. Home media-rail — 1 slot

Section heading is "One Call for the Whole Property", **4:3**, 1200×900. Ideally one frame showing
several surfaces at once: driveway, siding and windows in the same shot.

---

## 6. Already placeholders, replace when convenient

Generated brand artwork. On-brand and not misleading, so low urgency.

- **About split images** (3): `/images/about/our-story.png`, `why-the-monarch.png`, `community.png`
- **Blog covers** (10): `/images/blog/*.png`

Replace with real job photography using the **same filenames** and nothing else changes.

## 7. Correct as they are — leave alone

- `og-default.png` — real branded 1200×630 social card
- `logo.png`, `/brand/butterfly-*` — the actual brand marks
- `footer-motif.png` — the commissioned footer illustration
- `certifications:logos-row` — empty **on purpose**. Never display a badge you have not earned.
  BBB, Google rating, PWNA and UAMCC go here only once real.

## 8. Dead files to delete

- `src/assets/images/hero-img.png` — **2.2 MB, zero references**
- `roofing-crew.jpg` — stock roofing photo on a pressure-washing site. No longer on any live page;
  still referenced by `magnet-demo.astro` and an unused component variant.

---

## Stock sourcing, until you have your own

**Use:** Unsplash, Pexels (both free, commercial use, no attribution required). Adobe Stock if you
want specific results.

**Search terms that return usable results:** `pressure washing driveway`, `soft wash siding`,
`roof cleaning algae`, `gutter cleaning hands`, `window cleaning squeegee`, `concrete sealing`,
`power washing patio`.

**Rules for stock on this site:**

1. **Never for before/after, the owner portrait, or credential badges.** Those are claims about
   you, not decoration.
2. **No visible faces.** A stock person becomes "the owner" in a visitor's mind. Hands, equipment
   and surfaces only.
3. **No other company's branding** — van livery, uniforms, logos.
4. **Nothing that misrepresents the climate.** Lush green lawns and wet pavement read wrong for
   the high desert. Prefer dry, bright, open.
5. **Nothing implying scale you do not have.** No crews of four, no fleets.
6. Replace with your own work as it accumulates. Stock is a stopgap, not a decision.

---

## Technical requirements

| | |
|---|---|
| Format | JPG for photographs, PNG only for graphics with transparency |
| Hero source width | **2400px minimum** (served up to 2200px) |
| 4:3 slots | 1200×900 minimum |
| Owner portrait | 1200×1500 (4:5) |
| File size | Keep source under ~2 MB; Astro + the Cloudflare `IMAGES` binding handle resizing and WebP |
| Colour | Images sit on navy under a 60% dark overlay. Bright, high-contrast originals survive it; flat grey ones disappear. |

**Where to put them:** drop files in `public/images/` and reference by path, or upload through the
EmDash admin media library, which serves from R2 and is optimised automatically. Note there is **no
image picker for sections** — section images are set by pasting a path into the section JSON. That
is a known gap recorded in the CMS ADR.

**Alt text is required on every one.** Describe the work and the town: "Soft washing the north-facing
siding of a North End bungalow in Boise", not "pressure washing".

---

## Suggested order

1. **Three before/after pairs** from your next three jobs. Highest value, costs nothing but remembering to shoot the before.
2. **Owner portrait.** One hour with anyone competent.
3. **Five town hero images.** Covers 40 pages.
4. **Nine service hero images.** Shoot during normal work over a few weeks.
5. **24 feature-row detail shots.** Phone photos during jobs.
6. Replace the generated About and blog artwork last.

Steps 1 and 2 are the two that change how the site is perceived. Everything after is refinement.
