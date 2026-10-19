import type { APIRoute } from "astro";
import { ZOLATO_API_KEY } from "astro:env/server";
import { CONSENT_TEXT } from "@/content/copy/consent";

/**
 * /api/lead — the single, CRM-agnostic capture endpoint for every lead magnet
 * (CTA opt-ins now; interactive calculators/estimators later). Any magnet POSTs
 * a normalized JSON payload here; this route validates lightly, normalizes it
 * into one lead shape, and hands it to `deliverLead()`.
 *
 * STATUS: log-only. `deliverLead()` currently just writes a structured line to
 * the Worker logs so we capture everything while the CRM is still being chosen.
 *
 * TODO(before launch): wire the real CRM. Target is likely Autopilot
 * (Zolato). Leads post to Zolato's lead-intake webhook; the email adapter is a
 * massage this normalized shape into what their API accepts — and split off any
 * data it can't hold (e.g. rich estimator answers, computed $ bands) into a
 * secondary store or a Zapier/Make hop. Keep the normalized shape below stable;
 * only the delivery adapter changes. See docs/lead-magnets.md.
 */

export const prerender = false;

interface NormalizedLead {
  receivedAt: string;
  source: string; // e.g. "magnet:seasonal-calendar"
  magnet: string | null; // magnet slug
  tags: string[]; // svc:*, area:*, prop:*, interest:*, temp:*, src:*
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  page?: string; // where the magnet was submitted from
  answers: Record<string, unknown>; // everything else the tool collected
}

const CONTACT_KEYS = ["name", "email", "phone", "address", "city"] as const;
/** Honeypot field names — kept out of `answers` so they never reach a notification. */
const HONEYPOT_KEYS = ["companyWebsite", "company_website"] as const;
const META_KEYS = new Set([
  "source",
  "magnet",
  "tags",
  "page",
  ...HONEYPOT_KEYS,
  ...CONTACT_KEYS,
]);

function toTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((t) => t.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

function normalize(body: Record<string, unknown>): NormalizedLead {
  const contact: NormalizedLead["contact"] = {};
  for (const k of CONTACT_KEYS) {
    const v = body[k];
    if (typeof v === "string" && v.trim()) contact[k] = v.trim();
  }
  const answers: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!META_KEYS.has(k)) answers[k] = v;
  }
  const magnet = typeof body.magnet === "string" && body.magnet ? body.magnet : null;
  const source =
    (typeof body.source === "string" && body.source) ||
    (magnet ? `magnet:${magnet}` : "magnet:unknown");

  const lead: NormalizedLead = {
    receivedAt: new Date().toISOString(),
    source,
    magnet,
    tags: toTags(body.tags),
    contact,
    page: typeof body.page === "string" ? body.page : undefined,
    answers,
  };
  // Derive tags the form can't send explicitly (property type, urgency, and
  // marketing attribution) from the answers — so every channel (esp. the SIA
  // quizzes, which only send src/svc/area) is consistently segmented.
  lead.tags = [...new Set([...lead.tags, ...deriveTags(lead)])];
  return lead;
}

/** Tags inferred from answers when not already present as explicit tags. */
function deriveTags(lead: NormalizedLead): string[] {
  const a = lead.answers;
  const out: string[] = [];
  const has = (ns: string) => lead.tags.some((t) => t.startsWith(ns + ":"));

  // Property type from a quiz answer (home/business) → prop: tag.
  if (!has("prop") && typeof a.propertyType === "string") {
    const p = a.propertyType.toLowerCase();
    if (/home|residential/.test(p)) out.push("prop:residential");
    else if (/business|commercial|manage/.test(p)) out.push("prop:commercial");
  }
  // Urgency/temperature from a quiz timing/timeline answer → temp: tag.
  if (!has("temp")) {
    const t = String(a.timing ?? a.timeline ?? "").toLowerCase();
    if (/asap|as soon|possible/.test(t)) out.push("temp:hot");
    else if (/week|calendar|soon|plan|quote|just/.test(t)) out.push("temp:warm");
  }
  // Marketing attribution from UTM params / click ids.
  const src = String(a.utm_source ?? "").toLowerCase();
  const med = String(a.utm_medium ?? "").toLowerCase();
  const paid = /cpc|ppc|paid|ads?/.test(med);
  if (a.gclid || (src.includes("google") && paid)) out.push("ad:google");
  if (a.fbclid || (/facebook|instagram|meta/.test(src) && paid)) out.push("ad:facebook");
  if (typeof a.utm_campaign === "string" && a.utm_campaign.trim()) {
    out.push("campaign:" + a.utm_campaign.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }
  return out;
}

/**
 * Deliver a captured lead to every configured destination.
 *
 * Returns true when at least one destination accepted it. The caller uses that
 * to decide what the visitor is told: this endpoint previously answered
 * `{ok:true}` even when every adapter had failed, so a visitor saw "thanks,
 * we'll be in touch" while the lead existed only in a log line.
 */
async function deliverLead(lead: NormalizedLead): Promise<boolean> {
  // Structured, greppable record — always, regardless of adapter config.
  console.info("[lead]", JSON.stringify(lead));

  let delivered = false;

  if (ZOLATO_API_KEY) {
    try {
      await deliverToZolato(lead, ZOLATO_API_KEY);
      console.info("[lead] zolato: delivered", lead.contact.email || lead.contact.phone || "");
      delivered = true;
    } catch (err) {
      console.error("[lead] zolato delivery failed:", (err as Error)?.message);
    }
  }

  if (await deliverByEmail(lead)) delivered = true;

  if (!delivered) console.error("[lead] NO DESTINATION ACCEPTED THIS LEAD — log only");
  return delivered;
}

// ---- Email adapter (Cloudflare Email Sending) --------------------------------
// Notifies the inquiries inbox on every lead. Reply-To is the lead's own address
// so a reply goes straight back to the customer rather than to the Worker.
//
// Reads the binding + addresses from the Worker env rather than astro:env because
// `send_email` is a binding (runtime-only) and the addresses live in wrangler
// `vars`, which astro:env's build-time `access: "public"` path can't see.
//
// Degrades to log-only when the binding or recipient is missing, so the site can
// ship before the sending domain is onboarded without dropping a 500 on a visitor.

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

function leadSubject(lead: NormalizedLead): string {
  const who = lead.contact.name || lead.contact.email || lead.contact.phone || "Unknown";
  const svc = lead.tags.find((t) => t.startsWith("svc:"))?.slice(4);
  const area = lead.tags.find((t) => t.startsWith("area:"))?.slice(5);
  const bits = [titleize(svc ?? ""), titleize(area ?? "")].filter(Boolean).join(" · ");
  return `New lead — ${who}${bits ? ` — ${bits}` : ""}`;
}

async function deliverByEmail(lead: NormalizedLead): Promise<boolean> {
  let EMAIL: { send: (m: Record<string, unknown>) => Promise<unknown> } | undefined;
  let to: string | undefined;
  let from: string | undefined;
  try {
    const { env } = (await import("cloudflare:workers")) as { env: Record<string, any> };
    EMAIL = env.EMAIL;
    to = env.LEAD_NOTIFY_TO;
    from = env.LEAD_NOTIFY_FROM;
  } catch {
    return false; // not running on workerd (e.g. a unit test) — the log line stands
  }
  if (!EMAIL || !to || !from) {
    console.warn("[lead] email adapter not configured (EMAIL binding / LEAD_NOTIFY_TO / LEAD_NOTIFY_FROM) — logged only");
    return false;
  }

  const notes = buildNotes(lead);
  const c = lead.contact;
  const contactRows = [
    ["Name", c.name],
    ["Phone", c.phone],
    ["Email", c.email],
    ["Address", c.address],
    ["City", c.city],
  ].filter(([, v]) => v);

  const text = [
    `${leadSubject(lead)}`,
    "",
    ...contactRows.map(([k, v]) => `${k}: ${v}`),
    "",
    notes,
    "",
    `Tags: ${lead.tags.join(", ") || "none"}`,
  ].join("\n");

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#0e2a3f">` +
    `<h2 style="margin:0 0 .5rem">${esc(leadSubject(lead))}</h2>` +
    `<table cellpadding="4" style="border-collapse:collapse;margin-bottom:1rem">` +
    contactRows
      .map(
        ([k, v]) =>
          `<tr><td style="color:#52646f">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`
      )
      .join("") +
    `</table>` +
    `<pre style="white-space:pre-wrap;font:inherit;background:#f4f7f8;padding:.75rem;border-radius:6px;margin:0">${esc(notes)}</pre>` +
    `<p style="color:#52646f;font-size:13px">Tags: ${esc(lead.tags.join(", ") || "none")}</p>` +
    `</div>`;

  try {
    await EMAIL.send({
      to,
      from: { email: from, name: "Monarch Pro Wash Website" },
      // Reply goes to the customer, not the Worker. Omitted when they only left a phone.
      ...(c.email ? { replyTo: c.email } : {}),
      subject: leadSubject(lead),
      text,
      html,
    });
    console.info("[lead] email: delivered to", to);
    return true;
  } catch (err) {
    // E_SENDER_DOMAIN_NOT_CONFIGURED here means the sending domain is not set
    // up in Cloudflare. Zolato is the primary destination, so this is a
    // secondary notification path rather than the thing leads depend on.
    console.error("[lead] email delivery failed:", (err as any)?.code, (err as Error)?.message);
    return false;
  }
}

// ---- Shared lead formatting --------------------------------------------------
// Used by both the Zolato payload and the email notification, so a lead reads
// the same wherever it lands.

const titleize = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function buildNotes(lead: NormalizedLead): string {
  const a = lead.answers;
  const svc = lead.tags.filter((t) => t.startsWith("svc:")).map((t) => titleize(t.slice(4)));
  const area = lead.tags.find((t) => t.startsWith("area:"))?.slice(5);
  const L: string[] = [`Website lead — ${lead.source}`, `Received: ${lead.receivedAt}`];
  if (lead.page) L.push(`Page: ${lead.page}`);
  if (svc.length) L.push(`Service(s): ${svc.join(", ")}`);
  else if (a.service) L.push(`Service: ${titleize(String(a.service))}`);
  if (area) L.push(`Area: ${titleize(area)}`);
  else if (a.city) L.push(`City: ${a.city}`);
  if (a.contactTime) L.push(`Best time to reach: ${a.contactTime}`);
  if (a.timeline) L.push(`Timeline: ${a.timeline}`);
  if (a.estimateLow != null && a.estimateHigh != null) L.push(`Estimate: $${a.estimateLow}–$${a.estimateHigh}`);
  if (a.propertyType) L.push(`Property type: ${a.propertyType}`);
  if (a.homeSqft) L.push(`Home size: ~${a.homeSqft} sq ft`);
  if (a.stories) L.push(`Stories: ${a.stories}`);
  if (a.solarPanels) L.push(`Solar panels: ${a.solarPanels}`);
  if (lead.contact.address) L.push(`Address given: ${lead.contact.address}`);
  if (a.notes) L.push(`Notes: ${a.notes}`);
  const shown = new Set(["service", "city", "contactTime", "timeline", "estimateLow", "estimateHigh", "propertyType", "homeSqft", "stories", "solarPanels", "notes", "services", "otherRequest"]);
  const extra = Object.entries(a).filter(([k, v]) => !shown.has(k) && v != null && v !== "");
  if (extra.length) L.push("Answers: " + extra.map(([k, v]) => `${titleize(k)}=${v}`).join("; "));
  return L.join("\n");
}

// ---- Zolato CRM adapter ------------------------------------------------------
// POST https://zolato.ai/api/public/v1/leads with a Bearer key. Chosen over the
// Settings → Lead Intake webhook because that endpoint answers 200 to anything,
// including an empty body, so a broken payload looks like a success. This one
// validates and names the offending field.
//
// Accepted top level (confirmed by probing the endpoint's validation errors):
//   name, phone, email, address, service, message, source, consent, custom_fields
// Anything else is rejected with 422, so all our routing detail goes into
// custom_fields rather than being silently dropped.
//
// CONSENT. Zolato requires `consent.text` whenever sms or email consent is
// true: "the exact wording the person agreed to". Every form now renders the
// disclosure from src/content/copy/consent.ts next to its submit control, and
// this adapter transmits that same constant. The two must stay identical, which
// is why neither keeps its own copy of the string. Never assert consent from a
// form that does not display it.
//
// The key is a credential: set it with `wrangler secret put ZOLATO_API_KEY`,
// never in wrangler.jsonc `vars`, which is committed.
// Limits: 60 requests/minute, 1,000/day.

const ZOLATO_LEADS_URL = "https://zolato.ai/api/public/v1/leads";

async function deliverToZolato(lead: NormalizedLead, key: string): Promise<void> {
  const c = lead.contact;
  const a = lead.answers;
  const svc = lead.tags.find((t) => t.startsWith("svc:"))?.slice(4);
  const area = lead.tags.find((t) => t.startsWith("area:"))?.slice(5);

  // Zolato writes its own note on the lead and already prints "Received via
  // Website", "Service requested" and "Address" at the top of it, then our
  // `message` as the body, then `custom_fields` beneath an "Additional details"
  // heading. So `message` carries only what the visitor actually wrote, and the
  // structured extras go in custom_fields with human-readable labels rather
  // than snake_case keys, because those keys are shown verbatim.
  const custom: Record<string, string> = {};
  const put = (label: string, v: unknown) => {
    if (v === undefined || v === null || v === "") return;
    custom[label] = String(v);
  };
  put("Service area", area ? titleize(area) : a.city);
  put("Best time to reach", a.contactTime);
  put("Timeline", a.timeline);
  put("Property type", a.propertyType);
  put("Home size", a.homeSqft ? `~${a.homeSqft} sq ft` : undefined);
  put("Stories", a.stories);
  put("Solar panels", a.solarPanels);
  if (a.estimateLow != null && a.estimateHigh != null) {
    put("Estimate range", `$${a.estimateLow}-$${a.estimateHigh}`);
  }
  put("Submitted from", lead.page);
  put("Lead source", lead.source);

  // Remaining quiz answers, so a service-specific questionnaire is not lost.
  const known = new Set([
    "city", "contactTime", "timeline", "propertyType", "homeSqft", "stories",
    "solarPanels", "estimateLow", "estimateHigh", "service", "notes", "message",
  ]);
  for (const [k, v] of Object.entries(a)) if (!known.has(k)) put(titleize(k), v);

  const visitorMessage = [a.message, a.notes].filter(Boolean).join("\n\n");

  const payload: Record<string, unknown> = {
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: [c.address, c.city].filter(Boolean).join(", ") || undefined,
    service: svc ? titleize(svc) : a.service ? titleize(String(a.service)) : undefined,
    message: visitorMessage || undefined,
    source: "Website",
  };

  // Consent is collected by the disclosure shown next to every form's submit
  // control. CONSENT_TEXT is the exact string the visitor saw, which is what
  // Zolato asks for; it is imported rather than retyped so the record cannot
  // drift from what was displayed. Email consent is only asserted when we
  // actually have an address to send to, which the API enforces anyway.
  payload.consent = {
    sms: Boolean(c.phone),
    email: Boolean(c.email),
    text: CONSENT_TEXT,
  };

  for (const k of Object.keys(payload)) if (payload[k] === undefined || payload[k] === "") delete payload[k];
  if (Object.keys(custom).length) payload.custom_fields = custom;

  const r = await fetch(ZOLATO_LEADS_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await r.text().catch(() => "");
  if (!r.ok) throw new Error(`zolato ${r.status} ${body.slice(0, 300)}`);

  // 201 with status "needs_review" means it could not identify a lead from the
  // payload. Treat that as a failure so it surfaces rather than looking fine.
  let parsed: any = null;
  try { parsed = JSON.parse(body); } catch { /* non-JSON 2xx */ }
  if (parsed?.status && parsed.status !== "created") {
    throw new Error(`zolato accepted but returned status="${parsed.status}" (id ${parsed.id ?? "?"})`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: a filled hidden field means a bot. Accept silently so it moves on.
  // Both spellings: the forms render `company_website`, while older/external
  // callers post `companyWebsite`. Checking only one left the server-side trap
  // dead for anything POSTing straight here.
  if (HONEYPOT_KEYS.some((k) => typeof body[k] === "string" && (body[k] as string).trim())) {
    return json({ ok: true });
  }

  const lead = normalize(body);

  // Minimal validity: need at least one way to reach them.
  if (!lead.contact.email && !lead.contact.phone) {
    return json({ ok: false, error: "missing_contact" }, 422);
  }

  try {
    const delivered = await deliverLead(lead);
    if (!delivered) return json({ ok: false, error: "delivery_failed" }, 502);
  } catch (err) {
    console.error("[lead] delivery failed:", (err as Error)?.message);
    // Still 200 so the visitor sees success; the log above preserves the lead.
  }

  return json({ ok: true });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
