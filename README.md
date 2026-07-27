# RangeBallsDirect

Single-page marketing site for RangeBallsDirect — range balls sourced direct from vetted factories in mainland China, imported and delivered to driving ranges and golf courses across Europe.

Static HTML. No build step, no dependencies, no framework. Deploys to GitHub Pages on every push to `main`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole site — markup, styles and enquiry-form script, all inline |
| `404.html` | Branded not-found page (GitHub Pages serves this automatically) |
| `og.png` | 1200×630 social share card |
| `apple-touch-icon.png` | 180×180 iOS home-screen icon |
| `robots.txt` / `sitemap.xml` | Crawl directives |
| `.nojekyll` | Stops GitHub Pages running the files through Jekyll |
| `test/verify.mjs` | 34-check end-to-end suite (layout, form, links, a11y, metadata) |
| `.github/workflows/deploy.yml` | Runs the suite, then deploys to Pages on `main` |

## Test

```bash
cd /c/dev/rangeballsdirect && npm install && npm test
```

Drives real Chromium against `index.html` at 1280px and 375px and asserts:

- no horizontal overflow and no element past the viewport edge, at either width — including while a range row is hovered and expanding its padding
- every grid collapses correctly on mobile, and stays expanded on desktop
- every tap target clears 32px; every field has a label; no heading-level skips
- the enquiry form's three validation gates fire in order and move focus to the offending field
- a successful submit POSTs every field and swaps in the success panel
- a failed submit restores the button and surfaces the mailto fallback
- clicking a ball type prefills the message
- every in-page anchor resolves, the JSON-LD parses, canonical and `og:image` are present
- "Enquire →" clears 4.5:1 contrast against the bone background at rest

`npm test -- --shots` also writes full-page screenshots to `test/shots/`.

The suite uses `playwright-core`, which does not download browsers. It finds Chromium in the local Playwright cache, or set `CHROME_PATH` to any Chrome/Chromium binary. CI installs one explicitly.

## Deploy

1. Create an empty repo on GitHub (no README, no `.gitignore`).
2. Push:

```bash
cd /c/dev/rangeballsdirect && git remote add origin https://github.com/<owner>/<repo>.git && git push -u origin main
```

3. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. The workflow runs on the next push and publishes to `https://<owner>.github.io/<repo>/`.

### Custom domain

Add a `CNAME` file containing `rangeballsdirect.com`, point the DNS at GitHub Pages, then set the domain under Settings → Pages.

## Before it goes live — three things to change

**1. The domain.** Every absolute URL currently points at `https://rangeballsdirect.com/`. If the live address differs, update it in:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, and the `url` field in the JSON-LD block
- `robots.txt` — the `Sitemap:` line
- `sitemap.xml` — the `<loc>` value

**2. The enquiry form.** It posts to [FormSubmit](https://formsubmit.co) at `hello@rangeballsdirect.com` — no account, no key. It stays inert until someone at that address clicks the one-time activation email FormSubmit sends on the first submission. Send one test enquiry from the live site, activate, done.

To point it somewhere else (Formspree, a Vercel function, a CRM webhook), change both:

- `ENDPOINT` at the top of the `<script>` block — the JSON `fetch` path used when JS is on
- the `action` attribute on `<form id="enqForm">` — the no-JS fallback, which posts a normal form encoding

Set `ENDPOINT` to `''` to disable the fetch entirely and let the native form POST handle it.

**3. The two placeholder images.** The hatched box captioned *Factory floor — Qingdao* is a placeholder. Swap it for a real photograph:

```html
<img src="/factory-floor.jpg" alt="…" style="height:184px;width:100%;object-fit:cover;border-radius:12px;margin-top:auto">
```

## What was added on top of the design

The design file was implemented as-is — layout, type, colour and copy are unchanged. Production work layered on top:

- **Mobile layout fixed.** The design's media query only collapsed `section > div` grids, so the hero and enquiry sections stayed two-column on a phone and the "why us" feature card kept its `grid-row: 1 / 3` span, leaving a hole. Both fixed, plus a two-column process row, a wrapping nav, tighter headline sizes below 420px and an `overflow-x` guard. Verified at 375px.
- **A real form.** Was a click handler on a `<button type="button">` with a `// TODO: POST` comment — no `<form>`, so no Enter-key submit and nothing to post. Now a genuine `<form>` with `required`, `type="email"`, `autocomplete`, a honeypot, a busy state, a network error path that falls back to the mailto address, and a no-JS native POST.
- **Accessibility.** Skip link, `for`/`id` label pairing, `role="alert"` on the error, `role="status"` + focus move on success, `aria-hidden` on decorative marks, `aria-label` on both navs, `h4` → `h3` to fix the heading-level skip, `:focus-visible` rings, `prefers-reduced-motion`.
- **SEO and social.** Canonical, `og:url`/`og:image`/`twitter:card`, `theme-color`, Organization JSON-LD with the eight served countries, `robots.txt`, `sitemap.xml`.
- **One contrast fix.** "Enquire →" was `#e4ff00` on the `#f2f2ef` range background — 1.1:1, invisible until the row inverted on hover. It now sits at 5.4:1 at rest and turns yellow on hover, where the row is dark and the yellow reads.
- **One interaction.** Clicking a ball type in the range table prefills the enquiry message with that ball's name.
- **Footer links.** Were inert `<span>`s; now anchors to the matching sections.
- **A test suite**, so none of the above silently regresses.
