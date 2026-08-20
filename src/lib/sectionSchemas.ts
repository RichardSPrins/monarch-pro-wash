import { z } from "astro/zod";

/**
 * Central section validation registry.
 *
 * Each entry validates a section's `data` for a given `type`. Schemas are
 * intentionally LOOSE (`.passthrough()` — extra fields allowed) and only assert
 * the genuinely-required data, so valid content never false-fails; the goal is
 * to catch *broken* sections (missing required data, wrong type/theme), not to
 * be pedantic. Types without an entry pass by default — add schemas as needed.
 *
 * This validates required section data at render time. Content is stored/edited
 * in EmDash (D1); `sections` is a `json` field holding the {type,theme,data} array.
 */

const themeEnum = z.enum([
  "default",
  "alt",
  "muted",
  "inverse",
  "primary",
  "brand-secondary",
]);

// ── compact builders ────────────────────────────────────────────────────────
/** data must have at least one of `fields` set (non-empty). */
const requireAny = (fields: string[], msg?: string) =>
  z
    .object({})
    .passthrough()
    .refine(
      (d: Record<string, unknown>) =>
        fields.some((f) => d?.[f] != null && d[f] !== ""),
      { message: msg ?? `requires one of: ${fields.join(", ")}` },
    );

/** data[field] must be a non-empty array. */
const requireArray = (field: string) =>
  z
    .object({})
    .passthrough()
    .refine(
      (d: Record<string, unknown>) =>
        Array.isArray(d?.[field]) && (d[field] as unknown[]).length > 0,
      { message: `\`${field}\` must be a non-empty array` },
    );

const heroHeading = requireAny(
  ["heading", "headline"],
  "a hero needs `heading` (or `headline`)",
);

// ── per-type schemas (required-data cases) ───────────────────────────────────
const schemas: Record<string, z.ZodTypeAny> = {
  // Heroes — need a heading
  "hero:split-form": heroHeading,
  "hero:stacked-form": heroHeading,
  "hero:image-overlay": heroHeading,
  "hero:full": heroHeading,
  "hero:minimal": heroHeading,
  "hero:gradient": heroHeading,
  "hero:stats": heroHeading,
  "hero:split-image": heroHeading,
  "hero:centered-card": heroHeading,
  "hero:video": heroHeading,
  "hero:rating-spotlight": heroHeading,
  "hero:split-panel": heroHeading,
  "hero:spotlight": heroHeading,
  "hero:form-overlay": heroHeading,
  "hero:showcase": heroHeading,
  "hero:split-video": heroHeading,

  // Galleries — need images/pairs
  "gallery:grid": requireArray("images"),
  "gallery:masonry": requireArray("images"),
  "gallery:carousel": requireArray("images"),
  "gallery:featured": requireArray("images"),
  "gallery:filterable": requireArray("images"),
  "gallery:instagram": requireArray("images"),
  "gallery:before-after": requireArray("pairs"),
  "gallery:before-after-grid": requireArray("pairs"),

  // Process — need steps
  "process:numbered": requireArray("steps"),
  "process:horizontal": requireArray("steps"),
  "process:vertical": requireArray("steps"),
  "process:cards": requireArray("steps"),
  "process:timeline": requireArray("steps"),
  "process:icon-row": requireArray("steps"),

  // Pricing
  "pricing:tiers": requireArray("plans"),
  "pricing:packages": requireArray("plans"),
  "pricing:table": requireArray("plans"),
  "pricing:estimate": requireArray("rows"),
  "pricing:addons": requireArray("rows"),
  "pricing:cards": requireArray("items"),
  "pricing:single": requireAny(["name", "price", "inclusions"]),

  // Team — need members
  "team:grid": requireArray("members"),
  "team:list": requireArray("members"),
  "team:cards-detailed": requireArray("members"),
  "team:carousel": requireArray("members"),
  "team:featured": requireArray("members"),
  "team:compact": requireArray("members"),

  // Stats / trust / features / benefits — need their item arrays
  "stats:counters": requireArray("stats"),
  "stats:cards": requireArray("stats"),
  "stats:split": requireArray("stats"),
  "trust-bar:stats": requireArray("stats"),
  "trust-bar:logos": requireArray("logos"),
  "trust-bar:ratings": requireArray("sources"),
  "trust-bar:inline": requireArray("items"),
  "trust-bar:marquee": requireAny(["logos", "items"]),
  "certifications:grid": requireArray("items"),
  "guarantee:badges": requireArray("items"),
  "benefits:tabs": requireArray("tabs"),
  "benefits:grid": requireArray("items"),
  "benefits:icon-list": requireArray("items"),
  "feature:list": requireArray("items"),
  "feature:centered-icons": requireArray("items"),
  "feature:cards": requireArray("items"),
  "feature:checklist": requireArray("items"),
  "feature:alternating": requireArray("rows"),
  "feature:highlight": requireAny(["heading", "body"]),

  // About / content / reviews / comparison
  "about:values": requireArray("items"),
  "about:timeline": requireArray("items"),
  "about:mission": requireAny(["heading", "quote"]),
  "about:owner-video": requireAny(["video", "heading"]),
  "comparison:us-vs-them": requireArray("rows"),
  "content:rich-text": requireAny(["body", "heading"]),
  "content:two-column": requireAny(["bodyLeft", "bodyRight", "heading"]),
  "content:image-text": requireAny(["body", "heading"]),
  "content:quote": requireAny(["quote"]),
  "content:cards": requireArray("items"),
  "content:callout": requireAny(["heading", "body"]),
  "reviews:featured": requireAny(["author", "body"]),
  "reviews:video": requireAny(["video"]),
  "reviews:video-duo": requireArray("videos"),

  // Banners / sticky
  "banner:announcement": requireAny(["text"]),
};

export interface SectionValidation {
  ok: boolean;
  errors: string[];
}

/** Validate a section's `data` against its type's schema (pass if none). */
export function validateSectionData(
  type: string,
  data: unknown,
): SectionValidation {
  const schema = schemas[type];
  if (!schema) return { ok: true, errors: [] };
  const res = schema.safeParse(data ?? {});
  if (res.success) return { ok: true, errors: [] };
  return {
    ok: false,
    errors: res.error.issues.map(
      (i) => `${i.path.join(".") || "data"}: ${i.message}`,
    ),
  };
}

export function isValidTheme(theme: unknown): boolean {
  return theme === undefined || themeEnum.safeParse(theme).success;
}
