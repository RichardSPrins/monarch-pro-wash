// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import markdoc from '@astrojs/markdoc';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';
import { sectionBuilder } from './plugins/section-builder/register.mjs';

// `site` is resolved at BUILD time (canonical tags, sitemap, robots, JSON-LD all
// bake it in), so a runtime `vars` entry in wrangler.jsonc cannot supply it — the
// production default below is what actually ships unless SITE_URL is exported
// into the build environment.
const PROD_SITE = 'https://www.monarchprowashidaho.com';
const SITE_URL = process.env.SITE_URL;
const isDev = process.argv.some((a) => a === 'dev');
if (!SITE_URL && process.argv.some((a) => a === 'build')) {
  console.warn(
    `\n\x1b[33mℹ  SITE_URL is not set\x1b[0m — using the production default ${PROD_SITE}` +
      '\n   for canonical/sitemap/robots/JSON-LD. Export SITE_URL to build for another host.\n',
  );
}
// In dev, default `site` to localhost so EmDash's absolute admin/login redirects
// stay on the local http server (otherwise they point at the prod domain).
const SITE = SITE_URL || (isDev ? 'http://localhost:4321' : PROD_SITE);

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
      // Autopilot (autopilotapp.io) CRM — server-side lead delivery via /api/lead.
      // Unset → /api/lead stays log-only. Source id is the "Website" lead source.
      // Zolato public leads API. Bearer key, so it is a secret and must be set
      // with `wrangler secret put`, never in wrangler.jsonc `vars`, which is
      // committed.
      ZOLATO_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
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
    // NOTE: @astrojs/sitemap is intentionally NOT used. Under `output: 'server'`
    // it only sees statically-known routes, so it emitted a sitemap with just
    // /blog, /estimate, /magnet-demo and /search — none of the ~240 CMS pages.
    // src/pages/sitemap.xml.ts builds the real one from the CMS at request time.
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