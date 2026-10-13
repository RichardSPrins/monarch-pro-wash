import type { APIRoute } from "astro";
import { getPages, getPosts, getServices, getServiceAreas } from "@/lib/content";
import { hasSiaPages } from "@/config/launchScope";

/**
 * Sitemap, generated at request time from the CMS.
 *
 * @astrojs/sitemap can only see statically-known routes, and under
 * `output: 'server'` every content page is dynamic ([...slug], [area]/[service],
 * services/[slug]). It therefore emitted a sitemap containing only /blog,
 * /estimate, /magnet-demo and /search — none of the ~240 real pages, plus two
 * internal routes. This route is the authoritative sitemap instead.
 *
 * Slug → URL mapping mirrors the page routes exactly:
 *   "index"                   → /
 *   "svc-{service}"           → /services/{service}
 *   "sia-{area}--{service}"   → /{area}/{service}
 *   anything else             → /{slug}
 */
export const prerender = false;

/** Internal/dev routes that must never be advertised to crawlers. */
const EXCLUDED_PREFIXES = [
  "sections",
  "components",
  "section-preview",
  "magnet-demo",
  "search",
];

function pathForSlug(slug: string): string | null {
  if (EXCLUDED_PREFIXES.some((p) => slug === p || slug.startsWith(`${p}/`))) return null;
  if (slug === "index") return "/";
  if (slug.startsWith("svc-")) return `/services/${slug.slice(4)}`;
  if (slug.startsWith("sia-")) {
    const [area, service] = slug.slice(4).split("--");
    // Malformed matrix slug — skip rather than emit a URL that 404s.
    return area && service ? `/${area}/${service}` : null;
  }
  return `/${slug}`;
}

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://www.monarchprowashidaho.com");

  const [pages, posts, services, areas] = await Promise.all([
    getPages(),
    getPosts(),
    getServices(),
    getServiceAreas(),
  ]);

  const paths = new Set<string>();

  for (const page of pages) {
    // Drafts, demo/reference pages, and anything marked noindex stay out.
    if (page.data.draft || page.data.demo || page.data.seo?.noIndex) continue;
    const path = pathForSlug(page.data.slug);
    if (path) paths.add(path);
  }

  // Routes that resolve from collections rather than a CMS page: service detail,
  // town hubs, and the service-in-area matrix. These are real, indexable URLs
  // whether or not anyone has authored a page for them, and they are the bulk of
  // the site — a sitemap without them lists almost nothing. getServices() is
  // already filtered to the published set, and the matrix is gated the same way
  // the route is, so this can never advertise a URL that 404s.
  for (const service of services) {
    paths.add(`/services/${service.data.slug}`);
  }
  for (const area of areas) {
    paths.add(`/${area.data.slug}`);
    if (!hasSiaPages(area.data.slug)) continue;
    for (const service of services) {
      paths.add(`/${area.data.slug}/${service.data.slug}`);
    }
  }

  // Real static routes that aren't CMS pages.
  paths.add("/blog");
  paths.add("/estimate");
  for (const post of posts) {
    const slug = (post as any)?.data?.slug ?? (post as any)?.id;
    if (slug) paths.add(`/blog/${slug}`);
  }

  const urls = [...paths]
    .sort()
    .map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Content changes when the CMS changes; keep it fresh but not uncached.
      "Cache-Control": "public, max-age=600",
    },
  });
};
