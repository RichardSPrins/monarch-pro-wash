// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';
import { sectionBuilder } from './plugins/section-builder/register.mjs';

// Loud warning if a production build runs without SITE_URL — canonical, sitemap,
// robots, and JSON-LD would otherwise all point at https://example.com.
const SITE_URL = process.env.SITE_URL;
const isDev = process.argv.some((a) => a === 'dev');
if (!SITE_URL && process.argv.some((a) => a === 'build')) {
  console.warn(
    '\n\x1b[33m⚠  SITE_URL is not set\x1b[0m — canonical/sitemap/robots/JSON-LD will use https://example.com.' +
      '\n   Set SITE_URL in your deploy environment before shipping this site.\n',
  );
}
// In dev, default `site` to localhost so EmDash's absolute admin/login redirects
// stay on the local http server (otherwise they point at the prod placeholder).
const SITE = SITE_URL || (isDev ? 'http://localhost:4321' : 'https://monarch-pro-wash.extensiblmedia.workers.dev');

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),

  site: SITE,

  env: {
    schema: {
      SITE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      // Plausible (self-hostable): domain + optional script src (defaults to plausible.io)
      PUBLIC_PLAUSIBLE_DOMAIN: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_PLAUSIBLE_SRC: envField.string({ context: 'client', access: 'public', optional: true }),
      // Umami (self-hostable): website id + script src (your Umami instance)
      PUBLIC_UMAMI_WEBSITE_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_UMAMI_SRC: envField.string({ context: 'client', access: 'public', optional: true }),
      // Forms / CRM: how contact, newsletter, and quiz forms submit
      PUBLIC_FORM_ADAPTER: envField.string({ context: 'client', access: 'public', optional: true, default: 'stub' }),
      PUBLIC_FORM_ENDPOINT: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
      // Ad / marketing pixels (cookie-setting) — gated behind the consent banner
      PUBLIC_META_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_ADS_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_TIKTOK_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      GOOGLE_SITE_VERIFICATION: envField.string({ context: 'client', access: 'public', optional: true }),
      BING_SITE_VERIFICATION: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_MAPS_API_KEY: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
      PUBLIC_GHL_CHAT_WIDGET_ID: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
      PUBLIC_GHL_LOCATION_ID: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
    },
  },

  image: {
    layout: 'constrained',
  },

  integrations: [
    react(),
    // D1 + R2 for both dev and prod. `astro dev` runs under the Cloudflare
    // adapter's workerd emulation, which serves a local (miniflare) D1 + R2 from
    // the wrangler.jsonc bindings — so there is no Node-native SQLite dev path.
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      plugins: [/** @type {any} */ (sectionBuilder())],
    }),
    markdoc(),
    sitemap({
      // Keep internal/dev preview pages out of the sitemap (they are noindex).
      filter: (page) => !/\/(sections|components|section-preview)(\/|$)/.test(page),
    }),
    icon(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});