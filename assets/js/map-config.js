/* Working provider for the local preview. See README before public launch.
 * Browser requests retain normal referrers and cache headers; no tile prefetch.
 * Change the provider URL, attribution and zoom limit together if needed.
 */
window.COMMUNITY_MAP_CONFIG = Object.freeze({
  center: [34.151, -118.449],
  zoom: 14,
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
});
