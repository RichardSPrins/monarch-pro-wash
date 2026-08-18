# Lead Magnets & Lead Capture

Strategy + architecture for free, value-first tools that convert visitors into
segmented, followed-up leads. Built as a **platform**: the plumbing is built once
so each new magnet and each placement becomes **CMS config, not a code project.**

Guiding principle (think like a marketing engineer): **immense value up front,
minimal effort on our end, a better-quality lead list.** The tool does the
qualifying; the CRM does the follow-up; the owner only works the hot queue.

---

## The three layers

**1) Magnet library** — the tools. Each computes real value client-side (instant,
cheap) and gates the *result* behind an opt-in.

**2) Placement engine (CMS-controlled)** — how a magnet appears:
- **Inline block** — a `magnet:*` section variant in the registry, droppable in any
  JSON-composed page: `{ "type": "magnet:cta", "data": { "magnet": "seasonal-calendar", … } }`.
- **CTA banner** — a compact opt-in you attach in blog posts / landing pages. ← *shipped first*
- **Pop-ins** *(planned)* — a `placements` collection mapping **trigger → magnet →
  where** (exit-intent on `/services/*`, 60%-scroll on a blog post, timed on town
  pages), with page-match rules + frequency cap + on/off, all from the CMS.

**3) Capture & routing** — one endpoint (`/api/lead`), one tag contract, and a
branch: **convert-now vs. drop-to-nurture.**

---

## Magnet catalog

**Tier 0 — ungated (SEO + trust, soft capture)**
- "What should this cost in the Treasure Valley?" cost-range guides per service.
- Printable TV exterior-care calendar (teaser → opt-in for the PDF).

**Tier 1 — low-friction opt-in (email/phone → a result; cold→warm)**
- **Seasonal Home Exterior Maintenance Calendar** — TV-specific freeze-thaw timeline.
  The nurture engine: seeds seasonal tags we campaign against all year.
- **HOA Notice Response Kit** — for people who got a letter (big in Meridian/Eagle).
- Hard-water spot guide / solar output one-pager / new-build punch list.

**Tier 2 — interactive, result gated behind opt-in (core magnets; warm→hot)**
- **Instant Price Estimator** ⭐ — service(s) + stories/size + surfaces + town → range.
  Reuses service+town slugs and the existing quiz UI.
- **"Is it algae or just dirt?" roof check** → `roof-cleaning`.
- **Solar output-loss calculator** → `solar-panel-cleaning` (Nampa farmland, Eagle foothills).
- **Gutter risk score** → `gutter-cleaning`.
- **Bin-cleaning savings/freshness calc** → recurring revenue.
- **"Which service do I need?" triage** — standalone version of the SIA quiz.

**Tier 3 — high-intent (hot)**
- **Instant quote → pick a time** (estimator + booking).
- **Sprinkler-blowout / Christmas-light early-bird lists** — seasonal list-building.

---

## Convert-now vs. nurture

Rule: **if the tool reveals urgency + a clear next step + a price they'll accept,
offer the booking right there.** Everyone else is captured pre-scoped and dropped
into a nurture sequence.

| Magnet | Immediate conversion (hot) | Otherwise → nurture |
|---|---|---|
| Price Estimator | "Lock this price + grab a slot" / "Text me the exact quote today" / add-a-service bundle | drip the saved estimate + seasonal urgency + reviews |
| Roof "is it algae?" | high likelihood → book soft-wash | roof-algae education drip |
| Solar output-loss | "$X/yr lost → book / 2×-year plan" | solar-savings drip |
| Gutter risk score | high risk → "book before first freeze" | fall reminder list |
| Bin-cleaning calc | "start recurring" (subscription) | one-time offer drip |
| HOA notice kit | fast-track quote | HOA-standards drip |
| Which-service triage | routes into the matching estimator | — |
| Seasonal calendar / early-bird | — | subscriber → timed seasonal campaigns |

**Estimator conversion (three exits after the range):** (a) book a slot now,
(b) "confirm exact price, text me today" (hot handoff), (c) add a second service
→ bundle discount (raises ticket size + reveals multi-service intent). Non-bookers
still leave service + area + property + timeline + a $ band.

---

## Capture contract (`/api/lead`)

One CRM-agnostic endpoint. Every magnet POSTs JSON; the route normalizes to:

```jsonc
{
  "receivedAt": "ISO-8601",
  "source": "magnet:<slug>",
  "magnet": "<slug>",
  "tags": ["src:…", "svc:…", "area:…", "prop:…", "interest:…", "temp:…"],
  "contact": { "name?", "email?", "phone?", "address?", "city?" },
  "page": "/where/it/was/submitted",
  "answers": { /* everything else the tool collected */ }
}
```

### Tag taxonomy (namespaced; mirrors the site's own slugs)
- `src:` — magnet source: `src:seasonal-calendar`, `src:price-estimator`, …
- `svc:` — service interest — **reuse the 18 service slugs** (`svc:roof-cleaning`, …).
- `area:` — **reuse the town slugs** (`area:eagle`, `area:garden-city`, …).
- `prop:` — `prop:residential | commercial | hoa | manufactured`.
- `interest:` — recurring/seasonal programs: `interest:sprinkler-blowout`,
  `interest:christmas-lights`, `interest:recurring-bin`, `interest:maintenance-plan`.
- `stage:` — lifecycle: `stage:subscriber | lead | mql | quote-requested | customer | recurring`.
- `temp:` — `temp:cold | warm | hot` (or a numeric lead-score field).
- `consent:` — `consent:email | consent:sms`.

**Tags vs. custom fields:** tags = segmentation/automation triggers (low-cardinality,
enumerable). Per-contact *values* (address, sqft/stories, surfaces, est_min/est_max,
timeline, last_service_date, quiz_json, lead_score) go in **custom fields**.

### Lifecycle
`Subscriber → Lead → MQL/Engaged → Quote Requested (→ Opportunity) → Customer →
Recurring/Reactivation`. Each tool **upserts the same contact** (by email/phone),
accumulates tags, raises the score, and advances the stage.

---

## CRM — Autopilot (autopilotapp.io), WIRED ✅

`deliverLead()` in `src/pages/api/lead.ts` now creates/updates a lead in Autopilot:
- A website lead → `POST /v1/clients` with `client_or_lead: "lead"` (Leads pipeline).
- Contact typed; everything else (service, area, timeline, estimate range, quiz
  answers, notes) folded into `client_notes` (no custom-field API).
- Our namespaced tags → readable Autopilot tag names, **resolve-or-create** (tags
  are UUID-referenced), cached per worker instance.
- **Dedupe** by email then phone → PATCH notes + merge tags instead of duplicating.
- Native `source_id` = the "Website" lead source when `AUTOPILOT_WEBSITE_SOURCE_ID`
  is set; the `Website Lead` tag covers it regardless.
- `is_do_not_marketing_sms: true` until an explicit SMS opt-in is captured on-site.
- Still always writes the durable `[lead]` log; CRM failures never fail the request.

**Secrets** (`astro:env` server schema): `AUTOPILOT_API_KEY`, `AUTOPILOT_WEBSITE_SOURCE_ID`.
In `.dev.vars` for dev; **`wrangler secret put` both at deploy** (not in `.dev.vars`
for prod). Verified end-to-end against the live account (test lead created + deleted).

> Chatbot / future channels: post the normalized shape to `/api/lead` with
> `source:"chatbot"` + tags — it flows through the same adapter, no new CRM code.

### (historical) log-only phase

**`/api/lead` currently LOGS every lead** (structured `[lead] {…}` line, visible in
`wrangler tail` / Cloudflare logs) via `deliverLead()`. Nothing is dropped while
the CRM is chosen. The normalized shape above is the stable contract; only the
delivery adapter changes.

> ### ⚠️ TODO — before launch
> Wire the real CRM. Probable target: **Autopilot — autopilotapp.io**.
> Autopilot's API/automations are limited, so we will need to:
> 1. **Massage** the normalized lead into what Autopilot's API accepts (map tags →
>    their tag/journey model; map custom fields → their contact fields).
> 2. **Split** anything it can't hold (rich estimator answers, computed $ bands,
>    quiz_json) into a secondary store or a Zapier/Make hop.
> 3. Confirm dedupe/upsert by email or phone, and how `stage:`/`temp:` map to their
>    journeys/segments.
>
> Implementation point: `deliverLead()` in `src/pages/api/lead.ts`. Add the adapter
> there (and, if a webhook is used, an `envField` for its URL in `astro.config.mjs`).
> This must be done before any magnet goes live for real capture.

---

## Current status (what's built)

- **`/api/lead`** — capture endpoint, log-only, honeypot + minimal validation.
  `src/pages/api/lead.ts`.
- **`magnet:cta`** — CTA-style lead magnet section, CMS-droppable, low-friction
  (email by default), pre-tags every capture with `src:<magnet>` + author tags,
  POSTs to `/api/lead`. `src/components/sections/magnets/MagnetCta.astro`,
  registered in `src/lib/sectionRegistry.ts`.

### Example CMS usage
```jsonc
{
  "type": "magnet:cta",
  "theme": "primary",
  "data": {
    "eyebrow": { "text": "Free Download" },
    "heading": "Your Treasure Valley Home Exterior Calendar",
    "subheading": "Know exactly when to clean, seal, and blow out — month by month.",
    "highlights": ["Freeze-thaw timeline", "Roof-algae check reminders", "Sprinkler blowout dates"],
    "magnet": "seasonal-calendar",
    "tags": ["interest:maintenance-plan", "prop:residential"],
    "fields": ["email"],
    "submitLabel": "Send Me the Calendar",
    "disclaimer": "No spam. Unsubscribe anytime.",
    "successHeading": "On its way!",
    "successBody": "Check your inbox for the calendar."
  }
}
```

---

## Estimator pricing (`/estimate`)

The calculator's figures are a transparent ballpark model (base range × size/stories/
property multipliers, solar per-panel), **not** external data.

- **CMS-editable (live).** A **`pricing` singleton** collection exists in EmDash with a
  single `value` (json) field holding the `EstimatorPricing` shape. Edit it in the admin
  (Estimator Pricing) and the change is live at request time — confirmed end-to-end.
- **Code default / fallback:** `src/config/estimatorPricing.ts`. The page reads through
  `getEstimatorPricing()` (`src/lib/content.ts`), which returns the CMS singleton if
  present, else this default. The tool consumes the model as injected JSON.
- The `pricing` collection was created **additively via the schema API**
  (`POST /_emdash/api/schema/collections`) — no reseed, existing content untouched. To
  recreate on another environment, run `scratchpad/create-pricing-singleton.mjs`.

> Follow-up (nice-to-have): the admin edits pricing as one JSON blob. If Richard wants
> per-field number inputs, promote `value` to structured fields (services list + solar +
> multipliers) and map them back in `getEstimatorPricing()`. Deferred to his audit pass.

## Roadmap

1. ✅ Capture endpoint (log-only) + `magnet:cta` block. ← **here**
2. Real CRM adapter in `deliverLead()` (Autopilot) — **TODO before launch**.
3. Interactive magnets on the same contract: Price Estimator first (flagship,
   convert-now), then roof/solar/gutter/bin calculators.
4. `/resources` hub page collecting all tools (SEO + internal-linking asset).
5. Placement engine: `offers` + `placements` collections → pop-ins (exit-intent /
   scroll / timed) controlled entirely from the CMS.
6. Lead scoring + `stage:`/`temp:` automation once the CRM is live.
