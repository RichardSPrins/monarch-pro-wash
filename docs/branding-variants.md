# Branding & Variants — how color, sections, and elements line up

A composing reference for building pages. It answers: *"If I set this section's
`theme`, what color is the background, the text, the accent, and my buttons — and
which button/badge/eyebrow variant should I reach for so it reads well?"*

Everything below is **derived from tokens**, so it re-skins in one place. The
chain is:

```
src/styles/theme.css   ─ raw brand tokens (--t-*)  ← the ONE reskin knob
      ↓
src/styles/global.css  ─ semantic tokens (--color-*, --primary, --theme-accent…)
      ↓                  + surface classes (.theme-*) + element variants
section { theme, data } ─ picks a surface; Button/Badge/eyebrow auto-adapt to it
```

You almost never write a color. You pick a **surface** (`theme`) and a **variant**
(button/badge/eyebrow), and the token system keeps it contrast-correct.

---

## 1. The Monarch palette (theme.css)

| Role | Token | Hex | Used for |
| --- | --- | --- | --- |
| Primary | `--t-primary` | `#e85c2b` | orange — main CTAs / primary actions |
| Primary light | `--t-primary-light` | `#f0764a` | orange for buttons **on dark** surfaces |
| Secondary | `--t-secondary` | `#2fa8b5` | teal — **accent**: eyebrows, links, icons |
| Secondary ink | `--t-secondary-fg` | `#06303a` | dark teal text on a teal surface |
| Base bg | `--t-bg` | `#0e2a3f` | deep navy — the default surface |
| Alt bg | `--t-bg-alt` | `#f5f8f9` | the light/white contrast surface |
| Muted bg | `--t-bg-muted` | `#0a2233` | deeper navy band |
| Inverse bg | `--t-bg-inverse` | `#0a1f2e` | darkest navy (footer / deep bands) |
| Text | `--t-fg` | `#e7eef2` | light text on dark |
| Text on light | `--t-fg-on-light` | `#22323f` | slate ink on the light surface |

**Dark-first:** navy is the default; `alt` is the light break. Think of the page
as mostly dark with white (`alt`) sections punched in for rhythm.

---

## 2. Section theme variants — the `theme` field

Every section takes `theme` (default `"default"`). It sets the **surface**: the
background, the on-surface text colors, the accent, and what a `primary` button
becomes. All six are complete, contrast-correct token sets.

| `theme` | Surface background | Body / heading text | Accent (eyebrow · links · icons) | A `primary` button here |
| --- | --- | --- | --- | --- |
| `default` | Deep navy `#0e2a3f` | Light | **Teal** | Orange fill, white text |
| `alt` | **Light** `#f5f8f9` | Slate ink `#22323f` | Teal | Orange fill, white text |
| `muted` | Deeper navy `#0a2233` | Light | Teal | Orange fill, white text |
| `inverse` | Darkest navy `#0a1f2e` | Light | Teal | **Lighter** orange (`#f0764a`), white text |
| `primary` | **Orange** `#e85c2b` | White | Light teal (teal + white) | **Inverts** → white fill, orange text |
| `brand-secondary` | **Teal** `#2fa8b5` | Dark teal ink `#06303a` | Dark teal ink | Orange fill, white text (pops) |

### When to use which
- **`default`** — the workhorse dark surface. Most sections.
- **`alt`** — the white breather. Alternate `default` → `alt` → `default` down a
  page so it doesn't read as one dark slab. This is your primary rhythm tool.
- **`muted`** — a *subtle* step down from `default` (barely darker navy). Use for
  a secondary band you want set apart without a full white break.
- **`inverse`** — the darkest, most dramatic surface. Heroes, footers, "closing"
  CTA bands. Its primary button uses the lightened orange so it still pops on near-black.
- **`primary`** — a full **orange** section. High-energy, use sparingly (one per
  page, e.g. a CTA banner). Note the primary button **inverts** to white here.
- **`brand-secondary`** — a full **teal** section. The calmer brand accent as a
  whole surface; good for a trust/《info》band. Orange primary buttons pop hard on it.

> **Rhythm rule of thumb:** don't place two light surfaces (`alt`) back-to-back,
> and don't stack `primary` + `brand-secondary` adjacent (orange next to teal is a
> lot). Separate loud surfaces with a `default`/`muted` band.

---

## 3. Button variants — `cta.variant` (SectionCTA)

CTAs accept `variant: "primary" | "secondary" | "outline" | "ghost"` (plus the
inherited Starwind `default` and semantic ones). They **recolor per surface**
automatically — the same `variant` string looks right on any `theme`.

| `variant` | Fill / border | Text | Reads as | Use for |
| --- | --- | --- | --- | --- |
| `primary` | Orange fill (`--primary`) | White* | The loud, main action | The one action you most want clicked |
| `secondary` | **Teal** fill (`--secondary`) | Near-black (contrast override) | Second brand action | A parallel action next to primary |
| `outline` | Transparent + 1px border | Surface text color | Quiet, framed | Secondary action beside a primary |
| `ghost` | None (hover tint only) | Surface text color | Tertiary / inline | Low-emphasis ("Learn more") |
| `default` | Foreground color as fill | Inverted (surface bg) | High-contrast neutral | A neutral "white/dark" button, non-brand |
| `info`·`success`·`warning`·`error` | Semantic status colors | — | Status, **not brand** | Alerts/feedback only — avoid as page CTAs |

\* On `theme="primary"` (orange surface) the `primary` button **inverts** to a
white fill with orange text — so it stays visible on its own color.

**Pattern:** one `primary` + one `outline` (or `ghost`) side-by-side is the
default hero/CTA pairing. Use `secondary` (teal) when you genuinely want two
brand-colored buttons, but not on a teal surface (see combos below).

---

## 4. Badge / eyebrow variants

### Badge (`<Badge variant>`) — same variant vocabulary as buttons
`default` (solid foreground-color pill) · `primary` (orange) · `secondary`
(teal) · `outline` (border only) · `ghost` (10% foreground tint) · semantic
(`info`/`success`/`warning`/`error`). Badges auto-contrast per surface the same
way buttons do.

### Eyebrow (`eyebrow.variant`) — the little label above a heading
The type allows `"badge" | "tag" | "text"`, but there are **two visual outcomes**:

| `eyebrow.variant` | Renders as |
| --- | --- |
| `badge` | A solid `<Badge>` pill (uppercase, tracked) |
| `text` **or** `tag` | An uppercase, letter-spaced label in the **accent color** (`--theme-accent`) — `tag` currently falls through to this same style |

So: **`badge`** for a chip; **`text`** (or `tag`) for the classic accent-colored
kicker. On dark/white surfaces that accent is teal; on orange it's light teal; on
teal it's dark teal ink.

---

## 5. How they combine — the surface × variant matrix

The one thing to internalize: **the accent is teal, the primary action is orange,
and the surface decides how they render.** Read the row for the `theme` you're on.

| On surface… | Eyebrow/accent shows | Best primary action | Best secondary action | Avoid |
| --- | --- | --- | --- | --- |
| `default` / `muted` (navy) | Teal | `primary` (orange) | `outline` or `ghost` | — |
| `inverse` (near-black) | Teal | `primary` (light orange) | `outline` | `default` (light) button can feel heavy |
| `alt` (white) | Teal | `primary` (orange) | `outline` (navy border) | `ghost` can get lost — prefer `outline` |
| `primary` (orange) | Light teal | `primary` (inverts → white) **or** `outline` (white border) | `secondary` (teal) | orange-on-orange elements; loud badges |
| `brand-secondary` (teal) | Dark teal ink | `primary` (orange — pops) | `outline` | **`secondary` button (teal) → teal-on-teal, no contrast** |

### Combining rules
1. **One primary per view.** `primary` (orange) is the loudest thing; more than
   one dilutes it. Pair it with `outline`/`ghost`, not a second `primary`.
2. **Don't match a fill to its surface.** Teal `secondary` button on a
   `brand-secondary` (teal) surface, or an orange element on a `primary` (orange)
   surface, both flatten. Switch to `outline` or the inverted `primary`.
3. **Accent stays teal everywhere** except it shifts to *light teal* on orange and
   *dark teal ink* on teal — so eyebrows/links never need per-section thought.
4. **Semantic colors (info/success/warning/error) are not brand colors.** Use them
   for status/alerts only; never as a page CTA.
5. **Light card inside a dark section?** Add `surface-base` to that element (a
   form, a floating card). It resets the token set to the solid light surface so
   its contents don't inherit the dark section's light-on-light text.

---

## 6. Quick cheat-sheet

```
Surfaces (theme):   default=navy · alt=white · muted=deep-navy · inverse=near-black
                    primary=orange · brand-secondary=teal
Page rhythm:        default → alt → default → (inverse or primary) closer
Accent (auto):      teal everywhere (light-teal on orange, dark-teal on teal)
CTA pairing:        primary (orange) + outline/ghost      ← default hero/CTA combo
On orange surface:  primary button turns white/orange-text; or use outline (white)
On teal surface:    use orange primary; NEVER teal secondary (no contrast)
Eyebrow:            "text"/"tag" = teal kicker · "badge" = solid pill
Element variants:   primary=orange · secondary=teal · outline=framed · ghost=quiet
                    default=neutral high-contrast · info/success/warning/error=status only
```

---

### Sources (keep this doc in sync)
- Palette: [src/styles/theme.css](../src/styles/theme.css)
- Surface classes + semantic tokens + accent-per-surface: [src/styles/global.css](../src/styles/global.css) (`.theme-*`, `--theme-accent`, `surface-base`)
- Button variants: [src/components/starwind/button/Button.astro](../src/components/starwind/button/Button.astro) + brand overrides in [src/components/elements/button/Button.astro](../src/components/elements/button/Button.astro)
- Badge variants: [src/components/starwind/badge/Badge.astro](../src/components/starwind/badge/Badge.astro)
- Eyebrow / CTA types: [src/types/sections.ts](../src/types/sections.ts)
