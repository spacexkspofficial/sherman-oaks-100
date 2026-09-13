# Sherman Oaks 100 — Centennial Website

A static HTML, CSS and JavaScript website for the 2027 centennial, hosted on GitHub Pages at `shermanoaks100.com`. No framework, build step, backend or payment processing.

## Current preview — September 12, 2026

The non-historical changes from the 24-item website proposal have been implemented locally. The preview gate remains in place. This update has not been deployed.

- Brighter homepage with direct links to events, history, community stories, sponsors and participation.
- Four planned 2027 events, shown by quarter; Q3 is planned for August. Exact dates, times, venues and admission details remain unconfirmed.
- Proposed sponsorship levels of $100, $1,000, $5,000 and $10,000+. Benefits and the official external program link remain pending.
- Centennial Legacy vision for trees, small-business support and student scholarships, clearly described as ideas under consideration.
- Memory Wall introduction awaiting approved entries. Volunteer, story, photo, sponsorship and contact actions open an email draft addressed to `info@shermanoaks100.com`, the address already used by the preview gate. No message is sent automatically.
- Sample event dates, sponsor benefits, committee identities, partner endorsements and dated news announcements removed from the refreshed pages. No newsletter subscription is represented as completed.
- Historical page bodies, maps and gallery remain existing drafts on hold. No historical archive photos or facts were imported.

The full implementation and approval status is maintained in the workspace's `CHANGELOG-PENDING-APPROVAL.md`, outside the deployed folder.

## Files to maintain

| Content | File |
| --- | --- |
| Homepage sections, Memory Wall | `index.html` |
| Event calendar and filtering | `events.html` |
| Sponsorship proposals and inquiry links | `sponsors.html` |
| Participation and contribution instructions | `get-involved.html` |
| Contact options | `contact.html` |
| Mission and Legacy vision | `about.html` |
| Committee and partner listings awaiting confirmation | `steering-committee.html`, `civic-partners.html` |
| Frequently asked questions and updates | `faq.html`, `news.html` |
| Held historical drafts | `history.html`, `gallery.html`, `map.html`, `notable-residents.html` |
| Draft policies requiring review | `privacy.html`, `terms.html`, `copyright.html`, `accessibility.html` |
| Shared styles and responsive layout | `assets/css/styles.css` |
| Navigation, preview access, filters and countdown display | `assets/js/main.js` |
| Countdown configuration and date calculation | `assets/js/site-config.js`, `assets/js/countdown.js` |

Header and footer markup are duplicated across all 19 HTML pages. Update them consistently. Homepage section links use `index.html#section-id` from other pages; 404 links use root-relative paths so nested missing URLs work.

## Local preview

Run from this folder:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` in a browser. The existing preview password is configured in `assets/js/main.js`.

## Countdown activation

`foundersDay` in `assets/js/site-config.js` is intentionally `null`. The page displays an announcement message and starts no countdown timer.

After the committee confirms the date and time, set an ISO 8601 timestamp with the correct Los Angeles UTC offset. The display labels the date in Los Angeles time. Do not use the October 18, 2026 website launch target as the 2027 event date. Missing or invalid dates keep the pending message; completed dates stop at zero.

## Content holds and launch work

- Keep historical photographs, timeline revisions, then-and-now comparisons, trivia, maps and video on hold until Alex releases the hold and the relevant content is approved.
- Approved Memory Wall entries can be added manually to the marked section of `index.html`, with contributor permission, captions and credits.
- Update event cards on both `index.html` and `events.html` when plans are confirmed.
- Confirm sponsorship benefits, program URL, contribution wording and any tax language before publishing final offers. The site only directs inquiries; it cannot process payments or administer a fund.
- Public media uploads require an approved external submission and storage service. Current contribution links open the visitor's email app.
- Confirm committee roster, partner participation, social links, policy wording and inbox operation before launch. Do not restore placeholder names or endorsements.
- Browser verification is complete for the refreshed build: all 10 refreshed pages were checked at 320, 768 and 1440 pixels, with additional visual checks at 390 pixels. Login, event filters, navigation, keyboard access, FAQ expansion, the pending countdown and email-link destinations were checked. Browser review corrected event-card columns, obscured seal lettering and a mobile-menu resize scroll lock. Inbox delivery and actual event/sponsorship details still require confirmation.
- Remove the preview screen and deploy only as part of an authorized public launch. Pushes to the publishing branch can update GitHub Pages; no push was made for this update.

## Local verification

The workspace includes read-only validation scripts outside the deployed folder:

```sh
python ../tmp/check_site.py
node ../tmp/check_countdown.cjs
```

These check internal links and anchors, four matching event cards, held historical page bodies, the pending countdown configuration, preview gating, and date calculation edge cases. They do not replace visual or real-browser testing.

## Acknowledgments

The design uses Fraunces and Inter from Google Fonts, HTML, CSS and vanilla JavaScript. The existing SVG centennial seal is retained. Site code is provided for the Sherman Oaks 100 Centennial Committee; content and asset permissions are handled separately.
