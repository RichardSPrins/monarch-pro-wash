# Autopilot Tags — Setup Reference

A standalone catalog of every **tag** to create in Autopilot (autopilotapp.io), split
by the app's two separate vocabularies: **Client Tags** and **Job Tags**. This is the
"what to put in the system" checklist. For *how* website leads map to these (derivation
rules, namespace→name mapping, API delivery), see [crm-vocabulary.md](./crm-vocabulary.md).

> Autopilot keeps **Client Tags** and **Job Tags** as two different lists in
> **Settings → Tags**. They are not interchangeable. Client tags describe the
> person/lead; job tags describe the work performed.

---

## 1. Client Tags

Where: **Settings → Tags → Client Tags**. Website leads auto-create the attribution
tags on first use (no pre-seeding needed); the **operational** tags below are the ones
to add by hand (or via `scratchpad/autopilot-seed-tags.mjs`).

### Auto-applied by the website (created on first use)
These come from `deriveTags()` in `src/pages/api/lead.ts` — listed so you recognize them:

- **Always:** `Website Lead`
- **Source:** `Source: Website Quiz` · `Source: Price Estimator` · `Source: <magnet>`
- **Service:** `Service: <name>` (e.g. `Service: Roof Cleaning`)
- **Area:** `Area: <town>` (e.g. `Area: Boise`)
- **Property:** `Property: Residential` · `Property: Commercial`
- **Temperature:** `Hot Lead` · `Warm Lead` · `Cold Lead`
- **Interest:** `Interest: Estimate` (etc.)
- **Value:** `Multi-Service` (2+ services) · `High Value` (estimate ≥ $500)
- **Attribution:** `Google Ads` · `Facebook Ads` · `Campaign: <name>`

### Operational tags to seed by hand (26)

**Funnel / disposition**
Contacted · No Answer · Left Voicemail · Quoted · Booked · Won · Lost · Follow-up Needed · Not Interested · Price Shopper · Bad Number

**Relationship / account**
Commercial · HOA / Property Manager · Builder / GC · Realtor / Referral Partner · VIP · Repeat Customer

**Programs / seasonal lists**
Maintenance Plan · Recurring: Bin Cleaning · Fall Blowout List · Holiday Lights List · Spring Wash List

**Consent (positive)**
Email Opt-In · SMS Opt-In

**Value / opportunity**
High Value · Multi-Service *(also auto-applied by the estimator)*

---

## 2. Job Tags

Where: **Settings → Tags → Job Tags**. **No API** creates these (the website never
creates jobs) — add them all by hand. The **service performed** goes in the native job
**Type** field, *not* a tag. Prefixes (`Equip:` / `Chem:` / `Sealed:` / `Sealant:`)
keep the flat list grouped.

**Site / access**
Gated · Dog on Site · Steep Roof · Ladder / 2-Story · Roof Access · Acreage / Rural · Commercial Site · Hard-Water Heavy

**Job nature**
Recurring · One-Time · Add-On · Warranty / Callback · Redo · Seasonal

**Ops flags**
Needs Reschedule · Weather Hold · Upsell Opportunity · Photos Needed · Before/After Captured

### Equipment used — `Equip:`
Hot Water Washer · Cold Water Washer · Surface Cleaner · Soft Wash System ·
Downstream Injector · Water-Fed Pole (DI) · Telescoping Wand · Turbo Nozzle ·
Gutter Vacuum · Airless Sprayer · Roller / Brush Applied · Ladder / Ladder-Assist ·
Lift / Boom · Wastewater Recovery · Ground Containment · Compressed Air (Blowout)

### Chemicals used — `Chem:`
Sodium Hypochlorite (SH) · Surfactant / Soap · Degreaser (Sodium Hydroxide) ·
Efflorescence Remover · Oxalic Acid (Rust / Hard-Water) · Muriatic Acid (Masonry) ·
Rust Remover · Oxidation Remover · Mold / Mildew Inhibitor · Neutralizer ·
DI / Purified Water Only · Water Only (No Chemicals)

### Surface sealed — `Sealed:`
Concrete · Pavers · Asphalt · Brick · Natural Stone · Masonry / Block ·
Wood / Deck · Grout / Tile

### Sealant type — `Sealant:`
Acrylic (Solvent) · Acrylic (Water-Based) · Silane / Siloxane (Penetrating) ·
Polyurethane · Epoxy · Lithium Silicate (Densifier) · Joint-Stabilizing (Paver) ·
Wet-Look / High-Gloss · Matte / Natural Finish · Asphalt Sealcoat (Emulsion) ·
Concrete Stain (Water-Based) · Concrete Stain (Acid)

> **Tags vs. notes/line-items:** job tags capture the *categorical* fact for filtering
> and reporting ("all jobs where `Sealant: Silane/Siloxane` was used"). Exact product
> name, dilution ratio, batch, or coverage/quantity belong in the **job note** or as
> **line items** — a tag can't hold a value. Tag the *category*, note the *specifics*.

---

## 3. Lead Sources (the `Source` field — not a tag)

One per lead, set under **Settings → Lead Sources**. The website uses **Website**.
Recommended set:

Website *(in use)* · Phone Call · Referral · Google / GBP · Facebook / Instagram ·
Chatbot · Repeat Customer · Yard Sign / Flyer · Local Services Ads
