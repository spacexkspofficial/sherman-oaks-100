(function () {
  "use strict";
  const root = document.querySelector("[data-community-map]");
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const canvas = $("#community-map");
  const list = $("#map-locations");
  const count = $("#map-count");
  const empty = $("#map-empty");
  const emptyTitle = $("#map-empty-title");
  const emptyText = $("#map-empty-text");
  const search = $("#map-search");
  const category = $("#map-category");
  const reset = $("#map-reset");
  const resetView = $("#map-reset-view");
  const retry = $("#map-retry");
  const notice = $("#map-notice");
  const noticeText = $("#map-notice-text");
  const tilesRetry = $("#map-tiles-retry");
  const data = window.CommunityMapData;
  const config = window.COMMUNITY_MAP_CONFIG;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let map, layer, tiles, allPlaces = [], visiblePlaces = [], selected = null;
  let tileFailed = false, requestNumber = 0;
  const markers = new Map();

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }
  function externalLink(label, url) {
    const a = element("a", "map-place__link", label);
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", label + " (opens in a new tab)");
    return a;
  }
  function details(place, popup) {
    const box = element("div", popup ? "map-popup" : "map-place");
    box.append(element("p", "map-place__category", data.categories[place.category]));
    box.append(element("h3", "map-place__title", place.name));
    box.append(element("p", "map-place__address", place.address));
    box.append(element("p", "map-place__description", place.description));
    if (place.accessibility) box.append(element("p", "map-place__access", "Access & visiting notes: " + place.accessibility));
    const actions = element("div", "map-place__actions");
    if (!popup && map) {
      const button = element("button", "map-place__show", "Show on map");
      button.type = "button";
      button.dataset.showPlace = place.id;
      button.setAttribute("aria-label", "Show " + place.name + " on map");
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => select(place.id, true));
      actions.append(button);
    }
    actions.append(externalLink("Directions", data.directions(place)));
    if (place.url) actions.append(externalLink("Visit website", place.url));
    if (place.sourceUrl) actions.append(externalLink(place.sourceLabel, place.sourceUrl));
    box.append(actions);
    return box;
  }
  function markSelected(id) {
    selected = id;
    list.querySelectorAll("[data-place-id]").forEach(function (item) {
      const active = item.dataset.placeId === id;
      item.classList.toggle("is-selected", active);
      const button = item.querySelector("[data-show-place]");
      if (button) button.setAttribute("aria-pressed", String(active));
    });
  }
  function select(id, focusMap) {
    const place = visiblePlaces.find(item => item.id === id);
    if (!place || !map) return;
    markSelected(id);
    map.setView([place.lat, place.lng], Math.max(map.getZoom(), 16), { animate: false });
    markers.get(id).openPopup();
    if (focusMap) {
      canvas.scrollIntoView({ block: "center", behavior: reducedMotion ? "instant" : "smooth" });
      const close = canvas.querySelector(".leaflet-popup-close-button");
      (close || canvas).focus({ preventScroll: true });
    }
  }
  function fitPlaces() {
    if (!map) return;
    if (visiblePlaces.length) {
      map.fitBounds(visiblePlaces.map(place => [place.lat, place.lng]), { padding: [42, 42], maxZoom: 16, animate: false });
    } else map.setView(config.center, config.zoom, { animate: false });
  }
  function render() {
    visiblePlaces = data.filter(allPlaces, category.value, search.value);
    map?.closePopup();
    layer?.clearLayers();
    markers.clear(); selected = null;
    list.replaceChildren();
    visiblePlaces.forEach(function (place, index) {
      const item = element("li", "map-location");
      item.dataset.placeId = place.id;
      item.append(details(place, false));
      list.append(item);
      if (map) {
        const pin = element("span", "community-pin community-pin--" + place.category, String(index + 1));
        const marker = window.L.marker([place.lat, place.lng], {
          icon: window.L.divIcon({ html: pin, className: "community-marker", iconSize: [36, 42], iconAnchor: [18, 42], popupAnchor: [0, -38] }),
          title: place.name, alt: place.name, keyboard: true
        }).bindPopup(details(place, true), { maxWidth: 300, maxHeight: 240 });
        marker.on("popupopen", () => markSelected(place.id));
        marker.addTo(layer);
        marker.getElement().setAttribute("aria-label", place.name);
        markers.set(place.id, marker);
      }
    });
    count.textContent = visiblePlaces.length + (visiblePlaces.length === 1 ? " place" : " places") +
      (allPlaces.length && visiblePlaces.length !== allPlaces.length ? " of " + allPlaces.length : "") + " to explore";
    empty.hidden = visiblePlaces.length > 0;
    emptyTitle.textContent = allPlaces.length ? "No places match your search." : "Places are on the way.";
    emptyText.textContent = allPlaces.length ? "Try another name or category, or clear your filters." :
      "Confirmed centennial locations will appear here. For now, explore the neighborhood on the map.";
    reset.hidden = !search.value && category.value === "all";
    fitPlaces();
  }
  async function loadPlaces() {
    const request = ++requestNumber;
    search.disabled = category.disabled = true;
    retry.hidden = true;
    count.textContent = "Loading places…";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      // Keep content approvals current and let retry recover from a corrected
      // data file. This applies only to our JSON, never to map tile caching.
      const response = await fetch(root.dataset.locationsSrc, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Locations unavailable.");
      const result = data.read(await response.json());
      if (request !== requestNumber) return;
      allPlaces = result.places;
      if (result.rejected) console.warn("Community map: skipped " + result.rejected + " unapproved or invalid location record(s).");
      if (result.rejected && !allPlaces.length) throw new Error("No valid locations in the file.");
      search.disabled = category.disabled = false;
      render();
    } catch (_) {
      if (request !== requestNumber) return;
      allPlaces = []; visiblePlaces = []; selected = null;
      layer?.clearLayers(); markers.clear(); list.replaceChildren();
      count.textContent = "Place list unavailable";
      empty.hidden = false; reset.hidden = true;
      emptyTitle.textContent = "We couldn’t load the places.";
      emptyText.textContent = "Please try again. You can still explore the neighborhood map or contact the committee.";
      retry.hidden = false;
    } finally { clearTimeout(timer); }
  }
  function initMap() {
    if (!window.L || !config) {
      canvas.hidden = true;
      notice.hidden = false;
      noticeText.textContent = "The interactive map couldn’t load. You can still browse the place list and open directions.";
      return;
    }
    map = window.L.map(canvas, {
      center: config.center, zoom: config.zoom, minZoom: 10, maxZoom: config.maxZoom,
      scrollWheelZoom: false, zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion,
      markerZoomAnimation: !reducedMotion
    });
    layer = window.L.layerGroup().addTo(map);
    tiles = window.L.tileLayer(config.tileUrl, {
      attribution: config.attribution, maxZoom: config.maxZoom,
      updateWhenIdle: true, keepBuffer: 1
    });
    tiles.on("loading", () => { tileFailed = false; });
    tiles.on("tileerror", function () {
      tileFailed = true; notice.hidden = false; tilesRetry.hidden = false;
      noticeText.textContent = "Some map details couldn’t load. Retry the map or use the place list and directions.";
    });
    tiles.on("load", function () { if (!tileFailed) notice.hidden = true; });
    tiles.addTo(map);
    resetView.disabled = false;
    map.on("popupclose", () => markSelected(null));
    canvas.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && selected) {
        const previous = selected;
        map.closePopup();
        const button = Array.from(list.querySelectorAll("[data-show-place]")).find(item => item.dataset.showPlace === previous);
        button?.focus({ preventScroll: true });
      }
    }, true);
    if ("ResizeObserver" in window) new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(canvas);
  }
  function start() {
    if (!data) {
      count.textContent = "Map unavailable";
      emptyTitle.textContent = "Please reload to try again.";
      emptyText.textContent = "The map tools couldn’t load. You can also contact the committee for help.";
      return;
    }
    initMap();
    $("#map-controls").addEventListener("submit", event => event.preventDefault());
    search.addEventListener("input", render);
    category.addEventListener("change", render);
    reset.addEventListener("click", function () { search.value = ""; category.value = "all"; render(); search.focus(); });
    resetView.addEventListener("click", fitPlaces);
    retry.addEventListener("click", loadPlaces);
    tilesRetry.addEventListener("click", function () { tileFailed = false; tiles.redraw(); });
    loadPlaces();
  }
  // The existing preview gate hides the main page. Start after it opens so
  // Leaflet gets real dimensions and does not request tiles behind the gate.
  if (document.documentElement.classList.contains("auth-required")) {
    const observer = new MutationObserver(function () {
      if (!document.documentElement.classList.contains("auth-required")) { observer.disconnect(); start(); }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  } else start();
})();
