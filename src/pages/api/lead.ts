import type { APIRoute } from "astro";
import { AUTOPILOT_API_KEY, AUTOPILOT_WEBSITE_SOURCE_ID } from "astro:env/server";

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
 * (autopilotapp.io). Autopilot's API/automations are limited, so we will need to
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
const META_KEYS = new Set([
  "source",
  "magnet",
  "tags",
  "page",
  "companyWebsite", // honeypot
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
 * Deliver a captured lead. Always writes a durable log line; if Autopilot is
 * configured (AUTOPILOT_API_KEY set), also creates/updates a lead in the CRM.
 * CRM failures never fail the request — the log preserves the lead.
 */
async function deliverLead(lead: NormalizedLead): Promise<void> {
  // Structured, greppable record — always, regardless of CRM config.
  console.info("[lead]", JSON.stringify(lead));
  if (!AUTOPILOT_API_KEY) return; // log-only until the key is set
  try {
    await deliverToAutopilot(lead, AUTOPILOT_API_KEY);
    console.info("[lead] autopilot: delivered", lead.contact.email || lead.contact.phone || "");
  } catch (err) {
    console.error("[lead] autopilot delivery failed:", (err as Error)?.message);
  }
}

// ---- Autopilot (autopilotapp.io) adapter ------------------------------------
// A website lead maps to a `client` with client_or_lead:"lead". Contact fields
// are typed; everything else (service, area, timeline, estimate, quiz answers)
// goes into client_notes since Autopilot has no custom-field API. Our namespaced
// tags map to readable Autopilot tag names (resolve-or-create, since tags are
// UUID-referenced). Dedupe by email then phone → PATCH+merge instead of dupe.

const AP_BASE = "https://app.autopilotapp.io/api";

async function apFetch(key: string, path: string, init?: RequestInit): Promise<any> {
  const r = await fetch(`${AP_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  let body: any = null;
  try { body = await r.json(); } catch { /* 204 No Content */ }
  if (!r.ok) throw new Error(`autopilot ${init?.method || "GET"} ${path} -> ${r.status} ${body?.error?.message ?? ""}`);
  return body;
}

const titleize = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Map our namespaced tag strings (svc:/area:/temp:…) to readable Autopilot names. */
function friendlyTagNames(lead: NormalizedLead): string[] {
  const names = new Set<string>(["Website Lead"]);
  for (const t of lead.tags) {
    const [ns, ...rest] = t.split(":");
    const val = rest.join(":");
    if (!val) { names.add(t); continue; }
    switch (ns) {
      case "src": names.add(`Source: ${val === "sia-quiz" ? "Website Quiz" : titleize(val)}`); break;
      case "svc": names.add(`Service: ${titleize(val)}`); break;
      case "area": names.add(`Area: ${titleize(val)}`); break;
      case "interest": names.add(`Interest: ${titleize(val)}`); break;
      case "prop": names.add(`Property: ${titleize(val)}`); break;
      case "temp": names.add(val === "hot" ? "Hot Lead" : val === "warm" ? "Warm Lead" : "Cold Lead"); break;
      case "flag": names.add(val === "high-value" ? "High Value" : val === "multi-service" ? "Multi-Service" : titleize(val)); break;
      case "ad": names.add(val === "google" ? "Google Ads" : val === "facebook" ? "Facebook Ads" : `${titleize(val)} Ads`); break;
      case "campaign": names.add(`Campaign: ${titleize(val)}`); break;
      default: names.add(titleize(t));
    }
  }
  return [...names];
}

// Tag vocabulary cache (per worker instance) so we don't GET it on every lead.
let apTagCache: Map<string, string> | null = null;
async function resolveTagIds(key: string, wanted: string[]): Promise<string[]> {
  if (!apTagCache) {
    apTagCache = new Map();
    const res = await apFetch(key, "/v1/client-tags");
    for (const t of res?.data ?? []) apTagCache.set(String(t.name).toLowerCase(), t.id);
  }
  const ids: string[] = [];
  for (const name of wanted) {
    const k = name.toLowerCase();
    let id = apTagCache.get(k);
    if (!id) {
      const created = await apFetch(key, "/v1/client-tags", { method: "POST", body: JSON.stringify({ name }) });
      id = created?.id;
      if (id) apTagCache.set(k, id);
    }
    if (id) ids.push(id);
  }
  return ids;
}

async function findClient(key: string, email?: string, phone?: string): Promise<any | null> {
  if (email) {
    const r = await apFetch(key, `/v1/clients?email=${encodeURIComponent(email)}&limit=1`);
    if (r?.data?.[0]) return r.data[0];
  }
  if (phone) {
    const r = await apFetch(key, `/v1/clients?phone=${encodeURIComponent(phone)}&limit=1`);
    if (r?.data?.[0]) return r.data[0];
  }
  return null;
}

/** Fold everything untyped into one readable note block. */
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

function splitName(name?: string): { first: string | null; last: string | null } {
  if (!name) return { first: null, last: null };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: null };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

async function deliverToAutopilot(lead: NormalizedLead, key: string): Promise<void> {
  const { first, last } = splitName(lead.contact.name);
  const notes = buildNotes(lead);
  const tagIds = await resolveTagIds(key, friendlyTagNames(lead));

  const existing = await findClient(key, lead.contact.email, lead.contact.phone);
  if (existing) {
    const merged = [existing.client_notes, notes].filter(Boolean).join("\n\n— — —\n\n");
    await apFetch(key, `/v1/clients/${existing.id}`, { method: "PATCH", body: JSON.stringify({ client_notes: merged }) });
    const existingTagIds: string[] = (existing.tags ?? []).map((t: any) => t.id);
    const tagSet = [...new Set([...existingTagIds, ...tagIds])];
    await apFetch(key, `/v1/clients/${existing.id}/tags`, { method: "PUT", body: JSON.stringify({ tag_ids: tagSet }) });
    return;
  }

  await apFetch(key, "/v1/clients", {
    method: "POST",
    body: JSON.stringify({
      first_name: first,
      last_name: last,
      email: lead.contact.email ?? null,
      primary_phone_number: lead.contact.phone ?? null,
      client_notes: notes,
      client_or_lead: "lead",
      // Native "Website" lead source if configured; the "Website Lead" tag covers it either way.
      ...(AUTOPILOT_WEBSITE_SOURCE_ID ? { source_id: AUTOPILOT_WEBSITE_SOURCE_ID } : {}),
      // No explicit SMS opt-in captured on the site yet — stay off marketing SMS.
      is_do_not_marketing_sms: true,
      tag_ids: tagIds,
    }),
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: a filled hidden field means a bot. Accept silently so it moves on.
  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return json({ ok: true });
  }

  const lead = normalize(body);

  // Minimal validity: need at least one way to reach them.
  if (!lead.contact.email && !lead.contact.phone) {
    return json({ ok: false, error: "missing_contact" }, 422);
  }

  try {
    await deliverLead(lead);
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
