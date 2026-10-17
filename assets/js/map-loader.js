/* Loads the community map only when it is needed: as the map section nears
 * the screen, or straight away for a #place=… link. Keeps the one-page site
 * light on phones; the map libraries are the largest files on the page. */
(function () {
  "use strict";
  const root = document.querySelector("[data-community-map]");
  if (!root) return;
  const v = "20261017a";
  const styles = ["assets/vendor/leaflet/leaflet.css", "assets/vendor/maplibre/maplibre-gl.css"];
  const scripts = ["assets/vendor/leaflet/leaflet.js", "assets/vendor/maplibre/maplibre-gl.js",
    "assets/vendor/maplibre/leaflet-maplibre-gl.js", "assets/js/map-config.js?v=" + v,
    "assets/js/map-data.js?v=" + v, "assets/js/community-map.js?v=" + v];
  let started = false;

  function load() {
    if (started) return;
    started = true;
    styles.forEach(function (href) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = href;
      document.head.append(link);
    });
    // In order; a failed library still lets community-map.js show its fallback.
    scripts.reduce(function (previous, src) {
      return previous.then(function () {
        return new Promise(function (resolve) {
          const script = document.createElement("script");
          script.src = src; script.onload = resolve; script.onerror = resolve;
          document.head.append(script);
        });
      });
    }, Promise.resolve());
  }
  const wantsPlace = () => /^#place=/.test(location.hash);
  if (wantsPlace()) load();
  window.addEventListener("hashchange", function () { if (wantsPlace()) load(); });
  if (!("IntersectionObserver" in window)) { load(); return; }
  // Hidden behind the preview gate, the section never intersects, so nothing
  // loads (and no map tiles are requested) until the page is opened.
  const observer = new IntersectionObserver(function (entries) {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
  }, { rootMargin: "900px 0px" });
  observer.observe(root);
})();
