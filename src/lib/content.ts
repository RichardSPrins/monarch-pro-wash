// EmDash content adapter.
//
// Wraps the EmDash live query API (getEmDashCollection/getEmDashEntry) and maps
// entries back to the shapes the existing components/helpers already expect
// (git schema: camelCase fields, `.id`/`.data`). This keeps the ~69 read sites a
// near-mechanical `getCollection("x")` → `getX()` swap instead of rewriting each.
//
// Resolved at request time (SSR) → live edits appear without a rebuild.
import { getEmDashCollection, getEmDashEntry } from "emdash";
import { estimatorPricing, type EstimatorPricing } from "@/config/estimatorPricing";

/** A JSON column can come back parsed or as a string; normalise. */
function asJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return v as T;
}

async function all(collection: string): Promise<any[]> {
  const { entries, error } = await getEmDashCollection(collection as any);
  if (error) {
    console.error(`[emdash] getEmDashCollection("${collection}")`, error);
    return [];
  }
  return entries as any[];
}

// ---- pages ------------------------------------------------------------------

function mapPage(e: any) {
  const d = e.data ?? {};
  return {
    id: e.id,
    data: {
      title: d.title,
      slug: d.slug ?? e.id,
      demo: d.demo ?? false,
      draft: (d.status ?? e.status) === "draft",
      // Native EmDash SEO (title/description/image/canonical/noIndex) — the live
      // loader exposes it at data.seo. Consumed via getSeoMeta() in the page route.
      seo: d.seo ?? undefined,
      // Custom JSON-LD (Service/FAQ/LocalBusiness) — the one thing native SEO can't do.
      structuredData: asJson<any>(d.structured_data, undefined),
      sections: asJson<any[]>(d.sections, []),
    },
  };
}

export async function getPages() {
  return (await all("pages")).map(mapPage);
}

/** Single page by slug/id (the EmDash entry id equals the page slug). */
export async function getPage(slug: string) {
  const { entry } = await getEmDashEntry("pages" as any, slug);
  return entry ? mapPage(entry) : null;
}

// ---- services / categories / areas ------------------------------------------

export async function getServices() {
  // Resolve the `category` reference (stored as the target's translationGroup id)
  // back to the category slug the components group by.
  const [svcs, cats] = await Promise.all([all("services"), all("service_categories")]);
  const catSlug = new Map<string, string>();
  for (const c of cats) if (c.data?.translationGroup) catSlug.set(c.data.translationGroup, c.id);
  return svcs.map((e) => {
    const d = e.data ?? {};
    return {
      id: e.id,
      data: {
        title: d.title,
        slug: d.slug ?? e.id,
        description: d.description ?? undefined,
        metaTitle: d.meta_title ?? undefined,
        metaDescription: d.meta_description ?? undefined,
        image: d.image ?? undefined,
        category: d.category ? (catSlug.get(d.category) ?? undefined) : undefined,
        content: d.content ?? undefined,
        isEmergency: d.is_emergency ?? false,
        featured: d.featured ?? false,
        order: d.order ?? 0,
      },
    };
  });
}

/** First taxonomy term slug for a given taxonomy on an entry. */
function termSlug(entry: any, taxonomy: string): string | undefined {
  return entry?.data?.terms?.[taxonomy]?.[0]?.slug ?? undefined;
}

export async function getServiceCategories() {
  return (await all("service_categories")).map((e) => {
    const d = e.data ?? {};
    return {
      id: e.id,
      data: { title: d.title, slug: d.slug ?? e.id, description: d.description ?? undefined, icon: d.icon ?? undefined, order: d.order ?? 0 },
    };
  });
}

export async function getServiceAreas() {
  return (await all("service_areas")).map((e) => {
    const d = e.data ?? {};
    return {
      id: e.id,
      data: { city: d.city, state: d.state ?? undefined, slug: d.slug ?? e.id, county: d.county ?? undefined, featured: d.featured ?? false, order: d.order ?? 0 },
    };
  });
}

// ---- faqs / reviews ---------------------------------------------------------

export async function getFaqs() {
  return (await all("faqs")).map((e) => {
    const d = e.data ?? {};
    // `service` grouping is now the `topics` taxonomy.
    return { id: e.id, data: { question: d.question, answer: d.answer, service: termSlug(e, "topics"), order: d.order ?? 0 } };
  });
}

export async function getReviews() {
  return (await all("reviews")).map((e) => {
    const d = e.data ?? {};
    return {
      id: e.id,
      // date: datetime → Date (components call .getTime()); service: `topics` taxonomy.
      data: { author: d.author, rating: d.rating ?? 5, body: d.body ?? undefined, date: new Date(d.date ?? 0), service: termSlug(e, "topics"), location: d.location ?? undefined, featured: d.featured ?? false, source: d.source ?? undefined },
    };
  });
}

// ---- posts (byline → author, portableText body) -----------------------------

function mapPost(e: any) {
  const d = e.data ?? {};
  return {
    id: e.id,
    data: {
      title: d.title,
      slug: d.slug ?? e.id,
      description: d.description ?? undefined,
      date: new Date(d.date ?? 0),
      featured: d.featured ?? false,
      author: d.byline?.displayName ?? "Admin",
      body: asJson<any[]>(d.body, []), // Portable Text blocks (render with emdash/ui PortableText)
    },
  };
}

export async function getPosts() {
  return (await all("posts")).map(mapPost);
}

export async function getPost(slug: string) {
  const { entry } = await getEmDashEntry("posts" as any, slug);
  return entry ? mapPost(entry) : null;
}

// ---- estimator pricing singleton --------------------------------------------

/** Ballpark pricing for the /estimate calculator. Reads the optional `pricing`
 * singleton (json `value`) if it's been registered in the CMS — so the numbers
 * become editable in the EmDash admin — and otherwise falls back to the code
 * default in src/config/estimatorPricing.ts. The page reads through here, so no
 * page change is needed once the singleton is added. */
export async function getEstimatorPricing(): Promise<EstimatorPricing> {
  try {
    const { entry } = await getEmDashEntry("pricing" as any, "pricing");
    const v = (entry?.data as any)?.value ?? (entry?.data as any);
    if (v && v.services) return v as EstimatorPricing;
  } catch {
    // `pricing` collection not registered yet — use the code default.
  }
  return estimatorPricing;
}

// ---- business profile + appearance singletons -------------------------------

/** Header/footer chrome selection (native select fields → admin dropdowns). */
export async function getAppearance() {
  const { entry } = await getEmDashEntry("appearance" as any, "appearance");
  const d = (entry?.data as any) ?? {};
  return { headerVariant: d.header_variant ?? "classic", footerVariant: d.footer_variant ?? "columns" };
}

/** Local-business profile (NAP + hours + license/GBP) — the `business` singleton.
 * Native SiteSettings has no slot for these; social/title/tagline live in native
 * SiteSettings instead (see getBusinessData in utils.ts). */
export async function getBusiness(): Promise<Record<string, any>> {
  const { entry } = await getEmDashEntry("business" as any, "business");
  return (entry?.data as any) ?? {};
}

/** Business hours, as the getCollection-compatible array-of-one (`[{ data: { hours } }]`)
 * the 11 hours consumers already expect — now sourced from the `business` singleton. */
export async function getHoursSettings(): Promise<Array<{ id: string; data: { hours: any[] } }>> {
  const d = await getBusiness();
  // Normalize the repeater's snake_case sub-field back to the camelCase shape
  // the 11 consumers expect ({ day, open, close, closedAllDay }).
  const hours = ((d.hours as any[]) ?? []).map((h) => ({
    day: h.day,
    open: h.open,
    close: h.close,
    closedAllDay: h.closed_all_day ?? h.closedAllDay ?? false,
  }));
  return [{ id: "business", data: { hours } }];
}
