import type { AstroComponentFactory } from "astro/runtime/server/index.js";

// Header variants
import HeaderClassic from "@/components/layout/Header.astro";
import HeaderCentered from "@/components/layout/HeaderCentered.astro";
import HeaderMinimal from "@/components/layout/HeaderMinimal.astro";
import HeaderTransparent from "@/components/layout/HeaderTransparent.astro";
import HeaderInverse from "@/components/layout/HeaderInverse.astro";
import HeaderTwoRow from "@/components/layout/HeaderTwoRow.astro";
import HeaderPill from "@/components/layout/HeaderPill.astro";
import HeaderCompact from "@/components/layout/HeaderCompact.astro";
import HeaderCTAProminent from "@/components/layout/HeaderCTAProminent.astro";
import HeaderGradient from "@/components/layout/HeaderGradient.astro";

// Footer variants
import FooterColumns from "@/components/layout/Footer.astro";
import FooterSimple from "@/components/layout/FooterSimple.astro";
import FooterCTA from "@/components/layout/FooterCTA.astro";
import FooterNewsletter from "@/components/layout/FooterNewsletter.astro";
import FooterMap from "@/components/layout/FooterMap.astro";
import FooterMega from "@/components/layout/FooterMega.astro";
import FooterCentered from "@/components/layout/FooterCentered.astro";
import FooterHours from "@/components/layout/FooterHours.astro";
import FooterSocial from "@/components/layout/FooterSocial.astro";
import FooterBar from "@/components/layout/FooterBar.astro";
import FooterBrandmark from "@/components/layout/FooterBrandmark.astro";
import FooterGlow from "@/components/layout/FooterGlow.astro";
import FooterSpotlight from "@/components/layout/FooterSpotlight.astro";
import FooterMarquee from "@/components/layout/FooterMarquee.astro";

/**
 * Header/footer chrome variants, selectable per-site via the `headerVariant` /
 * `footerVariant` fields in general settings (src/content/settings/general.json).
 * This is how a clone swaps its site chrome without touching the layouts.
 */
export const headerVariants: Record<string, AstroComponentFactory> = {
  classic: HeaderClassic,
  centered: HeaderCentered,
  minimal: HeaderMinimal,
  transparent: HeaderTransparent,
  inverse: HeaderInverse,
  "two-row": HeaderTwoRow,
  pill: HeaderPill,
  compact: HeaderCompact,
  "cta-prominent": HeaderCTAProminent,
  gradient: HeaderGradient,
};

export const footerVariants: Record<string, AstroComponentFactory> = {
  columns: FooterColumns,
  simple: FooterSimple,
  cta: FooterCTA,
  newsletter: FooterNewsletter,
  map: FooterMap,
  mega: FooterMega,
  centered: FooterCentered,
  hours: FooterHours,
  social: FooterSocial,
  bar: FooterBar,
  brandmark: FooterBrandmark,
  glow: FooterGlow,
  spotlight: FooterSpotlight,
  marquee: FooterMarquee,
};

export function resolveHeader(variant?: string): AstroComponentFactory {
  return headerVariants[variant ?? "classic"] ?? HeaderClassic;
}

export function resolveFooter(variant?: string): AstroComponentFactory {
  return footerVariants[variant ?? "columns"] ?? FooterColumns;
}
