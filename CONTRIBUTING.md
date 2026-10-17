# Contributing to Sherman Oaks 100

Start with the [README](README.md) for the repository layout and runtime behavior. Coding agents must also read [AGENTS.md](AGENTS.md). These guides apply to code, content, design, and documentation changes.

## Workflow

1. Review the request or issue, the relevant source files, and the working tree (`git status --short`). Preserve unrelated changes already in progress.
2. Use a focused branch for shared work, for example `git switch -c docs/contribution-guide`. Build on the intended branch or commit; do not reset someone else's work.
3. Make the smallest coherent change. Follow the existing HTML, CSS, and vanilla JavaScript conventions. A framework, build pipeline, new service, or dependency should solve a stated need and be explained in the proposal.
4. Run the [validation](#validation) relevant to the change. Update the README when structure or behavior changes, this guide when the workflow changes, and AGENTS.md when agent instructions change.
5. Open a pull request describing the result and validation. Publishing is a separate action: merging or pushing to the configured GitHub Pages source may update the website.

Bug reports should include the affected URL or section, expected and actual behavior, reproduction steps, and browser/viewport details when relevant. Keep private correspondence and unpublished source material out of public issues and pull requests.

## Editing conventions

- **Content:** Edit `index.html` for events, sponsorships, history, committee information, and contact routes. Retired page files such as `events.html` are redirect stubs; preserve their destination, incoming hash handling, and fallback link.
- **Shared markup:** Update the header/footer consistently across `index.html`, `privacy.html`, `terms.html`, `copyright.html`, `accessibility.html`, and `404.html`. Preserve the 404 page's root-relative URLs.
- **Behavior:** Keep element IDs, `data-*` hooks, ARIA relationships, and deep links in sync. Do not rename a comparison panel without updating its tab controls and map story links.
- **Styles:** Use existing CSS variables and component classes. Keep phone overrides in `mobile.css`, linked last with the matching 699 px media condition. Preserve content, credits, and reading order across viewports.
- **Accessibility:** Use semantic elements, descriptive alt text, visible keyboard focus, labeled controls, and meaningful links. Retain reduced-motion handling, keyboard slider/tab operation, and popup/lightbox focus restoration.
- **JavaScript:** Follow the existing two-space indentation, scoped functions, and plain browser APIs. Keep `map-data.js` independent of the DOM so it remains usable from Node. Render location text as text, not executable markup.
- **Vendor files:** Do not hand-edit minified dependencies. If updating a library, verify its source/version, retain its license, update provenance notes, and check the map and fallback behavior together.
- **Analytics and providers:** Keep consent in front of analytics requests. Review the privacy page when changing a tracking service, map provider, or other external request. A measurement ID is public configuration; private credentials do not belong in client code.

### Cache versions

Assets use explicit `?v=` query strings. When changing a referenced runtime file, search for its path and update the version on every page that loads it.

- For `locations.json`, update `data-locations-src` in `index.html`.
- For dynamically loaded map scripts, update the `v` constant in `map-loader.js`, then the loader's own query string in `index.html`.
- For shared CSS, JavaScript, or icons, find all references, including root-relative ones in `404.html`.
- Markdown-only changes do not need asset version changes.

## Adding content and map places

Use supplied or verified content. Preserve existing decisions and placeholders until the task or an approved source provides a replacement; do not invent event dates, sponsor benefits, endorsements, historical claims, or payment functionality. Sponsorship purchases and next steps currently begin by email.

For photographs, retain the source, contributor permission, caption, and required credit. Keep original images and private approval records outside the publishing repository. Export appropriately sized web images without EXIF metadata, preserve watermarks where applicable, and update alt text, dimensions, `srcset`, captions, and thumbnails together. Existing history exports commonly use 1600 px full images, 800 px responsive images, and 480 × 360 map thumbnails; match the relevant component and preserve intentional crops.

To add a map place:

1. Confirm the public description, coordinates, category, and photo/source details. Keep drafts outside `assets/data/locations.json`.
2. Add a record following the [README data contract](README.md#community-map) and the actual validation in [map-data.js](assets/js/map-data.js). Keep the document at `version: 1`; only include approved public records.
3. Use a stable unique ID and place the record in its intended list order. If photos are present, include their labels and alt text. Use a real local `storyUrl` target when linking a comparison.
4. Update the JSON cache version. Check the pin, list entry, popup, photo toggle, story link, and directions coordinates in the browser, including `index.html#place=<id>`.

The `approved` flag is a display filter, not an access control or a substitute for permission records. Current held timeline and Notable Residents drafts remain outside the repository. Do not reintroduce held material as part of an unrelated code change. Maintainers with the larger local workspace should consult its latest handoff and approval records when a change touches that material; dated notes may have been superseded by later user decisions.

## Validation

There is no repository-local automated test suite or CI workflow yet. A fresh clone can be served with the README's Python command. Use the checks below as appropriate, and report exactly what ran and anything that could not be checked.

### Checks available in a fresh clone

Check whitespace and review the diff:

```sh
git diff --check
git diff --stat
git diff
git status --short
```

Remember that `git diff` does not show untracked files; review newly added files too. For documentation changes, verify relative links and file names and check the Markdown preview. Browser regression testing is only needed if runtime behavior or content changed.

With Node.js installed, check the syntax of changed application scripts. The complete set is:

```sh
node --check assets/js/main.js
node --check assets/js/site-config.js
node --check assets/js/consent.js
node --check assets/js/map-loader.js
node --check assets/js/map-config.js
node --check assets/js/map-data.js
node --check assets/js/community-map.js
```

For a map-data change, run this from the repository root in PowerShell or a POSIX shell:

```sh
node -e "const fs=require('node:fs'); const data=require('./assets/js/map-data.js'); const result=data.read(JSON.parse(fs.readFileSync('assets/data/locations.json','utf8'))); if(result.rejected) throw Error('Rejected map records: '+result.rejected); console.log('Valid map records: '+result.places.length);"
```

This checks schema acceptance, not image existence, story anchors, factual accuracy, or publication permission. Check those separately for changed records.

### Browser checks for website changes

- Preview affected sections at 320 px, a typical phone width (375–390 px), tablet width (768 px), and desktop width (1440 px). For mobile CSS changes, also compare 699 px and 700 px. Check overflow, wrapping, credits, and usable controls.
- Check navigation, incoming hashes and retired-page redirects. For shared layout changes, include a policy page and the 404 page. Python's basic server does not automatically serve the custom 404 page; open `/404.html` directly, then check nested missing URLs on the target host when validating deployment.
- Use the keyboard for affected menus, FAQ disclosures, comparison tabs/sliders, lightboxes, and map popups. Check focus placement and Escape behavior.
- For map changes, check deep links, list/pin selection, photo and directions links, retry/error states, and raster fallback. Search/category controls are intentionally hidden for a small single-category dataset. Never leave test locations or `_map-qa*` fixtures in the published files.
- For analytics changes, use a fresh browser storage state. Verify no analytics request before consent or after decline, then check consent, revocation, and browser opt-out behavior. Local preview uses the configured measurement ID too; deliberate analytics consent can send test traffic to that property.
- Check the console and network panel for unexpected errors or missing assets. A working `mailto:` link verifies the draft destination, not inbox delivery.

### Additional maintainer workspace checks

Some local workspaces have read-only validators in `../tmp/`. They are not tracked in this repository and will not exist in a normal clone. If available, run them from the repository root:

```sh
python ../tmp/check_site.py
node ../tmp/check_map.cjs
```

They check site structure, links, redirects, image metadata/content holds, and map-data behavior. They do not establish publication permission or replace relevant browser checks. Do not rerun old workspace build/edit scripts blindly: later changes were made directly in the site files.

## Pull requests and handoff

Include the following in a pull request:

- The problem or request and the resulting behavior.
- Relevant files or design decisions a reviewer needs to understand.
- Checks run, results, and remaining gaps; screenshots for visible layout changes.
- Content sources or approvals relevant to the change, without exposing private correspondence.
- Any deployment/configuration step or unresolved dependency.

Keep unrelated changes separate and use descriptive commit messages. Update public docs when needed, and keep private operational history in the maintainer workspace. Do not claim code is deployed or content approved merely because local checks passed.

All files in the publishing repository can be fetched publicly. Keep the preview gate, domain configuration, and current content decisions intact unless changing them is within the task's authorized scope. Preserve bundled licenses and image credits; this repository does not currently grant a blanket open-source license.
