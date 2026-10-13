/* foundersDay: set only after the committee confirms the exact Founders' Day
 * date and time. Use an ISO 8601 timestamp with its UTC offset (Los Angeles
 * local time). Keep null while the date is unconfirmed; the page shows an
 * announcement message. The October 18, 2026 website launch target is NOT
 * the 2027 event date.
 *
 * gaMeasurementId: the Google Analytics 4 measurement ID (property
 * "shermanoaks100.com", owned by the info@shermanoaks100.com Google account).
 * assets/js/consent.js asks each visitor first and loads Google Analytics only
 * after "Allow analytics". Set it to null to turn analytics and the banner off.
 * After changing this file, bump its ?v= query on all 8 pages that load it
 * (see the workspace's legal/LAUNCH-COMPLIANCE-CHECKLIST.md, section C).
 */
window.SHERMAN_OAKS_100 = Object.freeze({ foundersDay: null, gaMeasurementId: "G-PXPTZCRR28" });
