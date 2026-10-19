/**
 * Shared marketing copy — the single source for the blocks that repeat across
 * the site.
 *
 * WHY THIS FILE EXISTS
 * Before this, `PROCESS_STEPS`, `WHY_ITEMS` and the guarantee were maintained in
 * three places at once (src/lib/pageTemplates.ts, the `fallbackSections` array in
 * src/pages/[area]/[service].astro, and scripts/ingest-vault-copy.mjs) plus the
 * already-ingested rows in D1. They had already drifted: the ingested copy lost a
 * process step and a "Why Monarch" item relative to the vault scaffold. Everything
 * shared now lives here and is imported, so one edit lands everywhere.
 *
 * VOICE RULES (from the vault — binding)
 * Plain, confident, local, scannable. Short sentences. Second person for the
 * reader, "we/our" for Monarch. NO EM DASHES. No phone numbers in body copy; the
 * phone lives in the chrome. Keyword-first plain headings, never editorial ones.
 * Specifics read as real, adjectives read as marketing.
 *
 * TRUE CLAIMS (binding — see docs and the vault foundation doc)
 * - Licensed and insured. Confirmed by Richard on 2026-10-18; the earlier
 *   insured-only wording is gone. If that status changes, this file and
 *   TrustBarBadges are the two places to change it back.
 * - Founded 2026. No operating history, no "serving since", no years-in-business.
 * - "Fifteen years" is the OWNER'S trades background BEFORE Monarch existed.
 *   Never "fifteen years cleaning Boise exteriors".
 * - Solo operator. No "crew", no "team", no "technicians".
 * - The Monarch Standard is a workmanship standard, NOT a money-back guarantee,
 *   NOT a rain guarantee, and carries no time window.
 *
 * POSITIONING
 * Lead with owner-operated accountability and the outcome (how the property looks
 * and feels). Surface-matched method supports the pitch but is deliberately not
 * the wedge: local competitors already claim it almost word for word, so it reads
 * as table stakes rather than a differentiator.
 */

/** A page's stable identity, used to pick a heading variant. */
export type VariantSeed = string | undefined;

/**
 * Deterministic variant pick.
 *
 * The same slug always resolves to the same variant, so a page's wording is
 * stable across builds (changing headings on every deploy would be an SEO
 * own-goal), while neighbouring pages differ. FNV-1a, which is plenty for
 * choosing between three strings.
 */
export function pickVariant<T>(seed: VariantSeed, options: readonly T[]): T {
  if (options.length === 0) throw new Error("pickVariant: no options");
  if (!seed) return options[0];
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return options[Math.abs(h) % options.length];
}

// ---------------------------------------------------------------------------
// The offer
// ---------------------------------------------------------------------------

/** New-customer discount. Real offer, confirmed 2026-10-17. */
export const NEW_CUSTOMER_OFFER = {
  short: "10% off your first service",
  sentence: "New customers get 10% off their first service.",
} as const;

// ---------------------------------------------------------------------------
// Trust bar
// ---------------------------------------------------------------------------

/**
 * Default trust bar for service and service-in-area pages.
 *
 * `familyOwned` is deliberately off here. Monarch is a single-member LLC with no
 * employees, so "family owned and operated" overclaims on a service page; the
 * About page turns it back on, where the founding story gives it context.
 *
 * `tradeYears` is the owner's pre-Monarch trades experience, which is why it is a
 * separate badge from the component's `foundingYear` maths. Founded 2026 computes
 * to zero years in business, which is correct and correctly hides that badge.
 */
export const TRUST_BADGES = {
  insured: true,
  ownerOperated: true,
  tradeYears: 15,
  freeQuotes: true,
  familyOwned: false,
} as const;

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

export const PROCESS_HEADINGS = [
  "How It Works",
  "What Happens After You Call",
  "How a Monarch Job Runs",
] as const;

/**
 * Four steps, restoring the landscaping step the ingest dropped. Each body
 * carries something concrete (no hourly meter, plants pre-wet, the owner on site
 * at walkthrough) rather than an adjective.
 */
export const PROCESS_STEPS = [
  {
    heading: "Get your free quote",
    body: "Tell us what needs cleaning. You get one clear price up front, with no hourly meter and no surprise total at the end.",
  },
  {
    heading: "We match the method to the surface",
    body: "A gentle soft wash for roofs, siding and anything delicate. Real pressure only where it helps. Nothing gets treated the same way just because it is faster.",
  },
  {
    heading: "We protect everything we are not cleaning",
    body: "Plants get pre-wet and rinsed, fixtures get covered, and each stain gets the solution it actually needs.",
  },
  {
    heading: "We walk the job with you",
    body: "You see the finished work with the owner standing next to you. Anything that is not right gets corrected before we pack up.",
  },
] as const;

// ---------------------------------------------------------------------------
// Why Monarch
// ---------------------------------------------------------------------------

export const WHY_HEADINGS = [
  "Why Monarch",
  "Why Property Owners Call Monarch",
  "What You Get With Monarch",
] as const;

/**
 * Ordered deliberately: insurance is the single most-named trust gate in the
 * customer research, and owner accountability is the chosen wedge, so those lead.
 * The outcome item is second because curb appeal is what people actually buy.
 * Surface-matched sits lower precisely because competitors claim it too.
 */
export const WHY_ITEMS = [
  {
    title: "Licensed, insured, and the owner does the work",
    body: "The person who quotes your job is the person who shows up to do it. Licensed and insured, with proof any time you want to see it. No subcontractors and no call center.",
  },
  {
    title: "Your property looks cared for again",
    body: "Clean siding, a driveway without the dark stripe down the middle, and windows you can actually see through. The kind of difference people notice from the street.",
  },
  {
    title: "Fifteen years in the trades",
    body: "The owner spent more than fifteen years doing hands-on surface work before starting Monarch. That experience is why the method gets matched to the material, not the other way around.",
  },
  {
    title: "Soft wash, not just power wash",
    body: "The safe low-pressure method is standard here for roofs and siding. It is not an upsell and it is not an extra.",
  },
  {
    title: "One call for the whole property",
    body: "Wash, seal, windows and gutters handled in the same visit, by someone who already knows the property.",
  },
] as const;

// ---------------------------------------------------------------------------
// The Monarch Standard
// ---------------------------------------------------------------------------

/**
 * Wording set by the owner and locked in the vault. A workmanship standard, not a
 * guarantee: do not add a money-back promise, a re-clean window, or a warranty.
 * Kept identical on every page on purpose, because a guarantee that is worded
 * three different ways reads as weaker, not fresher.
 */
export const GUARANTEE = {
  eyebrow: "Our Guarantee",
  heading: "The Monarch Standard",
  badge: "Make It Right",
  body: "The goal is a full, thorough clean on the first visit. If any surface we cleaned is not right, tell us and we come back to make it right. No fine print and no runaround.",
} as const;

// ---------------------------------------------------------------------------
// Closing CTA
// ---------------------------------------------------------------------------

/**
 * Three closers. The previous single version said "from a local team that treats
 * your property like its own" on nearly every page, which both read as filler and
 * claimed a team that does not exist.
 */
export const CTA_VARIANTS = [
  {
    heading: "Ready to see the difference?",
    subheading: `Get a free quote with your price up front, from the person who will be doing the work. ${NEW_CUSTOMER_OFFER.sentence}`,
  },
  {
    heading: "Ready for a cleaner property?",
    subheading: `One clear price up front, no obligation, and the owner on site. ${NEW_CUSTOMER_OFFER.sentence}`,
  },
  {
    heading: "Let's get your property looking right",
    subheading: `Free quote, clear price, and no pressure to book. ${NEW_CUSTOMER_OFFER.sentence}`,
  },
] as const;

export const CTA_BUTTON = "Get My Free Quote";

/** Closing CTA band. `seed` keeps a given page on the same variant every build. */
export function ctaBanner(seed: VariantSeed, overrides?: { heading?: string }) {
  const v = pickVariant(seed, CTA_VARIANTS);
  return {
    heading: overrides?.heading ?? v.heading,
    subheading: v.subheading,
    ctas: [{ label: CTA_BUTTON, href: "/contact", variant: "primary" }],
    showPhone: true,
  };
}
