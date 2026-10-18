/* Working provider for the local preview. See README before public launch.
 * Browser requests retain normal referrers and cache headers; no tile prefetch.
 * Change the provider URL, attribution and zoom limit together if needed.
 */
window.COMMUNITY_MAP_CONFIG = Object.freeze({
  center: [34.148, -118.452],
  zoom: 13,
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  vectorUrl: "https://vector.openstreetmap.org/shortbread_v1/tilejson.json",
  glyphsUrl: "https://vector.openstreetmap.org/styles/shortbread/fonts/{fontstack}/{range}.pbf",
  // "© OpenStreetMap" linked to the licence page meets the OSMF attribution guidelines.
  attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">&copy; OpenStreetMap<span class="sr-only"> (opens in a new tab)</span></a>',
  maxZoom: 19
});

// A small, original style in the site's palette: warm paper, sage parks, soft
// water, gold avenues and amber freeways (the 101 and 405 frame the neighborhood).
// Buildings, house numbers, business icons and minor points of interest are
// deliberately not drawn. All approved centennial markers stay above this layer.
window.communityMapStyle = function () {
  const config = window.COMMUNITY_MAP_CONFIG;
  const source = "neighborhood";
  const kind = list => ["in", ["get", "kind"], ["literal", list]];
  const freeway = kind(["motorway", "trunk"]);
  const avenue = kind(["primary", "secondary"]);
  const minor = kind(["tertiary", "residential", "unclassified", "living_street"]);
  const named = kind(["motorway", "trunk", "primary", "secondary", "tertiary"]);
  const name = ["coalesce", ["get", "name_en"], ["get", "name"], ["get", "ref"], ""];
  const width = (z10, z14, z18) => ["interpolate", ["exponential", 1.4], ["zoom"], 10, z10, 14, z14, 18, z18];
  const line = (id, filter, color, w) => ({ id, type: "line", source, "source-layer": "streets", filter,
    layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color, "line-width": w } });
  return {
    version: 8, glyphs: config.glyphsUrl,
    sources: { [source]: { type: "vector", url: config.vectorUrl, attribution: config.attribution } },
    layers: [
      { id: "paper", type: "background", paint: { "background-color": "#f4efe3" } },
      { id: "neighborhoods", type: "fill", source, "source-layer": "land",
        filter: kind(["residential"]), paint: { "fill-color": "#f1ebdc" } },
      { id: "shops", type: "fill", source, "source-layer": "land",
        filter: kind(["commercial", "retail"]), paint: { "fill-color": "#efe2c9" } },
      { id: "green-space", type: "fill", source, "source-layer": "land",
        filter: kind(["park", "forest", "wood", "grass", "grassland", "meadow", "nature_reserve", "recreation_ground", "scrub", "golf_course", "playground", "pitch", "cemetery"]),
        paint: { "fill-color": "#d9e5c8" } },
      { id: "water", type: "fill", source, "source-layer": "water_polygons", paint: { "fill-color": "#b9d6de" } },
      { id: "waterways", type: "line", source, "source-layer": "water_lines",
        paint: { "line-color": "#a7cad5", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1, 16, 4] } },
      line("minor-casing", minor, "#e2d7bf", width(.6, 4, 17)),
      line("minor-roads", minor, "#fffdf8", width(.3, 2.6, 14)),
      line("avenue-casing", avenue, "#d8bd7d", width(1.2, 6, 22)),
      line("avenues", avenue, "#f6e3ae", width(.8, 4.4, 18)),
      line("freeway-casing", freeway, "#b98e43", width(1.6, 7.5, 26)),
      line("freeways", freeway, "#eac47c", width(1.1, 5.5, 21)),
      { id: "road-names", type: "symbol", source, "source-layer": "street_labels", filter: named, minzoom: 12.5,
        layout: { "symbol-placement": "line", "symbol-spacing": 320, "text-field": name, "text-font": ["noto_sans_regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 13, 11, 17, 13], "text-letter-spacing": .02 },
        paint: { "text-color": "#5d4f36", "text-halo-color": "#fffaf0", "text-halo-width": 2 } },
      { id: "local-road-names", type: "symbol", source, "source-layer": "street_labels", filter: ["all", minor, ["!", named]], minzoom: 15.5,
        layout: { "symbol-placement": "line", "symbol-spacing": 420, "text-field": name, "text-font": ["noto_sans_regular"], "text-size": 11 },
        paint: { "text-color": "#776b57", "text-halo-color": "#fffaf0", "text-halo-width": 2 } },
      { id: "neighborhood-names", type: "symbol", source, "source-layer": "place_labels", minzoom: 10,
        layout: { "text-field": name, "text-font": ["noto_sans_regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 11, 12, 15, 16],
          "text-letter-spacing": .14, "text-transform": "uppercase", "text-max-width": 12, "text-padding": 40 },
        paint: { "text-color": "#2f5a47", "text-halo-color": "#f7f2e6", "text-halo-width": 2.2 } }
    ]
  };
};
