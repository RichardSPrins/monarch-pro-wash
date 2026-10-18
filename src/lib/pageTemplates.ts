/**
 * Generated page templates.
 *
 * These build a page's `sections` array in code, for URLs that must resolve even
 * when nobody has authored a CMS page for them yet. An authored page always
 * wins; these are the floor, not the ceiling.
 *
 * `buildTownHubSections` is not a fallback in practice: no town hub exists in D1,
 * so this file IS the live copy for all 13 `/{town}` URLs.
 *
 * All shared blocks (process, why, guarantee, CTA, trust badges) come from
 * src/content/copy/shared.ts. They used to be redefined here AND in the
 * service-in-area route AND in the ingest script, which is how they drifted out
 * of sync with the vault. Do not reintroduce local copies.
 */
import type { SectionConfig } from "@/types/sections";
import type { getServices, getServiceAreas } from "@/lib/content";
import {
  PROCESS_STEPS,
  PROCESS_HEADINGS,
  WHY_ITEMS,
  WHY_HEADINGS,
  GUARANTEE,
  TRUST_BADGES,
  ctaBanner,
  pickVariant,
} from "@/content/copy/shared";

type Service = Awaited<ReturnType<typeof getServices>>[number];
type ServiceArea = Awaited<ReturnType<typeof getServiceAreas>>[number];

/** Shared blocks, as section configs. Spread so the readonly literals stay intact. */
const trustBar = (): SectionConfig => ({
  type: "trust-bar:badges",
  theme: "alt",
  data: { ...TRUST_BADGES },
});

const processSection = (seed: string, theme: SectionConfig["theme"]): SectionConfig => ({
  type: "process:horizontal",
  theme,
  data: {
    eyebrow: { text: "The Process", variant: "text" },
    heading: pickVariant(seed, PROCESS_HEADINGS),
    steps: PROCESS_STEPS.map((s) => ({ ...s })),
  },
});

const whySection = (seed: string, theme: SectionConfig["theme"], heading?: string): SectionConfig => ({
  type: "about:values",
  theme,
  data: {
    eyebrow: { text: "Why Monarch", variant: "text" },
    heading: heading ?? pickVariant(seed, WHY_HEADINGS),
    items: WHY_ITEMS.map((i) => ({ ...i })),
  },
});

const guaranteeSection = (): SectionConfig => ({
  type: "guarantee:callout",
  theme: "brand-secondary",
  data: { ...GUARANTEE },
});

/**
 * Service-detail page — /services/{slug}.
 *
 * The unique per-service copy (the service explained, top concerns) lives in the
 * content vault and arrives via an authored page. Until then this renders the
 * frame with the service's own description so the URL is useful rather than a 404.
 */
export function buildServiceSections(service: Service): SectionConfig[] {
  const title = service.data.title;
  const lower = title.toLowerCase();
  const slug = service.data.slug;
  const seed = `svc-${slug}`;
  const desc =
    service.data.description ??
    `Professional ${lower} for homes and businesses across the Treasure Valley.`;

  return [
    {
      type: "hero:image-overlay",
      theme: "inverse",
      data: {
        eyebrow: { text: "Boise & the Treasure Valley · Insured & Owner-Operated", variant: "text" },
        heading: `${title} in the Treasure Valley`,
        subheading: desc,
        showPhone: true,
        ctas: [{ label: "Get a Free Quote", href: "/contact", variant: "primary" }],
      },
    },
    trustBar(),
    {
      type: "content:rich-text",
      theme: "alt",
      data: {
        eyebrow: { text: title, variant: "text" },
        heading: `What ${title} Involves`,
        body: `<p>${desc}</p><p>Every job starts by reading the surface and matching the method to it. That is the difference between a property that comes out clean and one that comes out clean and undamaged, and it is why the same machine does not get pointed at a roof and a driveway at the same setting.</p>`,
      },
    },
    processSection(seed, "default"),
    whySection(seed, "alt"),
    // No gallery:before-after in the generated page: with no pairs it fails
    // validation, which is a loud shim in dev and nothing in prod. Authored
    // pages add it back once there are real photos.
    {
      type: "reviews:cards",
      theme: "alt",
      data: { eyebrow: { text: "Reviews", variant: "text" }, heading: "What Our Customers Say", filter: "all", service: slug, limit: 3 },
    },
    guaranteeSection(),
    {
      type: "faqs:accordion",
      theme: "alt",
      // `service` is a `topics` TERM slug, which for service pages equals the
      // service slug. Omitting it would show only the untagged general FAQs.
      data: { eyebrow: { text: "FAQs", variant: "text" }, heading: `${title}: Common Questions`, service: slug },
    },
    { type: "service-areas:grid", theme: "muted", data: { eyebrow: { text: "Service Areas", variant: "text" }, heading: "Serving the Treasure Valley" } },
    { type: "cta:banner", theme: "primary", data: ctaBanner(seed) },
  ];
}

/**
 * Town hub page — /{town}.
 *
 * Every town gets one, including towns outside the service-in-area matrix: the
 * nav links here, and it is where service links for that town live. For towns
 * in the matrix the service grid points at /{town}/{service}; elsewhere it
 * points at the service detail pages.
 *
 * NOTE: this is live copy for 13 URLs, not a fallback. The opening paragraph is
 * still generic across towns; per-town specifics (neighbourhoods, local
 * conditions) come from each `_{town}-local-reference.md` in the vault and are a
 * follow-up. Any such detail MUST respect that town's binding accuracy rules,
 * including its banned subdivision names and hard-water figures.
 */
export function buildTownHubSections(area: ServiceArea, opts: { linkToSia: boolean }): SectionConfig[] {
  const city = area.data.city;
  const state = area.data.state ?? "ID";
  const seed = `town-${area.data.slug}`;

  return [
    {
      type: "hero:image-overlay",
      theme: "inverse",
      data: {
        eyebrow: { text: `${city}, ${state} · Insured & Owner-Operated`, variant: "text" },
        heading: `Exterior Cleaning in ${city}, ${state}`,
        subheading: `Pressure washing, soft washing, windows and gutters for ${city} homes and businesses, with the method matched to every surface.`,
        showPhone: true,
        ctas: [{ label: "Get a Free Quote", href: "/contact", variant: "primary" }],
      },
    },
    trustBar(),
    {
      type: "content:rich-text",
      theme: "alt",
      data: {
        heading: `Exterior Cleaning for ${city} Property Owners`,
        body: `<p>Treasure Valley weather is hard on an exterior. High-desert dust settles on everything, hard water leaves its mark on concrete and glass, and freeze and thaw works away at the driveway every winter. It builds up slowly enough that most people stop seeing it.</p><p>Monarch cleans homes and businesses across ${city}, and the owner is the one doing the work. You get one clear price up front, a method chosen to suit the surface rather than the schedule, and a property that looks cared for again.</p>`,
      },
    },
    {
      type: "services:grid",
      theme: "alt",
      data: {
        eyebrow: { text: "What We Do", variant: "text" },
        heading: `Our Services in ${city}`,
        subheading: "Most properties need more than one thing cleaned. We handle it in a single visit.",
        // Only link into the matrix for towns that actually have those pages.
        ...(opts.linkToSia ? { hrefBase: `/${area.data.slug}` } : {}),
      },
    },
    processSection(seed, "alt"),
    whySection(seed, "default", `Why ${city} Property Owners Choose Monarch`),
    {
      type: "reviews:cards",
      theme: "alt",
      data: { eyebrow: { text: "Reviews", variant: "text" }, heading: `What ${city} Customers Say`, filter: "all", area: city, limit: 3 },
    },
    guaranteeSection(),
    { type: "faqs:accordion", theme: "alt", data: { eyebrow: { text: "FAQs", variant: "text" }, heading: "Common Questions" } },
    { type: "service-areas:chips", theme: "muted", data: { eyebrow: { text: "Service Areas", variant: "text" }, heading: "Serving the Treasure Valley" } },
    {
      type: "cta:banner",
      theme: "primary",
      data: ctaBanner(seed, { heading: `Ready for a Cleaner Property in ${city}?` }),
    },
  ];
}
