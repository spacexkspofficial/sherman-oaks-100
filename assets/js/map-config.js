/* Working provider for the local preview. See README before public launch.
 * Browser requests retain normal referrers and cache headers; no tile prefetch.
 * Change the provider URL, attribution and zoom limit together if needed.
 */
window.COMMUNITY_MAP_CONFIG = Object.freeze({
  center: [34.151, -118.449],
  zoom: 14,
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  vectorUrl: "https://vector.openstreetmap.org/shortbread_v1/tilejson.json",
  glyphsUrl: "https://vector.openstreetmap.org/styles/shortbread/fonts/{fontstack}/{range}.pbf",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
});

// A small, original style: roads, green space, water and useful labels only.
// Buildings, house numbers, business icons and minor points of interest are
// deliberately not drawn. All approved centennial markers stay above this layer.
window.communityMapStyle = function () {
  const config = window.COMMUNITY_MAP_CONFIG;
  const source = "neighborhood";
  const major = ["in", ["get", "kind"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]];
  const roads = ["in", ["get", "kind"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary", "residential", "unclassified", "living_street"]]];
  const name = ["coalesce", ["get", "name_en"], ["get", "name"], ["get", "ref"], ""];
  return {
    version: 8, glyphs: config.glyphsUrl,
    sources: { [source]: { type: "vector", url: config.vectorUrl, attribution: config.attribution } },
    layers: [
      { id: "paper", type: "background", paint: { "background-color": "#f5f4ee" } },
      { id: "green-space", type: "fill", source, "source-layer": "land",
        filter: ["in", ["get", "kind"], ["literal", ["park", "forest", "wood", "grass", "grassland", "nature_reserve", "recreation_ground", "scrub", "golf_course"]]],
        paint: { "fill-color": "#dfe9d7" } },
      { id: "water", type: "fill", source, "source-layer": "water_polygons", paint: { "fill-color": "#c6dfe5" } },
      { id: "waterways", type: "line", source, "source-layer": "water_lines", paint: { "line-color": "#bdd6de", "line-width": 2 } },
      { id: "road-edges", type: "line", source, "source-layer": "streets", filter: roads,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#d5d8cf", "line-width": ["interpolate", ["linear"], ["zoom"], 10, .7, 14, 4, 18, 16] } },
      { id: "roads", type: "line", source, "source-layer": "streets", filter: roads,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ffffff", "line-width": ["interpolate", ["linear"], ["zoom"], 10, .3, 14, 2.5, 18, 13] } },
      { id: "main-roads", type: "line", source, "source-layer": "streets", filter: major,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#d6cba5", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 14, 4, 18, 14] } },
      { id: "main-road-names", type: "symbol", source, "source-layer": "street_labels", filter: major, minzoom: 12,
        layout: { "symbol-placement": "line", "symbol-spacing": 350, "text-field": name, "text-font": ["noto_sans_regular"], "text-size": 12 },
        paint: { "text-color": "#566358", "text-halo-color": "#fffdf8", "text-halo-width": 2 } },
      { id: "local-road-names", type: "symbol", source, "source-layer": "street_labels", filter: ["all", roads, ["!", major]], minzoom: 15,
        layout: { "symbol-placement": "line", "symbol-spacing": 450, "text-field": name, "text-font": ["noto_sans_regular"], "text-size": 11 },
        paint: { "text-color": "#667064", "text-halo-color": "#fffdf8", "text-halo-width": 2 } },
      { id: "neighborhood-names", type: "symbol", source, "source-layer": "place_labels", minzoom: 10,
        layout: { "text-field": name, "text-font": ["noto_sans_regular"], "text-size": 15, "text-letter-spacing": .08, "text-transform": "uppercase", "text-max-width": 14, "text-padding": 35 },
        paint: { "text-color": "#375044", "text-halo-color": "#fffdf8", "text-halo-width": 2 } }
    ]
  };
};
