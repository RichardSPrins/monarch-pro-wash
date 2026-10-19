/**
 * Blog listing queries, built on the EmDash collection API.
 *
 * Everything here is pushed down to the database rather than done in memory:
 *
 *   limit / offset   real pagination, so page three fetches one page of rows
 *   where            category filtering, server side
 *   orderBy          featured first, then newest
 *   status           published only, explicitly
 *   cacheHint        returned to the route so it can set cache headers
 *
 * The loader does not return a total row count. That is deliberate on its part
 * (CollectionResult documents `hasMore` as existing "so numbered archive routes
 * can render a next page link without computing a total count"), so the UI
 * offers Previous/Next plus the current page rather than a 1..N page list.
 * Rendering the full list would cost a COUNT on every request to save a click.
 */
import { getEmDashCollection } from "emdash";

/** One lead card plus two rows of three on page one. */
export const POSTS_PER_PAGE = 7;

/** Featured first, then newest. This is what makes the CMS Featured toggle work. */
const ORDER = { featured: "desc", date: "desc" } as const;

export interface PostCard {
  slug: string;
  title: string;
  description?: string;
  date: Date;
  cover?: string;
  coverAlt?: string;
  category?: string;
  author?: string;
  featured?: boolean;
}

function toCard(e: any): PostCard {
  const d = e.data ?? {};
  return {
    slug: d.slug ?? e.id,
    title: d.title,
    description: d.description ?? undefined,
    date: new Date(d.date ?? 0),
    cover: d.cover ?? undefined,
    coverAlt: d.cover_alt ?? undefined,
    category: d.topic ?? undefined,
    author: d.author ?? "Richard Prins",
    featured: Boolean(d.featured),
  };
}

/** Thin wrapper so every query in this file shares the same defaults. */
async function query(filter: Record<string, unknown>) {
  const res = await getEmDashCollection("posts" as any, {
    status: "published",
    orderBy: ORDER,
    ...filter,
  } as any);
  if (res.error) console.error("[blog] query", filter, res.error);
  return res;
}

export interface PageOptions {
  page: number;
  /** Exact-match category filter, applied in the database. */
  category?: string;
}

/**
 * One page of posts.
 *
 * On page one of the unfiltered archive the first row is lifted out as the
 * lead card, so nothing renders twice. Category pages skip the lead, because a
 * large card plus two siblings reads oddly on a short list.
 */
export async function getPage({ page, category }: PageOptions) {
  const { entries, hasMore, cacheHint } = await query({
    limit: POSTS_PER_PAGE,
    offset: (page - 1) * POSTS_PER_PAGE,
    // Stored as `topic`, not `category`: the services collection already has a
    // `category` field of type reference, and the where-builder resolves field
    // metadata by slug, so filtering posts on `category` silently matched zero
    // rows. Renaming the posts field sidesteps the collision.
    ...(category ? { where: { topic: category } } : {}),
  });

  const cards = (entries ?? []).map(toCard);
  const useLead = page === 1 && !category;

  return {
    lead: useLead ? (cards[0] ?? null) : null,
    posts: useLead ? cards.slice(1) : cards,
    hasMore: Boolean(hasMore),
    page,
    category,
    isEmpty: cards.length === 0,
    cacheHint,
  };
}

/**
 * The category chips.
 *
 * There is no DISTINCT in the loader API, so this reads a bounded page of rows
 * and reduces. It is capped rather than unbounded on purpose: if the archive
 * ever outgrows the cap, the chip list is the thing that degrades, not the
 * listing itself. Promote `category` to a real EmDash taxonomy if that day
 * comes, which would give a proper term list and term-filtered queries.
 */
export async function getCategories(): Promise<string[]> {
  const { entries } = await query({ limit: 200 });
  const seen = new Set<string>();
  for (const e of entries ?? []) {
    const c = (e.data as any)?.topic;
    if (c) seen.add(c);
  }
  return [...seen].sort();
}

/** Most recent posts for the "Recent Articles" strips. Also a bounded query. */
export async function recentPosts(limit = 3, excludeSlug?: string) {
  const { entries } = await query({ limit: excludeSlug ? limit + 1 : limit });
  return (entries ?? [])
    .map(toCard)
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit);
}

/**
 * Related posts for a single article: same category first, then recent.
 * Two bounded queries rather than one unbounded fetch-and-filter.
 */
export async function relatedPosts(slug: string, category?: string, limit = 3) {
  const picked: PostCard[] = [];
  const take = (cards: PostCard[]) => {
    for (const c of cards) {
      if (picked.length >= limit) break;
      if (c.slug === slug || picked.some((p) => p.slug === c.slug)) continue;
      picked.push(c);
    }
  };

  if (category) {
    const { entries } = await query({ limit: limit + 1, where: { topic: category } });
    take((entries ?? []).map(toCard));
  }
  if (picked.length < limit) {
    const { entries } = await query({ limit: limit + 1 + picked.length });
    take((entries ?? []).map(toCard));
  }
  return picked;
}
