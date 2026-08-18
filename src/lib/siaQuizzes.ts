/**
 * Service-in-area lead quizzes. One tailored qualifying quiz per service, keyed
 * by service slug. The /[area]/[service] route injects the matching quiz into
 * the hero:split-form, so every matrix page (authored or generated, any town)
 * gets a service-specific quiz with no per-page CMS data. `getSiaQuiz(slug)`
 * falls back to a generic property → timing quiz for any unmapped service.
 */
import type { FormConfig, QuizStep } from "@/types/sections";

const CONTACT: QuizStep = {
  id: "contact",
  type: "contact",
  question: "Where should we send your free quote?",
  fields: [
    { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Smith" },
    { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "(555) 555-5555" },
    { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    // Optional but preferred — helps us route and pre-scope the quote.
    { name: "address", label: "Property Address", type: "text", placeholder: "Street address (optional)" },
    // Open-ended catch-all — surfaces access notes, problem areas, extra asks.
    { name: "notes", label: "Anything else we should know?", type: "text", placeholder: "Gate code, problem areas, extra requests… (optional)" },
  ],
};

const PROPERTY: QuizStep = {
  id: "propertyType",
  type: "single-select",
  autoAdvance: true,
  question: "Is this for a home or a business?",
  options: [
    { label: "My home", icon: "home" },
    { label: "A business or property I manage", icon: "wrench" },
  ],
};

/** single-select step: sel(id, question, [[label, icon], ...]) */
const sel = (id: string, question: string, opts: [string, string][]): QuizStep => ({
  id,
  type: "single-select",
  autoAdvance: true,
  question,
  options: opts.map(([label, icon]) => ({ label, icon })),
});

/** Preferred contact time — one low-friction tap, appended to every quiz so we
 * know when to reach out (lifts connect rate). */
const PREFERRED_TIME: QuizStep = sel("contactTime", "When's the best time to reach you?", [
  ["Morning", "clock"],
  ["Afternoon", "clock"],
  ["Evening", "clock"],
  ["Anytime works", "check"],
]);

const quiz = (steps: QuizStep[]): FormConfig => ({
  type: "quiz",
  title: "Get My Free Quote",
  description: "Answer a few quick questions. Prefer to talk? Call (458) 209-7735.",
  submitLabel: "Get My Free Quote",
  steps: [...steps, PREFERRED_TIME, CONTACT],
  outcome: {
    heading: "Thanks! Your free quote is on the way.",
    body: "We'll review your answers and get back to you the same business day with a clear, up-front price.",
  },
});

const QUIZZES: Record<string, FormConfig> = {
  "pressure-washing": quiz([
    sel("surface", "What do you need pressure washed?", [["Driveway & sidewalks", "home"], ["Patio, deck, or pool area", "drop"], ["Concrete, pavers, or hardscape", "wrench"], ["Commercial property", "dollar"], ["Multiple areas / not sure", "question"]]),
    sel("issue", "What's the main issue?", [["General dirt, grime & dust", "dot"], ["Algae, moss, or green growth", "drop"], ["Oil, rust, or hard-water stains", "storm"], ["Just want it maintained", "check"]]),
    PROPERTY,
  ]),
  "solar-panel-cleaning": quiz([
    sel("system", "What kind of solar setup?", [["Home rooftop panels", "home"], ["Ground-mount array", "wrench"], ["Commercial / large array", "dollar"], ["Not sure", "question"]]),
    sel("issue", "What's the concern?", [["Dust & pollen buildup", "dot"], ["Bird droppings or hard-water spots", "drop"], ["Noticing lower output", "storm"], ["Just routine cleaning", "check"]]),
    PROPERTY,
  ]),
  "soft-washing": quiz([
    sel("surface", "What needs soft washing?", [["House siding", "home"], ["Roof", "shingle"], ["Fence or deck", "wrench"], ["The whole exterior", "storm"], ["Not sure", "question"]]),
    sel("issue", "What are you seeing?", [["Green algae or mildew", "drop"], ["Black streaks", "storm"], ["Chalky or dull surface", "dot"], ["General grime", "check"]]),
    PROPERTY,
  ]),
  "roof-cleaning": quiz([
    sel("issue", "What's on your roof?", [["Black streaks", "storm"], ["Green moss", "drop"], ["General dirt & dust", "dot"], ["Not sure", "question"]]),
    sel("material", "What is your roof made of?", [["Asphalt shingle", "shingle"], ["Metal", "wrench"], ["Tile", "home"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "graffiti-removal": quiz([
    sel("surface", "What surface was tagged?", [["Brick or masonry", "home"], ["Concrete wall", "wrench"], ["Painted wall or siding", "drop"], ["Metal or glass", "storm"], ["Not sure", "question"]]),
    sel("timing", "How soon do you need it gone?", [["As soon as possible", "clock"], ["This week", "calendar"], ["Just getting quotes", "search"]]),
    sel("propertyType", "Is this a business or a home?", [["A business or storefront", "dollar"], ["My home", "home"]]),
  ]),
  "gutter-cleaning": quiz([
    sel("issue", "What's going on with your gutters?", [["Overflowing", "storm"], ["Slow draining", "drop"], ["Packed with debris", "sag"], ["Just maintenance", "check"]]),
    sel("stories", "How many stories is the home?", [["One story", "home"], ["Two stories", "wrench"], ["Three or more", "storm"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "window-cleaning": quiz([
    sel("scope", "What needs cleaning?", [["Home windows", "home"], ["Storefront glass", "dollar"], ["Hard-water spots", "drop"], ["Windows + screens", "wrench"]]),
    sel("sides", "Inside and out, or just outside?", [["Both inside & out", "check"], ["Exterior only", "home"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "screen-repair": quiz([
    sel("issue", "What's wrong with your screens?", [["Torn mesh", "sag"], ["Bent frames", "wrench"], ["Missing screens", "question"], ["A mix of issues", "storm"]]),
    sel("count", "About how many screens?", [["1 to 3", "home"], ["4 to 8", "wrench"], ["9 or more", "storm"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "bin-cleaning": quiz([
    sel("scope", "What needs cleaning?", [["Home trash cans", "home"], ["Commercial dumpster", "dollar"], ["Both", "wrench"], ["Not sure", "question"]]),
    sel("frequency", "One-time or recurring?", [["One-time deep clean", "check"], ["Recurring service", "calendar"], ["Not sure yet", "question"]]),
    PROPERTY,
  ]),
  "fleet-vehicle-cleaning": quiz([
    sel("fleet", "What's in your fleet?", [["Vans & work trucks", "wrench"], ["Box trucks", "home"], ["Heavy equipment", "storm"], ["A mix", "question"]]),
    sel("count", "How many vehicles?", [["1 to 5", "home"], ["6 to 15", "wrench"], ["16 or more", "storm"], ["Not sure", "question"]]),
    sel("frequency", "One-time or recurring?", [["One-time", "check"], ["Recurring service", "calendar"]]),
  ]),
  "parking-lot-striping": quiz([
    sel("scope", "What do you need?", [["Re-stripe faded lines", "wrench"], ["Fresh new layout", "home"], ["ADA & fire lanes", "storm"], ["Not sure", "question"]]),
    sel("size", "About how big is the lot?", [["Small", "home"], ["Medium", "wrench"], ["Large / big-box", "storm"], ["Not sure", "question"]]),
  ]),
  "sprinkler-blowouts": quiz([
    sel("zones", "How many zones does your system have?", [["1 to 5", "home"], ["6 to 10", "wrench"], ["11 or more", "storm"], ["Not sure", "question"]]),
    sel("timing", "When do you need it done?", [["Before the next freeze", "clock"], ["Sometime this fall", "calendar"], ["Just planning ahead", "search"]]),
    PROPERTY,
  ]),
  "christmas-lights": quiz([
    sel("scope", "What do you want lit?", [["Roofline & eaves", "home"], ["Trees & landscaping", "drop"], ["Columns & railings", "wrench"], ["The whole home", "storm"]]),
    sel("lights", "Whose lights?", [["Provide them for me", "check"], ["Use my own", "home"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "surface-treatment": quiz([
    sel("surface", "What surface needs treating?", [["Concrete", "home"], ["Stone or pavers", "wrench"], ["Driveway or entry", "storm"], ["Multiple", "question"]]),
    sel("goal", "What's the goal?", [["Repel hard-water film", "drop"], ["Protect from wear", "shingle"], ["Less slick when wet", "check"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "concrete-sealing-staining": quiz([
    sel("surface", "What's the concrete?", [["Driveway", "home"], ["Patio", "wrench"], ["Walkway or steps", "storm"], ["Garage / shop floor", "dollar"]]),
    sel("goal", "Seal, stain, or both?", [["Seal only", "shingle"], ["Stain for color", "drop"], ["Both", "check"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "paver-sealing": quiz([
    sel("where", "Where are the pavers?", [["Patio", "home"], ["Walkway", "wrench"], ["Driveway", "storm"], ["Pool deck", "drop"]]),
    sel("concern", "What's the main concern?", [["Faded color", "drop"], ["Weeds in the joints", "sag"], ["Shifting pavers", "storm"], ["Just protection", "check"]]),
    PROPERTY,
  ]),
  "asphalt-sealing": quiz([
    sel("scope", "What are you sealing?", [["Home driveway", "home"], ["Commercial lot", "dollar"], ["Multi-unit drive lanes", "wrench"], ["Not sure", "question"]]),
    sel("condition", "What's the condition?", [["Faded gray", "dot"], ["Early cracks", "storm"], ["Still black, want protection", "check"], ["Not sure", "question"]]),
    PROPERTY,
  ]),
  "post-construction-cleanup": quiz([
    sel("project", "What kind of project?", [["New home build", "home"], ["Remodel or addition", "wrench"], ["Commercial build", "dollar"], ["Not sure", "question"]]),
    sel("scope", "What needs clearing?", [["Windows & glass", "drop"], ["Concrete & flatwork", "home"], ["The whole exterior", "storm"], ["Not sure", "question"]]),
    sel("propertyType", "Are you the homeowner or the builder?", [["Homeowner", "home"], ["Builder or GC", "wrench"]]),
  ]),
};

/** Generic fallback for any service without a bespoke quiz. */
const GENERIC = quiz([
  PROPERTY,
  sel("timing", "How soon do you need it?", [["As soon as possible", "clock"], ["In the next few weeks", "calendar"], ["Just getting quotes", "search"]]),
]);

export function getSiaQuiz(serviceSlug: string): FormConfig {
  return QUIZZES[serviceSlug] ?? GENERIC;
}
