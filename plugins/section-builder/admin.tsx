// section-builder — admin field-widget (React). Bound to `pages.sections` via
// `widget: "section-builder:pageBuilder"`. A visual page-builder over the json
// array of {type, theme, data}.
//
// Forms are DATA-DRIVEN (inferred from the actual values) so they always bind to
// real content — the recovered Decap field manifest had drifted field names
// (headline vs heading, cta vs ctas). New sections initialise from real per-type
// example templates (extracted from the demo pages → correct field names). The
// manifest is used only for the accurate human labels in the add picker.
//
// Widget props (from the admin runtime): { value, onChange }
import * as React from "react";
import { useMemo, useState } from "react";
import { sectionFields } from "./schema/sectionFields.mjs";
import templates from "./schema/templates.json";

type Section = { type: string; theme?: string; spacing?: { desktop?: string; mobile?: string }; data?: Record<string, unknown> };

const LABELS = sectionFields as Record<string, { label: string }>;
const TEMPLATES = templates as Record<string, Record<string, unknown>>;
const THEMES = ["default", "alt", "muted", "inverse", "primary", "brand-secondary"];
// Vertical-padding density options ("" = use the section's built-in default).
const PADS = ["", "none", "xs", "sm", "md", "lg", "xl"];

// Focal-point choices for background images (mirror FOCAL_POSITION in
// src/lib/images.ts). Rendered as dropdowns wherever a field is named `focal`
// or `focalMobile`. focalMobile's blank option = "inherit the desktop focal".
const FOCAL = ["center", "left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"];
const focalLabel = (v: string) => v.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const ENUM_FIELDS: Record<string, { value: string; label: string }[]> = {
  focal: FOCAL.map((v) => ({ value: v, label: focalLabel(v) })),
  focalMobile: [{ value: "", label: "Same as desktop" }, ...FOCAL.map((v) => ({ value: v, label: focalLabel(v) }))],
};

// Hero types whose background renders through the shared `.hero-bg` mechanism
// (src/lib/images.ts getHeroBg + global.css), so they honor the focal point.
// Only these surface the focal controls; other heroes still take a bg image.
const FOCAL_TYPES = new Set([
  "hero:angled", "hero:badge-row", "hero:gradient", "hero:minimal", "hero:overlay-card",
  "hero:split-checklist", "hero:split-content", "hero:split-image", "hero:split-stats", "hero:stacked-form",
]);

const CATALOG: Record<string, { type: string; label: string }[]> = (() => {
  const out: Record<string, { type: string; label: string }[]> = {};
  for (const type of Object.keys(TEMPLATES)) {
    const group = type.split(":")[0];
    (out[group] ??= []).push({ type, label: LABELS[type]?.label ?? type });
  }
  return out;
})();

const titleCase = (s: string) => s.replace(/([A-Z])/g, " $1").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

/** Blank a template's values (keep shape/keys) so a new section starts empty. */
function blank(v: unknown): unknown {
  if (typeof v === "string") return "";
  if (typeof v === "number" || typeof v === "boolean") return v; // keep sensible defaults
  if (Array.isArray(v)) return v.length ? [blank(v[0])] : [];
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) o[k] = blank(val);
    return o;
  }
  return v;
}

// ── styles ───────────────────────────────────────────────────────────────────
const S = {
  wrap: { display: "flex", flexDirection: "column", gap: 8 } as React.CSSProperties,
  card: { border: "1px solid var(--border, #d4d4d8)", borderRadius: 8, background: "var(--card, #fff)" } as React.CSSProperties,
  row: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" } as React.CSSProperties,
  btn: { fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border, #d4d4d8)", background: "var(--card, #fff)", cursor: "pointer" } as React.CSSProperties,
  ghost: { fontSize: 12, padding: "2px 6px", border: "none", background: "transparent", cursor: "pointer", opacity: 0.7 } as React.CSSProperties,
  body: { padding: "10px 12px", borderTop: "1px solid var(--border, #eee)", display: "flex", flexDirection: "column", gap: 10 } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 600, display: "block", marginBottom: 3 } as React.CSSProperties,
  input: { width: "100%", fontSize: 13, padding: "5px 7px", borderRadius: 6, border: "1px solid var(--border, #d4d4d8)", background: "var(--bg, #fff)", boxSizing: "border-box" } as React.CSSProperties,
  nested: { border: "1px solid var(--border, #eee)", borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 8 } as React.CSSProperties,
  tag: { fontSize: 11, opacity: 0.6 } as React.CSSProperties,
};

// ── data-driven field renderer (recursive; infers input from the value) ──────
function DataField({ name, value, onChange, focalOk }: { name: string; value: unknown; onChange: (v: unknown) => void; focalOk?: boolean }) {
  const label = titleCase(name);

  const enumOpts = ENUM_FIELDS[name];
  if (enumOpts) {
    return (
      <label><span style={S.label}>{label}</span>
        <select style={S.input} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {enumOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <label><span style={S.label}>{label}</span>
        <input style={S.input} type="number" value={value} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
      </label>
    );
  }
  if (typeof value === "string" || value == null) {
    const long = typeof value === "string" && (value.length > 60 || value.includes("\n"));
    return (
      <label><span style={S.label}>{label}</span>
        {long
          ? <textarea style={S.input} rows={3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          : <input style={S.input} type="text" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />}
      </label>
    );
  }
  if (Array.isArray(value)) {
    const allStrings = value.every((v) => typeof v === "string");
    if (allStrings) return <StringList label={label} value={value as string[]} onChange={onChange} />;
    return <ListField label={label} value={value as Record<string, unknown>[]} onChange={onChange} />;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // A background image always exposes its focal controls, even on content
    // saved before the fields existed (the data-driven form otherwise only
    // renders keys already present). Existing values win over the defaults.
    const entries =
      name === "backgroundImage" && focalOk
        ? { ...obj, focal: obj.focal ?? "center", focalMobile: obj.focalMobile ?? "" }
        : obj;
    return (
      <div><span style={S.label}>{label}</span>
        <div style={S.nested}>
          {Object.entries(entries).map(([k, v]) => (
            <DataField key={k} name={k} value={v} focalOk={focalOk} onChange={(nv) => onChange({ ...obj, [k]: nv })} />
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function StringList({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div><span style={S.label}>{label}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {value.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 4 }}>
            <input style={S.input} value={item} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
            <button type="button" style={S.ghost} onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" style={S.btn} onClick={() => onChange([...value, ""])}>+ Add</button>
      </div>
    </div>
  );
}

function ListField({ label, value, onChange }: { label: string; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void }) {
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const addItem = () => onChange([...value, (blank(value[0] ?? {}) as Record<string, unknown>)]);
  return (
    <div><span style={S.label}>{label}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {value.map((item, i) => (
          <div key={i} style={S.nested}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={S.tag}>#{i + 1}</span>
              <span>
                <button type="button" style={S.ghost} onClick={() => move(i, -1)}>↑</button>
                <button type="button" style={S.ghost} onClick={() => move(i, 1)}>↓</button>
                <button type="button" style={S.ghost} onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
              </span>
            </div>
            {item && typeof item === "object"
              ? Object.entries(item).map(([k, v]) => (
                  <DataField key={k} name={k} value={v} onChange={(nv) => onChange(value.map((it, j) => (j === i ? { ...it, [k]: nv } : it)))} />
                ))
              : <DataField name={`item ${i + 1}`} value={item} onChange={(nv) => onChange(value.map((it, j) => (j === i ? (nv as Record<string, unknown>) : it)))} />}
          </div>
        ))}
        <button type="button" style={S.btn} onClick={addItem}>+ Add item</button>
      </div>
    </div>
  );
}

// ── add picker ───────────────────────────────────────────────────────────────
function AddPicker({ onPick, onClose }: { onPick: (type: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    return Object.entries(CATALOG)
      .map(([group, items]) => [group, items.filter((it) => !query || it.type.includes(query) || it.label.toLowerCase().includes(query))] as const)
      .filter(([, items]) => items.length);
  }, [q]);
  return (
    <div style={{ ...S.card, padding: 10 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input autoFocus style={S.input} placeholder="Search sections…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" style={S.btn} onClick={onClose}>Cancel</button>
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {groups.map(([group, items]) => (
          <div key={group}>
            <div style={{ ...S.label, textTransform: "capitalize", opacity: 0.7 }}>{group}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {items.map((it) => (
                <button key={it.type} type="button" style={S.btn} title={it.type} onClick={() => onPick(it.type)}>{it.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── the widget ───────────────────────────────────────────────────────────────
function PageBuilder({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const sections: Section[] = Array.isArray(value) ? (value as Section[]) : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const commit = (next: Section[]) => onChange(next);
  const patch = (i: number, p: Partial<Section>) => commit(sections.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };
  const remove = (i: number) => { commit(sections.filter((_, j) => j !== i)); if (openIdx === i) setOpenIdx(null); };
  const add = (type: string) => {
    const data = blank(TEMPLATES[type] ?? {}) as Record<string, unknown>;
    commit([...sections, { type, theme: "default", data }]);
    setAdding(false);
    setOpenIdx(sections.length);
  };

  return (
    <div style={S.wrap}>
      {sections.map((s, i) => {
        const open = openIdx === i;
        const data = (s.data ?? {}) as Record<string, unknown>;
        return (
          <div key={i} style={S.card}>
            <div style={S.row}>
              <button type="button" style={{ ...S.ghost, flex: 1, textAlign: "left" }} onClick={() => setOpenIdx(open ? null : i)}>
                <strong style={{ fontSize: 13 }}>{LABELS[s.type]?.label ?? s.type}</strong>{" "}
                <span style={S.tag}>{s.type}</span>
              </button>
              <select style={{ ...S.input, width: "auto" }} value={s.theme ?? "default"} onChange={(e) => patch(i, { theme: e.target.value })}>
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select title="Desktop vertical padding" style={{ ...S.input, width: "auto", fontSize: 11 }} value={s.spacing?.desktop ?? ""} onChange={(e) => patch(i, { spacing: { ...s.spacing, desktop: e.target.value } })}>
                {PADS.map((p) => <option key={p} value={p}>{p ? `🖥 ${p}` : "🖥 auto"}</option>)}
              </select>
              <select title="Mobile vertical padding" style={{ ...S.input, width: "auto", fontSize: 11 }} value={s.spacing?.mobile ?? ""} onChange={(e) => patch(i, { spacing: { ...s.spacing, mobile: e.target.value } })}>
                {PADS.map((p) => <option key={p} value={p}>{p ? `📱 ${p}` : "📱 auto"}</option>)}
              </select>
              <button type="button" style={S.ghost} onClick={() => move(i, -1)} title="Up">↑</button>
              <button type="button" style={S.ghost} onClick={() => move(i, 1)} title="Down">↓</button>
              <button type="button" style={S.ghost} onClick={() => remove(i)} title="Delete">✕</button>
            </div>
            {open && (
              <div style={S.body}>
                {(() => {
                  // Render the section type's FULL field set: the template's
                  // fields (blanked) merged under the saved values. Saved values
                  // win; fields the component supports but this saved section
                  // lacks (e.g. a CTA added to the template later) still surface
                  // for editing instead of being invisible in the data-driven form.
                  const fields = { ...(blank(TEMPLATES[s.type] ?? {}) as Record<string, unknown>), ...data };
                  const keys = Object.keys(fields);
                  if (keys.length === 0) return <div style={S.tag}>No fields on this section.</div>;
                  return keys.map((k) => (
                    <DataField key={k} name={k} value={fields[k]} focalOk={FOCAL_TYPES.has(s.type)} onChange={(nv) => patch(i, { data: { ...data, [k]: nv } })} />
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })}

      {adding
        ? <AddPicker onPick={add} onClose={() => setAdding(false)} />
        : <button type="button" style={{ ...S.btn, alignSelf: "flex-start" }} onClick={() => setAdding(true)}>+ Add section</button>}
    </div>
  );
}

export const fields = { pageBuilder: PageBuilder };
