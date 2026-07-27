// End-to-end checks for index.html: responsive layout, form behaviour, links, a11y, metadata.
//   npm test            run the suite
//   npm test -- --shots write full-page screenshots to test/shots/
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const URL = pathToFileURL(join(ROOT, 'index.html')).href;
const WANT_SHOTS = process.argv.includes('--shots');
const SHOT = join(ROOT, 'test', 'shots');
if (WANT_SHOTS) mkdirSync(SHOT, { recursive: true });

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
  const enq = await cols('#enq-2a > div');
  const qcRow = await page.$eval('#qc-2a [style*="grid-row"]', el => getComputedStyle(el).gridRowStart);
  const proc = await cols('#proc-2a > div[style*="grid-template-columns"]');
  const formGrid = await cols('#enq-2a div[style*="grid-template-columns:1fr 1fr"]');
  const rowCols = await cols('a[data-ball]');

  if (tag === 'mobile') {
    ok(hero === 1, `mobile: hero collapses to 1 col (got ${hero})`);
    ok(enq === 1, `mobile: enquiry section collapses to 1 col (got ${enq})`);
    ok(formGrid === 1, `mobile: form fields collapse to 1 col (got ${formGrid})`);
    ok(qcRow === 'auto', `mobile: qc feature card grid-row reset to auto (got ${qcRow})`);
    ok(proc === 2, `mobile: process row is 2 col (got ${proc})`);
    ok(rowCols === 3, `mobile: range rows are 3 col (got ${rowCols})`);
    const descVisible = await page.$eval('a[data-ball] span:nth-child(3)', el => getComputedStyle(el).display);
    ok(descVisible === 'none', `mobile: range row description hidden (got ${descVisible})`);
    // hovered range row must not overflow
    await page.hover('a[data-ball]');
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

// --- behaviour: form ---
console.log('\n=== form behaviour ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });
  let posted = null;
  await page.route('https://formsubmit.co/**', async route => {
    posted = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
  });

  // validation gates
  await page.click('#enqSubmit');
  ok(await page.isVisible('#enqErr'), 'empty submit shows an error');
  ok((await page.textContent('#enqErr')).includes('name'), 'first error names the missing field');
  ok(await page.evaluate(() => document.activeElement.id) === 'f-name', 'focus moves to the offending field');

  await page.fill('#f-name', 'Jane Doe');
  await page.click('#enqSubmit');
  ok((await page.textContent('#enqErr')).includes('range or course'), 'second gate: org required');

  await page.fill('#f-org', 'Fairway Driving Range');
  await page.fill('#f-email', 'not-an-email');
  await page.click('#enqSubmit');
  ok((await page.textContent('#enqErr')).includes('valid email'), 'third gate: email must be valid');

  // range-row prefill
  await page.click('a[data-ball="Floater"]');
  ok((await page.inputValue('#f-msg')).includes('Floater'), 'clicking a ball type prefills the message');

  await page.fill('#f-email', 'jane@fairway.com');
  await page.fill('#f-country', 'Germany');
  await page.click('#enqSubmit');
  await page.waitForSelector('#enqDone', { state: 'visible', timeout: 5000 });
  ok(!!posted, 'submit POSTs to the endpoint');
  ok(posted && posted.name === 'Jane Doe' && posted.email === 'jane@fairway.com' && posted.country === 'Germany'
     && posted.msg.includes('Floater'), 'payload carries every field ' + JSON.stringify(posted));
  ok(await page.isHidden('#enqLive'), 'form hides on success');
  ok((await page.textContent('#doneName')) === 'Jane Doe', 'success panel greets by name');
  await page.close();
}

// --- behaviour: network failure falls back to the email address ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });
  await page.route('https://formsubmit.co/**', r => r.abort());
  await page.fill('#f-name', 'Jane');
  await page.fill('#f-org', 'Fairway');
  await page.fill('#f-email', 'jane@fairway.com');
  await page.click('#enqSubmit');
  await page.waitForTimeout(600);
  const msg = await page.textContent('#enqErr');
  ok(msg.includes('hello@rangeballsdirect.com'), 'network failure surfaces the mailto fallback');
  ok(await page.isEnabled('#enqSubmit'), 'button is re-enabled after a failure');
  ok((await page.textContent('#enqSubmit')).includes('Send enquiry'), 'button label restored after a failure');
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
  const unlabelled = await page.evaluate(() => [...document.querySelectorAll('input:not([type=hidden]):not(.hp),textarea')]
    .filter(el => !el.labels || el.labels.length === 0).map(el => el.name));
  ok(unlabelled.length === 0, `every field has a label ${JSON.stringify(unlabelled)}`);

  // "Enquire →" sits on the bone background at rest — it must stay legible there.
  const ratio = await page.$eval('.enq-tag', el => {
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

await browser.close();
console.log('\n' + (fails.length ? 'FAILED: ' + fails.length + '\n- ' + fails.join('\n- ') : 'ALL CHECKS PASSED'));
process.exit(fails.length ? 1 : 0);
