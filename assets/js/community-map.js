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
  const toolbar = $("#map-controls");
  const search = $("#map-search");
  const category = $("#map-category");
  const reset = $("#map-reset");
  const resetView = $("#map-reset-view");
  const retry = $("#map-retry");
  const notice = $("#map-notice");
  const noticeText = $("#map-notice-text");
  const tilesRetry = $("#map-tiles-retry");
  const gestureHint = $("#map-gesture-hint");
  const data = window.CommunityMapData;
  const config = window.COMMUNITY_MAP_CONFIG;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // On touch screens one finger keeps scrolling the page; two fingers move the map.
  const touchFirst = window.matchMedia("(pointer: coarse)").matches;
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
  function photo(shot, className) {
    const figure = element("figure", className);
    if (shot.src) {
      const img = element("img");
      img.src = shot.src; img.alt = shot.alt; img.loading = "lazy"; img.decoding = "async";
      img.width = 480; img.height = 360;
      figure.append(img);
    } else figure.append(element("span", "map-place__photo-pending", shot.label === "TBD" ? "To be determined" : "Photo coming soon"));
    figure.append(element("figcaption", "", shot.label));
    return figure;
  }
  // List cards show then and now side by side.
  function photoPair(place) {
    if (!place.then && !place.now) return null;
    const row = element("div", "map-place__photos");
    [place.then, place.now].forEach(shot => { if (shot) row.append(photo(shot, "map-place__photo")); });
    return row;
  }
  // Popups show one photo with a then/now switch.
  function photoSwitch(place) {
    const shots = [place.then, place.now].filter(shot => shot && shot.src);
    if (!shots.length) return null;
    const box = element("div", "map-popup__photo");
    const img = element("img");
    img.width = 480; img.height = 360; img.decoding = "async";
    const show = shot => { img.src = shot.src; img.alt = shot.alt; };
    show(shots[0]);
    box.append(img);
    const labels = [place.then, place.now].filter(Boolean);
    if (labels.length > 1) {
      const toggle = element("div", "map-popup__toggle");
      toggle.setAttribute("role", "group");
      toggle.setAttribute("aria-label", "Choose a view of " + place.name);
      labels.forEach(function (shot) {
        const button = element("button", "", shot.label);
        button.type = "button";
        button.disabled = !shot.src;
        button.setAttribute("aria-pressed", String(shot === shots[0]));
        if (!shot.src) button.title = shot.label === "TBD" ? "Photo timing to be determined" : "Photo coming soon";
        button.addEventListener("click", function () {
          show(shot);
          toggle.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        });
        toggle.append(button);
      });
      box.append(toggle);
    }
    return box;
  }
  function actions(place, popup) {
    const row = element("div", "map-place__actions");
    if (!popup && map) {
      const button = element("button", "map-place__show", "Show on map");
      button.type = "button";
      button.dataset.showPlace = place.id;
      // The spoken name starts with the visible words so voice control matches it.
      button.setAttribute("aria-label", "Show on map: " + place.name);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => select(place.id, true));
      row.append(button);
    }
    if (place.storyUrl) {
      const story = element("a", "map-place__link", place.storyLabel);
      story.href = place.storyUrl;
      row.append(story);
    }
    row.append(externalLink("Directions", data.directions(place)));
    if (place.url) row.append(externalLink("Visit website", place.url));
    if (place.sourceUrl) row.append(externalLink(place.sourceLabel, place.sourceUrl));
    return row;
  }
  function card(place, number) {
    const box = element("div", "map-place");
    const shots = photoPair(place);
    if (shots) box.append(shots);
    const head = element("div", "map-place__head");
    head.append(element("span", "map-place__number", String(number)));
    const titles = element("div");
    titles.append(element("p", "map-place__category", data.categories[place.category]));
    titles.append(element("h3", "map-place__title", place.name));
    head.append(titles);
    box.append(head);
    box.append(element("p", "map-place__address", place.address));
    box.append(element("p", "map-place__description", place.description));
    if (place.accessibility) box.append(element("p", "map-place__access", "Visiting: " + place.accessibility));
    box.append(actions(place, false));
    return box;
  }
  function popupContent(place) {
    const box = element("div", "map-popup");
    const shots = photoSwitch(place);
    if (shots) box.append(shots);
    box.append(element("p", "map-place__category", data.categories[place.category]));
    box.append(element("h3", "map-place__title", place.name));
    box.append(element("p", "map-place__address", place.address));
    box.append(actions(place, true));
    return box;
  }
  function pinIcon(place, number) {
    const pin = element("span", "photo-pin photo-pin--" + place.category);
    const shot = [place.then, place.now].find(s => s && s.src);
    if (shot) {
      const img = element("img");
      img.src = shot.src; img.alt = ""; img.decoding = "async";
      pin.append(img);
    }
    pin.append(element("span", "photo-pin__number", String(number)));
    return window.L.divIcon({ html: pin, className: "community-marker", iconSize: [54, 64], iconAnchor: [27, 62], popupAnchor: [0, -58] });
  }

  function markSelected(id, fromMap) {
    selected = id;
    list.querySelectorAll("[data-place-id]").forEach(function (item) {
      const active = item.dataset.placeId === id;
      item.classList.toggle("is-selected", active);
      const button = item.querySelector("[data-show-place]");
      if (button) button.setAttribute("aria-pressed", String(active));
      if (active && fromMap) bringCardIntoView(item);
    });
    markers.forEach(function (marker, markerId) {
      const el = marker.getElement();
      if (el) el.classList.toggle("is-selected", markerId === id);
      marker.setZIndexOffset(markerId === id ? 1000 : 0);
    });
  }
  // Scroll only the place list (a sideways carousel on phones), never the page.
  function bringCardIntoView(item) {
    const behavior = reducedMotion ? "auto" : "smooth";
    const box = list.getBoundingClientRect(), rect = item.getBoundingClientRect();
    if (list.scrollWidth > list.clientWidth + 4) {
      const left = list.scrollLeft + rect.left - box.left - (list.clientWidth - rect.width) / 2;
      list.scrollTo({ left: Math.max(0, left), behavior });
    } else if (list.scrollHeight > list.clientHeight + 4) {
      list.scrollTo({ top: Math.max(0, list.scrollTop + rect.top - box.top - 12), behavior });
    }
  }
  function select(id, focusMap) {
    const place = visiblePlaces.find(item => item.id === id);
    if (!place || !map) return;
    markSelected(id, false);
    if (focusMap) canvas.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
    // Open the popup once the map has settled, so it pans to fit the photo card.
    const open = function () {
      markers.get(id)?.openPopup();
      if (focusMap) (canvas.querySelector(".leaflet-popup-close-button") || canvas).focus({ preventScroll: true });
    };
    const target = window.L.latLng(place.lat, place.lng);
    const zoom = Math.max(map.getZoom(), 16);
    if (reducedMotion || (map.getZoom() === zoom && map.getCenter().distanceTo(target) < 2)) {
      map.setView(target, zoom, { animate: false });
      open();
    } else {
      map.once("moveend", open);
      map.setView(target, zoom, { animate: true });
    }
  }
  function fitPlaces() {
    if (!map) return;
    if (visiblePlaces.length) {
      map.fitBounds(visiblePlaces.map(place => [place.lat, place.lng]), { padding: [40, 40], maxZoom: 16, animate: false });
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
      item.append(card(place, index + 1));
      list.append(item);
      if (map) {
        const marker = window.L.marker([place.lat, place.lng], {
          icon: pinIcon(place, index + 1), title: place.name, alt: place.name, keyboard: true, riseOnHover: true
        }).bindPopup(popupContent(place), { maxWidth: 280, minWidth: 240, autoPanPadding: [24, 24] });
        marker.on("popupopen", () => markSelected(place.id, true));
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
      "Confirmed centennial locations will appear here.";
    reset.hidden = !search.value && category.value === "all";
    fitPlaces();
  }
  // Search and categories appear only once there is enough to filter.
  function updateToolbar() {
    const kinds = new Set(allPlaces.map(place => place.category));
    toolbar.hidden = allPlaces.length <= 8 && kinds.size <= 1;
    Array.from(category.options).forEach(option => { option.hidden = option.value !== "all" && !kinds.has(option.value); });
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
      updateToolbar();
      render();
      openLinkedPlace();
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
  // Links such as #place=la-reina-theatre open that place's pin.
  function openLinkedPlace() {
    const id = new URLSearchParams(location.hash.slice(1)).get("place");
    if (!id || !allPlaces.some(place => place.id === id)) return;
    if (!visiblePlaces.some(place => place.id === id)) { search.value = ""; category.value = "all"; render(); }
    if (map) { select(id, true); return; }
    const item = Array.from(list.querySelectorAll("[data-place-id]")).find(node => node.dataset.placeId === id);
    if (item) { markSelected(id, true); item.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" }); }
  }
  function initMap() {
    canvas.querySelector(".map-loading")?.remove();
    if (!window.L || !config) {
      canvas.hidden = true;
      notice.hidden = false;
      noticeText.textContent = "The interactive map couldn’t load. You can still browse the place list and open directions.";
      return;
    }
    map = window.L.map(canvas, {
      center: config.center, zoom: config.zoom, minZoom: 11, maxZoom: config.maxZoom,
      scrollWheelZoom: false, dragging: !touchFirst, tap: false, zoomSnap: 0.25, zoomDelta: 0.5,
      zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion, markerZoomAnimation: !reducedMotion
    });
    // One compact credit line (styled in community-map.css): OpenStreetMap is
    // required and linked to its licence; library credits stay, no flag graphic.
    map.attributionControl.setPrefix(false);
    layer = window.L.layerGroup().addTo(map);
    addBasemap();
    resetView.disabled = false;
    map.on("popupclose", () => markSelected(null, false));
    // Smaller photo pins when zoomed out, so neighbors along Ventura don't overlap.
    const sizePins = () => canvas.classList.toggle("map--far", map.getZoom() < 14.25);
    map.on("zoomend", sizePins);
    sizePins();
    canvas.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && selected) {
        const previous = selected;
        map.closePopup();
        const button = Array.from(list.querySelectorAll("[data-show-place]")).find(item => item.dataset.showPlace === previous);
        button?.focus({ preventScroll: true });
      }
    }, true);
    if (touchFirst) initTouchGestures();
    if ("ResizeObserver" in window) new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(canvas);
  }
  // With dragging off, Leaflet's pinch handler still pans and zooms with two
  // fingers. A one-finger touch on the map shows a short hint instead.
  function initTouchGestures() {
    let hintTimer, moved = false;
    canvas.addEventListener("touchstart", function (event) {
      moved = false;
      if (event.touches.length > 1) gestureHint.classList.remove("is-visible");
    }, { passive: true });
    canvas.addEventListener("touchmove", function (event) {
      if (moved || event.touches.length !== 1 || event.target.closest(".leaflet-popup, .leaflet-control")) return;
      moved = true;
      gestureHint.classList.add("is-visible");
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => gestureHint.classList.remove("is-visible"), 1500);
    }, { passive: true });
  }
  function addBasemap() {
    if (tiles) { map.removeLayer(tiles); tiles = null; }
    if (window.L.maplibreGL && window.communityMapStyle && supportsVectorMap()) {
      try {
        tiles = window.L.maplibreGL({ style: window.communityMapStyle(),
          attributionControl: false, interactive: false, padding: 0, fadeDuration: 0 });
        tiles.addTo(map);
        setCredit(true);
        const vector = tiles.getMaplibreMap();
        let vectorFailed = false;
        vector.on("error", function () {
          vectorFailed = true;
          notice.hidden = false; tilesRetry.hidden = false;
          noticeText.textContent = "Some map details couldn’t load. Retry the map or use the place list and directions.";
        });
        vector.on("idle", function () { if (!vectorFailed && vector.isStyleLoaded() && vector.areTilesLoaded()) notice.hidden = true; });
        canvas.dataset.mapStyle = "simplified";
        return;
      } catch (_) {
        if (tiles && map.hasLayer(tiles)) {
          // A failed WebGL constructor has no MapLibre instance to dispose.
          if (!tiles.getMaplibreMap()) tiles.onRemove = function () { this.getContainer()?.remove(); };
          map.removeLayer(tiles);
        }
        tiles = null;
      }
    }
    // Keep a working map on browsers that cannot render the vector layer.
    canvas.dataset.mapStyle = "standard-fallback";
    setCredit(false);
    tiles = window.L.tileLayer(config.tileUrl, {
      maxZoom: config.maxZoom,
      updateWhenIdle: true, keepBuffer: 1
    });
    tiles.on("loading", () => { tileFailed = false; });
    tiles.on("tileerror", function () {
      tileFailed = true; notice.hidden = false; tilesRetry.hidden = false;
      noticeText.textContent = "Some map details couldn’t load. Retry the map or use the place list and directions.";
    });
    tiles.on("load", function () { if (!tileFailed) notice.hidden = true; });
    tiles.addTo(map);
  }
  let shownCredit = "";
  function setCredit(vector) {
    const text = config.attribution + ' · <a href="https://leafletjs.com">Leaflet</a>' +
      (vector ? ' · <a href="https://maplibre.org">MapLibre</a>' : "");
    if (shownCredit) map.attributionControl.removeAttribution(shownCredit);
    map.attributionControl.addAttribution(text);
    shownCredit = text;
  }
  function supportsVectorMap() {
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2");
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch (_) { return false; }
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
    resetView.addEventListener("click", function () { map?.closePopup(); fitPlaces(); });
    retry.addEventListener("click", loadPlaces);
    tilesRetry.addEventListener("click", function () { tileFailed = false; notice.hidden = true; addBasemap(); });
    window.addEventListener("hashchange", openLinkedPlace);
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
