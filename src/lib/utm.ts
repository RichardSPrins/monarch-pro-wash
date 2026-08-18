/**
 * First-touch marketing attribution. `captureUtms()` runs site-wide on page load
 * and persists any utm_* / click-id params to a first-party cookie (first touch
 * wins, so navigation doesn't lose them). `getUtms()` reads them back so every
 * form submission (via submitForm) can attach attribution, which /api/lead turns
 * into `Google Ads` / `Facebook Ads` / `Campaign: …` tags.
 */
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;
const COOKIE = "mpw_attr";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? m[1] : null;
}

/** Persist first-touch attribution if the landing URL carries any of the keys. */
export function captureUtms(): void {
  if (typeof window === "undefined") return;
  if (readCookie(COOKIE)) return; // first touch already stored — don't overwrite
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) found[k] = v;
  }
  if (!Object.keys(found).length) return;
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(found))};path=/;max-age=${MAX_AGE};samesite=lax`;
}

/** Read stored attribution for merging into a lead payload. */
export function getUtms(): Record<string, string> {
  const raw = readCookie(COOKIE);
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return {};
  }
}
