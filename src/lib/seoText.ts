/**
 * Meta-description derivation.
 *
 * `_emdash_seo` is empty, so nothing on this site carried a per-page
 * description. Every page that is not a service or service-in-area page fell
 * all the way back to the site tagline, which meant `/`, `/about`, `/contact`,
 * `/services` and all 13 town hubs shipped the same 33-character description:
 * "Exterior cleaning that transforms".
 *
 * Rather than introduce a second place to author copy (and a second place for
 * it to go stale), the description is derived from the page's own hero
 * subheading. That copy is already written per page, already specific, and
 * already the first thing a reader sees, which is exactly what a description
 * should summarise. An explicit description still wins when one is set.
 */
import type { SectionConfig } from "@/types/sections";

/** Google renders roughly 155-160 characters. */
const MAX = 155;

const clean = (v: unknown): string =>
  String(v ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/==/g, "") // accent-emphasis markers are authoring syntax, not prose
    .replace(/\s+/g, " ")
    .trim();

/** Trim to MAX without cutting a word, and without leaving dangling punctuation. */
function truncate(s: string): string {
  if (s.length <= MAX) return s;
  const cut = s.slice(0, MAX);
  const at = cut.lastIndexOf(" ");
  return (at > 60 ? cut.slice(0, at) : cut).replace(/[\s,;:.]+$/, "") + "...";
}

/**
 * Best available description for a page, or null to let the caller fall back.
 *
 * Preference order mirrors how much the text is "about the page": the hero
 * subheading first, then the opening body paragraph, then any section
 * subheading.
 */
export function deriveDescription(sections: SectionConfig[] | undefined): string | null {
  if (!sections?.length) return null;

  const hero = sections.find((s) => s.type?.startsWith("hero:"));
  const heroText = clean((hero?.data as any)?.subheading ?? (hero?.data as any)?.subheadline);
  if (heroText.length >= 50) return truncate(heroText);

  for (const s of sections) {
    const body = clean((s.data as any)?.body);
    if (body.length >= 50) return truncate(body);
  }
  for (const s of sections) {
    const sub = clean((s.data as any)?.subheading);
    if (sub.length >= 50) return truncate(sub);
  }
  return heroText.length ? heroText : null;
}
