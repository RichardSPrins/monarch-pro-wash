import type {
  WebSite,
  LocalBusiness,
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  Service,
  WithContext,
  SearchAction,
} from "schema-dts";

export interface BusinessData {
  businessName: string;
  tagline?: string;
  /** Logo from EmDash native SiteSettings (media). Falls back to the name text. */
  logo?: { url: string; alt?: string; width?: number; height?: number };
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  gbpUrl?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  /** Which header layout variant to render. Defaults to "classic". */
  headerVariant?:
    | "classic" | "centered" | "minimal" | "transparent" | "inverse"
    | "two-row" | "pill" | "compact" | "cta-prominent" | "gradient";
  /** Which footer layout variant to render. Defaults to "columns". */
  footerVariant?:
    | "columns" | "simple" | "cta" | "newsletter" | "map"
    | "mega" | "centered" | "hours" | "social" | "bar";
}

export interface SiteData {
  url: string;
  ogImage: string;
}

export function createWebsiteSchema(
  business: BusinessData,
  site: SiteData
): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: business.businessName,
    url: site.url,
    description: business.tagline,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      "query-input": {
        "@type": "PropertyValueSpecification",
        valueRequired: true,
        valueName: "search_term_string",
      },
    } as SearchAction,
  };
}

export function createLocalBusinessSchema(
  business: BusinessData,
  site: SiteData,
  options?: {
    businessType?: string;
    priceRange?: string;
    openingHours?: string[];
    areaServed?: string[];
    image?: string;
  }
): WithContext<LocalBusiness> {
  const socialLinks = Object.values(business.social || {}).filter(
    Boolean
  ) as string[];
  if (business.gbpUrl) socialLinks.push(business.gbpUrl);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.businessName,
    url: site.url,
    telephone: business.phone,
    email: business.email,
    image: options?.image || `${site.url}${site.ogImage}`,
    logo: `${site.url}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zip,
      addressCountry: "US",
    },
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
    priceRange: options?.priceRange,
    openingHours: options?.openingHours,
    areaServed: options?.areaServed?.map((area) => ({
      "@type": "City",
      name: area,
    })),
  };
}

const SCHEMA_DAY: Record<string, string> = {
  monday: "Mo",
  tuesday: "Tu",
  wednesday: "We",
  thursday: "Th",
  friday: "Fr",
  saturday: "Sa",
  sunday: "Su",
};

/** "8:00 AM" | "17:00" → "08:00" (schema.org wants 24-hour HH:MM). */
function to24Hour(value?: string): string | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2];
  const meridiem = m[3]?.toLowerCase();
  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

/**
 * Business-hours repeater → schema.org `openingHours` strings ("Mo 08:00-17:00").
 * Closed days and unparseable rows are dropped rather than emitted malformed,
 * since bad values are worse than an absent property.
 */
export function createOpeningHours(
  hours: { day?: string; open?: string; close?: string; closedAllDay?: boolean }[] = []
): string[] {
  const out: string[] = [];
  for (const h of hours) {
    if (h.closedAllDay) continue;
    const day = SCHEMA_DAY[String(h.day ?? "").trim().toLowerCase()];
    const open = to24Hour(h.open);
    const close = to24Hour(h.close);
    if (day && open && close) out.push(`${day} ${open}-${close}`);
  }
  return out;
}

export function createBlogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author: { name: string; url?: string };
  businessName: string;
  siteUrl: string;
}): WithContext<BlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: post.url,
    image: post.image,
    datePublished: post.datePublished.toISOString(),
    dateModified:
      post.dateModified?.toISOString() || post.datePublished.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: post.businessName,
      logo: {
        "@type": "ImageObject",
        url: `${post.siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.url,
    },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Per-page Service schema — attach to a service or service-in-location landing
 * page for local-SEO. `areaServed` scopes it (e.g. "Meridian, ID"); the site's
 * LocalBusiness is the provider.
 */
export function createServiceSchema(
  service: {
    name: string;
    description?: string;
    serviceType?: string;
    areaServed?: string;
    url?: string;
  },
  business: BusinessData,
  site: SiteData
): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    url: service.url,
    areaServed: service.areaServed
      ? { "@type": "City", name: service.areaServed }
      : undefined,
    provider: {
      "@type": "LocalBusiness",
      name: business.businessName,
      telephone: business.phone,
      url: site.url,
    },
  };
}

export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
