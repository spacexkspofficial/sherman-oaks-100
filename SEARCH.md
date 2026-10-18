# Search and AI discovery

Search engines and AI retrieval systems can read the same public HTML as visitors. The site has no build step, bot-only pages or required JavaScript for its main content. The interactive map supplements a static text directory. These measures support discovery; they do not guarantee indexing, rankings, citations or rich results.

## Files and canonical URLs

| File | Responsibility |
| --- | --- |
| `robots.txt` | Allows crawling of public pages and assets and advertises the sitemap. The wildcard rule includes search and AI retrieval crawlers; individual bot rules are unnecessary while the policy is the same for all crawlers. It preserves the previous unrestricted crawling policy and does not grant content reuse rights. |
| `sitemap.xml` | Lists the seven canonical HTML pages: `/`, two sponsorship pages and four policy pages. Redirects, fragments, the 404 page, the PDF and technical documentation are omitted. No speculative modification dates, priorities or crawl frequencies are included. |
| `llms.txt` | Optional plain-text discovery guide with links to authoritative HTML and explanations of pending event details and email inquiries. It is a supplementary convention, not a ranking requirement or an access-control file. |
| `assets/images/brand/sherman-oaks-100-social.png` | Shared 1200 × 630 PNG for Open Graph and social previews, using the existing centennial artwork. |
| Seven canonical HTML pages | Unique titles, descriptions, absolute canonical URLs, social metadata and inline JSON-LD. Search preview text and structured data are available in the initial response. |
| `index.html#photo-locations` | Static text directory of the eight approved photo places. Keep names, addresses, descriptions, visiting notes, links and Place schema synchronized with `assets/data/locations.json`. |

The homepage's canonical URL is `https://shermanoaks100.com/`, including when the visitor uses `/index.html` or a query string. Other full pages canonicalize to their own `.html` URLs. Compatibility redirects keep `noindex` and their existing destinations, query strings and fragments. The custom 404 keeps `noindex`; do not canonicalize missing URLs to the homepage or block crawlers from reading noindex pages.

## Structured data

Each canonical page defines a consistent WebSite and committee Organization identity. Homepage schema describes its visible sections, four event plans as an ItemList, the visible FAQ questions and answers, and eight approved photo Places with coordinates. Sponsorship pages use CollectionPage, ItemList and BreadcrumbList; policy pages use WebPage.

The event plans are named page sections, not Event rich-result markup. Times, exact venues, admission and accessibility details remain unconfirmed. Google requires a dedicated URL focused on each event and accurate event/location information for its event experience. Add separate event pages and matching Event schema only when those details are supplied and the page architecture is intentionally expanded. Do not invent venues, midnight start times, ticket offers or reservations. Keep retired `events.html` as a compatibility redirect unless a future migration explicitly replaces it.

FAQ schema mirrors the human-readable disclosures for systems that understand Schema.org. Google retired FAQ rich results in May 2026; this markup does not target that retired feature. Sponsorship packages are inquiries, not an online store: no Product, availability, payment, review or rating claims are added.

## Updating content

- Update the visible page and its inline JSON-LD together. Keep FAQ answer text, event names/dates, package names and prices consistent with the current approved HTML.
- When changing map records, update the static directory and homepage Place/ItemList schema as well as the JSON and its cache version. Preserve photo credits and source originals.
- Keep `llms.txt` synchronized when events, participation routes, pending details or canonical pages change. Current HTML remains the source of truth.
- When adding or retiring a full page, update canonical metadata, structured-data references, internal links and the sitemap. Do not put fragment URLs or redirects in the sitemap.
- Every image URL used in metadata must be publicly reachable. If replacing the social artwork, keep its actual dimensions, MIME type, alt text and metadata URLs aligned. Use a new filename when the image changes to avoid stale social caches.
- Keep important information in visible HTML. Do not add hidden keywords, fabricated endorsements, SearchAction for a nonexistent site search, or crawler-specific content.

## Validation and discovery after publishing

1. Run the relevant [contribution checks](CONTRIBUTING.md#validation). Parse every JSON-LD script and the XML sitemap. Confirm sitemap URLs match each page's canonical and social URL; confirm redirects and 404 remain excluded. Check the social image's dimensions and local targets.
2. Browse at 320, 375, 768 and 1440 px. Test the directory, photo links and existing deep links with JavaScript enabled; also check the readable directory, FAQ and sponsorship details with JavaScript disabled.
3. After an authorized deployment, confirm HTTP 200 for canonical pages, `robots.txt`, `sitemap.xml`, `llms.txt` and the social PNG. Confirm a nonexistent path returns HTTP 404 and uses the custom 404 screen. Check HTTPS and the preferred hostname's redirects.
4. In a verified [Google Search Console](https://search.google.com/search-console) property, submit `https://shermanoaks100.com/sitemap.xml`, inspect the homepage and both sponsorship URLs, and request indexing where appropriate. Review the property's inclusion in Search generative AI features and its generative AI performance report where available. Account verification may require the owner's DNS or account access; do not invent verification tags.
5. Submit the same sitemap in [Bing Webmaster Tools](https://www.bing.com/webmasters/). Review indexing and search performance in the owner's accounts. Analytics remains consent-based; no additional tracking is needed for this update.
6. Check structured data with [Schema.org's validator](https://validator.schema.org/) and supported Google features with the [Rich Results Test](https://search.google.com/test/rich-results). A syntactically valid graph does not establish rich-result eligibility. Allow time for search engines and social services to recrawl.

Maintainer workspaces may also provide `../tmp/check_seo.py` for metadata, sitemap, crawler, schema and source-consistency checks. This optional tool lives outside the publishing root and is not required to serve the site.

## Reference guidance

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features): standard SEO, crawl access, internal links, textual content and matching structured data; no special AI files or schema are required.
- [Google: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): current search-console guidance, agentic experiences and the limits of AI-specific files and markup.
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical URLs and truthful modification dates.
- [Google: event structured data](https://developers.google.com/search/docs/appearance/structured-data/event): dedicated event pages, accurate event details and eligibility requirements.
- [Google: documentation updates](https://developers.google.com/search/updates): the May and June 2026 entries record the retirement of FAQ rich results and their documentation.
- [OpenAI: crawlers](https://developers.openai.com/api/docs/bots): OAI-SearchBot controls ChatGPT search crawling independently of GPTBot training crawling.
