/**
 * submitForm — one client-side submission path for every form (contact,
 * newsletter, quiz). Adapter-based and CRM-agnostic:
 *
 *   stub    → no network. Logs the payload + dispatches `form:submit`. The
 *             default, so forms work out of the box before any CRM is wired.
 *   webhook → POST JSON to `endpoint` (GHL inbound webhook, Zapier, Make, your
 *             own API, …). This is the "any CRM / any endpoint" path.
 *   netlify → POST url-encoded to `endpoint` (or the page) for Netlify Forms.
 *
 * Every submission also dispatches a `form:submit` CustomEvent so pixels, GTM,
 * or bespoke integrations can hook in regardless of adapter.
 *
 * Config is resolved server-side per form (site default merged with the form's
 * own `submit` block) and handed to this function by the form's inline script.
 */
export interface FormSubmitConfig {
  adapter?: "stub" | "webhook" | "netlify" | string;
  endpoint?: string;
  method?: string;
  /** Redirect here on success (thank-you page). */
  redirect?: string;
  /** Static fields merged into every payload (source, tags, location id, …). */
  hiddenFields?: Record<string, string>;
  /** Identifies the form in the event detail + as the Netlify form-name. */
  formName?: string;
}

export interface SubmitResult {
  ok: boolean;
  status?: number;
  error?: unknown;
}

export async function submitForm(
  payload: Record<string, unknown>,
  config: FormSubmitConfig = {},
  target?: EventTarget | null,
): Promise<SubmitResult> {
  // Attach first-touch marketing attribution (utm_*/gclid/fbclid) to every
  // submission so /api/lead can derive campaign tags. Payload/hiddenFields win.
  const { getUtms } = await import("@/lib/utm");
  const data = { ...getUtms(), ...payload, ...(config.hiddenFields || {}) };

  // Always dispatch — lets GTM/pixels/custom code react to any submission.
  (target ?? document).dispatchEvent(
    new CustomEvent("form:submit", {
      detail: { data, form: config.formName },
      bubbles: true,
    }),
  );

  // Default to webhook when an endpoint is present but no adapter named.
  const adapter = config.adapter || (config.endpoint ? "webhook" : "stub");

  try {
    if (adapter === "stub" || (!config.endpoint && adapter !== "netlify")) {
      // No destination configured — succeed locally so the UI still confirms.
      console.info("[form] stub adapter (no endpoint set) — payload:", data);
      return { ok: true };
    }

    if (adapter === "netlify") {
      const body = new URLSearchParams();
      if (config.formName) body.append("form-name", config.formName);
      for (const [k, v] of Object.entries(data)) body.append(k, String(v ?? ""));
      const res = await fetch(config.endpoint || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      return { ok: res.ok, status: res.status };
    }

    // webhook (default): raw JSON to any CRM / automation endpoint.
    const res = await fetch(config.endpoint as string, {
      method: config.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    console.error("[form] submission failed:", error);
    return { ok: false, error };
  }
}
