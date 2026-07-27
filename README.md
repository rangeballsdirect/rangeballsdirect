# RangeBallsDirect

Marketing site for RangeBallsDirect — range balls sourced direct from vetted factories in mainland China, imported and delivered to driving ranges and golf courses across Europe.

Astro, static output, no client framework. One page plus a 404. Hosted on Vercel at [rangeballsdirect.com](https://rangeballsdirect.com), deployed from `main`.

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
    site.ts            brand, nav, hero copy, countries, process steps, contact address
    balls.ts           the range — one entry per ball type
  layouts/Base.astro   <head>, meta, canonical, OG, JSON-LD, skip link
  components/          Nav, Hero, CountryStrip, WhyUs, BallRange, Process, Enquiry, SiteFooter, Wordmark
  pages/
    index.astro        composes the section components in order
    404.astro
    robots.txt.ts      generated so the sitemap URL follows the deploy target
  styles/global.css    design tokens, .wrap measure, section rhythm, buttons, skip link
public/                og.png, apple-touch-icon.png
test/verify.mjs        64-check end-to-end suite
```

**Content is data, not markup.** Adding, removing or reordering a ball type is an edit to `src/data/balls.ts` — the row markup and the numbering follow. Same for nav items, served countries, process steps and the contact address in `src/data/site.ts`. Nothing about the range is hand-written in a template.

**Bands are full-bleed; `.wrap` holds the measure.** Any element with a background or a rule must be the band, with a `.wrap` inside it — never the reverse. Put the max-width on the outer element and the colour stops short of the screen edge on a wide display, which is exactly how the header and footer ended up looking cut off. The suite asserts this at 1920px and 1440px.

## Deploy

Vercel builds from `main` on every push. Nothing to configure per deploy:

| Setting | Value | Why |
|---|---|---|
| Framework preset | Astro | auto-detected |
| Build command | `npm run build` | type-checks, then builds |
| Output directory | `dist` | Astro's static output |
| Install command | `npm ci` | devDependencies are needed — `astro check` lives there |

`SITE_URL` and `BASE_PATH` are deliberately **unset** on Vercel. Their defaults are `https://rangeballsdirect.com` and `/`, which is exactly right for the production domain, so canonical, `og:image`, `robots.txt` and the sitemap all resolve correctly with no environment configuration.

`npm run build` runs `astro check` first, so a type error fails the deploy rather than shipping. That is intentional.

**GitHub Pages must stay off.** The site would otherwise exist at two origins and compete with itself in search. `.github/workflows/ci.yml` is a quality gate only and never publishes.

### Deploying somewhere else, or under a sub-path

```bash
SITE_URL=https://acme.example.com BASE_PATH=/rangeballs npm run build
```

## Contact

Enquiries go to **carl@rangeballsdirect.com** — set once in `src/data/site.ts` and used by the enquiry panel, the footer and the Organization JSON-LD. Change it there and everything follows; the suite fails if any other `@rangeballsdirect.com` address survives anywhere in the markup.

**There is no form, deliberately.** A form needs somewhere to post, and a form that silently swallows enquiries loses business that email would have won. So the enquiry panel is a `mailto:` with the subject line and a short template prefilled — range, country, ball type, season volume — which gets a more useful first message than an empty textarea would.

To bring the form back once there's a working endpoint, the full version — validation, honeypot, busy state, error fallback, no-JS native POST — is in git:

```bash
git show fc5a2be:src/components/Enquiry.astro
```

## Agency credit

The footer carries one outbound link — *Web design by Lucent Digital Studio* → `https://lucentdigital.co.uk/`, configured in `credit` in `src/data/site.ts`.

Three deliberate choices, each asserted by the suite so they can't be undone by accident:

- **Apex, not `www`.** `www.lucentdigital.co.uk` 308-redirects to the apex, and the apex is what that site declares as its own canonical. Linking straight there avoids a redirect hop.
- **Followable.** `rel="noopener"` only — no `nofollow`, `sponsored` or `ugc`. It's an editorial credit, not paid placement, so it should pass equity.
- **Branded anchor with a descriptor**, not exact-match keyword stuffing, which reads as manipulation to a search engine.

It is the only outbound link on the site.

## Outstanding

**The factory photograph.** The hatched box captioned *Factory floor — Qingdao* in `WhyUs.astro` is a placeholder. Replace it with:

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
- every tap target clears 32px; no heading-level skips
- at 1920px and 1440px, every coloured band reaches both screen edges while every `.wrap` holds the 1180px measure
- no `<form>` and no orphan inputs are shipped; the enquiry panel and footer both offer email
- every `mailto:` targets the address in `site.ts`, the CTA prefills a subject and template, and no stale address survives anywhere in the markup
- every in-page anchor resolves; the JSON-LD parses; canonical and `og:image` are present
- "Enquire →" clears 4.5:1 contrast against the bone background at rest
- an unknown path returns a real 404 that is noindex, offers a route home and does not overflow
- the build emits `og.png`, `apple-touch-icon.png`, `robots.txt`, `sitemap-index.xml` and `404.html`, with CSS inlined and no `undefined` in the markup

`playwright-core` does not download browsers. The suite finds Chromium in the local Playwright cache, or set `CHROME_PATH` to any Chrome/Chromium binary. CI installs one explicitly.

## What changed from the design file

Layout, type, colour and copy follow the design. At the point of the Astro rewrite a full-page pixel diff against the design's own rendering was **zero pixels at 1280px**. Deliberate divergences since:

- **Full-bleed bands.** The design put its 1180px wrapper *outside* the coloured bands, so above 1180px the dark header, the bone range strip, the process band and the footer all stopped short with white gutters either side — at 1920px, 370px of white on each edge. Backgrounds now reach the viewport edges; the content still sits on the 1180px measure, so nothing below 1180px changed.
- **No enquiry form.** See *Contact* above.
- **Mobile layout.** The design's media query only collapsed `section > div` grids, so the hero and enquiry sections stayed two-column at 375px and the quality-control feature card kept `grid-row: 1 / 3`, leaving a hole. Both fixed, plus a two-column process row, a wrapping nav, 32px+ tap targets, tighter headings below 420px and an `overflow-x` guard.
- **Contrast.** "Enquire →" was `#e4ff00` on `#f2f2ef` — 1.1:1, invisible until the row inverted on hover. Now 5.4:1 at rest and yellow on hover, where the row is dark.
- **Footer nav.** The design's `.site nav { padding-left: 22px }` mobile rule matched the footer's `<nav>` as well as the header's, indenting the footer links by a double gutter and squeezing their gap from 26px to 14px. Scoped styles fix it.
- **Accessibility.** Skip link, `aria-hidden` on decorative marks, `aria-label` on both navs, `h4` → `h3` to close a heading-level skip, `:focus-visible` rings, `prefers-reduced-motion`.
- **SEO and social.** Canonical, `og:url`/`og:image`, `twitter:card`, `theme-color`, Organization JSON-LD listing the eight served countries, generated `robots.txt`, `sitemap-index.xml`, a rendered 1200×630 `og.png` and a 180px touch icon.
- **A 404 page** in the site's own visual language.
- **A test suite**, so none of the above silently regresses.

The page now ships **zero JavaScript** — the only `<script>` in the output is the JSON-LD block.
