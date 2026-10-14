import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

/**
 * Central image resolver for JSON-driven content.
 *
 * Pages are composed from JSON, so image paths arrive as runtime STRINGS —
 * but Astro's <Image> optimizer needs a statically-imported ImageMetadata.
 * We bridge that here: every asset under src/assets is eagerly imported into
 * a path -> metadata map, so a JSON string like "/src/assets/images/x.jpg"
 * resolves to the real import and gets optimized. Public and remote URLs pass
 * through untouched.
 *
 * Accepted src forms:
 *   "/src/assets/images/x.jpg"  -> optimized (local asset)
 *   "@/assets/images/x.jpg"     -> optimized (alias, normalized to /src/…)
 *   "src/assets/images/x.jpg"   -> optimized (leading slash added)
 *   "x.jpg"                     -> optimized (assumed under assets/images)
 *   "/images/x.jpg"             -> passthrough (public/ asset)
 *   "https://…" / "data:…"       -> passthrough (remote)
 */

const assets = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/**/*.{jpeg,jpg,png,gif,webp,avif,svg}",
  { eager: true },
);

/**
 * EmDash serves CMS media from R2 at this path. Images under it are NOT inert
 * public files: `@emdash-cms/cloudflare/image-endpoint` reads the bytes straight
 * from the R2 binding and resizes them with the Cloudflare IMAGES binding, so
 * they can be optimized exactly like a bundled asset.
 */
export const EMDASH_MEDIA_PREFIX = "/_emdash/api/media/file/";

/** Is this an EmDash CMS media URL (relative or absolute)? */
export function isEmdashMedia(src?: string): boolean {
  if (!src) return false;
  try {
    return new URL(src, "http://localhost").pathname.startsWith(EMDASH_MEDIA_PREFIX);
  } catch {
    return false;
  }
}

/**
 * Absolutize an EmDash media URL against the site origin.
 *
 * Astro only optimizes a remote image when `isRemoteAllowed()` passes, and that
 * starts with `URL.canParse(src)` — a site-relative path fails immediately and
 * is handed back untouched. EmDash registers a remote pattern for
 * `{site}/_emdash/api/media/file/**`, so the absolute form is what makes the
 * optimizer engage. Returns the input unchanged when there's no site origin.
 *
 * Defaults to `import.meta.env.SITE` (the `site` from astro.config) so callers
 * don't have to thread `Astro.site` through every component that renders an image.
 */
export function toOptimizableMediaUrl(src: string, site?: URL | string): string {
  const origin = site ?? import.meta.env.SITE;
  if (!origin) return src;
  try {
    return new URL(src, origin).href;
  } catch {
    return src;
  }
}

function normalize(src: string): string {
  if (src.startsWith("@/")) return src.replace(/^@\//, "/src/");
  if (src.startsWith("src/")) return "/" + src;
  return src;
}

export type ResolvedImage = ImageMetadata | string | undefined;

/**
 * Resolve a JSON src to ImageMetadata (local, optimizable) or a passthrough
 * URL string (public/remote). Returns undefined when a local asset path is
 * referenced but the file is missing — callers can then fall back.
 */
export function resolveImage(src?: string): ResolvedImage {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src) || src.startsWith("data:")) return src;
  const key = normalize(src);
  if (key.startsWith("/src/")) return assets[key]?.default;
  if (key.startsWith("/")) return src; // public/ asset — passthrough as authored
  return assets[`/src/assets/images/${key}`]?.default;
}

/** Type guard: a resolved image that can go through <Image>. */
export function isLocal(img: ResolvedImage): img is ImageMetadata {
  return !!img && typeof img !== "string";
}

/**
 * Produce an optimized URL for CSS `background-image`. Local assets are run
 * through getImage(); public/remote URLs are returned as-is. Returns undefined
 * when nothing resolves so callers can skip the background entirely.
 */
export async function getBackgroundImage(
  src: string | undefined,
  opts: { width?: number; format?: "webp" | "avif" | "jpeg"; site?: URL | string } = {},
): Promise<string | undefined> {
  const resolved = resolveImage(src);
  if (!resolved) return undefined;

  if (typeof resolved === "string") {
    // CMS media can be optimized (EmDash resizes it from R2); other remote and
    // public/ URLs genuinely can't be, so they pass through as-is.
    if (!isEmdashMedia(resolved)) return resolved;
    try {
      const img = await getImage({
        src: toOptimizableMediaUrl(resolved, opts.site),
        width: opts.width ?? 1920,
        format: opts.format ?? "webp",
        // Dimensions aren't carried in section data, and a hero is too large to
        // ship unresized; inferSize lets the optimizer read them from the bytes.
        inferSize: true,
      });
      return img.src;
    } catch {
      // Never let an un-optimizable image blank out a hero background.
      return resolved;
    }
  }

  const img = await getImage({
    src: resolved,
    width: opts.width ?? 1920,
    format: opts.format ?? "webp",
  });
  return img.src;
}

/**
 * Named focal points → CSS `background-position` values. A 3×3 grid so an
 * editor can keep the image's subject in frame when `cover` crops it. Values
 * are consumed by the shared `.hero-bg` rules in global.css via
 * `--hero-position` (desktop) and `--hero-position-mobile`.
 */
export const FOCAL_POSITION = {
  center: "center",
  left: "left center",
  right: "right center",
  top: "center top",
  bottom: "center bottom",
  "top-left": "left top",
  "top-right": "right top",
  "bottom-left": "left bottom",
  "bottom-right": "right bottom",
} as const;

export type FocalPoint = keyof typeof FOCAL_POSITION;

export interface HeroBackground {
  src?: string;
  /** Scrim darkness 0–100 (authored as number or numeric string). */
  overlayOpacity?: number | string;
  /** Crop focal point (default `center`). */
  focal?: string;
  /** Optional mobile-only focal override; falls back to `focal` when unset. */
  focalMobile?: string;
}

function focalToPosition(f?: string): string {
  return (f && FOCAL_POSITION[f as FocalPoint]) || FOCAL_POSITION.center;
}

/**
 * Resolve a hero's optional background image into the inline CSS custom
 * properties the shared `.hero-bg` rules read: the optimized image URL, the
 * scrim opacity, and the crop focal point (desktop + optional mobile override).
 * Returns `null` when no image resolves, so callers skip `has-bg` and the style
 * attribute entirely.
 */
export async function getHeroBg(
  bg?: HeroBackground,
): Promise<{ style: string } | null> {
  const url = await getBackgroundImage(bg?.src, { width: 2200 });
  if (!url) return null;
  const overlay = (Number(bg?.overlayOpacity ?? 60) || 0) / 100;
  const pos = focalToPosition(bg?.focal);
  const posMobile = bg?.focalMobile ? focalToPosition(bg.focalMobile) : pos;
  return {
    style: `--hero-image: url('${url}'); --hero-overlay: ${overlay}; --hero-position: ${pos}; --hero-position-mobile: ${posMobile}`,
  };
}
