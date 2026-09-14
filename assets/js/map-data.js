/* Shared by the community map and its local validation checks. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CommunityMapData = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const categories = Object.freeze({
    events: "Event venues", heritage: "Heritage sites",
    art: "Public art", community: "Community places"
  });
  const text = value => typeof value === "string" ? value.trim() : "";
  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
    } catch (_) { return ""; }
  }
  function read(document) {
    if (!document || document.version !== 1 || !Array.isArray(document.locations)) {
      throw new Error("Expected version 1 and a locations array.");
    }
    const ids = new Set();
    const places = [];
    let rejected = 0;
    document.locations.forEach(function (entry) {
      const valid = entry && entry.approved === true &&
        entry.id === text(entry.id) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) && !ids.has(entry.id) &&
        text(entry.name) && text(entry.address) && text(entry.description) &&
        Object.prototype.hasOwnProperty.call(categories, entry.category) &&
        Number.isFinite(entry.lat) && Math.abs(entry.lat) <= 90 &&
        Number.isFinite(entry.lng) && Math.abs(entry.lng) <= 180;
      if (!valid) { rejected += 1; return; }
      ids.add(entry.id);
      places.push({
        id: entry.id, name: text(entry.name), category: entry.category,
        address: text(entry.address), description: text(entry.description),
        lat: entry.lat, lng: entry.lng, accessibility: text(entry.accessibility),
        url: safeUrl(entry.url), sourceUrl: safeUrl(entry.sourceUrl),
        sourceLabel: text(entry.sourceLabel) || "Source"
      });
    });
    return { places, rejected };
  }
  function searchText(value) {
    return text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function filter(places, category, query) {
    const words = searchText(query).split(/\s+/).filter(Boolean);
    return places.filter(function (place) {
      const haystack = searchText([place.name, place.address, place.description,
        categories[place.category], place.accessibility].join(" "));
      return (category === "all" || place.category === category) && words.every(word => haystack.includes(word));
    });
  }
  function directions(place) {
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(place.lat + "," + place.lng);
  }
  return Object.freeze({ categories, read, filter, safeUrl, directions });
});
