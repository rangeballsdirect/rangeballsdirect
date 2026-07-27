# RangeBallsDirect

Marketing site for RangeBallsDirect — range balls sourced direct from vetted factories in mainland China, imported and delivered to driving ranges and golf courses across Europe.

Astro, static output, no client framework. One page plus a 404. Deploys to GitHub Pages on every push to `main`.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check, then build to dist/
npm test         # build, then run the end-to-end suite
```

## Structure

```
src/
  data/
    site.ts            brand, nav, hero copy, countries, process steps, form endpoint
    balls.ts           the range — one entry per ball type
  layouts/Base.astro   <head>, meta, canonical, OG, JSON-LD, skip link
  components/          Nav, Hero, CountryStrip, WhyUs, BallRange, Process, Enquiry, SiteFooter, Wordmark
  pages/
    index.astro        composes the section components in order
    404.astro
    robots.txt.ts      generated so the sitemap URL follows the deploy target
  styles/global.css    design tokens, section rhythm, buttons, skip link
public/                og.png, apple-touch-icon.png, .nojekyll
test/verify.mjs        44-check end-to-end suite
```

**Content is data, not markup.** Adding, removing or reordering a ball type is an edit to `src/data/balls.ts` — the row markup, the numbering and the enquiry-form prefill all follow. Same for nav items, served countries and process steps in `src/data/site.ts`. Nothing about the range is hand-written in a template.

## Deploy

1. Create an empty repo on GitHub (no README, no `.gitignore`).
2. Push:

```bash
cd /c/dev/rangeballsdirect && git remote add origin https://github.com/<owner>/<repo>.git && git push -u origin main
```

3. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

The workflow type-checks, runs the suite, then builds and publishes. `SITE_URL` and `BASE_PATH` come from `actions/configure-pages`, so the same commit is correct on `https://<owner>.github.io/<repo>/` or on a custom domain — canonical, OG image, sitemap and asset paths all follow. Nothing to edit when the domain changes.

### Custom domain

Add a `CNAME` file to `public/` containing the domain, point DNS at GitHub Pages, then set the domain under Settings → Pages.

### Building for a sub-path locally

```bash
SITE_URL=https://acme.github.io BASE_PATH=/rangeballsdirect npm run build
```

## Before it goes live — two things

**1. The enquiry form.** It posts to [FormSubmit](https://formsubmit.co) at the address in `src/data/site.ts` — no account, no key. It stays inert until someone at that address clicks the one-time activation email FormSubmit sends on the first submission. Send one test enquiry from the live site, activate, done.

To point it elsewhere (Formspree, a serverless function, a CRM webhook), change `formEndpoint` and `formEndpointAjax` in `src/data/site.ts`. `formEndpoint` is the `action` used when JS is off; `formEndpointAjax` takes the JSON `fetch`. Set `formEndpointAjax` to `''` to disable the fetch and let the native POST handle everything.

**2. The factory photograph.** The hatched box captioned *Factory floor — Qingdao* in `WhyUs.astro` is a placeholder. Replace it with:

```astro
<img src="/factory-floor.jpg" alt="…" class="card__media" style="object-fit:cover;width:100%" />
```

## Test

```bash
npm test              # build, then verify
npm test -- --shots   # also write full-page screenshots to test/shots/
```

Serves `dist/` over HTTP and drives real Chromium at 1280px and 375px:

- no horizontal overflow and no element past the viewport edge at either width — including while a range row is hovered and expanding its padding
- every grid collapses correctly on mobile and stays expanded on desktop
- every tap target clears 32px; every field has a label; no heading-level skips
- the enquiry form's three validation gates fire in order and move focus to the offending field
- a successful submit POSTs every field and swaps in the success panel
- a failed submit restores the button and surfaces the mailto fallback
- clicking a ball type prefills the message
- every in-page anchor resolves; the JSON-LD parses; canonical and `og:image` are present
- "Enquire →" clears 4.5:1 contrast against the bone background at rest
- an unknown path returns a real 404 that is noindex, offers a route home and does not overflow
- the build emits `og.png`, `apple-touch-icon.png`, `robots.txt`, `sitemap-index.xml` and `404.html`, with CSS inlined and no `undefined` in the markup

`playwright-core` does not download browsers. The suite finds Chromium in the local Playwright cache, or set `CHROME_PATH` to any Chrome/Chromium binary. CI installs one explicitly.

## What changed from the design file

The design was implemented as-is — layout, type, colour and copy are unchanged. A full-page pixel diff against the design's own rendering is **zero pixels at 1280px**; the only difference at 375px is the footer link row, noted below.

Production work layered on top:

- **Mobile layout.** The design's media query only collapsed `section > div` grids, so the hero and enquiry sections stayed two-column at 375px and the quality-control feature card kept `grid-row: 1 / 3`, leaving a hole. Both fixed, plus a two-column process row, a wrapping nav, 32px+ tap targets, tighter headings below 420px and an `overflow-x` guard.
- **A real form.** Was a click handler on a `<button type="button">` with a `// TODO: POST` comment — no `<form>`, so no Enter-key submit and nothing to post. Now a genuine form with `required`, `type="email"`, `autocomplete`, a honeypot, a busy state, a network error path that falls back to the mailto address, and a native POST when JS is off.
- **Accessibility.** Skip link, `for`/`id` label pairing, `role="alert"` on the error, `role="status"` plus a focus move on success, `aria-hidden` on decorative marks, `aria-label` on both navs, `h4` → `h3` to close a heading-level skip, `:focus-visible` rings, `prefers-reduced-motion`.
- **Contrast.** "Enquire →" was `#e4ff00` on `#f2f2ef` — 1.1:1, invisible until the row inverted on hover. Now 5.4:1 at rest and yellow on hover, where the row is dark.
- **Footer nav.** The design's `.site nav { padding-left: 22px }` mobile rule matched the footer's `<nav>` as well as the header's, indenting the footer links by a double gutter and squeezing their gap from 26px to 14px. Scoped styles fix it; this is the one intentional visual difference at 375px.
- **SEO and social.** Canonical, `og:url`/`og:image`, `twitter:card`, `theme-color`, Organization JSON-LD listing the eight served countries, generated `robots.txt`, `sitemap-index.xml`, a rendered 1200×630 `og.png` and a 180px touch icon.
- **One interaction.** Clicking a ball type in the range table prefills the enquiry message with that ball's name.
- **A 404 page** in the site's own visual language.
- **A test suite**, so none of the above silently regresses.
