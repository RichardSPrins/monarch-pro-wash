/**
 * Generated page templates.
 *
 * These build a page's `sections` array in code, for URLs that must resolve even
 * when nobody has authored a CMS page for them yet. An authored page always
 * wins; these are the floor, not the ceiling.
 *
 * They follow the same section order as the authored templates in the content
 * vault, so a page doesn't visibly restructure when it graduates from generated
 * to authored. Sections that need real photography or reviews are included but
 * will self-hide: `sectionSchemas` drops a section whose required data is
 * missing, and the reviews/gallery variants render nothing when empty.
 */
import type { SectionConfig } from "@/types/sections";
import type { getServices, getServiceAreas } from "@/lib/content";

type Service = Awaited<ReturnType<typeof getServices>>[number];
type ServiceArea = Awaited<ReturnType<typeof getServiceAreas>>[number];

/** Shared "how we work" steps — identical copy on every generated page. */
const PROCESS_STEPS = [
  { heading: "Get your free quote", body: "A clear price up front, with no guessing." },
  {
    heading: "We match the method to the surface",
    body: "Real pressure where it helps, a gentle soft wash where it protects.",
  },
  {
    heading: "We clean, protect, and inspect",
    body: "Stains treated, landscaping protected, and the job checked before we leave.",
  },
];

/** Shared "why Monarch" points. Kept as items, not prose, so they render as a grid. */
const WHY_ITEMS = [
  {
    title: "Surface-matched every time",
    body: "The method fits the material, so you get a deep clean with zero damage.",
  },
  {
    title: "Soft wash, not just power wash",
    body: "The safe method for anything delicate is standard here, not an upsell.",
  },
  {
    title: "Owner-run and insured",
    body: "The person accountable for the work is the person doing it.",
  },
  {
    title: "One vendor for the whole property",
    body: "Wash, seal, windows, and gutters under one roof.",
  },
];

const GUARANTEE: SectionConfig = {
  type: "guarantee:callout",
  theme: "brand-secondary",
  data: {
    eyebrow: { text: "Our Guarantee", variant: "text" },
    heading: "The Monarch Standard",
    body: "We aim for a full, thorough clean on the first visit. If any surface we cleaned is not right, tell us and we come back to make it right. No fine print and no runaround.",
    badge: "Make It Right",
  },
};

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
  const desc =
    service.data.description ??
    `Professional ${lower} for homes and businesses across the Treasure Valley.`;

  return [
    {
      type: "hero:image-overlay",
      theme: "inverse",
      data: {
        eyebrow: { text: "Treasure Valley · Fully Insured", variant: "text" },
        heading: `${title} in the Treasure Valley`,
        subheading: desc,
        showPhone: true,
        ctas: [{ label: "Get a Free Quote", href: "/contact", variant: "primary" }],
      },
    },
    {
      type: "trust-bar:badges",
      theme: "alt",
      // foundingYear 2026 makes "years in business" zero, which is falsy, so that
      // badge correctly hides for a company founded this year.
      data: { foundingYear: 2026, familyOwned: true, insured: true },
    },
    {
      type: "content:rich-text",
      theme: "alt",
      data: {
        eyebrow: { text: title, variant: "text" },
        heading: `${title} Done the Right Way`,
        body: `<p>${desc}</p><p>Every job starts by reading the surface and matching the method to it, so you get a thorough clean without the damage that comes from treating every surface the same.</p>`,
      },
    },
    { type: "process:horizontal", theme: "alt", data: { eyebrow: { text: "The Process", variant: "text" }, heading: "How It Works", steps: PROCESS_STEPS } },
    { type: "about:values", theme: "default", data: { eyebrow: { text: "Why Monarch", variant: "text" }, heading: "Why Monarch", items: WHY_ITEMS } },
    // No gallery:before-after in the generated page: with no pairs it fails
    // validation, which is a loud shim in dev and nothing in prod. Authored
    // pages add it back once there are real photos.
    {
      type: "reviews:cards",
      theme: "alt",
      data: { eyebrow: { text: "Reviews", variant: "text" }, heading: "What Our Customers Say", filter: "all", service: service.data.slug, limit: 3 },
    },
    GUARANTEE,
    {
      type: "faqs:accordion",
      theme: "alt",
      // `service` is a `topics` TERM slug, which for service pages equals the
      // service slug. Omitting it would show only the untagged general FAQs.
      data: { eyebrow: { text: "FAQs", variant: "text" }, heading: `${title}: Common Questions`, service: service.data.slug },
    },
    { type: "service-areas:grid", theme: "muted", data: { eyebrow: { text: "Service Areas", variant: "text" }, heading: "Serving the Treasure Valley" } },
    {
      type: "cta:banner",
      theme: "primary",
      data: {
        heading: "Ready for a Cleaner Property?",
        subheading: "Get a free quote with your price up front and a clean that is safe for every surface.",
        ctas: [{ label: "Get My Free Quote", href: "/contact", variant: "primary" }],
        showPhone: true,
      },
    },
  ];
}

/**
 * Town hub page — /{town}.
 *
 * Every town gets one, including towns outside the service-in-area matrix: the
 * nav links here, and it is where service links for that town live. For towns
 * in the matrix the service grid points at /{town}/{service}; elsewhere it
 * points at the service detail pages.
 */
export function buildTownHubSections(area: ServiceArea, opts: { linkToSia: boolean }): SectionConfig[] {
  const city = area.data.city;
  const state = area.data.state ?? "ID";

  return [
    {
      type: "hero:image-overlay",
      theme: "inverse",
      data: {
        eyebrow: { text: `${city}, ${state} · Fully Insured`, variant: "text" },
        heading: `Exterior Cleaning in ${city}, ${state}`,
        subheading: `Pressure washing, soft washing, windows, and gutters for ${city} homes and businesses, with the method matched to every surface.`,
        showPhone: true,
        ctas: [{ label: "Get a Free Quote", href: "/contact", variant: "primary" }],
      },
    },
    { type: "trust-bar:badges", theme: "alt", data: { foundingYear: 2026, familyOwned: true, insured: true } },
    {
      type: "content:rich-text",
      theme: "alt",
      data: {
        heading: `Exterior Cleaning for ${city}`,
        body: `<p>Monarch Pro Wash is owner-run and insured, and we clean homes and businesses across ${city} and the wider Treasure Valley. Every job starts by reading the surface and matching the method to it.</p>`,
      },
    },
    {
      type: "services:grid",
      theme: "alt",
      data: {
        eyebrow: { text: "What We Do", variant: "text" },
        heading: `Our Services in ${city}`,
        subheading: "Most properties need more than one thing cleaned. We handle it in one visit.",
        // Only link into the matrix for towns that actually have those pages.
        ...(opts.linkToSia ? { hrefBase: `/${area.data.slug}` } : {}),
      },
    },
    { type: "process:horizontal", theme: "alt", data: { eyebrow: { text: "The Process", variant: "text" }, heading: "How It Works", steps: PROCESS_STEPS } },
    { type: "about:values", theme: "default", data: { eyebrow: { text: "Why Monarch", variant: "text" }, heading: `Why ${city} Chooses Monarch`, items: WHY_ITEMS } },
    {
      type: "reviews:cards",
      theme: "alt",
      data: { eyebrow: { text: "Reviews", variant: "text" }, heading: `What ${city} Customers Say`, filter: "all", area: city, limit: 3 },
    },
    GUARANTEE,
    { type: "faqs:accordion", theme: "alt", data: { eyebrow: { text: "FAQs", variant: "text" }, heading: "Common Questions" } },
    { type: "service-areas:chips", theme: "muted", data: { eyebrow: { text: "Service Areas", variant: "text" }, heading: "Serving the Treasure Valley" } },
    {
      type: "cta:banner",
      theme: "primary",
      data: {
        heading: `Ready for a Cleaner Property in ${city}?`,
        subheading: "Get a free quote with your price up front, from a local team that treats your property like its own.",
        ctas: [{ label: "Get My Free Quote", href: "/contact", variant: "primary" }],
        showPhone: true,
      },
    },
  ];
}
