export interface Eyebrow {
  text: string;
  variant?: "badge" | "tag" | "text";
}

export interface SectionCTA {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

/** A reference to an image, authored as a string path resolved by src/lib/images.ts. */
export interface ImageRef {
  src: string;
  alt?: string;
}

/** A single step in a process/how-it-works section. */
export interface ProcessStep {
  heading: string;
  body?: string;
}

/** A single big-number stat. */
export interface StatItem {
  value: string;
  label: string;
  description?: string;
}

/** A logo in a trust bar / "as seen in" row. */
export interface LogoItem {
  src: string;
  alt?: string;
  href?: string;
}

/** Shared header fields most sections accept. */
export interface SectionHeader {
  eyebrow?: Eyebrow;
  heading?: string;
  subheading?: string;
}

/** A pricing plan / tier card. */
export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features?: string[];
  cta?: SectionCTA;
  highlighted?: boolean;
}

/** A team member card. */
export interface TeamMember {
  name: string;
  role?: string;
  photo?: string;
  bio?: string;
}

/** A row in a zig-zag alternating feature section. */
export interface FeatureRow {
  heading: string;
  body?: string;
  image?: ImageRef;
  bullets?: string[];
}

/** A row in an us-vs-them comparison table. `true`/`false` render as check/cross; a string renders as text. */
export interface ComparisonRow {
  feature: string;
  us?: boolean | string;
  them?: boolean | string;
}

/** An aggregate rating from a review source (Google / Facebook / Yelp). */
export interface RatingSource {
  name: "Google" | "Facebook" | "Yelp" | string;
  rating: number;
  count?: number;
  url?: string;
}

/** A tab in a tabbed section (benefits, services, etc.). */
export interface TabItem {
  label: string;
  heading?: string;
  body?: string;
  bullets?: string[];
  image?: ImageRef;
  icon?: string;
}

/** A certification / license / manufacturer badge. */
export interface CertItem {
  label: string;
  logo?: string;
  description?: string;
}

/** A "starting at" price row for a service. */
export interface EstimateRow {
  service: string;
  from: string;
  note?: string;
}

/** A company-history milestone. */
export interface TimelineItem {
  title: string;
  year?: string;
  body?: string;
}

/** An icon + title + body feature/value item. */
export interface FeatureItem {
  icon?: string;
  title: string;
  body?: string;
  bullets?: string[];
}

/** A selectable option in a quiz step. */
export interface QuizOption {
  label: string;
  value?: string;
  description?: string;
  icon?: string;
}

/** A contact-capture field in a quiz step. */
export interface QuizField {
  name: string;
  label: string;
  type?: "text" | "tel" | "email";
  placeholder?: string;
  required?: boolean;
}

/** A single step in a multi-step quiz form. */
export interface QuizStep {
  id: string;
  type: "single-select" | "multi-select" | "scale" | "contact";
  question: string;
  help?: string;
  options?: QuizOption[];
  fields?: QuizField[];
  autoAdvance?: boolean;
}

/**
 * Where a lead form sends its payload. Destination-agnostic: on submit the form
 * dispatches a `form:submit` DOM event with the whole payload, optionally POSTs
 * JSON to `endpoint`, and optionally redirects. GHL/Formspree/Worker/none are
 * all just config.
 */
export interface FormSubmit {
  /** Override the site default: stub (no network) | webhook (POST JSON) | netlify. */
  adapter?: "stub" | "webhook" | "netlify";
  endpoint?: string;
  method?: string;
  redirect?: string;
  hiddenFields?: Record<string, string>;
}

/**
 * A lead form's config, authored in a form-carrying section's `data.form`. The
 * `type` selects which form sub-component renders via the form registry
 * (src/lib/formRegistry.ts). Answers are held in local client state and
 * submitted as one payload at the end.
 *
 *   simple → single-step contact form (name/phone/email/service/message)
 *   quiz   → multi-step qualifying quiz driven by `steps`
 */
export interface FormConfig {
  type?: "simple" | "quiz";
  title?: string;
  description?: string;
  submitLabel?: string;
  submit?: FormSubmit;
  /** quiz only */
  steps?: QuizStep[];
  /** quiz only — outcome screen; heading/body support {{stepId}} tokens from answers */
  outcome?: {
    heading?: string;
    body?: string;
  };
}

/** Decorative background motif layered onto any section from the CMS. */
export interface MotifConfig {
  kind: "butterfly" | "butterfly-color" | "droplets" | "splash" | "glow" | "grid";
  position?: "left" | "right" | "center" | "top" | "bottom";
  color?: string;
  opacity?: number;
  size?: string;
  /** Override the source SVG (defaults per kind; butterfly-color auto-picks antennae by theme). */
  src?: string;
}

/**
 * One entry in a page's `sections` array — the render contract.
 * Shared by PageRenderer and SectionList.
 */
export interface SectionConfig {
  type: string;
  theme?: string;
  /** Optional CMS-set vertical padding override (density keys: none|xs|sm|md|lg|xl). */
  spacing?: { desktop?: string; mobile?: string };
  /** Optional decorative motif (watermark / texture / glow) behind this section. */
  motif?: MotifConfig;
  data?: Record<string, unknown>;
}
