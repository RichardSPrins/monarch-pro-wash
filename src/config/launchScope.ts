/**
 * Launch scope — which services and towns are PUBLIC right now.
 *
 * Monarch is a new, owner-operated company. The CMS holds all 18 services and all
 * 13 towns, but publishing everything at once would (a) advertise work that needs
 * equipment the business doesn't own yet, and (b) put ~234 near-identical
 * service-in-area pages on a domain with no authority and no reviews.
 *
 * This file is the growth dial. Add a slug here and the service or town appears
 * everywhere at once — nav, services hub, home page, cross-sell grids, sitemap,
 * and the service-in-area matrix. Remove it and it disappears just as cleanly.
 * Nothing here deletes or edits CMS data; it is a read-time filter only.
 */

/**
 * Services with a public page, listed in nav/grids, and eligible for
 * service-in-area pages. Order here is irrelevant — the `order` field on the
 * services collection still drives display order.
 *
 * Deferred and why (all still in the CMS, unpublished):
 *   bin-cleaning ............ needs a dedicated bin-washing truck
 *   fleet-vehicle-cleaning .. needs water reclamation to wash fleets on site
 *   parking-lot-striping .... needs a striping rig + ADA layout liability
 *   screen-repair ........... a fabrication trade, not exterior cleaning
 *   solar-panel-cleaning .... niche; revisit once roof work is routine
 *   paver-sealing ........... see concrete-sealing-staining note below
 *   asphalt-sealing ......... needs a sealcoat rig
 *   surface-treatment ....... folds into the sealing line; revisit later
 *   sprinkler-blowouts ...... seasonal, parked per gbp-service-categories.md
 *   christmas-lights ........ seasonal, parked per gbp-service-categories.md
 *
 * NOTE: `concrete-sealing-staining` is published pending confirmation that
 * sealing does not require Idaho contractor registration. Monarch is insured but
 * not licensed — if registration is required, remove this entry.
 */
export const PUBLISHED_SERVICES = [
  "pressure-washing",
  "soft-washing",
  "roof-cleaning",
  "gutter-cleaning",
  "window-cleaning",
  "concrete-sealing-staining",
  "post-construction-cleanup",
  "graffiti-removal",
] as const;

/**
 * Towns that get service-in-area pages (`/{area}/{service}`).
 *
 * ALL 13 towns still get a town hub at `/{town}` and still appear in service-area
 * chips and the LocalBusiness `areaServed` schema — this list only gates the
 * programmatic matrix. 5 towns x 8 services = 40 pages, which is a defensible
 * amount of near-duplicate content for a new domain. Add a town here to publish
 * 8 more.
 */
export const SIA_AREAS = [
  "boise",
  "meridian",
  "nampa",
  "eagle",
  "caldwell",
] as const;

export type PublishedService = (typeof PUBLISHED_SERVICES)[number];
export type SiaArea = (typeof SIA_AREAS)[number];

const PUBLISHED_SERVICE_SET: ReadonlySet<string> = new Set(PUBLISHED_SERVICES);
const SIA_AREA_SET: ReadonlySet<string> = new Set(SIA_AREAS);

/** Is this service slug public? */
export function isPublishedService(slug?: string): boolean {
  return !!slug && PUBLISHED_SERVICE_SET.has(slug);
}

/** Does this town slug get service-in-area pages? */
export function hasSiaPages(areaSlug?: string): boolean {
  return !!areaSlug && SIA_AREA_SET.has(areaSlug);
}
