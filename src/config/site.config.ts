import {
  PUBLIC_GA_MEASUREMENT_ID,
  PUBLIC_GTM_ID,
  PUBLIC_PLAUSIBLE_DOMAIN,
  PUBLIC_PLAUSIBLE_SRC,
  PUBLIC_UMAMI_WEBSITE_ID,
  PUBLIC_UMAMI_SRC,
  PUBLIC_GHL_CHAT_WIDGET_ID,
  PUBLIC_GHL_LOCATION_ID,
  PUBLIC_FORM_ADAPTER,
  PUBLIC_FORM_ENDPOINT,
  PUBLIC_META_PIXEL_ID,
  PUBLIC_GOOGLE_ADS_ID,
  PUBLIC_TIKTOK_PIXEL_ID,
} from "astro:env/client";

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  twitter?: {
    site: string;
    creator: string;
  };
  branding: {
    logo: {
      alt: string;
    };
    favicon: {
      svg: string;
    };
    colors: {
      themeColor: string;
      backgroundColor: string;
    };
  };
  analytics: {
    gaMeasurementId?: string;
    gtmId?: string;
    plausible?: { domain?: string; src?: string };
    umami?: { websiteId?: string; src?: string };
  };
  ghl: {
    chatWidgetId?: string;
    locationId?: string;
  };
  /** Default submission target for all forms (contact, newsletter, quiz). */
  forms: {
    adapter: "stub" | "webhook" | "netlify" | (string & {});
    endpoint: string;
  };
  /** Ad/marketing pixels — cookie-setting, so gated behind the consent banner. */
  marketing: {
    metaPixelId?: string;
    googleAdsId?: string;
    tiktokPixelId?: string;
  };
}

const siteConfig: SiteConfig = {
  // These are demo defaults — client-specific data lives in CMS generalSettings
  name: "Monarch Pro Wash",
  description:
    "Insured, owner-run exterior cleaning for Boise and the Treasure Valley. Pressure washing, soft washing, roof, gutter and window cleaning, with the price up front.",
  url: import.meta.env.SITE || "https://example.com",
  ogImage: "/og-default.png",
  author: "Velocity Web Studio",
  branding: {
    logo: {
      alt: "Monarch Pro Wash",
    },
    favicon: {
      svg: "/favicon.svg",
    },
    colors: {
      themeColor: "#0a1f2e",
      backgroundColor: "#0a1f2e",
    },
  },
  analytics: {
    gaMeasurementId: PUBLIC_GA_MEASUREMENT_ID,
    gtmId: PUBLIC_GTM_ID,
    plausible: {
      domain: PUBLIC_PLAUSIBLE_DOMAIN,
      src: PUBLIC_PLAUSIBLE_SRC,
    },
    umami: {
      websiteId: PUBLIC_UMAMI_WEBSITE_ID,
      src: PUBLIC_UMAMI_SRC,
    },
  },
  ghl: {
    chatWidgetId: PUBLIC_GHL_CHAT_WIDGET_ID,
    locationId: PUBLIC_GHL_LOCATION_ID,
  },
  forms: {
    adapter: PUBLIC_FORM_ADAPTER || "stub",
    endpoint: PUBLIC_FORM_ENDPOINT || "",
  },
  marketing: {
    metaPixelId: PUBLIC_META_PIXEL_ID,
    googleAdsId: PUBLIC_GOOGLE_ADS_ID,
    tiktokPixelId: PUBLIC_TIKTOK_PIXEL_ID,
  },
};

export default siteConfig;
