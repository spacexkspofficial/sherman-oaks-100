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

    if (localStorage.getItem(AUTH_STORAGE_KEY) === "granted") {
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
            "<input id=\"auth-password\" name=\"password\" type=\"password\" required />" +
            "<button class=\"btn btn--accent\" type=\"submit\">Enter site</button>" +
          "</div>" +
          "<p class=\"auth-gate__status\" aria-live=\"polite\"></p>" +
        "</form>" +
      "</div>";

    document.body.prepend(gate);
    document.body.style.overflow = "hidden";

    const form = gate.querySelector(".auth-gate__form");
    const input = gate.querySelector("#auth-password");
    const status = gate.querySelector(".auth-gate__status");

    window.setTimeout(function () {
      input.focus();
    }, 0);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value === SITE_PASSWORD) {
        localStorage.setItem(AUTH_STORAGE_KEY, "granted");
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

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("nav--open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close on link click (mobile)
    nav.querySelectorAll(".nav__menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("nav--open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("nav--open")) {
        nav.classList.remove("nav--open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
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
      const href = (link.getAttribute("href") || "").toLowerCase();
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
   * Mock forms — for any form that should never leave the browser.
   * ------------------------------------------------------------------- */
  function initForms() {
    document.querySelectorAll("[data-mock-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const status = form.querySelector(".form__status");
        if (status) {
          const msg = form.getAttribute("data-success-msg") ||
                      "Thank you — we'll be in touch soon.";
          status.textContent = msg;
          status.classList.add("is-visible");
        }
        form.reset();
      });
    });
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
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = 80;
        const rect = target.getBoundingClientRect();
        const y = rect.top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: "smooth" });
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
    initForms();
    initMapPins();
    initAnchorOffset();
  });
})();
