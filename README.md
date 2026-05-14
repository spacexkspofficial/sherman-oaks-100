# Sherman Oaks 100 — Centennial Website

A preliminary static website for the Sherman Oaks 100-year celebration
(1927–2027). Hand-built, no framework, no build step, no backend. Designed
to be hosted free on GitHub Pages and easy for a non-technical community
team to maintain.

> This is a preliminary build. Placeholder content (events, sponsors,
> committee roster, photos, dates, legal language) is clearly marked
> throughout the site and should be replaced as the centennial committee
> confirms real details.

---

## What's in here

```
/
├── index.html                  Home
├── about.html                  About the centennial
├── events.html                 Events calendar (client-side filtering)
├── history.html                History timeline
├── map.html                    Community map placeholder
├── gallery.html                Photos & media (client-side filtering)
├── sponsors.html               Sponsor tiers + interest form
├── get-involved.html           Volunteer + ways to participate
├── contact.html                Contact form + addresses
├── steering-committee.html     Volunteer leadership roster
├── civic-partners.html         Partner organizations
├── faq.html                    Frequently asked questions
├── news.html                   Update log / newsletter overflow
├── accessibility.html          Accessibility statement
├── privacy.html                Privacy policy (placeholder, needs legal review)
├── terms.html                  Terms of service (placeholder, needs legal review)
├── copyright.html              Copyright notice (placeholder, needs legal review)
├── 404.html                    Branded "not found" page
├── robots.txt                  Search-engine instructions
├── sitemap.xml                 Sitemap for crawlers
├── .nojekyll                   Tells GitHub Pages to skip Jekyll processing
├── README.md                   This file
└── assets/
    ├── css/styles.css          One stylesheet, all design tokens at the top
    └── js/main.js              One JS file, vanilla, no dependencies
```

---

## Recommended site architecture

```
Home
├─ About the Centennial
│   ├─ Steering Committee
│   └─ Civic Partners
├─ Events
├─ History (timeline)
├─ Community Map
├─ Gallery (photos + video)
├─ Sponsors / Supporters
├─ Get Involved (volunteer + partner)
├─ News & Updates
├─ FAQ
└─ Contact
Legal: Privacy · Terms · Copyright · Accessibility
```

The primary nav exposes 9 top-level pages; the rest sit one click away in
the footer or via in-page links. This keeps the main nav scannable on
mobile while still giving every page a real place to live.

---

## Local preview

Just open `index.html` in a browser. Or, from this folder, serve a quick
local web server:

```bash
# Python 3
python -m http.server 8000

# Node, if you have it
npx serve .
```

Then visit `http://localhost:8000`.

---

## Deploying on GitHub Pages

1. Push the contents of this folder to the `main` branch of your repo
   (already configured: `spacexkspofficial/sherman-oaks-100`).
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source**: *Deploy from a branch*
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Save. After about a minute, GitHub will publish the site to
   `https://<your-org>.github.io/sherman-oaks-100/`.

The included `.nojekyll` file tells GitHub Pages to skip Jekyll processing
and serve files as-is.

### Adding a custom domain

Once you've bought a domain (recommended candidates listed in this folder's
project notes — `shermanoaks100.com` is the cleanest):

1. In **Settings → Pages → Custom domain**, enter your domain
   (e.g., `shermanoaks100.com`) and save. GitHub will create a `CNAME`
   file in the repo automatically.
2. At your DNS provider, point the domain at GitHub Pages:

   **For the apex domain (`shermanoaks100.com`):** create four `A` records:

   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   **For the `www` subdomain:** create a `CNAME` record pointing to
   `<your-org>.github.io`.

3. Back on GitHub, check **Enforce HTTPS** once the certificate provisions
   (usually within minutes to a few hours).

---

## Editing content

All pages are plain HTML. Search the file for the page title or section
heading and edit inline. The most common edits:

- **Event cards** — `events.html`, look for `<article class="event-card">`.
- **Sponsor logos / names** — `sponsors.html`, look for
  `<div class="sponsor">`.
- **Timeline entries** — `history.html`, look for
  `<li class="timeline__item">`.
- **Committee members** — `steering-committee.html`, look for
  `<div class="person">`.
- **Footer / nav links** — duplicated across every page; if you change one,
  paste the same block into the others to keep them in sync.

The header and footer are intentionally duplicated across pages (not loaded
via JavaScript) so the site works without scripting and stays
search-engine-friendly. When you change them, change them in every page.

### Quick global edits

- **Year / dates** — the visible year placeholder is mostly the centennial
  year (2027). Search for `2027` and edit. The "current year" in the
  footer auto-updates via JavaScript (`<span data-year>`).
- **Email addresses** — global default is `hello@example.com`. Search and
  replace once the official centennial email is decided.
- **Brand colors / fonts** — open `assets/css/styles.css` and edit the
  `:root { ... }` block at the top. Every page picks up the change.

---

## Connecting forms (no backend required)

The contact, volunteer, sponsorship interest, and newsletter forms are all
UI mockups — they intercept submission with JavaScript and show a thank-you
message. They don't actually send anything yet. To make them real, pick a
static-site-friendly form service and paste in their endpoint.

### Recommended (free tiers):

- **[Formspree](https://formspree.io/)** — easiest drop-in. Sign up,
  create a form, paste their endpoint URL into the `action` attribute,
  change `method` to `POST`. Remove the `data-mock-form` attribute. Done.
- **[Basin](https://usebasin.com/)** — similar pattern, generous free tier.
- **[Google Forms](https://forms.google.com/)** — create the form in
  Google Forms, embed the iframe, throw away the HTML form. Lowest
  maintenance, looks slightly less integrated.
- **[Netlify Forms](https://docs.netlify.com/forms/setup/)** — only if you
  switch hosting from GitHub Pages to Netlify.
- **mailto: fallback** — change `action` to
  `mailto:hello@example.com` with `enctype="text/plain"`. Opens the
  user's email client. Always works, zero setup, looks 1998-vintage.

### Newsletter

Replace the newsletter form on the home page with an embed from:

- [Mailchimp](https://mailchimp.com/) — popular, free for small lists.
- [Beehiiv](https://beehiiv.com/) — modern, generous free tier.
- [Substack](https://substack.com/) — easiest if you also want to write
  newsletter content there.
- [EmailOctopus](https://emailoctopus.com/) — affordable, no-frills.

---

## Connecting Google Maps

The `map.html` page has a placeholder map. To replace it with a real one,
the in-file comments walk through four options:

1. **Google My Maps embed** — easiest for a curated set of pins. Create a
   map at [mymaps.google.com](https://mymaps.google.com), make it public,
   click *Embed on my site*, paste the iframe.
2. **Single-location Google Maps embed** — for one venue.
3. **OpenStreetMap embed** — no Google account required.
4. **Leaflet.js** — fully interactive, free, no API key, works perfectly
   on GitHub Pages. See [leafletjs.com](https://leafletjs.com/).

Each option is a paste-in replacement for the `.map-wrap` block.

---

## What the board needs to provide

A short checklist of decisions and content needed before this site is
launch-ready in public. Most of these can be filled in incrementally:

- [ ] Official centennial name confirmation
- [ ] Final centennial seal / logo (current SVG is a placeholder design)
- [ ] Official domain name (recommend `shermanoaks100.com`)
- [ ] Confirmed centennial year and primary dates
- [ ] Confirmed marquee event list (replaces placeholders in `events.html`)
- [ ] Verified history milestones with sources (`history.html`)
- [ ] Historical photographs / images with usage rights
- [ ] Sponsor list at confirmed tiers (`sponsors.html`)
- [ ] Steering committee roster with consent to be listed by name
- [ ] Civic partner roster with consent to be listed
- [ ] Official centennial email address and routing
- [ ] Legal review of `privacy.html`, `terms.html`, `copyright.html`
- [ ] Real map data (Google My Maps or coordinate list)
- [ ] Newsletter service decision (Mailchimp / Beehiiv / Substack / etc.)
- [ ] Form service decision (Formspree / Basin / Google Forms / etc.)
- [ ] Social media handles for footer links
- [ ] Fiscal sponsor / 501(c)(3) arrangement for donations

---

## Open-source acknowledgments

- **Fonts** — [Fraunces](https://fonts.google.com/specimen/Fraunces) and
  [Inter](https://fonts.google.com/specimen/Inter), served from Google
  Fonts under the SIL Open Font License.
- **Tech** — HTML, CSS, and vanilla JavaScript. No frameworks, no build
  step, no paid dependencies.

---

## License

Site code is released to the Sherman Oaks 100 Centennial Committee for
use in the centennial year and afterward. Content (text, branding) is
© the Sherman Oaks 100 Centennial Committee unless otherwise credited.
See `copyright.html` for details.
