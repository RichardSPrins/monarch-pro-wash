import type { APIRoute } from "astro";

/**
 * Generated robots.txt — references the @astrojs/sitemap output using the site
 * URL from astro.config (`site`), so it stays correct per deploy/domain.
 */
/**
 * Disallowed paths: the CMS surface, plus the internal preview/demo routes that
 * the sitemap filter in astro.config.mjs already excludes. Those pages exist for
 * development (section galleries, design-system demos, the magnet sandbox) and
 * would otherwise be crawlable and compete with real service pages.
 */
const DISALLOWED = [
  "/_emdash/",
  "/sections",
  "/components",
  "/section-preview",
  "/magnet-demo",
  "/search",
  "/dev-apply-page-seo.json",
];

const robotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /
${DISALLOWED.map((p) => `Disallow: ${p}`).join("\n")}

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  // src/pages/sitemap.xml.ts — built from the CMS at request time. (The old
  // sitemap-index.xml came from @astrojs/sitemap, which under output:'server'
  // could only see static routes and missed every content page.)
  const sitemapURL = new URL("sitemap.xml", site);
  return new Response(robotsTxt(sitemapURL), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
