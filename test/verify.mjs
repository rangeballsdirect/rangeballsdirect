// End-to-end checks against the built site in dist/: responsive layout, form
// behaviour, links, accessibility and metadata.
//
//   npm test              build, then run the suite
//   npm test -- --shots   also write full-page screenshots to test/shots/
//
// Serves dist/ over HTTP rather than opening it via file://, because Astro's
// script bundle is referenced by an absolute path.
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createServer } from 'node:http';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');
const WANT_SHOTS = process.argv.includes('--shots');
const EMAIL = 'carl@rangeballsdirect.com';
const SHOT = join(ROOT, 'test', 'shots');
if (WANT_SHOTS) mkdirSync(SHOT, { recursive: true });

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html is missing — run `npx astro build` first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
};

const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    const notFound = join(DIST, '404.html');
    if (existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end(readFileSync(notFound));
    }
    return res.writeHead(404).end();
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const URL = ORIGIN + '/';

// playwright-core does not download browsers. Use CHROME_PATH, else the newest
// build in the Playwright cache, else fall back to a system Chrome install.
function resolveChrome() {
  if (process.env.CHROME_PATH) return { executablePath: process.env.CHROME_PATH };
  const cache = process.platform === 'win32'
    ? join(homedir(), 'AppData', 'Local', 'ms-playwright')
    : process.platform === 'darwin'
      ? join(homedir(), 'Library', 'Caches', 'ms-playwright')
      : join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(cache)) {
    const build = readdirSync(cache)
      .filter(d => /^chromium-\d+$/.test(d))
      .sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
    if (build) {
      for (const rel of ['chrome-win64/chrome.exe', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-linux/chrome']) {
        const p = join(cache, build, ...rel.split('/'));
        if (existsSync(p)) return { executablePath: p };
      }
    }
  }
  return { channel: 'chrome' };
}

const browser = await chromium.launch(resolveChrome());
const fails = [];
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fails.push(m); };

for (const [w, h, tag] of [[1280, 900, 'desktop'], [375, 812, 'mobile']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'load' });

  console.log(`\n=== ${tag} ${w}x${h} ===`);
  ok(errors.length === 0, `${tag}: no console/page errors ${errors.join(' | ')}`);

  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(scrollW <= w, `${tag}: no horizontal overflow (scrollWidth ${scrollW} <= ${w})`);

  // any element wider than the viewport?
  const wide = await page.evaluate(vw => [...document.querySelectorAll('body *')]
    .filter(el => el.getBoundingClientRect().right > vw + 1)
    .slice(0, 5).map(el => el.tagName + '.' + el.className + ' r=' + Math.round(el.getBoundingClientRect().right)), w);
  ok(wide.length === 0, `${tag}: nothing overflows the viewport ${JSON.stringify(wide)}`);

  const cols = async sel => page.$eval(sel, el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  const hero = await cols('#main');
  const enq = await cols('.enquiry__grid');
  const qcRow = await page.$eval('.card--feature', el => getComputedStyle(el).gridRowStart);
  const proc = await cols('.process__grid');
  const rowCols = await cols('.row');

  if (tag === 'mobile') {
    ok(hero === 1, `mobile: hero collapses to 1 col (got ${hero})`);
    ok(enq === 1, `mobile: enquiry section collapses to 1 col (got ${enq})`);
    ok(qcRow === 'auto', `mobile: qc feature card grid-row reset to auto (got ${qcRow})`);
    ok(proc === 2, `mobile: process row is 2 col (got ${proc})`);
    ok(rowCols === 3, `mobile: range rows are 3 col (got ${rowCols})`);
    const descVisible = await page.$eval('.row__blurb', el => getComputedStyle(el).display);
    ok(descVisible === 'none', `mobile: range row description hidden (got ${descVisible})`);
    // hovered range row must not overflow
    await page.hover('.row');
    await page.waitForTimeout(300);
    const sw2 = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw2 <= w, `mobile: no overflow while a range row is hovered (${sw2})`);
    // tap targets
    const small = await page.evaluate(() => [...document.querySelectorAll('a,button,input,textarea')]
      .filter(el => !el.classList.contains('hp') && !el.classList.contains('skip'))
      .map(el => ({ t: el.tagName + (el.className ? '.' + el.className : ''), r: el.getBoundingClientRect() }))
      .filter(o => o.r.width > 0 && o.r.height > 0 && o.r.height < 32).map(o => o.t + ' h=' + Math.round(o.r.height)));
    ok(small.length === 0, `mobile: all tap targets >= 32px tall ${JSON.stringify(small)}`);
  } else {
    ok(hero === 2, `desktop: hero is 2 col (got ${hero})`);
    ok(proc === 5, `desktop: process row is 5 col (got ${proc})`);
    ok(rowCols === 4, `desktop: range rows are 4 col (got ${rowCols})`);
    ok(qcRow === '1', `desktop: qc feature card spans rows (got ${qcRow})`);
  }

  if (WANT_SHOTS) {
    await page.mouse.move(0, 0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(SHOT, tag + '.png'), fullPage: true, animations: 'disabled' });
  }
  await page.close();
}

// --- contact route ---
// There is no form until there is somewhere for it to post. A form that
// silently swallows enquiries loses business; email does not.
console.log('\n=== contact ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });

  ok(await page.$('form') === null, 'no form is shipped while there is nowhere to post');
  ok(await page.$('input, textarea') === null, 'no orphan inputs left behind');

  const links = await page.$$eval('a[href^="mailto:"]', els => els.map(a => a.getAttribute('href')));
  ok(links.length >= 2, `enquiry panel and footer both offer email (found ${links.length})`);
  ok(links.every(h => h.startsWith(`mailto:${EMAIL}`)), `every mailto targets ${EMAIL}: ${JSON.stringify(links)}`);

  const prefilled = links.find(h => h.includes('subject='));
  ok(!!prefilled, 'the enquiry CTA prefills a subject line');
  ok(!!prefilled && decodeURIComponent(prefilled).includes('Range or course:'),
     'the enquiry CTA prefills the details a useful enquiry needs');

  const shown = (await page.textContent('.panel__address')).trim();
  ok(shown === EMAIL, `the address is also shown as readable text (got ${shown})`);

  // Nothing may still point at a retired address.
  const found = await page.evaluate(() => document.body.innerHTML.match(/[\w.+-]+@rangeballsdirect\.com/g) ?? []);
  const unique = [...new Set(found)];
  ok(unique.every(a => a === EMAIL), `no stale address anywhere: ${JSON.stringify(unique)}`);
  await page.close();
}

// --- anchors + head ---
console.log('\n=== links & metadata ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });
  const broken = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
    .map(a => a.getAttribute('href')).filter(h => h !== '#' && !document.querySelector(h)));
  ok(broken.length === 0, `every in-page anchor resolves ${JSON.stringify(broken)}`);
  const ld = await page.$eval('script[type="application/ld+json"]', el => el.textContent);
  let parsed = null; try { parsed = JSON.parse(ld); } catch {}
  ok(parsed && parsed['@type'] === 'Organization', 'JSON-LD parses as Organization');
  ok(await page.$('link[rel=canonical]') !== null, 'canonical present');
  ok(await page.$('meta[property="og:image"]') !== null, 'og:image present');
  const h = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e => +e.tagName[1]));
  let skips = []; for (let i = 1; i < h.length; i++) if (h[i] - h[i - 1] > 1) skips.push(h[i - 1] + '->' + h[i]);
  ok(skips.length === 0, `no heading-level skips ${JSON.stringify(skips)} seq=${h.join(',')}`);
  // "Enquire →" sits on the bone background at rest — it must stay legible there.
  const ratio = await page.$eval('.row__cta', el => {
    const rgb = s => s.match(/[\d.]+/g).map(Number);
    const lum = ([r, g, b]) => { const f = c => (c /= 255) <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
      return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const cs = getComputedStyle(el);
    const fg = rgb(cs.color), a = parseFloat(cs.opacity);
    let bgEl = el, bg = [255, 255, 255];
    while (bgEl) { const c = getComputedStyle(bgEl).backgroundColor;
      if (c && !c.includes('rgba(0, 0, 0, 0)')) { bg = rgb(c).slice(0, 3); break; } bgEl = bgEl.parentElement; }
    const eff = fg.slice(0, 3).map((c, i) => c * a + bg[i] * (1 - a));
    const [l1, l2] = [lum(eff), lum(bg)].sort((x, y) => y - x);
    return Math.round(((l1 + .05) / (l2 + .05)) * 100) / 100;
  });
  ok(ratio >= 4.5, `"Enquire →" meets 4.5:1 against its background at rest (got ${ratio}:1)`);
  await page.close();
}

// --- full-bleed bands on a wide display ---
// The design's 1180px wrapper sat outside the coloured bands, so on anything
// wider the dark header, process strip and footer stopped short with white
// gutters either side. Backgrounds must reach both edges; the measure must not.
console.log('\n=== full bleed ===');
for (const w of [1920, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });

  const bands = await page.evaluate(() =>
    ['.masthead', '#delivery', '#range', 'footer'].map(sel => {
      const el = document.querySelector(sel);
      const r = el.getBoundingClientRect();
      return { sel, left: Math.round(r.left), right: Math.round(r.right) };
    }));

  for (const b of bands)
    ok(b.left <= 0 && b.right >= w,
       `${w}px: ${b.sel} reaches both edges (left ${b.left}, right ${b.right} vs ${w})`);

  // ...while the content inside stays on the 1180px measure.
  const wraps = await page.evaluate(() =>
    [...document.querySelectorAll('.wrap')].map(el => Math.round(el.getBoundingClientRect().width)));
  ok(wraps.length > 0 && wraps.every(x => x === 1180),
     `${w}px: every .wrap holds the 1180px measure ${JSON.stringify([...new Set(wraps)])}`);

  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= w, `${w}px: no horizontal overflow (${sw})`);

  if (WANT_SHOTS) await page.screenshot({ path: join(SHOT, `wide-${w}.png`), clip: { x: 0, y: 0, width: w, height: 800 } });
  await page.close();
}

// --- the 404 route ---
console.log('\n=== 404 ===');
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const res = await page.goto(ORIGIN + '/no-such-page', { waitUntil: 'load' });
  ok(res.status() === 404, `unknown path returns 404 (got ${res.status()})`);
  ok((await page.title()).includes('not found'), 'the 404 page is served, not a bare error');
  ok(await page.$('meta[name=robots][content*=noindex]') !== null, '404 is noindex');
  const home = await page.getAttribute('.btn', 'href');
  ok(!!home, `404 offers a route home (href=${home})`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 375, `404 does not overflow at 375px (got ${sw})`);
  await page.close();
}

// --- build output ---
console.log('\n=== build output ===');
{
  for (const f of ['og.png', 'apple-touch-icon.png', 'robots.txt', 'sitemap-index.xml', '404.html'])
    ok(existsSync(join(DIST, f)), `dist/${f} exists`);

  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  ok(!/<link[^>]+rel="stylesheet"/.test(html), 'CSS is inlined — no render-blocking stylesheet');
  ok(!html.includes('undefined'), 'no "undefined" leaked into the markup');
}

await browser.close();
server.close();
console.log('\n' + (fails.length ? 'FAILED: ' + fails.length + '\n- ' + fails.join('\n- ') : 'ALL CHECKS PASSED'));
process.exit(fails.length ? 1 : 0);
