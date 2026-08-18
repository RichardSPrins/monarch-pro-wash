/**
 * Ballpark pricing model for the /estimate interactive calculator.
 *
 * This is the single source of truth for the estimator's numbers. Edit here to
 * tune pricing. The page reads this at render and injects it into the tool, so
 * the compute logic never hardcodes figures.
 *
 * These are transparent ballparks (base range × size/stories/property
 * multipliers), NOT quotes — the tool labels them as such and the real price is
 * confirmed on-site.
 *
 * FUTURE (CMS-editable): to let Richard tune these from the EmDash admin without
 * a deploy, promote this object to a `pricingSettings` singleton (see
 * docs/lead-magnets.md). The page would read the singleton and fall back to this
 * default; the injected-JSON contract to the client stays identical.
 */
export interface ServicePricing {
  /** Base [low, high] at the baseline: medium home, 1 story, residential. */
  base: [number, number];
  /** Scale the base by the home-size multiplier. */
  size: boolean;
  /** Scale the base by the stories multiplier. */
  story: boolean;
  /** Priced per solar panel instead of by base range. */
  panels?: boolean;
}

export interface EstimatorPricing {
  /** Keyed by service slug (must match the estimator's service list). */
  services: Record<string, ServicePricing>;
  /** Solar is priced by panel count: [low, high] per panel, floored at min. */
  solar: { perPanel: [number, number]; min: [number, number] };
  /** Home-size slider → linear multiplier from min (at sqftMin) to max (at sqftMax). */
  sizeMult: { min: number; max: number; sqftMin: number; sqftMax: number };
  /** Stories → multiplier (applied to services with `story: true`). */
  storyMult: { one: number; two: number; three: number };
  /** Whole-estimate multiplier when the property is a business. */
  commercialMult: number;
  /** Round each end of the range to the nearest this many dollars. */
  roundTo: number;
}

export const estimatorPricing: EstimatorPricing = {
  services: {
    "pressure-washing": { base: [150, 300], size: true, story: false },
    "soft-washing": { base: [250, 500], size: true, story: true },
    "roof-cleaning": { base: [350, 700], size: true, story: true },
    "gutter-cleaning": { base: [150, 300], size: true, story: true },
    "window-cleaning": { base: [180, 350], size: true, story: true },
    "solar-panel-cleaning": { base: [0, 0], size: false, story: false, panels: true },
  },
  solar: { perPanel: [6, 12], min: [90, 180] },
  sizeMult: { min: 0.7, max: 2.0, sqftMin: 800, sqftMax: 6000 },
  storyMult: { one: 1.0, two: 1.3, three: 1.6 },
  commercialMult: 1.4,
  roundTo: 10,
};
