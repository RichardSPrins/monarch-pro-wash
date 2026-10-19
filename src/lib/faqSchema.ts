/**
 * Builds FAQPage structured data from the FAQ sections a page actually renders.
 *
 * Previously `createFAQSchema` only ran when a page carried a hand-authored
 * `structured_data.faq` array, and no page does, so none of the live FAQs were
 * described in structured data at all. This derives the schema from the same
 * query the FAQ components run, which matters: structured data that does not
 * match the visible page is a guidelines violation, not just a wasted tag.
 *
 * The filter below is deliberately a copy of the one in FAQAccordion: a section
 * with a `service` shows FAQs carrying that topic term, and a section without
 * one shows only the untagged general FAQs.
 *
 * A page may hold more than one FAQ section but may only emit one FAQPage, so
 * the results are merged and de-duplicated by question.
 *
 * Scope note: Google restricted FAQ rich results to authoritative government
 * and health sites in 2023, so this is not a route to FAQ snippets in Google.
 * It is still worth emitting: Bing uses it, and it gives AI search and other
 * consumers an unambiguous question/answer structure instead of asking them to
 * infer one from an accordion.
 */
import { getFaqs } from "@/lib/content";

export interface FaqPair {
  question: string;
  answer: string;
}

type SectionLike = { type?: string; data?: Record<string, any> };

/**
 * Resolve every FAQ rendered by a page's sections, in render order.
 * Returns null when the page shows no FAQs, so callers can skip the tag.
 */
export async function faqsForSections(sections: SectionLike[] | undefined): Promise<FaqPair[] | null> {
  const faqSections = (sections ?? []).filter((s) => s.type?.startsWith("faqs:"));
  if (!faqSections.length) return null;

  const all = await getFaqs();
  if (!all.length) return null;

  const seen = new Set<string>();
  const out: FaqPair[] = [];

  for (const section of faqSections) {
    const topic = section.data?.service as string | undefined;
    const picked = all
      .filter((f) => (topic ? f.data.service === topic : !f.data.service))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
      .slice(0, (section.data?.limit as number | undefined) ?? all.length);

    for (const f of picked) {
      const question = String(f.data.question ?? "").trim();
      const answer = String(f.data.answer ?? "").trim();
      if (!question || !answer) continue;
      const key = question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      // Answers may carry HTML now. Google's allowed set for acceptedAnswer
      // covers what the CMS produces (a, p, ul, ol, li, strong, em, br), so it
      // is passed through rather than stripped.
      out.push({ question, answer });
    }
  }

  return out.length ? out : null;
}
