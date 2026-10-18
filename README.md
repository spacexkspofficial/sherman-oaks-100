# Sherman Oaks 100

The community website for Sherman Oaks' 2027 centennial: events, neighborhood history, then-and-now photographs, an interactive map, sponsorship information, and ways to get involved.

The site is built with HTML, CSS, and vanilla JavaScript and is designed for GitHub Pages. Files in this repository are the deployable site; there is no package install, build step, application server, or database.

- [Contribution guide](CONTRIBUTING.md): workflow, editing conventions, and validation.
- [Agent instructions](AGENTS.md): where coding agents should start and what to preserve.
- [Website](https://shermanoaks100.com/): the custom domain recorded in `CNAME`.

## Run locally

Clone the repository, enter its root, and serve it with Python 3:

```sh
git clone https://github.com/spacexkspofficial/sherman-oaks-100.git
cd sherman-oaks-100
python -m http.server 8012 --bind 127.0.0.1
```

Open [the local preview](http://127.0.0.1:8012/index.html). On Windows, `py -3` can replace `python`. Stop the server with Ctrl+C. If you already have a checkout, run the server from the directory containing `index.html`.

Serve the site over HTTP: opening HTML through `file://` will not reliably load the map's JSON. The preview screen uses the `SITE_PASSWORD` value in [main.js](assets/js/main.js) and remembers access in browser local storage. This is a client-side presentation gate; it does not protect published files. Without JavaScript, each full page shows a `<noscript>` preview notice instead of a blank screen. The notice hides itself on any page without the `auth-required` class, so removing that class (and the gate code) makes every page readable without JavaScript; delete the notices at the same time.

Python is only needed for this preview command. Node.js is optional for the checks in [CONTRIBUTING.md](CONTRIBUTING.md#validation). External fonts, map tiles, and consented analytics require an internet connection.

## Repository layout

| Path | Responsibility |
| --- | --- |
| [index.html](index.html) | Main scrolling page: About, Events, History, Map, Stories, Support, Get involved, FAQ, and Contact. Sponsorship is a short overview with three links and one contact panel. |
| `sponsorship-series.html`, `sponsorship-events.html`, `sponsorship-centennial.html` | Full sponsorship prices, benefits, comparison table, event levels, special opportunities, and organizer contacts. Keep detailed sponsorship content on these pages. |
| [assets/docs/sherman-oaks-100-sponsorship.pdf](assets/docs/sherman-oaks-100-sponsorship.pdf) | Public two-page sponsorship flyer, linked from all three sponsorship pages. Its page-1 service-day date matches page 2 (Saturday, April 24). It declares English but has no screen-reader tags, so the HTML pages carry all of its content. |
| `about.html`, `events.html`, `gallery.html`, `map.html`, `get-involved.html`, `contact.html`, `faq.html`, `news.html`, `steering-committee.html`, `civic-partners.html` | Compatibility redirects to sections of `index.html`. They preserve incoming query strings and URL fragments. |
| `privacy.html`, `terms.html`, `copyright.html`, `accessibility.html` | Standalone policy and accessibility pages. |
| [404.html](404.html) | Custom missing-page screen with root-relative asset and navigation URLs. |
| [assets/css/styles.css](assets/css/styles.css) | Shared design tokens, components, and responsive styles. |
| [assets/css/mobile.css](assets/css/mobile.css) | Phone overrides, loaded last with `media="(max-width: 699px)"`. |
| [assets/css/community-map.css](assets/css/community-map.css) | Map, marker, popup, and place-list styles. |
| [assets/js/main.js](assets/js/main.js) | Preview gate, navigation, section tracking, comparisons, photo lightbox, and other shared interactions. |
| [assets/js/map-loader.js](assets/js/map-loader.js) | Lazy-loads map libraries and application scripts in dependency order. |
| [assets/js/map-config.js](assets/js/map-config.js) | Map center, zoom limits, tile/font URLs, attribution, and vector style. |
| [assets/js/map-data.js](assets/js/map-data.js) | Location validation, search/filter helpers, safe URLs, and directions links. Usable in the browser and through CommonJS in Node. |
| [assets/js/community-map.js](assets/js/community-map.js) | Fetches locations and coordinates map pins, popups, lists, deep links, and fallback states. |
| [assets/data/locations.json](assets/data/locations.json) | Public map records in a versioned JSON document. |
| [assets/js/site-config.js](assets/js/site-config.js), [assets/js/consent.js](assets/js/consent.js) | Analytics configuration, consent choices, and conditional Google Analytics loading. |
| `assets/images/brand/`, `assets/images/history/`, `assets/icons/`, `favicon.ico` | Website image exports, branding, and icons. |
| `assets/vendor/leaflet/`, `assets/vendor/maplibre/` | Bundled map libraries and their license files. |
| [CNAME](CNAME) | Custom domain for publishing. |

## How the code works

### Page content and navigation

Most changes start in `index.html`. Content is written directly in HTML; there is no CMS, template engine, or generated page bundle. The retired HTML pages redirect visitors to the matching section, so event content belongs in `index.html`, not `events.html`.

Shared headers and footers are repeated in the main page, three sponsorship pages, four policy pages, and 404 page. Keep those nine pages consistent when changing shared navigation. Main-page links use `#section`; standalone-page links use `index.html#section`; the 404 page uses `/index.html#section` so nested missing URLs still work.

The homepage sponsorship cards link directly to the three static detail pages. `main.js` forwards old homepage hashes (`#series-packages`, `#single-event`, and `#centennial-opportunities`) to their corresponding pages, preserving the query string and section target. Without JavaScript, those homepage IDs identify the corresponding overview links. Each detail page includes navigation to the other sponsorship pages and back to the homepage. Package inquiries retain editable email drafts; purchases begin by email.

`main.js` initializes behaviors using element IDs, classes, and `data-*` hooks. The then-and-now viewer connects tab buttons, comparison panels, range sliders, and previous/next controls. The map and external links also target those panel IDs. Preserve these relationships when editing markup.

### Community map

When the map approaches the viewport, `map-loader.js` loads Leaflet, MapLibre GL JS, the Leaflet adapter, then the configuration, data helpers, and map controller. A `#place=<id>` URL requests this immediately; map initialization waits for the preview gate to open.

`community-map.js` fetches `locations.json`, validates it through `map-data.js`, and renders the place list and pins. Leaflet handles interaction; MapLibre renders the simplified OpenStreetMap vector basemap. Raster tiles provide a fallback, and the place list remains available when the map layer cannot load. Search and category controls are revealed when the dataset grows beyond eight places or contains multiple categories.

The data document has this shape:

```json
{
  "version": 1,
  "locations": []
}
```

Each displayed record needs `approved: true`, a unique lowercase hyphenated `id`, nonempty `name`, `address`, and `description`, a supported `category`, and numeric `lat`/`lng` within geographic bounds. Categories are `then-now`, `events`, `heritage`, `art`, and `community`. Record order controls display order.

Optional fields include visiting notes (`accessibility`), HTTPS links (`url`, `sourceUrl`, `sourceLabel`), photo fields (`thenImage`/`thenAlt`/`thenLabel`/`thenCredit` and `nowImage`/`nowAlt`/`nowLabel`/`nowCredit`), and a local `storyUrl` with `storyLabel`. Photo paths must match `assets/images/history/<slug>.jpg`. A photo requires its label, image, and alt text; a label alone produces a placeholder. Credits are plain text shown below the list-card photos and under the popup photo, worded like the History section credits. Story links can target a section such as `#then-now-la-reina`.

Invalid/unapproved records and duplicate IDs are skipped. A malformed document produces an error state with a retry action. The approval flag only controls rendering: everything in the JSON is publicly readable. See [Adding content and map places](CONTRIBUTING.md#adding-content-and-map-places) before adding records.

### Styles and assets

`styles.css` contains the shared palette and component styles. `community-map.css` styles the map independently. `mobile.css` applies only through 699 px and preserves the same content and reading order.

History images are optimized web exports, often with full-size, `-800.jpg`, and `-thumb.jpg` variants. Originals and review material belong outside the published repository. Keep captions, credits, alt text, responsive image sources, and map thumbnails in sync.

### Analytics and external services

`site-config.js` currently contains a GA4 measurement ID. `consent.js` loads Google Analytics only after consent, remembers the choice, honors browser opt-out signals, and supports changing the choice on the privacy page. Setting `gaMeasurementId` to `null` disables both analytics and its banner.

Fraunces and Inter load from Google Fonts. Map tiles and map-label fonts come from OpenStreetMap; directions links open Google Maps when selected. Provider configuration lives in `map-config.js`. Changes to external requests also need a review of the site's privacy disclosures.

Links to other websites and the sponsorship PDF open in a new tab and include a visually hidden “(opens in a new tab)” note; map links generated in JavaScript use the same wording. Contact, volunteer, story, photo, and sponsorship actions open email drafts to the committee. The repository does not implement submission storage, accounts, payment processing, receipts, or fund administration.

## Publishing

The repository is organized for serving its root at `shermanoaks100.com`. Root-relative paths, especially on the 404 page, assume this arrangement; a deployment beneath a URL subdirectory needs path review.

There is no build workflow or CI configuration checked into this repository. Confirm the repository's current GitHub Pages settings before publishing: updates to its configured publishing source can deploy the site. Keep `CNAME` and the preview behavior intact unless the task includes changing them. Treat all committed site files as public, including files hidden by the preview screen or unused by the page.

## Collaboration and credits

Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes. Coding agents must also follow [AGENTS.md](AGENTS.md) and keep these docs aligned with the implementation.

Some maintainers have a larger local workspace containing historical archives, approval notes, and validation scripts. Those files are outside this Git repository and are not required to run a fresh clone. Dated status notes are separate from this codebase guide.

Bundled dependencies are Leaflet 1.9.4, MapLibre GL JS 5.24.0, and maplibre-gl-leaflet 0.1.3. Their licenses are retained in the vendor directories; MapLibre provenance is recorded in its [vendor README](assets/vendor/maplibre/README.md). Preserve those notices when updating libraries.

No repository-wide open-source license has been added. Site code, branding, photographs, and contributed content have separate ownership and permission considerations; do not assume public availability grants reuse rights.
