import type { APIRoute } from 'astro';

// Generated rather than static so the sitemap URL tracks SITE_URL / BASE_PATH.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const path = `${base.endsWith('/') ? base : `${base}/`}sitemap-index.xml`;
  const sitemap = new URL(path, site ?? 'https://rangeballsdirect.com').href;

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
