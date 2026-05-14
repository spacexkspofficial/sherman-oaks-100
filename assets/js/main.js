/* ==========================================================================
   Sherman Oaks 100 — Site JavaScript
   --------------------------------------------------------------------------
   Vanilla JS. No build step. No dependencies. Loads on every page.
   Most behaviors are progressive enhancement: site works without JS.
   ========================================================================== */
(function () {
  "use strict";

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
   * Mock forms — for any form that should never leave the browser
   * (kept for backward compat; most live forms use the mailto handler).
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
   * Mailto forms — open the user's email client with a prefilled draft.
   *
   * Usage on a <form>:
   *   data-mailto-form="hello@shermanoaks100.com"     (required: To address)
   *   data-mailto-subject="Sherman Oaks 100 — Topic"  (optional: base subject)
   *   data-mailto-subject-field="topic"               (optional: append the
   *                                                    value of a named field
   *                                                    to the subject)
   *   data-success-msg="Opening your email app..."    (optional status text)
   *
   * GitHub Pages can't receive form data, so we hand the user's input to
   * their email client as a prepared draft. Swap this for Formspree/Basin/
   * Google Forms when ready for direct inbox delivery (see README).
   * ------------------------------------------------------------------- */
  function initMailtoForms() {
    document.querySelectorAll("[data-mailto-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const to = form.getAttribute("data-mailto-form") || "hello@example.com";
        let subject = form.getAttribute("data-mailto-subject") ||
                      "Message from the Sherman Oaks 100 website";

        // Append a dynamic value from a named field (e.g., contact topic)
        const subjField = form.getAttribute("data-mailto-subject-field");
        if (subjField) {
          const subjEl = form.querySelector("[name='" + subjField + "']");
          if (subjEl && subjEl.value) {
            subject = subject + ": " + subjEl.value;
          }
        }

        // Build a readable body from the form fields
        const lines = [];
        const seen = {};
        const fields = form.querySelectorAll("input, select, textarea");
        fields.forEach(function (el) {
          if (!el.name) return;
          if (el.type === "submit" || el.type === "button") return;
          if ((el.type === "checkbox" || el.type === "radio") && !el.checked) return;
          if (el.value === "") return;
          const label = el.name
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
          if (seen[el.name] != null) {
            lines[seen[el.name]] += ", " + el.value;
          } else {
            seen[el.name] = lines.length;
            lines.push(label + ": " + el.value);
          }
        });
        lines.push("");
        lines.push("— Sent from the Sherman Oaks 100 website");

        const body = lines.join("\r\n");
        const mailto = "mailto:" + to +
                       "?subject=" + encodeURIComponent(subject) +
                       "&body=" + encodeURIComponent(body);

        const status = form.querySelector(".form__status");
        if (status) {
          const msg = form.getAttribute("data-success-msg") ||
                      "Opening your email app to send your message...";
          status.textContent = msg;
          status.classList.add("is-visible");
        }

        // Hand off to the email client.
        window.location.href = mailto;
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
    initNavToggle();
    initHeaderScroll();
    initActiveNav();
    initYear();
    initReveal();
    initEventFilters();
    initForms();
    initMailtoForms();
    initMapPins();
    initAnchorOffset();
  });
})();
