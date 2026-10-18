#!/usr/bin/env node
/**
 * Conversion-first prose rewrites, by page and section index.
 *
 * The regex passes in copy-rewrite.mjs fix defects: false claims, em dashes,
 * crew language, wall-of-text paragraphs. They cannot fix the thing that
 * actually matters, which is that the pages read as explanation rather than as
 * a structured case for hiring.
 *
 * THE PATTERN every rewrite here follows:
 *
 *   1. Open on the reader's problem, in concrete terms, in the first sentence.
 *      Never "Concrete in Meridian rarely stays clean on its own."
 *   2. Name the cost of leaving it. Stakes, not description.
 *   3. Give the fix plainly, with the specific reassurance that matters for
 *      that surface (no etching, no stripped granules, no blown-out sand).
 *   4. Close on proof: owner-run, insured, the quoter is the worker.
 *   5. Keep paragraphs to two or three sentences, and front-load each one.
 *
 * Local facts carried over from the existing copy are verified against the
 * vault's per-town reference files and must not be invented or embellished.
 * Hard-water figures stay qualitative for Meridian. American spelling. No em
 * dashes. Second person for the reader, "we" for Monarch.
 *
 *   node scripts/copy-prose.mjs [--write]
 */
import fs from "node:fs";

const WRITE = process.argv.includes("--write");
const DIR = ".emdash/ingest";

const p = (...paras) => paras.map((t) => `<p>${t}</p>`).join("");

export const PROSE = {
  // ---------------------------------------------------------------- homepage
  // A home page, not a service page: an overview of the business, written from
  // the same problem-first frame. The owner letter at [8] is left alone. It is
  // the best copy on the site and the tonal reference for everything else.
  index: {
    2: {
      heading: "One Call for the Whole Property",
      _was: '"Unmatched Service for Homeowners and Businesses" plus "we offer a premium experience". Adjectives, no problem, no reason to act.',
      subheading:
        "Most exterior cleaners do one thing. You end up with one company for the driveway, another for the windows, and nobody who takes responsibility for how the place actually looks. Monarch handles the driveway, the roof, the siding, the windows and the gutters in a single visit, with the method matched to each surface. One quote, one visit, one person accountable for all of it.",
    },
    4: {
      heading: "Exterior Cleaning Services Across the Treasure Valley",
      _was: '"Premium Exterior Cleaning Services" and "Trust us to deliver top-quality services and lasting results". Template filler.',
      subheading:
        "Take the whole property in one visit, or just the one thing that is bothering you. Either way the surface decides the method: real pressure where concrete can take it, a gentle soft wash anywhere that cannot.",
    },
  },

  // ---------------------------------------------------------------- flagship
  "svc-pressure-washing": {
    2: {
      heading: "Why Treasure Valley Concrete Goes Gray",
      _was: '"The Service Explained" opening on a feature list. Now opens on the reader\'s problem and what it is costing them.',
      body: p(
        "Your driveway is the first thing anyone sees when they pull up. Right now it is probably telling them the property is older and less cared for than it really is.",
        "Three things do the damage here. High-desert dust works into the pores all summer. Hard water and iron from sprinklers leave rust-colored mineral staining that rinsing will never touch. Freeze and thaw then drives all of it deeper every winter.",
        "Pressure washing reverses it. We lift the dirt, oil and mineral staining back out of the surface, matching pressure to the material so concrete, pavers and pool decks get a deep clean with no etching, no pitting and no blown-out joint sand.",
        "Want it to stay that way? We can seal the surface once it dries, so the clean holds for years instead of months.",
      ),
    },
  },

  "svc-soft-washing": {
    2: {
      heading: "When Pressure Is the Wrong Tool",
      body: p(
        "Black streaks down the roof. Siding gone dull and green on the north side. A fence darkening where the sun never reaches it. The instinct is to hit all of it hard.",
        "That is how roofs lose shingle granules, how water gets forced in behind siding, and how wood gets gouged. The damage costs more than the cleaning ever would have.",
        "Soft washing is the right tool for those surfaces. Low pressure, plus a solution that kills algae, mold, mildew and moss at the root, so the growth stays gone for seasons instead of weeks.",
        "Here the north-facing and shaded walls hold moisture and grow the worst of it, while high-desert dust dulls everything else. We match the treatment to each surface and wet down your landscaping before we start.",
      ),
    },
  },

  "svc-roof-cleaning": {
    2: {
      heading: "Those Black Streaks Are Alive",
      body: p(
        "The black streaks running down your roof are not dirt, and they will not wash off in the rain. They are Gloeocapsa algae, and they feed on the limestone filler in your shingles.",
        "Left alone, that growth holds moisture against the roof. Moss follows, roots at the shingle edges and starts lifting them. That is how a roof gets replaced years before it should have been.",
        "Roof cleaning stops it at the source with a low-pressure soft wash. No blasting, no scrubbing, nobody dragging equipment across your shingles. The solution does the work and rinses away gently.",
        "Your roof looks right again, and the granules that protect it stay where they belong.",
      ),
    },
  },

  "svc-gutter-cleaning": {
    2: {
      heading: "A Clogged Gutter Is a Foundation Problem",
      body: p(
        "Gutters have one job. When leaves and needles pack the channel or block a downspout, rainwater and snowmelt spill over the edge instead of draining away.",
        "That overflow runs down your fascia and pools against the foundation. Through a Treasure Valley winter it feeds the freeze-thaw cycle that cracks concrete and drives water in where it does not belong. Clearing a gutter is cheap. Ignoring one is not.",
        "We clear the channels, flush the downspouts until the water runs clean, and brighten the gutter exterior so the front of the house looks as good as it drains.",
        "Best done before the seasons when your gutters carry the heaviest load. Homes and commercial buildings both.",
      ),
    },
  },

  "svc-window-cleaning": {
    2: {
      heading: "Why Your Windows Still Look Dirty After You Clean Them",
      body: p(
        "Dirty windows here are rarely just dust. High-desert grit films the glass, sprinkler overspray leaves mineral spots, and hard water bakes on staining that a paper towel will never move.",
        "That buildup dulls the whole view, and it makes a well-kept house read as neglected from the street.",
        "We clean interior and exterior glass, clear the tracks where grit and dead bugs collect, and treat hard-water staining at the source instead of smearing it around. Screens and seals get care, not force.",
        "The result is glass that is actually clear from every angle and in any light, done properly the first time.",
      ),
    },
  },

  "svc-concrete-sealing-staining": {
    2: {
      heading: "Bare Concrete Is a Sponge",
      body: p(
        "Bare concrete is porous, and that is the whole problem. It drinks up oil and rust, holds dust deep in the surface, and takes the full force of freeze-thaw every winter as water seeps in and expands.",
        "That is how a good slab starts spalling and cracking. Once it does, you are pricing replacement, not cleaning.",
        "Sealing closes the pores with a protective layer that repels stains and keeps water out before it can do the damage. Decorative staining goes further, adding lasting color that turns a plain gray driveway or patio into a finished surface.",
        "Both matter here, where UV fades surfaces, hard water leaves mineral marks, and freeze-thaw is the number one enemy of concrete. Sealed after a thorough clean, the slab stays looking right far longer between washes.",
      ),
    },
  },

  "svc-post-construction-cleanup": {
    2: {
      heading: "The Last Ten Percent Nobody Wants to Do",
      body: p(
        "A new build leaves a film that ordinary cleaning does not touch. Mortar smears and stucco splatter cling to brick and siding. Paint overspray dots the windows. Fine drywall dust settles over every exterior surface, and high-desert dust blows across the site to finish the job.",
        "Until that comes off, the property does not look finished. A buyer or an owner walking up sees the mess before they see the work.",
        "We wash down siding and hard surfaces, clear mortar and staining off the flatwork, detail the glass free of overspray and stickers, and clear the leftover debris. Real pressure on concrete, a gentle soft wash on anything delicate, so nothing that was just installed gets damaged on the way out.",
        "Show-ready for the owner, the buyer, or the final walkthrough.",
      ),
    },
  },

  "svc-graffiti-removal": {
    2: {
      heading: "Every Day a Tag Stays Up, It Invites the Next One",
      body: p(
        "Graffiti on your storefront tells every customer and every neighbor something you did not choose to say. And a tag that sits there attracts more.",
        "Speed matters here more than almost anything else.",
        "The difficulty is that paint behaves differently on every surface. Porous brick and concrete absorb it. Siding and coated surfaces hold it on top. We match the method to the material, using real pressure only where a hard surface can take it and a gentler process where it cannot.",
        "The goal is a clean wall, not a bright scrubbed patch that draws the eye as much as the tag did.",
      ),
    },
  },

  // ------------------------------------------------------------ Boise set
  // These pages already opened on the problem and carry strong, verified local
  // detail, so most keep their wording. Two things are fixed across the set:
  // window-cleaning opened with the company instead of the reader, and the
  // "conditions" blocks get bolded lead-ins so three themed paragraphs scan as
  // three causes rather than as a column of text.
  "sia-boise--window-cleaning": {
    1: {
      _was: 'Opened "Monarch Pro Wash is an owner-run, insured exterior cleaning company serving Boise". Company first, reader second. The problem was in paragraph two.',
      body: p(
        "Boise glass does not stay clear for long. Hard water leaves cloudy mineral spotting that a wipe will not touch, dust rolls off the Foothills all summer, and fire season settles a film over everything.",
        "You end up looking at the view through a haze you stopped noticing months ago, and a well-kept house reads as tired from the street.",
        "We clean interior and exterior glass, clear the tracks, and break down the mineral buildup at the source instead of smearing it around.",
        "Monarch is owner-run and insured. The person who books your job is the person who shows up to do it.",
      ),
    },
    2: {
      body: p(
        "<strong>Hard water.</strong> It is a fact of life across Boise, and it shows on your glass as cloudy mineral spotting that a quick wipe will not shift. It is worst on windows the sprinklers reach, which is most of Southeast Boise and the Bench. We break that buildup down rather than moving it around.",
        "<strong>Foothills dust and fire season.</strong> Out toward the Highlands, Boise Heights and the Central Foothills, windows collect a steady film off the hills, and every fire season lays smoke on top of it. We wash inside and out so the filtered look goes and daylight comes through clean.",
        "<strong>Storefront traffic.</strong> Around The Grove, BoDo and Old Boise, your front glass is the first impression. Street grime, fingerprints and spotting build up fast on a busy entrance. We keep it sharp so customers see a clean business before they reach the door.",
      ),
    },
  },

  "sia-boise--roof-cleaning": {
    2: {
      body: p(
        "<strong>Shade is the main culprit.</strong> In the North End and Hyde Park, mature trees keep whole roof slopes damp, and homes backing the Boise River and Greenbelt sit in humidity that never really burns off. Those north-facing slopes grow algae, black streaks and moss. Soft washing removes it at the root instead of scraping it, so it does not come racing back in a few months.",
        "<strong>In the foothills, it falls out of the sky.</strong> Around the Highlands, Boise Heights and the Central Foothills, fine dust off the hills and settled wildfire smoke build up on the roof and work into the grit. We rinse and treat at low pressure, clearing it without driving water up under the shingles.",
        "<strong>High pressure is the wrong tool for any of it.</strong> Blasting a roof strips the protective granules off asphalt shingles and forces water where it does not belong. We soft wash instead: the solution kills the growth, and low pressure carries it away. Your roof gets clean and the shingles stay intact.",
      ),
    },
  },

  "sia-boise--pressure-washing": {
    2: {
      body: p(
        "Boise is hard on hard surfaces in three specific ways, and each calls for a different touch.",
        "<strong>Aging concrete on the Bench.</strong> Many homes there, and their original slabs, date to the 1940s and 1950s, and decades of freeze-thaw have already stressed them. Older concrete gets a measured, surface-safe clean, never a turbo nozzle dragged across it that etches and pits.",
        "<strong>Hard water and iron.</strong> Across most of the city, iron-rich irrigation leaves rusty orange and dull mineral staining that rinsing will not lift. We treat it at the source with the right solution rather than with more pressure.",
        "<strong>Foothills grit and smoke.</strong> Up in the Highlands and Boise Heights, wind-blown grit and wildfire fallout settle on driveways and walkways right through the dry months. We clean it off, and where you want the finish to hold, we can seal afterward.",
      ),
    },
  },

  "sia-boise--soft-washing": {
    2: {
      body: p(
        "<strong>Historic Boise was built for a softer touch.</strong> Homes in the North End, Hyde Park, the East End and the Warm Springs corridor have older siding, painted wood and delicate trim that high pressure splinters or strips. Low pressure plus the right solution gets them clean without gouged wood or forced-open seams.",
        "<strong>By the river it is a different problem.</strong> Homes backing the Boise River and Greenbelt, plus much of Harris Ranch, Barber Valley and Warm Springs Mesa, sit in shade and humidity that feed algae and mildew. That green and gray film keeps returning because the roots stay behind. Soft washing kills what a rinse leaves, so the walls stay clean longer.",
        "<strong>Up in the foothills it is dust and hard water.</strong> Around the Highlands, Boise Heights and the Central Foothills, fine hill dust and settled smoke dull everything they land on, and Boise's hard water leaves a mineral haze on siding and glass. We adjust solution and technique to the surface rather than running one rinse over all of it.",
      ),
    },
  },

  "sia-boise--gutter-cleaning": {
    2: {
      body: p(
        "<strong>The North End and Hyde Park are the classic case.</strong> Decades-old shade trees line those streets and drop enough leaf litter every fall to pack a gutter solid. Once the channels and downspouts block, water has nowhere to go but over the side. We clear the debris by hand and flush the downspouts until the system drains again.",
        "<strong>Winter makes it worse.</strong> Water trapped in a clogged gutter freezes, thaws and freezes again. That cycle strains the gutters, backs water up under the roof edge and works against your fascia. Clearing before winter gives the water a path out instead of letting it sit.",
        "<strong>Then there is your foundation.</strong> When gutters overflow, water dumps straight down beside the house and pools against the foundation. Downspouts that actually carry water away are the first line of defense. We make sure yours are open and moving it clear of the house.",
      ),
    },
  },

  "sia-boise--concrete-sealing-staining": {
    2: {
      body: p(
        "<strong>Older Bench concrete is already tired.</strong> Much of the Bench went in during the 1940s and 1950s, and that concrete has seen decades of freeze-thaw. Around Depot Bench, South Boise Village and Morris Hill you see cracking and surface spalling from years of moisture cycling. Cleaning and sealing slows the damage and protects what is left.",
        "<strong>New slabs are worth protecting from day one.</strong> Driveways in Harris Ranch and Barber Valley look great now, but Boise winters and hard summer sun will test them. Sealing early helps a new slab resist staining and freeze-thaw before any of it starts.",
        "<strong>Staining is where the curb appeal comes in.</strong> A tired Bench patio or a blank new driveway can take decorative color that suits the house. Stain plus seal gives you a surface that looks finished and stands up to the seasons.",
      ),
    },
  },

  "sia-boise--post-construction-cleanup": {
    2: {
      body: p(
        "<strong>River-adjacent lots collect grit fast.</strong> New builds in Harris Ranch and Barber Valley sit right in the Greenbelt corridor. We work the whole envelope in order, roofline down to driveway, so dust does not settle back onto surfaces we have already cleaned.",
        "<strong>Jobsite dust is relentless out on the edges.</strong> Boise is high desert, and out toward the newer Southeast and Southwest pockets that grit works into window tracks, hardscape and siding seams. We use the right pressure per surface to lift it without scarring new stucco, fresh concrete or factory finishes.",
        "<strong>Mortar and overspray need more than a rinse.</strong> On new brick, stone and glass around Surprise Valley we treat and release those deposits with methods matched to the material. The goal is a true move-in clean, not a hose-down that shows streaks in the first morning light.",
      ),
    },
  },

  "sia-boise--graffiti-removal": {
    2: {
      body: p(
        "<strong>Downtown is where most of it happens.</strong> Storefronts and walls through BoDo, Old Boise, the Basque Block and around The Grove take the brunt, and a visible tag on a business frontage needs to come off fast. Freak Alley is the city's sanctioned mural gallery, so art belongs there. The surrounding blocks are where unwanted tagging lands on private property.",
        "<strong>The busy corridors carry their share.</strong> State Street, Broadway near Boise State, and the commercial stretches along Fairview, Overland and Vista see steady foot and vehicle traffic, so a tag is seen by a lot of people until it is gone. Quick removal keeps your building from becoming a repeat target.",
        "<strong>Every surface takes a different touch.</strong> Brick, concrete, painted walls and siding each call for their own approach, and the wrong method leaves a shadow or damages the material. We match technique and pressure to what we are cleaning, so the tag lifts without etching the surface or stripping the finish behind it.",
      ),
    },
  },

  // --------------------------------------------------------- SIA exemplar
  "sia-meridian--pressure-washing": {
    1: {
      _was: 'Opened "Concrete in Meridian rarely stays clean on its own", then buried the owner proof at the end of a seven-sentence block.',
      body: p(
        "Your driveway is the first thing visitors see, and in Meridian it is fighting a losing battle. Dust blows in off the valley all summer. Sprinkler runoff dries into chalky mineral lines along the edges. Oil and tire marks sink in and stay.",
        "Leave it long enough and that gray film stops being dirt and becomes the color of the slab. Concrete that is five years old starts reading as fifteen.",
        "A proper wash pulls it back out. You get an even surface, corner to corner, that looks close to the day it was poured.",
        "Monarch is owner-run and insured. The person who quotes your driveway is the person who cleans it, and that does not change between the estimate and the job.",
      ),
    },
    2: {
      heading: "What Meridian Does to Your Concrete",
      _was: 'Opened "A lot of the driveways and patios we clean sit in..." (about us, not them) and used "Then there is the weather." as a transition. Now split into two named causes so it scans.',
      body: p(
        "Two things here are harder on flatwork than most people expect.",
        "<strong>Hard water.</strong> Meridian's water is among the hardest in the Treasure Valley. Sprinklers hit the driveway every morning, that mineral-heavy water dries, and it leaves chalky white staining along the edges and low spots. Rinsing does nothing to it. We treat those areas directly so the concrete comes back to its real color.",
        "<strong>Dust and freeze-thaw.</strong> High-desert dust settles into the surface all summer. Winter freeze and thaw then works it deeper into the pores. By spring it is not sitting on the slab any more, it is in it.",
        "Most of the flatwork we clean here is in newer neighborhoods like Paramount, Bridgetower and Century Farm, where the slab is only a few years old. That changes the job. We match pressure and technique to the age of the concrete, so you get a deep clean without etching or streaking, and we work the surface evenly so you are not left with clean lanes next to dirty borders.",
      ),
    },
  },
};

// ---------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith("copy-prose.mjs")) {
  const strip = (v) => String(v).replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, "").replace(/[ \t]+/g, " ").trim();
  let n = 0;
  for (const [slug, secs] of Object.entries(PROSE)) {
    const f = `${DIR}/${slug}.json`;
    if (!fs.existsSync(f)) { console.log("MISSING", slug); continue; }
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const [idx, patch] of Object.entries(secs)) {
      const sec = j.sections[Number(idx)];
      if (!sec) { console.log("no section", slug, idx); continue; }
      console.log(`\n${"=".repeat(70)}\n${slug} [${idx}] ${sec.type}`);
      if (patch._was) console.log(`WHY: ${patch._was}`);
      for (const k of ["heading", "body"]) {
        if (!(k in patch)) continue;
        console.log(`\n--- ${k} BEFORE\n${strip(sec.data[k] ?? "(unset)")}`);
        console.log(`\n--- ${k} AFTER\n${strip(patch[k])}`);
        sec.data[k] = patch[k];
        n++;
      }
    }
    if (WRITE) fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  }
  console.log(`\n${n} field(s) rewritten. ${WRITE ? "Saved." : "Dry run."}`);
}
