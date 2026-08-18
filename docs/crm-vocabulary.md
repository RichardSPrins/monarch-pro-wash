# CRM Vocabulary & Mapping — Autopilot (autopilotapp.io)

The reference for how website leads map into Autopilot, and the tag / source /
field vocabulary the CRM should carry. Pairs with [lead-magnets.md](./lead-magnets.md)
(the capture platform) and the API spec in [openapi.yaml](./openapi.yaml).

- **API base:** `https://app.autopilotapp.io/api` · Bearer `AUTOPILOT_API_KEY` (`ap_live_…`)
- **Delivery code:** `deliverLead()` in `src/pages/api/lead.ts`
- **Secrets:** `AUTOPILOT_API_KEY`, `AUTOPILOT_WEBSITE_SOURCE_ID` (astro:env server; `.dev.vars` in dev, `wrangler secret put` in prod)

---

## How a website lead maps to Autopilot

A lead is a **client** created with `client_or_lead: "lead"` (drops into the Leads
pipeline; Autopilot auto-flips it to `client` when a job is created). One
`POST /v1/clients` carries everything:

| Website lead field | Autopilot |
|---|---|
| `name` | `first_name` / `last_name` (split on first space) |
| `email` | `email` |
| `phone` | `primary_phone_number` |
| service, area, timeline, contact-time, estimate range, quiz answers, free-text notes | `client_notes` (formatted block — Autopilot has no custom-field API) |
| lead tags | `tag_ids[]` (resolve-or-create against the **Client Tags** vocabulary) |
| — | `client_or_lead: "lead"` |
| — | `source_id` = `AUTOPILOT_WEBSITE_SOURCE_ID` (the "Website" source) |
| — | `is_do_not_marketing_sms: true` (until a consent checkbox exists) |

**Dedupe:** search by email → phone; if found, PATCH notes (append) + merge tags
instead of creating a duplicate.

**Structured address** is *not* sent — Autopilot's `AddressInput` requires `zip_code`,
which the forms rarely capture; any address text goes in `client_notes` instead.

---

## Client Tags

Two origins: **auto-applied by the website** and **seeded/operational** (applied by
the team or Autopilot workflows). Tags are one flat name→UUID vocabulary; the
website's namespaced tags are mapped to readable names before delivery.

### Namespace → display-name mapping (in `deliverLead`)

| Website tag | Autopilot Client Tag |
|---|---|
| `src:sia-quiz` | `Source: Website Quiz` |
| `src:<magnet>` | `Source: <Title>` (e.g. `Source: Price Estimator`) |
| `svc:<service>` | `Service: <Title>` (e.g. `Service: Roof Cleaning`) |
| `area:<town>` | `Area: <Title>` (e.g. `Area: Boise`) |
| `interest:<x>` | `Interest: <Title>` |
| `prop:residential\|commercial` | `Property: Residential\|Commercial` |
| `temp:hot\|warm\|cold` | `Hot\|Warm\|Cold Lead` |
| `flag:multi-service` | `Multi-Service` |
| `flag:high-value` | `High Value` |
| `ad:google` / `ad:facebook` | `Google Ads` / `Facebook Ads` |
| `campaign:<slug>` | `Campaign: <Title>` |
| (anything else) | Title-cased as-is, plus `Website Lead` always added |

### Auto-applied by the website
- **Always:** `Website Lead`
- **Source of capture:** `Source: Website Quiz` (SIA hero quizzes), `Source: Price Estimator`, `Source: <magnet>` (each magnet CTA).
- **Service(s):** `Service: <name>` — from the SIA route per page, or the estimator's selected services.
- **Area:** `Area: <town>` — SIA route per page, or the estimator's city.
- **Property:** `Property: Residential|Commercial` — sent by the estimator; **derived** for SIA quizzes from the `home/business` answer.
- **Temperature:** `Hot|Warm|Cold Lead` — from the estimator's timeline; **derived** for quizzes from a `timing` answer (`asap`→Hot).
- **Interest:** `Interest: Estimate` (estimator), etc.
- **Value (estimator only):** `Multi-Service` (2+ services), `High Value` (estimate ≥ $500).
- **Attribution:** `Google Ads` / `Facebook Ads` / `Campaign: <name>` — derived from first-touch `utm_*` / `gclid` / `fbclid` (captured site-wide by `src/lib/utm.ts`).

> Derivation rules live in `deriveTags()` in `src/pages/api/lead.ts`. Missing tags
> (new services, towns, campaigns) auto-create on first use — no pre-seeding needed.

### Seeded operational tags (26 — applied by team / workflows, not the form)
Created via the API (re-run `scratchpad/autopilot-seed-tags.mjs` to recreate):

- **Funnel / disposition:** Contacted · No Answer · Left Voicemail · Quoted · Booked · Won · Lost · Follow-up Needed · Not Interested · Price Shopper · Bad Number
- **Relationship / account:** Commercial · HOA / Property Manager · Builder / GC · Realtor / Referral Partner · VIP · Repeat Customer
- **Programs / seasonal lists:** Maintenance Plan · Recurring: Bin Cleaning · Fall Blowout List · Holiday Lights List · Spring Wash List
- **Consent (positive):** Email Opt-In · SMS Opt-In
- **Value / opportunity:** High Value · Multi-Service *(also auto-applied by the estimator)*

---

## Job Tags (separate vocabulary — in-app only)

Autopilot keeps **Job Tags** separate from Client Tags. There is **no job-tags API**
(`JobInput.tags` is a free-text string), and **the website never creates jobs**, so
nothing here is automated — add these in **Settings → Tags → Job Tags** by hand.

> The *service performed* belongs in the native job **Type** field (your company's
> job types), not a tag. Reserve job tags for cross-cutting attributes. Prefixes
> (`Equip:` / `Chem:` / `Sealed:` / `Sealant:`) keep the flat list grouped.

**Site / access:** Gated · Dog on Site · Steep Roof · Ladder / 2-Story · Roof Access · Acreage / Rural · Commercial Site · Hard-Water Heavy

**Job nature:** Recurring · One-Time · Add-On · Warranty / Callback · Redo · Seasonal

**Ops flags:** Needs Reschedule · Weather Hold · Upsell Opportunity · Photos Needed · Before/After Captured

### Equipment used (`Equip:`)
Hot Water Washer · Cold Water Washer · Surface Cleaner · Soft Wash System ·
Downstream Injector · Water-Fed Pole (DI) · Telescoping Wand · Turbo Nozzle ·
Gutter Vacuum · Airless Sprayer · Roller / Brush Applied · Ladder / Ladder-Assist ·
Lift / Boom · Wastewater Recovery · Ground Containment · Compressed Air (Blowout)

### Chemicals used (`Chem:`)
Sodium Hypochlorite (SH) · Surfactant / Soap · Degreaser (Sodium Hydroxide) ·
Efflorescence Remover · Oxalic Acid (Rust / Hard-Water) · Muriatic Acid (Masonry) ·
Rust Remover · Oxidation Remover · Mold / Mildew Inhibitor · Neutralizer ·
DI / Purified Water Only · Water Only (No Chemicals)

### Surface sealed (`Sealed:`)
Concrete · Pavers · Asphalt · Brick · Natural Stone · Masonry / Block ·
Wood / Deck · Grout / Tile

### Sealant type (`Sealant:`)
Acrylic (Solvent) · Acrylic (Water-Based) · Silane / Siloxane (Penetrating) ·
Polyurethane · Epoxy · Lithium Silicate (Densifier) · Joint-Stabilizing (Paver) ·
Wet-Look / High-Gloss · Matte / Natural Finish · Asphalt Sealcoat (Emulsion) ·
Concrete Stain (Water-Based) · Concrete Stain (Acid)

> **Tags vs. notes/line-items:** these tags capture the *categorical* facts for
> filtering and reporting ("show all jobs where `Sealant: Silane/Siloxane` was
> used"). Exact product name, dilution ratio, batch, or coverage/quantity belong
> in the **job note** or as **line items** — a tag can't hold a value. Rule of
> thumb: tag the *category*, note the *specifics*.

---

## Lead Sources (the `Source` field, not tags)

One per lead, set in-app under lead sources. The website uses **Website**
(`AUTOPILOT_WEBSITE_SOURCE_ID`). There is **no sources API** — to get a source's
UUID, edit it in-app (UUID in the URL) or create a client with that source and read
`source_id` off it via the API. Recommended sources to add:

Website *(in use)* · Phone Call · Referral · Google / GBP · Facebook / Instagram ·
Chatbot · Repeat Customer · Yard Sign / Flyer · Local Services Ads

---

## Native fields (use instead of tags)

Autopilot has boolean fields for these — don't duplicate as tags:

- `client_or_lead` — `lead` vs `client` (pipeline stage; auto-advances on first job).
- `is_do_not_service` — the "Do Not Service" state.
- `is_do_not_sms` — hard SMS suppression (transactional + marketing).
- `is_do_not_marketing_sms` — marketing SMS suppression (website leads default `true`).

---

## Adding a channel (e.g. chatbot)

Any channel that POSTs the normalized shape to `/api/lead` flows through the same
adapter — no CRM code. Send `{ source: "chatbot", magnet: "chatbot", tags: ["src:chatbot", …],
name, email, phone, …answers }`. It becomes a `Source: Chatbot`-tagged website lead
with the same dedupe, notes, and derivation.
