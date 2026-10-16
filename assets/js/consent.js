/* ==========================================================================
   Sherman Oaks 100 — Analytics consent
   --------------------------------------------------------------------------
   Google Analytics loads only after a visitor selects "Allow analytics".
   Nothing is requested from Google Analytics before that choice.

   - With no measurement ID in site-config.js this file does nothing: no
     banner, no analytics, and the privacy page says analytics is not in use.
   - Global Privacy Control and Do Not Track signals count as a decline.
   - The choice is stored in localStorage for 12 months, then asked again.
   - Declining after allowing deletes the Google Analytics cookies.
   ========================================================================== */
(function () {
  "use strict";

  const config = window.SHERMAN_OAKS_100 || {};
  const ID = typeof config.gaMeasurementId === "string" && /^G-[A-Z0-9]{4,}$/.test(config.gaMeasurementId)
    ? config.gaMeasurementId : "";
  const STORAGE_KEY = "shermanOaks100AnalyticsChoice";
  const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  const script = document.currentScript;
  const privacyUrl = new URL("../../privacy.html#analytics", script ? script.src : location.href).href;
  const root = document.documentElement;

  /* ---------------------------------------------------------------------
   * Stored choice and browser privacy signals
   * ------------------------------------------------------------------- */
  function browserSignalsOptOut() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1";
  }
  function storedChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && (saved.choice === "granted" || saved.choice === "denied") && Date.now() - saved.time < MAX_AGE_MS) {
        return saved.choice;
      }
    } catch (_) { /* Storage may be disabled; ask again on each page. */ }
    return null;
  }
  function storeChoice(choice) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: choice, time: Date.now() })); } catch (_) { /* Applies to this page only. */ }
  }
  function effectiveChoice() {
    return browserSignalsOptOut() ? "denied" : storedChoice();
  }

  /* ---------------------------------------------------------------------
   * Google Analytics (GA4). Advertising features stay off; cookies last at
   * most 13 months.
   * ------------------------------------------------------------------- */
  let loaded = false;
  function loadAnalytics() {
    if (loaded || !ID) return;
    loaded = true;
    window["ga-disable-" + ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted"
    });
    window.gtag("js", new Date());
    window.gtag("config", ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 60 * 60 * 24 * 395
    });
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(tag);
  }

  function stopAnalytics() {
    if (!ID) return;
    window["ga-disable-" + ID] = true;
    if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: "denied" });
    // Delete _ga and _ga_<container> cookies on this host and its parent domains.
    const parts = location.hostname.split(".");
    const domains = [""];
    for (let i = 0; i < parts.length - 1; i++) domains.push("; domain=." + parts.slice(i).join("."));
    document.cookie.split(";").forEach(function (cookie) {
      const name = cookie.split("=")[0].trim();
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;
      domains.forEach(function (domain) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + domain;
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Status text and "Change analytics choice" buttons (privacy page)
   * ------------------------------------------------------------------- */
  function statusText() {
    if (!ID) return "This website does not currently use Google Analytics or any other analytics service.";
    if (browserSignalsOptOut()) return "Your browser is sending a Global Privacy Control or Do Not Track signal, so Google Analytics is off for you on this website.";
    const choice = storedChoice();
    if (choice === "granted") return "You have allowed Google Analytics in this browser.";
    if (choice === "denied") return "You have declined Google Analytics in this browser.";
    return "You have not made a choice in this browser, so Google Analytics is off.";
  }
  function updateStatus() {
    document.querySelectorAll("[data-consent-state]").forEach(function (el) { el.textContent = statusText(); });
  }

  let liveRegion = null;
  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    window.setTimeout(function () { liveRegion.textContent = message; }, 50);
  }

  /* ---------------------------------------------------------------------
   * Banner: a labelled, non-modal region early in the reading order and
   * fixed to the bottom of the screen. Both choices look the same.
   * ------------------------------------------------------------------- */
  let banner = null;
  let opener = null;
  let resizeObserver = null;

  function setBannerSpace() {
    root.style.setProperty("--consent-h", banner ? banner.offsetHeight + "px" : "0px");
  }

  function showBanner(fromButton) {
    if (!ID) return;
    if (banner) { const first = banner.querySelector("button"); if (first) first.focus(); return; }
    opener = fromButton || null;
    const blocked = browserSignalsOptOut();
    const choice = storedChoice();
    banner = document.createElement("section");
    banner.className = "consent";
    banner.setAttribute("aria-labelledby", "consent-title");
    const current = !blocked && choice ? " Current choice: " + (choice === "granted" ? "allowed." : "declined.") : "";
    const message = blocked
      ? "Your browser is sending a Global Privacy Control or Do Not Track signal, so Google Analytics stays off on this website."
      : "With your permission, we use Google Analytics cookies to count visits and see which pages help. " +
        "They stay off unless you allow them, and you can change your choice anytime under “Privacy choices” at the bottom of the page." + current;
    const buttons = blocked
      ? "<button type=\"button\" class=\"btn btn--small consent__close\" data-consent-close>Close</button>"
      : "<button type=\"button\" class=\"btn btn--small consent__btn\" data-consent=\"granted\">Allow analytics</button>" +
        "<button type=\"button\" class=\"btn btn--small consent__btn\" data-consent=\"denied\">Decline analytics</button>" +
        (opener ? "<button type=\"button\" class=\"btn btn--small consent__close\" data-consent-close>Close</button>" : "");
    banner.innerHTML =
      "<div class=\"container consent__inner\">" +
        "<div><p class=\"consent__title\" id=\"consent-title\">Analytics cookies</p>" +
        "<p class=\"consent__text\"></p></div>" +
        "<div class=\"consent__actions\">" + buttons + "</div>" +
      "</div>";
    const text = banner.querySelector(".consent__text");
    text.textContent = message + " ";
    const link = document.createElement("a");
    link.href = privacyUrl;
    link.textContent = "How we use analytics";
    text.appendChild(link);

    banner.addEventListener("click", function (e) {
      const button = e.target.closest("button");
      if (!button) return;
      const value = button.getAttribute("data-consent");
      if (value === "granted" || value === "denied") {
        storeChoice(value);
        if (value === "granted") loadAnalytics(); else stopAnalytics();
        announce(value === "granted" ? "Analytics allowed." : "Analytics declined. Nothing will be sent to Google Analytics.");
        updateStatus();
      }
      closeBanner();
    });

    const skip = document.querySelector(".skip-link");
    if (skip) skip.insertAdjacentElement("afterend", banner); else document.body.prepend(banner);
    document.body.classList.add("has-consent");
    setBannerSpace();
    if ("ResizeObserver" in window) { resizeObserver = new ResizeObserver(setBannerSpace); resizeObserver.observe(banner); }
    if (opener) { const first = banner.querySelector("button"); if (first) first.focus(); }
  }

  function closeBanner() {
    if (!banner) return;
    const hadFocus = banner.contains(document.activeElement);
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
    banner.remove();
    banner = null;
    document.body.classList.remove("has-consent");
    setBannerSpace();
    if (!hadFocus) return;
    if (opener && document.contains(opener)) { opener.focus(); return; }
    const main = document.getElementById("main");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }

  /* ---------------------------------------------------------------------
   * Start once the page is visible (after the preview gate, if present)
   * ------------------------------------------------------------------- */
  function whenPageVisible(fn) {
    if (!root.classList.contains("auth-required")) { fn(); return; }
    const watcher = new MutationObserver(function () {
      if (root.classList.contains("auth-required")) return;
      watcher.disconnect();
      fn();
    });
    watcher.observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  function init() {
    updateStatus();
    if (!ID) return;
    liveRegion = document.createElement("p");
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("role", "status");
    document.body.appendChild(liveRegion);
    document.querySelectorAll("[data-consent-open]").forEach(function (button) {
      button.hidden = false;
      button.addEventListener("click", function () { showBanner(button); });
    });
    if (browserSignalsOptOut()) { stopAnalytics(); return; }
    const choice = effectiveChoice();
    if (choice === "granted") { loadAnalytics(); return; }
    // No current "Allow" (declined, never asked, or the 12-month choice expired):
    // clear any Google Analytics cookies left from an earlier visit.
    stopAnalytics();
    if (choice === null) whenPageVisible(function () { showBanner(null); });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
