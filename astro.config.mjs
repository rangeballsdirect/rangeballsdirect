// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Both values are environment-driven so the same commit deploys to a project
 * Pages URL (https://<owner>.github.io/<repo>/) or a custom domain unchanged.
 *
 *   SITE_URL   absolute origin the canonical, OG and sitemap URLs are built from
 *   BASE_PATH  sub-path the site is served under; '/' for a custom domain
 */
const site = process.env.SITE_URL || 'https://rangeballsdirect.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // One page, one request. No render-blocking stylesheet.
    inlineStylesheets: 'always',
  },
});
