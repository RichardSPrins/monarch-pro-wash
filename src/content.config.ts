import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

// Shared section schema
const sectionSchema = z.object({
  type: z.string(),
  theme: z
    .enum(["default", "alt", "muted", "inverse", "primary", "brand-secondary"])
    .default("default"),
  data: z.record(z.string(), z.unknown()).optional(),
});

// Pages (for Top Level Pages like About, Contact, etc.)
const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.json" }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    noindex: z.boolean().default(false),
    draft: z.boolean().default(false),
    /** Demo/reference pages (e.g. /components) — excluded from production builds. */
    demo: z.boolean().default(false),
    /** Per-page SEO + structured data for bespoke landing/SEO pages. */
    seo: z
      .object({
        ogImage: z.string().optional(),
        ogImageAlt: z.string().optional(),
        canonical: z.string().optional(),
        /** Emit a Service JSON-LD (service / service-in-location pages). */
        service: z
          .object({
            name: z.string(),
            description: z.string().optional(),
            serviceType: z.string().optional(),
            areaServed: z.string().optional(),
          })
          .optional(),
        /** Emit an FAQPage JSON-LD from this page's Q&A. */
        faq: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
        /** Emit the site LocalBusiness JSON-LD on this page. */
        localBusiness: z.boolean().optional(),
      })
      .optional(),
    sections: z.array(sectionSchema).default([]),
  }),
});
// Services
const services = defineCollection({
  // Pure data (no rendered body) — JSON, not markdown.
  loader: glob({ base: "./src/content/services", pattern: "**/*.json" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    image: z.string().optional(),
    /** Slug of a `serviceCategories` entry — groups/filters services on pages. */
    category: z.string().optional(),
    /** Optional longer body copy (preserved from the former markdown body). */
    content: z.string().optional(),
    isEmergency: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

// Service Categories — taxonomy collection for grouping services
const serviceCategories = defineCollection({
  loader: glob({
    base: "./src/content/service-categories",
    pattern: "**/*.json",
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Service Areas
const serviceAreas = defineCollection({
  loader: glob({ base: "./src/content/service-areas", pattern: "**/*.json" }),
  schema: z.object({
    city: z.string(),
    state: z.string(),
    slug: z.string(),
    county: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

// // Local Service Pages
// const localPages = defineCollection({
//   loader: glob({ base: "./src/content/local-pages", pattern: "**/*.json" }),
//   schema: z.object({
//     area: z.string(),
//     service: z.string(),
//     title: z.string(),
//     metaTitle: z.string(),
//     metaDescription: z.string(),
//     featured: z.boolean().default(false),
//     draft: z.boolean().default(false),
//     sections: z.array(
//       z.object({
//         type: z.string(),
//         theme: z
//           .enum(["default", "alt", "muted", "inverse", "primary", "accent"])
//           .default("default"),
//         data: z.record(z.string(), z.unknown()).optional(),
//       }),
//     ),
//   }),
// });

// FAQs
const faqs = defineCollection({
  loader: glob({ base: "./src/content/faqs", pattern: "**/*.json" }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    service: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Reviews
const reviews = defineCollection({
  loader: glob({ base: "./src/content/reviews", pattern: "**/*.json" }),
  schema: z.object({
    author: z.string(),
    rating: z.number().min(1).max(5),
    body: z.string(),
    date: z.coerce.date(),
    service: z.string().optional(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    source: z.enum(["Google", "Facebook", "Yelp", "Direct"]).default("Google"),
  }),
});

// Blog Posts
const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,mdx,markdoc}",
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    image: z.string().optional(),
    author: z.string().default("Admin"),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

// Settings - individual files loaded separately
const generalSettings = defineCollection({
  loader: file("./src/content/settings/general.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "general", ...data }];
    },
  }),
  schema: z.object({
    businessName: z.string(),
    tagline: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    license: z.string().optional(),
    gbpUrl: z.string().optional(),
    social: z
      .object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
      })
      .optional(),
    headerVariant: z
      .enum([
        "classic", "centered", "minimal", "transparent", "inverse",
        "two-row", "pill", "compact", "cta-prominent", "gradient",
      ])
      .optional(),
    footerVariant: z
      .enum([
        "columns", "simple", "cta", "newsletter", "map",
        "mega", "centered", "hours", "social", "bar",
        "brandmark", "glow", "spotlight", "marquee",
      ])
      .optional(),
  }),
});

const hoursSettings = defineCollection({
  loader: file("./src/content/settings/hours.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "hours", ...data }];
    },
  }),
  schema: z.object({
    hours: z.array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closedAllDay: z.boolean().default(false),
      })
    ),
  }),
});

const seoSettings = defineCollection({
  loader: file("./src/content/settings/seo.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "seo", ...data }];
    },
  }),
  schema: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    googleVerification: z.string().optional(),
    bingVerification: z.string().optional(),
  }),
});

const navigationSettings = defineCollection({
  loader: file("./src/content/settings/navigation.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "navigation", ...data }];
    },
  }),
  schema: z.object({
    items: z.array(
      z.lazy(() =>
        z.object({
          label: z.string(),
          href: z.string().optional(),
          enabled: z.boolean().default(true),
          autoPopulate: z.enum(["services", "service-areas"]).optional(),
          children: z
            .array(
              z.object({
                label: z.string(),
                href: z.string().optional(),
                enabled: z.boolean().default(true),
                children: z
                  .array(
                    z.object({
                      label: z.string(),
                      href: z.string(),
                      enabled: z.boolean().default(true),
                    })
                  )
                  .optional(),
              })
            )
            .optional(),
        })
      )
    ),
  }),
});

export const collections = {
  services,
  serviceCategories,
  serviceAreas,
  // localPages,
  faqs,
  reviews,
  posts,
  generalSettings,
  hoursSettings,
  seoSettings,
  navigationSettings,
  pages,
};
