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

  // Keep shared/bookmarked homepage sponsorship hashes pointing to the full
  // details after those sections moved to dedicated static pages.
  function redirectSponsorshipHash() {
    const path = location.pathname.split("/").pop().toLowerCase();
    if (path && path !== "index.html") return false;
    const pages = {
      "#series-packages": "sponsorship-series.html",
      "#single-event": "sponsorship-events.html",
      "#centennial-opportunities": "sponsorship-centennial.html"
    };
    const page = pages[location.hash];
    if (!page) return false;
    location.replace(page + location.search + location.hash);
    return true;
  }

  /* ---------------------------------------------------------------------
   * Preview password gate
   * ------------------------------------------------------------------- */
  // The gate hides the page while it loads, so the browser's own jump to a
  // linked section (e.g. index.html#then-now-la-reina) finds nothing. Redo it
  // once the content is visible and the then-and-now tabs are ready.
  function hashTarget(hash) {
    let id = "";
    try { id = decodeURIComponent((hash || "").slice(1)); } catch (_) { return null; }
    return id && /^[\w-]+$/.test(id) ? document.getElementById(id) : null;
  }
  function revealTarget(target) {
    // A then-and-now view lives in a tab panel: open its tab first.
    const panel = target.closest("[data-tn-panel]");
    if (panel && panel.hidden && typeof panel.tnShow === "function") panel.tnShow();
  }
  function scrollToLinkedSection() {
    const target = hashTarget(location.hash);
    if (!target) return;
    revealTarget(target);
    target.scrollIntoView({ block: "start" });
  }

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
          "<img class=\"auth-gate__mark\" src=\"/assets/images/brand/sherman-oaks-centennial.webp\" width=\"637\" height=\"571\" alt=\"\" />" +
          "<span>Sherman Oaks<small>Centennial · 1927-2027</small></span>" +
        "</a>" +
        "<span class=\"eyebrow\">Preview Access</span>" +
        "<h1 id=\"auth-gate-title\">This website is currently being developed.</h1>" +
        "<p>For questions about Sherman Oaks 100, contact <a href=\"mailto:info@shermanoaks100.com\" target=\"_blank\" rel=\"noopener noreferrer\">info@shermanoaks100.com</a>.</p>" +
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
        scrollToLinkedSection();
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
   * Then-and-now comparisons. Without JS both photos show side by side;
   * here they become one frame with a draggable divider. The visually
   * hidden range input keeps the comparison keyboard and screen-reader
   * operable.
   * ------------------------------------------------------------------- */
  function initCompare() {
    document.querySelectorAll("[data-compare]").forEach(function (box) {
      const range = box.querySelector(".compare__range");
      if (!range) return;
      const thenLabel = box.getAttribute("data-then") || "earlier";
      let dragging = false;

      function set(value) {
        const v = Math.max(0, Math.min(100, value));
        box.style.setProperty("--pos", v + "%");
        range.value = String(Math.round(v));
        range.setAttribute("aria-valuetext", Math.round(v) + "% of the " + thenLabel + " view showing");
      }
      function fromPointer(e) {
        const rect = box.getBoundingClientRect();
        if (rect.width) set((e.clientX - rect.left) / rect.width * 100);
      }

      box.classList.add("compare--ready");
      range.addEventListener("input", function () { set(Number(range.value)); });
      box.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragging = true;
        // Touch waits for a horizontal move so a tap or vertical scroll does not jump.
        if (e.pointerType === "mouse") { fromPointer(e); box.setPointerCapture(e.pointerId); }
        range.focus({ preventScroll: true });
      });
      box.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        if (e.pointerType !== "mouse" && !box.hasPointerCapture(e.pointerId)) box.setPointerCapture(e.pointerId);
        fromPointer(e);
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
        box.addEventListener(type, function () { dragging = false; });
      });
      set(Number(range.value) || 50);
    });
  }

  /* ---------------------------------------------------------------------
   * Photo lightbox. Links still open the full image when JS or <dialog>
   * is unavailable.
   * ------------------------------------------------------------------- */
  function initLightbox() {
    const links = document.querySelectorAll("a[data-lightbox]");
    if (!links.length || typeof HTMLDialogElement !== "function") return;
    const dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", "Photo viewer");
    dialog.innerHTML = "<img alt=\"\" /><p class=\"lightbox__caption\"></p>" +
      "<button type=\"button\" class=\"lightbox__close\" aria-label=\"Close photo\">×</button>";
    document.body.append(dialog);
    const img = dialog.querySelector("img");
    const caption = dialog.querySelector(".lightbox__caption");
    let opener = null;

    dialog.querySelector(".lightbox__close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () {
      img.removeAttribute("src");
      if (opener) opener.focus({ preventScroll: true });
    });
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
        e.preventDefault();
        opener = link;
        const thumb = link.querySelector("img");
        img.src = link.getAttribute("href");
        img.alt = thumb ? thumb.alt : "";
        const figure = link.closest("figure");
        const text = figure && figure.querySelector("figcaption");
        const parts = text ? (text.children.length ? Array.from(text.children) : [text])
          .map(function (node) { return node.textContent.replace(/\s+/g, " ").trim(); }).filter(Boolean) : [];
        caption.textContent = parts.join(" — ");
        dialog.showModal();
      });
    });
  }

  /* ---------------------------------------------------------------------
   * In-page links: smooth scroll (CSS scroll-margin clears the sticky
   * header), move focus with the view and open then-and-now tabs. Delegated
   * so links added later (map popups) behave the same way.
   * ------------------------------------------------------------------- */
  function initAnchorLinks() {
    document.addEventListener("click", function (e) {
      const link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = link.getAttribute("href");
      if (href.indexOf("#place=") === 0) {
        // Map deep link: re-announce it even when the hash is unchanged.
        if (location.hash === href) { e.preventDefault(); window.dispatchEvent(new HashChangeEvent("hashchange")); }
        return;
      }
      const target = hashTarget(href);
      if (!target) return;
      e.preventDefault();
      revealTarget(target);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
      if (!target.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      history.pushState(null, "", href);
    });
  }

  /* ---------------------------------------------------------------------
   * Section navigation follows the reader. The link for the section under
   * the header is marked aria-current="location"; on phones the chip row
   * scrolls sideways to keep it in view. A thin bar shows page progress.
   * ------------------------------------------------------------------- */
  function initScrollSpy() {
    const header = document.querySelector(".site-header");
    const scroller = document.querySelector(".nav__scroller");
    const links = Array.from(document.querySelectorAll('.nav__menu a[href^="#"]'));
    const items = links.map(function (link) { return { link: link, section: hashTarget(link.getAttribute("href")) }; })
      .filter(function (item) { return item.section; });
    if (!header) return;
    let current = null, queued = false;

    function keepChipVisible(link) {
      if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
      // Measure against the scroller itself (offsetLeft is relative to the header).
      const box = scroller.getBoundingClientRect(), rect = link.getBoundingClientRect();
      const left = scroller.scrollLeft + rect.left - box.left - (scroller.clientWidth - rect.width) / 2;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scroller.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? "auto" : "smooth" });
    }
    function update() {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty("--progress", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
      if (!items.length) return;
      const line = header.offsetHeight + window.innerHeight * 0.3;
      let active = null;
      items.forEach(function (item) { if (item.section.getBoundingClientRect().top <= line) active = item; });
      if (max > 0 && max - window.scrollY < 4) active = items[items.length - 1];
      if (active === current) return;
      if (current) current.link.removeAttribute("aria-current");
      current = active;
      if (current) { current.link.setAttribute("aria-current", "location"); keepChipVisible(current.link); }
    }
    function queue() {
      if (queued) return;
      queued = true;
      // Animation frames pause in background tabs; fall back to a timer.
      if (document.hidden) setTimeout(update, 50); else window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    update();
    // Recheck once the preview gate reveals the page.
    new MutationObserver(queue).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------------------------------------------------------------------
   * Then & now viewer: without JS every comparison is listed; here they
   * become tabs (arrow keys move between them) with previous/next steps.
   * ------------------------------------------------------------------- */
  function initThenNowTabs() {
    document.querySelectorAll("[data-then-now-viewer]").forEach(function (viewer) {
      const tablist = viewer.querySelector(".tn-tabs");
      const tabs = Array.from(viewer.querySelectorAll(".tn-tab"));
      const panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute("data-tn-target")); });
      if (!tablist || !tabs.length || panels.some(function (p) { return !p; })) return;
      const reducedMotion = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

      function show(index, focusTab) {
        tabs.forEach(function (tab, i) {
          const on = i === index;
          tab.setAttribute("aria-selected", String(on));
          tab.tabIndex = on ? 0 : -1;
          panels[i].hidden = !on;
        });
        const tab = tabs[index];
        if (focusTab) tab.focus();
        if (tablist.scrollWidth > tablist.clientWidth) {
          const left = tablist.scrollLeft + tab.getBoundingClientRect().left - tablist.getBoundingClientRect().left - 16;
          tablist.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? "auto" : "smooth" });
        }
      }

      viewer.classList.add("tn-ready");
      tablist.hidden = false;
      tabs.forEach(function (tab, i) {
        const panel = panels[i];
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.setAttribute("data-tn-panel", "");
        panel.tabIndex = 0;
        panel.tnShow = function () { show(i, false); };
        tab.addEventListener("click", function () { show(i, false); });
        tab.addEventListener("keydown", function (e) {
          const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
          if (e.key in keys) { e.preventDefault(); show((i + keys[e.key] + tabs.length) % tabs.length, true); }
          else if (e.key === "Home") { e.preventDefault(); show(0, true); }
          else if (e.key === "End") { e.preventDefault(); show(tabs.length - 1, true); }
        });
        function go(delta) {
          const next = (i + delta + tabs.length) % tabs.length;
          show(next, false);
          if (viewer.getBoundingClientRect().top < 0) viewer.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
          tabs[next].focus({ preventScroll: true });
        }
        // A quiet "Next: place →" beside the drag hint shows there are more views.
        const hint = panel.querySelector(".compare__hint");
        if (hint) {
          const nextName = tabs[(i + 1) % tabs.length].querySelector("span").firstChild.textContent.trim();
          const nextLink = document.createElement("button");
          const arrow = document.createElement("span");
          nextLink.type = "button";
          nextLink.className = "tn-next";
          nextLink.textContent = "Next: " + nextName + " ";
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = "→";
          nextLink.append(arrow);
          nextLink.addEventListener("click", function () { go(1); });
          hint.append(nextLink);
        }
        const step = panel.querySelector(".tn-step");
        if (!step) return;
        step.hidden = false;
        step.querySelectorAll("[data-tn-step]").forEach(function (btn) {
          btn.addEventListener("click", function () { go(Number(btn.getAttribute("data-tn-step"))); });
        });
      });
      show(0, false);
      window.addEventListener("hashchange", function () {
        const target = hashTarget(location.hash);
        if (target) revealTarget(target);
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
    if (redirectSponsorshipHash()) return;
    window.addEventListener("hashchange", redirectSponsorshipHash);
    initAuthGate();
    initNavToggle();
    initHeaderScroll();
    initActiveNav();
    initYear();
    initReveal();
    initEventFilters();
    initMapPins();
    initCompare();
    initThenNowTabs();
    initLightbox();
    initAnchorLinks();
    initScrollSpy();
    if (!document.documentElement.classList.contains("auth-required")) scrollToLinkedSection();
  });
})();
