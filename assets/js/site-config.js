/* foundersDay: set only after the committee confirms the exact Founders' Day
 * date and time. Use an ISO 8601 timestamp with its UTC offset (Los Angeles
 * local time). Keep null while the date is unconfirmed; the page shows an
 * announcement message. The October 18, 2026 website launch target is NOT
 * the 2027 event date.
 *
 * gaMeasurementId: the Google Analytics 4 measurement ID ("G-XXXXXXXXXX").
 * Keep null until the privacy policy is approved and the GA property is set
 * up as described in the workspace's legal/LAUNCH-COMPLIANCE-CHECKLIST.md.
 * While it is null, no analytics loads and no cookie banner appears. When it
 * is set, assets/js/consent.js asks each visitor first and loads Google
 * Analytics only after "Allow analytics".
 */
window.SHERMAN_OAKS_100 = Object.freeze({ foundersDay: null, gaMeasurementId: null });
