// Build .emdash/seed.json from the git content collections — conformed to
// idiomatic EmDash types (references, taxonomies, datetime, select, bylines,
// portableText), not a flat data dump.
//
//   pages.sections/seo → json (the one unavoidable shim; 241 heterogeneous variants)
//   services.category  → reference → service_categories
//   faqs/reviews.service → `topics` taxonomy terms
//   reviews.date, posts.date → datetime;  reviews.source → select
//   posts.author → byline;  posts.body (markdown) → portableText
//   settings singletons → `settings` collection (json `value`)
//
// Run: node scripts/build-seed.mjs   (writes .emdash/seed.json)

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, basename } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT = resolve(ROOT, "src/content");
const OUT = resolve(ROOT, ".emdash/seed.json");

// ⚠️ LIVE-DATA GUARD (added 2026-08-20 after a stale seed reset the nav menus).
// This script rebuilds .emdash/seed.json from the *git content collections* — a
// MINIMAL snapshot (e.g. nav = "Home" only) that does NOT reflect the live D1.
// EmDash auto-applies .emdash/seed.json on boot when it thinks the DB is empty
// (which the flaky shared-remote D1 can momentarily report), so an out-of-date
// seed here is a loaded gun against production content.
//
// The authoritative snapshot now comes from live D1 via:
//   npx emdash export-seed --with-content > .emdash/seed.json
//
// This builder is therefore OFF by default. To intentionally regenerate the
// git-derived seed (e.g. standing up a brand-new empty site), run:
//   EMDASH_ALLOW_SEED_BUILD=1 npm run seed
if (process.env.EMDASH_ALLOW_SEED_BUILD !== "1") {
  console.error(
    "\n✋ build-seed is disabled to protect live data.\n" +
      "   It would overwrite .emdash/seed.json with a MINIMAL git-derived snapshot\n" +
      "   that EmDash can auto-apply on boot and wipe live content (e.g. nav menus).\n\n" +
      "   • To back up the LIVE site instead:  npx emdash export-seed --with-content > .emdash/seed.json\n" +
      "   • To force a fresh git-derived seed (new/empty site only):  EMDASH_ALLOW_SEED_BUILD=1 npm run seed\n",
  );
  process.exit(1);
}

const readJson = async (p) => JSON.parse(await readFile(p, "utf-8"));
async function jsonFiles(dir) {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
}
const titleCase = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const iso = (d) => (d ? new Date(d).toISOString() : null);

/** Minimal YAML-frontmatter parser for the simple post frontmatter. */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["']|["']$/g, "");
    if (v === "true") v = true;
    else if (v === "false") v = false;
    data[kv[1]] = v;
  }
  return { data, body: m[2].trim() };
}

/** Markdown body → Portable Text blocks (paragraph-level; sufficient for the
 * simple blog bodies here). Keys are index-derived (no Math.random). */
function mdToPortableText(md) {
  return md
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para, i) => ({
      _type: "block",
      _key: `b${i}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `b${i}s0`, text: para.replace(/\n/g, " "), marks: [] }],
    }));
}

const collections = [];
const content = {};
const topicTerms = new Map(); // slug -> label (collected from faqs/reviews service)

// ---- pages ------------------------------------------------------------------
collections.push({
  slug: "pages",
  label: "Pages",
  labelSingular: "Page",
  description: "Section-composed pages rendered through the section registry.",
  icon: "file",
  supports: ["drafts", "seo"],
  urlPattern: "/{slug}",
  // Meta tags (title/description/OG/canonical/noindex) come from EmDash's NATIVE
  // SEO panel (supports:["seo"]) — not custom fields. `structured_data` holds the
  // one thing native SEO can't: custom JSON-LD (Service/FAQPage/LocalBusiness).
  fields: [
    { slug: "title", label: "Title", type: "string", required: true },
    { slug: "demo", label: "Demo / reference page", type: "boolean", defaultValue: false },
    { slug: "structured_data", label: "Structured data (JSON-LD)", type: "json" },
    // Visual page-builder widget (section-builder plugin) over the sections json.
    { slug: "sections", label: "Sections", type: "json", required: true, widget: "section-builder:pageBuilder" },
  ],
});
// Native-SEO migration map (seed can't set native SEO; a post-seed step upserts it).
const pagesSeo = {};
content.pages = (await jsonFiles(`${CONTENT}/pages`)).map(async (f) => {
  const raw = await readJson(`${CONTENT}/pages/${f}`);
  const id = basename(f, ".json");
  const seo = raw.seo ?? {};
  // Native SEO (meta tags) → migration map, keyed by page slug.
  pagesSeo[raw.slug ?? id] = {
    title: raw.metaTitle ?? null,
    description: raw.metaDescription ?? null,
    image: seo.ogImage ?? null,
    canonical: seo.canonical ?? null,
    noIndex: raw.noindex ?? false,
  };
  // structured_data = only the custom JSON-LD bits (Service/FAQ/LocalBusiness).
  const sd = {};
  if (seo.service) sd.service = seo.service;
  if (seo.faq?.length) sd.faq = seo.faq;
  if (seo.localBusiness) sd.localBusiness = seo.localBusiness;
  return {
    id,
    slug: raw.slug ?? id,
    status: raw.draft ? "draft" : "published",
    data: {
      title: raw.title ?? id,
      demo: raw.demo ?? false,
      structured_data: Object.keys(sd).length ? sd : null,
      sections: raw.sections ?? [],
    },
  };
});

// ---- service_categories -----------------------------------------------------
collections.push({
  slug: "service_categories",
  label: "Service Categories",
  labelSingular: "Service Category",
  icon: "folder",
  fields: [
    { slug: "title", label: "Title", type: "string", required: true },
    { slug: "description", label: "Description", type: "text" },
    { slug: "icon", label: "Icon", type: "string" },
    { slug: "order", label: "Order", type: "number", defaultValue: 0 },
  ],
});
content.service_categories = (await jsonFiles(`${CONTENT}/service-categories`)).map(async (f) => {
  const raw = await readJson(`${CONTENT}/service-categories/${f}`);
  const id = basename(f, ".json");
  return { id, slug: raw.slug ?? id, status: "published", data: { title: raw.title, description: raw.description ?? null, icon: raw.icon ?? null, order: raw.order ?? 0 } };
});

// ---- services (category → reference) ----------------------------------------
collections.push({
  slug: "services",
  label: "Services",
  labelSingular: "Service",
  icon: "tool",
  urlPattern: "/services/{slug}",
  fields: [
    { slug: "title", label: "Title", type: "string", required: true },
    { slug: "description", label: "Description", type: "text" },
    { slug: "meta_title", label: "Meta Title", type: "string" },
    { slug: "meta_description", label: "Meta Description", type: "text" },
    { slug: "image", label: "Image", type: "string" },
    { slug: "category", label: "Category", type: "reference", options: { collection: "service_categories" } },
    { slug: "content", label: "Body", type: "text" },
    { slug: "is_emergency", label: "Emergency service", type: "boolean", defaultValue: false },
    { slug: "featured", label: "Featured", type: "boolean", defaultValue: false },
    { slug: "order", label: "Order", type: "number", defaultValue: 0 },
  ],
});
content.services = (await jsonFiles(`${CONTENT}/services`)).map(async (f) => {
  const raw = await readJson(`${CONTENT}/services/${f}`);
  const id = basename(f, ".json");
  return {
    id,
    slug: raw.slug ?? id,
    status: "published",
    data: {
      title: raw.title,
      description: raw.description ?? null,
      meta_title: raw.metaTitle ?? null,
      meta_description: raw.metaDescription ?? null,
      image: raw.image ?? null,
      // Reference to a service_categories entry (seed id === category slug).
      category: raw.category ? `$ref:${raw.category}` : null,
      content: raw.content ?? null,
      is_emergency: raw.isEmergency ?? false,
      featured: raw.featured ?? false,
      order: raw.order ?? 0,
    },
  };
});

// ---- service_areas ----------------------------------------------------------
collections.push({
  slug: "service_areas",
  label: "Service Areas",
  labelSingular: "Service Area",
  icon: "map-pin",
  fields: [
    { slug: "city", label: "City", type: "string", required: true },
    { slug: "state", label: "State", type: "string" },
    { slug: "county", label: "County", type: "string" },
    { slug: "featured", label: "Featured", type: "boolean", defaultValue: false },
    { slug: "order", label: "Order", type: "number", defaultValue: 0 },
  ],
});
content.service_areas = (await jsonFiles(`${CONTENT}/service-areas`)).map(async (f) => {
  const raw = await readJson(`${CONTENT}/service-areas/${f}`);
  const id = basename(f, ".json");
  return { id, slug: raw.slug ?? id, status: "published", data: { city: raw.city, state: raw.state ?? null, county: raw.county ?? null, featured: raw.featured ?? false, order: raw.order ?? 0 } };
});

// ---- faqs (service → `topics` taxonomy) -------------------------------------
collections.push({
  slug: "faqs",
  label: "FAQs",
  labelSingular: "FAQ",
  icon: "help",
  fields: [
    { slug: "question", label: "Question", type: "string", required: true },
    { slug: "answer", label: "Answer", type: "text", required: true },
    { slug: "order", label: "Order", type: "number", defaultValue: 0 },
  ],
});
content.faqs = (await jsonFiles(`${CONTENT}/faqs`)).map(async (f) => {
  const raw = await readJson(`${CONTENT}/faqs/${f}`);
  const id = basename(f, ".json");
  if (raw.service) topicTerms.set(raw.service, titleCase(raw.service));
  return {
    id,
    slug: raw.slug ?? id,
    status: "published",
    data: { question: raw.question, answer: raw.answer, order: raw.order ?? 0 },
    ...(raw.service ? { taxonomies: { topics: [raw.service] } } : {}),
  };
});

// ---- reviews (datetime + select + `topics` taxonomy) ------------------------
collections.push({
  slug: "reviews",
  label: "Reviews",
  labelSingular: "Review",
  icon: "star",
  fields: [
    { slug: "author", label: "Author", type: "string", required: true },
    { slug: "rating", label: "Rating", type: "number", defaultValue: 5, validation: { min: 1, max: 5 } },
    { slug: "body", label: "Body", type: "text" },
    { slug: "date", label: "Date", type: "datetime" },
    { slug: "location", label: "Location", type: "string" },
    { slug: "featured", label: "Featured", type: "boolean", defaultValue: false },
    { slug: "source", label: "Source", type: "select", defaultValue: "Google", validation: { options: ["Google", "Facebook", "Yelp", "Direct"] } },
  ],
});
content.reviews = (await jsonFiles(`${CONTENT}/reviews`)).map(async (f) => {
  const raw = await readJson(`${CONTENT}/reviews/${f}`);
  const id = basename(f, ".json");
  if (raw.service) topicTerms.set(raw.service, titleCase(raw.service));
  return {
    id,
    slug: raw.slug ?? id,
    status: "published",
    data: { author: raw.author, rating: raw.rating ?? 5, body: raw.body ?? null, date: iso(raw.date), location: raw.location ?? null, featured: raw.featured ?? false, source: raw.source ?? "Google" },
    ...(raw.service ? { taxonomies: { topics: [raw.service] } } : {}),
  };
});

// ---- posts (byline + portableText + datetime) -------------------------------
collections.push({
  slug: "posts",
  label: "Blog Posts",
  labelSingular: "Post",
  icon: "article",
  supports: ["drafts", "seo", "search"],
  urlPattern: "/blog/{slug}",
  fields: [
    { slug: "title", label: "Title", type: "string", required: true },
    { slug: "description", label: "Description", type: "text" },
    { slug: "date", label: "Date", type: "datetime" },
    { slug: "featured", label: "Featured", type: "boolean", defaultValue: false },
    { slug: "body", label: "Body", type: "portableText" },
  ],
});
// Post taxonomy terms collected from frontmatter (feed the native category/tag defs below).
const categoryTerms = new Map(); // slug -> label
const tagTerms = new Map();
const slugifyTerm = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// Handles real arrays AND the naive frontmatter parser's raw `["a", "b"]` string.
const asList = (v) => {
  if (Array.isArray(v)) return v.map(String);
  if (v == null || v === "") return [];
  return String(v)
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((x) => x.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
};
{
  const dir = `${CONTENT}/posts`;
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => /\.(md|mdx|markdoc)$/.test(f)).sort();
  } catch {}
  content.posts = files.map(async (f) => {
    const { data, body } = parseFrontmatter(await readFile(`${dir}/${f}`, "utf-8"));
    const id = basename(f).replace(/\.(md|mdx|markdoc)$/, "");
    const catSlugs = asList(data.category ?? data.categories).map((c) => {
      const s = slugifyTerm(c);
      categoryTerms.set(s, c);
      return s;
    });
    const tagSlugs = asList(data.tags ?? data.tag).map((t) => {
      const s = slugifyTerm(t);
      tagTerms.set(s, t);
      return s;
    });
    const taxonomies = {
      ...(catSlugs.length ? { category: catSlugs } : {}),
      ...(tagSlugs.length ? { tag: tagSlugs } : {}),
    };
    return {
      id,
      slug: data.slug ?? id,
      status: data.draft ? "draft" : "published",
      data: { title: data.title ?? id, description: data.description ?? null, date: iso(data.date), featured: data.featured ?? false, body: mdToPortableText(body) },
      bylines: [{ byline: "admin" }],
      ...(Object.keys(taxonomies).length ? { taxonomies } : {}),
    };
  });
}

// ---- appearance (header/footer chrome pickers — native select dropdowns) ----
const HEADER_VARIANTS = ["classic", "centered", "minimal", "transparent", "inverse", "two-row", "pill", "compact", "cta-prominent", "gradient"];
const FOOTER_VARIANTS = ["columns", "simple", "cta", "newsletter", "map", "mega", "centered", "hours", "social", "bar", "brandmark", "glow", "spotlight", "marquee"];
collections.push({
  slug: "appearance",
  label: "Appearance",
  labelSingular: "Appearance",
  icon: "palette",
  fields: [
    { slug: "header_variant", label: "Header Style", type: "select", defaultValue: "classic", validation: { options: HEADER_VARIANTS } },
    { slug: "footer_variant", label: "Footer Style", type: "select", defaultValue: "columns", validation: { options: FOOTER_VARIANTS } },
  ],
});
{
  const general = await readJson(`${CONTENT}/settings/general.json`);
  content.appearance = [
    { id: "appearance", slug: "appearance", status: "published", data: { header_variant: general.headerVariant ?? "classic", footer_variant: general.footerVariant ?? "columns" } },
  ];
}

// ---- business profile singleton ---------------------------------------------
// Local-business NAP + hours + license/GBP. These have NO slot in EmDash's fixed
// native SiteSettings schema, so they stay a (typed, one-entry) collection —
// individual native fields + a native `hours` repeater, not a raw JSON blob.
// (`title`/`tagline`/`social`/`seo verification` DO move to native SiteSettings,
// seeded via `seed.settings` below.)
collections.push({
  slug: "business",
  label: "Business Profile",
  labelSingular: "Business Profile",
  icon: "building-2",
  fields: [
    { slug: "phone", label: "Phone", type: "string" },
    { slug: "email", label: "Email", type: "string" },
    { slug: "address", label: "Street Address", type: "string" },
    { slug: "city", label: "City", type: "string" },
    { slug: "state", label: "State", type: "string" },
    { slug: "zip", label: "ZIP", type: "string" },
    { slug: "license", label: "License #", type: "string" },
    { slug: "gbp_url", label: "Google Business Profile URL", type: "url" },
    {
      slug: "hours",
      label: "Business Hours",
      type: "repeater",
      validation: {
        subFields: [
          { slug: "day", label: "Day", type: "string", required: true },
          { slug: "open", label: "Opens", type: "string" },
          { slug: "close", label: "Closes", type: "string" },
          { slug: "closed_all_day", label: "Closed all day", type: "boolean" },
        ],
      },
    },
  ],
});
{
  const general = await readJson(`${CONTENT}/settings/general.json`);
  // Repeater sub-field slugs must be snake_case; the reader (getHoursSettings)
  // normalizes `closed_all_day` back to `closedAllDay` for the 11 consumers.
  const hours = ((await readJson(`${CONTENT}/settings/hours.json`)).hours ?? []).map((h) => ({
    day: h.day ?? "",
    open: h.open ?? "",
    close: h.close ?? "",
    closed_all_day: h.closedAllDay ?? false,
  }));
  content.business = [
    {
      id: "business",
      slug: "business",
      status: "published",
      data: {
        phone: general.phone ?? "",
        email: general.email ?? "",
        address: general.address ?? "",
        city: general.city ?? "",
        state: general.state ?? "",
        zip: general.zip ?? "",
        license: general.license ?? "",
        gbp_url: general.gbpUrl ?? "",
        hours,
      },
    },
  ];
}

// Resolve async entry arrays.
for (const key of Object.keys(content)) content[key] = await Promise.all(content[key]);

// Relocate demo images → static public path (SSR-safe; files copied to public/images/).
{
  const rewritten = JSON.parse(JSON.stringify(content).split("/src/assets/images/").join("/images/"));
  for (const key of Object.keys(content)) content[key] = rewritten[key];
}

// ---- taxonomies (topics) + bylines (authors) --------------------------------
const taxonomies = [
  {
    name: "topics",
    label: "Topics",
    labelSingular: "Topic",
    hierarchical: false,
    collections: ["faqs", "reviews"],
    terms: [...topicTerms.entries()].map(([slug, label]) => ({ slug, label })),
  },
  // Native WP-style blog taxonomies. Use the SINGULAR machine names EmDash
  // reserves (`category`/`tag`, ids taxdef_category/taxdef_tag) so these merge
  // into the built-in taxonomies (adding terms) instead of creating duplicates.
  {
    name: "category",
    label: "Categories",
    labelSingular: "Category",
    hierarchical: true,
    collections: ["posts"],
    terms: [...categoryTerms.entries()].map(([slug, label]) => ({ slug, label })),
  },
  {
    name: "tag",
    label: "Tags",
    labelSingular: "Tag",
    hierarchical: false,
    collections: ["posts"],
    terms: [...tagTerms.entries()].map(([slug, label]) => ({ slug, label })),
  },
];
const bylines = [{ id: "admin", slug: "admin", displayName: "Admin" }];

// ---- menus (EmDash native — fully authored, editable in the CMS Navigation UI) --
// Nothing is derived at runtime. The services list and the service-area→service
// tree are SNAPSHOT here into real nested menu items (was the custom, non-native
// `nav-autopopulate` cssClasses hack). After seeding, every menu is 100% editable
// in the admin; adding a new service/area means adding a menu item (or reseeding).
const pageIds = new Set(content.pages.map((p) => p.id));
const pageSlugs = new Set(content.pages.map((p) => p.slug));
const link = (url, label, extra = {}) => ({ type: "custom", url, label, ...extra });
const pageLink = (id, label) => (pageIds.has(id) ? { type: "page", collection: "pages", ref: id, label } : link(`/${id}`, label));

const svcSorted = [...content.services].sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
const servicesChildren = svcSorted.map((s) => link(`/services/${s.slug}`, s.data.title));
const areasChildren = [...content.service_areas]
  .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
  .map((area) => {
    const kids = svcSorted
      .filter((s) => pageSlugs.has(`${area.slug}/${s.slug}`))
      .map((s) => link(`/${area.slug}/${s.slug}`, s.data.title));
    return kids.length ? link("#", `${area.data.city}, ${area.data.state}`, { children: kids }) : null;
  })
  .filter(Boolean);

// Flat city list for the footer's Service Areas column (featured-first).
const footerAreasFlat = [...content.service_areas]
  .sort((a, b) => (b.data.featured ? 1 : 0) - (a.data.featured ? 1 : 0) || (a.data.order ?? 0) - (b.data.order ?? 0))
  .map((area) => link("#", `${area.data.city}, ${area.data.state}`));

// Menus are authored from whatever content actually exists, so a stripped/new
// site has no broken links. Items appear only when their target does. Everything
// stays editable in the CMS Navigation admin.
const hasPosts = (content.posts?.length ?? 0) > 0;
const primaryItems = [link("/", "Home")];
if (servicesChildren.length) primaryItems.push({ ...link("/services", "Services"), children: servicesChildren });
if (areasChildren.length) primaryItems.push(link("#", "Service Areas", { children: areasChildren }));
if (pageIds.has("about")) primaryItems.push(pageLink("about", "About"));
if (hasPosts) primaryItems.push(link("/blog", "Blog"));
if (pageSlugs.has("contact")) primaryItems.push(link("/contact", "Contact"));
const primaryMenu = { name: "primary", label: "Primary Navigation", items: primaryItems };

// Footer menu is GROUPED: each top-level item is a footer column, its children
// are that column's links. Column footers render one column per group; minimal
// footers flatten the children into a row. Fully editable in the CMS.
const companyChildren = [link("/", "Home")];
if (pageIds.has("about")) companyChildren.push(pageLink("about", "About"));
if (hasPosts) companyChildren.push(link("/blog", "Blog"));
if (pageSlugs.has("contact")) companyChildren.push(link("/contact", "Contact"));
const footerGroups = [];
if (servicesChildren.length) footerGroups.push(link("#", "Our Services", { children: servicesChildren }));
if (footerAreasFlat.length) footerGroups.push(link("#", "Service Areas", { children: footerAreasFlat }));
footerGroups.push(link("#", "Company", { children: companyChildren }));
const footerNavMenu = { name: "footer", label: "Footer Navigation", items: footerGroups };

const legalMenu = {
  name: "footer-legal",
  label: "Footer — Legal",
  items: [
    ["privacy-policy", "Privacy Policy"],
    ["terms-of-service", "Terms of Service"],
    ["cookie-policy", "Cookie Policy"],
  ]
    .filter(([id]) => pageIds.has(id))
    .map(([id, label]) => ({ type: "page", collection: "pages", ref: id, label })),
};

const menus = [primaryMenu, footerNavMenu, ...(legalMenu.items.length ? [legalMenu] : [])];

// ---- native Site Settings (EmDash built-in, fixed schema) -------------------
// The overlap between our old `general`/`seo` singletons and EmDash's native
// SiteSettings — title/tagline/social/seo-verification — lives here now, edited
// in the admin's native Settings panel. (defaultOgImage is a MediaReference, so
// it's omitted until media is seeded; the OG fallback stays in site.config.)
const settings = await (async () => {
  const general = await readJson(`${CONTENT}/settings/general.json`);
  const seoRaw = await readJson(`${CONTENT}/settings/seo.json`);
  const social = {};
  for (const k of ["facebook", "instagram", "youtube"]) if (general.social?.[k]) social[k] = general.social[k];
  const seo = {};
  if (seoRaw.googleVerification) seo.googleVerification = seoRaw.googleVerification;
  if (seoRaw.bingVerification) seo.bingVerification = seoRaw.bingVerification;
  return {
    title: general.businessName,
    tagline: general.tagline,
    timezone: "America/Boise",
    dateFormat: "MMMM d, yyyy",
    postsPerPage: 10,
    ...(Object.keys(social).length ? { social } : {}),
    ...(Object.keys(seo).length ? { seo } : {}),
  };
})();

// ---- widget areas (EmDash native) -------------------------------------------
// Editor-managed slots the host layouts place via <WidgetArea name>. Only native
// widget types (content / menu / the 5 core:* components) — zero custom rendering.
const widgetAreas = [
  {
    name: "blog-sidebar",
    label: "Blog Sidebar",
    description: "Rail shown beside the blog index and posts.",
    widgets: [
      { type: "component", title: "Search", componentId: "core:search" },
      { type: "component", title: "Recent Posts", componentId: "core:recent-posts", props: { limit: 5 } },
      { type: "component", title: "Categories", componentId: "core:categories" },
      { type: "component", title: "Tags", componentId: "core:tags" },
    ],
  },
  {
    name: "announcement-bar",
    label: "Announcement Bar",
    description: "Optional promo strip at the very top of every page. Empty = hidden. Add a content widget in the CMS to show it.",
    widgets: [],
  },
  {
    name: "post-footer",
    label: "After Post",
    description: "Shown below every blog post (CTA + related).",
    widgets: [
      { type: "content", title: "CTA", content: mdToPortableText("Enjoyed this? Get a free quote today — contact us to get started.") },
      { type: "component", title: "Recent Posts", componentId: "core:recent-posts", props: { limit: 3 } },
    ],
  },
  {
    name: "footer-extra",
    label: "Footer Extra Column",
    description: "Optional editable column in the columns/mega footers. Empty by default — add content/menu widgets in the admin to show it.",
    widgets: [],
  },
];

const seed = {
  $schema: "https://emdashcms.com/seed.schema.json",
  version: "1",
  meta: { name: "vws-starter-2026", description: "Local-services starter content, conformed to EmDash idioms.", author: "Velocity Web Studio" },
  settings,
  collections,
  taxonomies,
  bylines,
  menus,
  widgetAreas,
  content,
};

await mkdir(resolve(ROOT, ".emdash"), { recursive: true });
await writeFile(OUT, JSON.stringify(seed, null, 2) + "\n");
// Native-SEO map (consumed once by the post-seed migration route).
await writeFile(resolve(ROOT, ".emdash/pages-seo.json"), JSON.stringify(pagesSeo, null, 2) + "\n");
console.log(`Wrote ${OUT}`);
console.log(`  collections: ${collections.length} | pages-seo entries: ${Object.keys(pagesSeo).length}`);
for (const [k, v] of Object.entries(content)) console.log(`  ${k}: ${v.length}`);
console.log(`  taxonomies: topics(${taxonomies[0].terms.length}) | bylines: ${bylines.length} | menus: ${menus.map((m) => m.name).join(", ")}`);
console.log(`  settings: ${Object.keys(settings).join(", ")} | widgetAreas: ${widgetAreas.map((w) => w.name).join(", ")}`);
