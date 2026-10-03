/* ==========================================================================
   Sherman Oaks 100 — Site JavaScript
   --------------------------------------------------------------------------
   Vanilla JS. No build step. No dependencies. Loads on every page.
   Most behaviors are progressive enhancement: site works without JS.
   ========================================================================== */
(function () {
  "use strict";

  const SITE_PASSWORD = "SO100-earlyaccess";
  const AUTH_STORAGE_KEY = "shermanOaks100PreviewAccess";

  /* ---------------------------------------------------------------------
   * Preview password gate
   * ------------------------------------------------------------------- */
  function initAuthGate() {
    const root = document.documentElement;
    if (!root.classList.contains("auth-required")) return;

    let hasAccess = false;
    try { hasAccess = localStorage.getItem(AUTH_STORAGE_KEY) === "granted"; } catch (_) { /* Storage may be disabled. */ }
    if (hasAccess) {
      root.classList.remove("auth-required");
      return;
    }

    const gate = document.createElement("section");
    gate.className = "auth-gate";
    gate.setAttribute("aria-labelledby", "auth-gate-title");
    gate.innerHTML =
      "<div class=\"auth-gate__panel\">" +
        "<a class=\"auth-gate__brand\" href=\"index.html\" aria-label=\"Sherman Oaks 100 home\">" +
          "<span class=\"auth-gate__mark\">100</span>" +
          "<span>Sherman Oaks<small>Centennial · 1927-2027</small></span>" +
        "</a>" +
        "<span class=\"eyebrow\">Preview Access</span>" +
        "<h1 id=\"auth-gate-title\">This website is currently being developed.</h1>" +
        "<p>For questions about Sherman Oaks 100, contact <a href=\"mailto:info@shermanoaks100.com\">info@shermanoaks100.com</a>.</p>" +
        "<form class=\"auth-gate__form\" autocomplete=\"off\">" +
          "<label for=\"auth-password\">Password</label>" +
          "<div class=\"auth-gate__row\">" +
            "<div class=\"auth-gate__password\">" +
              "<input id=\"auth-password\" name=\"password\" type=\"password\" required autocapitalize=\"none\" spellcheck=\"false\" />" +
              "<button class=\"auth-gate__toggle\" type=\"button\" aria-label=\"Show password\" aria-pressed=\"false\">Show</button>" +
            "</div>" +
            "<button class=\"btn btn--accent\" type=\"submit\">Enter site</button>" +
          "</div>" +
          "<p class=\"auth-gate__caps\" aria-live=\"polite\"><span class=\"auth-gate__caps-icon\" aria-hidden=\"true\">!</span> Caps Lock is on</p>" +
          "<p class=\"auth-gate__status\" aria-live=\"polite\"></p>" +
        "</form>" +
      "</div>";

    document.body.prepend(gate);
    document.body.style.overflow = "hidden";

    const form = gate.querySelector(".auth-gate__form");
    const input = gate.querySelector("#auth-password");
    const toggle = gate.querySelector(".auth-gate__toggle");
    const caps = gate.querySelector(".auth-gate__caps");
    const status = gate.querySelector(".auth-gate__status");

    window.setTimeout(function () {
      input.focus();
    }, 0);

    toggle.addEventListener("click", function () {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.textContent = show ? "Hide" : "Show";
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
      toggle.setAttribute("aria-pressed", String(show));
      input.focus();
    });

    function updateCapsLock(e) {
      if (!e.getModifierState) return;
      caps.classList.toggle("is-visible", e.getModifierState("CapsLock"));
    }

    input.addEventListener("keydown", updateCapsLock);
    input.addEventListener("keyup", updateCapsLock);
    input.addEventListener("blur", function () {
      caps.classList.remove("is-visible");
    });
    input.addEventListener("input", function () {
      status.textContent = "";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value.trim() === SITE_PASSWORD) {
        try { localStorage.setItem(AUTH_STORAGE_KEY, "granted"); } catch (_) { /* Access still works for this page. */ }
        document.body.style.overflow = "";
        root.classList.remove("auth-required");
        gate.remove();
        document.querySelectorAll(".reveal").forEach(function (el) {
          el.classList.add("is-revealed");
        });
        return;
      }

      status.textContent = "That password did not work. Please try again.";
      input.select();
    });
  }

  /* ---------------------------------------------------------------------
   * Mobile navigation toggle
   * ------------------------------------------------------------------- */
  function initNavToggle() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav__toggle");
    if (!nav || !toggle) return;

    function closeNav() {
      nav.classList.remove("nav--open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("nav--open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close on link click (mobile)
    nav.querySelectorAll(".nav__menu a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("nav--open")) {
        closeNav();
        toggle.focus();
      }
    });

    // A menu opened on a phone must not leave desktop scrolling locked.
    window.matchMedia("(max-width: 1200px)").addEventListener("change", function (event) {
      if (!event.matches && nav.classList.contains("nav--open")) closeNav();
    });
  }

  /* ---------------------------------------------------------------------
   * Header shadow on scroll
   * ------------------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const setScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });
  }

  /* ---------------------------------------------------------------------
   * Auto-highlight current nav link
   * ------------------------------------------------------------------- */
  function initActiveNav() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav__menu a").forEach(function (link) {
      const href = (link.getAttribute("data-page") || link.getAttribute("href") || "").toLowerCase();
      if (!href) return;
      const isHome = (path === "" || path === "index.html") &&
                     (href === "index.html" || href === "/" || href === "./");
      if (href === path || isHome) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Current year in footer
   * ------------------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------------------
   * Scroll reveal (no library)
   * ------------------------------------------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
   * Event category filtering
   * Buttons with [data-filter] toggle .hidden on [data-category] items.
   * ------------------------------------------------------------------- */
  function initEventFilters() {
    const bars = document.querySelectorAll("[data-filter-bar]");
    bars.forEach(function (bar) {
      const targetSel = bar.getAttribute("data-filter-bar");
      const items = document.querySelectorAll(targetSel + " [data-category]");
      const chips = bar.querySelectorAll(".filter-bar__chip");

      function apply(value) {
        items.forEach(function (item) {
          const cats = (item.getAttribute("data-category") || "").split(/\s+/);
          const show = value === "all" || cats.indexOf(value) !== -1;
          item.classList.toggle("hidden", !show);
        });
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed",
            String(c.getAttribute("data-filter") === value));
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          apply(chip.getAttribute("data-filter") || "all");
        });
      });
      apply("all");
    });
  }

  /* ---------------------------------------------------------------------
   * Founders' Day countdown. No date is assumed while confirmation is pending.
   * ------------------------------------------------------------------- */
  function initCountdown() {
    const panel = document.querySelector("[data-countdown]");
    if (!panel || typeof window.centennialTimeRemaining !== "function") return;
    const target = (window.SHERMAN_OAKS_100 || {}).foundersDay;
    const values = panel.querySelector("[data-countdown-values]");
    const message = panel.querySelector("[data-countdown-message]");
    const initial = window.centennialTimeRemaining(target, Date.now());
    if (!initial) return;
    let timer;
    function render() {
      const result = window.centennialTimeRemaining(target, Date.now());
      ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
        panel.querySelector('[data-unit="' + unit + '"]').textContent = String(result[unit]).padStart(2, "0");
      });
      values.hidden = false;
      message.textContent = result.complete ? "Founders’ Day has arrived. Celebrate with your neighbors!" :
        "Join us on " + new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/Los_Angeles" }).format(new Date(target)) + ".";
      if (result.complete && timer) window.clearInterval(timer);
    }
    render();
    if (!initial.complete) timer = window.setInterval(render, 1000);
  }

  /* ---------------------------------------------------------------------
   * Map placeholder pin tooltips (preview behavior)
   * ------------------------------------------------------------------- */
  function initMapPins() {
    document.querySelectorAll(".map-wrap__pin").forEach(function (pin) {
      pin.addEventListener("click", function () {
        const name = pin.getAttribute("data-name") || "Location";
        const msg = document.querySelector(".map-wrap__msg");
        if (msg) {
          msg.innerHTML =
            "<h3 style=\"margin:0 0 .5rem;font-family:var(--font-display);font-size:1.25rem;color:var(--primary-deep);\">" +
            name + "</h3>" +
            "<p style=\"margin:0;font-size:.9rem;color:var(--ink-700);\">" +
            "Placeholder location. Connect to Google My Maps or replace with real coordinates.</p>";
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Smooth-anchor offset for sticky header
   * ------------------------------------------------------------------- */
  function initAnchorOffset() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const id = link.getAttribute("href");
        if (!id || id === "#" || id.length < 2) return;
        const target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        const offset = 80;
        const rect = target.getBoundingClientRect();
        const y = rect.top + window.scrollY - offset;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
        // Move keyboard focus with the viewport, including the skip link.
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        history.pushState(null, "", id);
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Init on DOM ready
   * ------------------------------------------------------------------- */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initAuthGate();
    initNavToggle();
    initHeaderScroll();
    initActiveNav();
    initYear();
    initReveal();
    initEventFilters();
    initCountdown();
    initMapPins();
    initAnchorOffset();
  });
})();
