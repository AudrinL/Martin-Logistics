/* ==========================================================================
   MARTIN LOGISTICS — motion engine
   Lenis (smooth scroll) + GSAP ScrollTrigger
   ========================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COARSE = window.matchMedia("(pointer: coarse)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();

  /* ── Smooth scroll ────────────────────────────────────────────────────── */
  var lenis = null;
  function initLenis() {
    if (REDUCED || !window.Lenis) return;
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      syncTouch: false
    });
    lenis.on("scroll", function () { if (hasGSAP) ScrollTrigger.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Word splitting for line reveals ──────────────────────────────────── */
  /* Walks child nodes rather than reading textContent, so authored <br>
     line breaks inside a heading survive the split. */
  function splitWords(el) {
    if (el.dataset.split === "done") return;

    var out = document.createDocumentFragment();

    function pushWord(word) {
      var w = document.createElement("span");
      w.className = "w";
      var inner = document.createElement("i");
      inner.textContent = word;
      w.appendChild(inner);
      out.appendChild(w);
      out.appendChild(document.createTextNode(" "));
    }

    [].slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var words = node.nodeValue.split(/\s+/).filter(Boolean);
        words.forEach(pushWord);
      } else if (node.nodeName === "BR") {
        out.appendChild(document.createElement("br"));
      } else if (node.nodeType === 1) {
        /* Keep inline elements (em, span…) whole — one animated unit. */
        var w = document.createElement("span");
        w.className = "w";
        var inner = document.createElement("i");
        inner.appendChild(node.cloneNode(true));
        w.appendChild(inner);
        out.appendChild(w);
        out.appendChild(document.createTextNode(" "));
      }
    });

    el.innerHTML = "";
    el.appendChild(out);
    el.dataset.split = "done";
  }

  /* ── Navigation ───────────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var last = window.scrollY;

    function onScroll() {
      var cur = window.scrollY;
      nav.classList.toggle("solid", cur > 40);
      if (cur > 200 && cur > last) nav.classList.add("up");
      else nav.classList.remove("up");
      last = cur;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var burger = document.getElementById("burger");
    var sheet = document.getElementById("sheet");
    if (!burger || !sheet) return;

    burger.addEventListener("click", function () {
      var open = sheet.classList.toggle("open");
      burger.classList.toggle("x", open);
      document.body.classList.toggle("is-locked", open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    sheet.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        sheet.classList.remove("open");
        burger.classList.remove("x");
        document.body.classList.remove("is-locked");
        if (lenis) lenis.start();
      });
    });
  }

  /* ── Cursor ───────────────────────────────────────────────────────────── */
  function initCursor() {
    var cur = document.getElementById("cur");
    if (!cur || COARSE) { if (cur) cur.remove(); return; }
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty;

    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cur.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("a, button, .svc__row, .rail__card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("big"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("big"); });
    });
  }

  /* ── Preloader ────────────────────────────────────────────────────────── */
  function runPreloader(done) {
    var pre = document.getElementById("pre");
    if (!pre || !hasGSAP) {
      if (pre) pre.style.display = "none";
      done();
      return;
    }
    var bar = pre.querySelector(".pre__bar i");
    var pct = document.getElementById("prePct");
    var logo = pre.querySelector(".pre__logo");
    var counter = { v: 0 };

    var tl = gsap.timeline({
      onComplete: function () { pre.style.display = "none"; done(); }
    });
    tl.to(logo, { opacity: 1, duration: .5, ease: "power2.out" })
      .to(bar, { right: "0%", duration: REDUCED ? .1 : 1.15, ease: "power2.inOut" }, 0.1)
      .to(counter, {
        v: 100, duration: REDUCED ? .1 : 1.15, ease: "power2.inOut",
        onUpdate: function () { if (pct) pct.textContent = String(Math.round(counter.v)).padStart(3, "0"); }
      }, 0.1)
      .to(pre, { opacity: 0, duration: .55, ease: "power2.inOut" }, "+=0.12");
  }

  /* ── Hero: scroll-scrubbed video ──────────────────────────────────────── */
  function initHero() {
    var hero = document.getElementById("hero");
    if (!hero || !hasGSAP) return;

    var vid = hero.querySelector(".hero__vid");
    var l1 = hero.querySelectorAll(".hero__l1 > i");
    var l2 = hero.querySelectorAll(".hero__l2 > i");
    var foot = hero.querySelector(".hero__foot");
    var kick = hero.querySelector(".hero__kick");
    var railFill = hero.querySelector(".hero__rail i");

    /* Entrance */
    var intro = gsap.timeline();
    intro.from(kick, { opacity: 0, y: 16, duration: .8, ease: "power2.out" })
      .from(l1, { yPercent: 115, duration: 1.15, ease: "expo.out", stagger: .08 }, "-=0.5")
      .from(l2, { yPercent: 115, duration: 1.15, ease: "expo.out", stagger: .08 }, "-=0.95")
      .from(foot, { opacity: 0, y: 22, duration: .9, ease: "power2.out" }, "-=0.6");

    if (REDUCED) return;

    /* Video scrub — drive currentTime from scroll progress. */
    if (vid) {
      var state = { t: 0 };
      var ready = false;
      var applyFrame = function () {
        if (!ready) return;
        var d = vid.duration;
        if (!d || !isFinite(d)) return;
        var target = Math.min(d - 0.05, Math.max(0, state.t * d));
        if (Math.abs(vid.currentTime - target) > 0.015) vid.currentTime = target;
      };
      var markReady = function () { ready = true; applyFrame(); };
      if (vid.readyState >= 2) markReady();
      vid.addEventListener("loadeddata", markReady, { once: true });

      gsap.to(state, {
        t: 1, ease: "none",
        scrollTrigger: {
          trigger: hero, start: "top top", end: "bottom bottom",
          scrub: 0.35, onUpdate: applyFrame
        }
      });
    }

    /* Type parts and lifts away as the corridor opens up. */
    gsap.timeline({
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: .6 }
    })
      .to(".hero__l1", { xPercent: -12, opacity: .12, ease: "none" }, 0)
      .to(".hero__l2", { xPercent: 10, opacity: .12, ease: "none" }, 0)
      .to(".hero__foot", { opacity: 0, y: -30, ease: "none" }, 0)
      .to(".hero__kick", { opacity: 0, ease: "none" }, 0)
      .to(".hero__veil", { opacity: 1.35, ease: "none" }, 0);

    if (railFill) {
      gsap.to(railFill, {
        height: "100%", ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: .3 }
      });
    }
  }

  /* ── Generic reveals ──────────────────────────────────────────────────── */
  function initReveals() {
    if (!hasGSAP) {
      document.querySelectorAll(".fade,.rise,.rv").forEach(function (el) {
        el.style.opacity = 1; el.style.transform = "none";
      });
      return;
    }

    document.querySelectorAll(".rv").forEach(function (el) {
      splitWords(el);
      var inners = el.querySelectorAll(".w > i");
      gsap.set(inners, { yPercent: 112 });
      gsap.to(inners, {
        yPercent: 0, duration: 1.05, ease: "expo.out", stagger: .035,
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });

    gsap.utils.toArray(".rise").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .95, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });

    gsap.utils.toArray(".fade").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, duration: 1.1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true }
      });
    });
  }

  /* ── Counters ─────────────────────────────────────────────────────────── */
  function initCounters() {
    if (!hasGSAP) return;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: target, duration: 1.9, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(obj.v); }
          });
        }
      });
    });
  }

  /* ── Corridor: route draw + stop activation ───────────────────────────── */
  function initCorridor() {
    var cor = document.getElementById("cor");
    if (!cor || !hasGSAP) return;

    var paths = cor.querySelectorAll(".rt");
    var nodes = cor.querySelectorAll(".nd, .lb");
    var stops = cor.querySelectorAll(".cor__stop");

    paths.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    gsap.set(nodes, { opacity: 0 });

    if (REDUCED) {
      paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
      gsap.set(nodes, { opacity: 1 });
      stops.forEach(function (s) { s.classList.add("live"); });
      return;
    }

    var tl = gsap.timeline({
      scrollTrigger: { trigger: cor, start: "top top", end: "bottom bottom", scrub: .7 }
    });

    paths.forEach(function (p, i) {
      tl.to(p, { strokeDashoffset: 0, ease: "none", duration: 1 }, i * 0.75);
    });
    tl.to(nodes, { opacity: 1, duration: .4, stagger: .06, ease: "none" }, 0.3);

    /* Light each stop as the scroll passes its slice of the pin. */
    stops.forEach(function (stop, i) {
      ScrollTrigger.create({
        trigger: cor,
        start: "top top",
        end: "bottom bottom",
        onUpdate: function (self) {
          var slice = self.progress * stops.length;
          stop.classList.toggle("live", slice >= i && slice < i + 1.35);
        }
      });
    });
  }

  /* ── Fleet rail: vertical scroll → horizontal travel ──────────────────── */
  function initRail() {
    var rail = document.getElementById("rail");
    if (!rail || !hasGSAP || REDUCED) return;
    var track = rail.querySelector(".rail__track");
    if (!track) return;

    /* Read the resolved padding off the track — a custom property would come
       back as the literal clamp() string and parse to NaN. */
    function distance() {
      var pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
      return Math.max(0, track.scrollWidth - window.innerWidth + pad);
    }

    /* The section is as tall as the horizontal travel, so the two feel 1:1. */
    function sizeRail() {
      rail.style.height = window.innerHeight + distance() + "px";
    }
    sizeRail();

    gsap.to(track, {
      x: function () { return -distance(); },
      ease: "none",
      scrollTrigger: {
        trigger: rail,
        start: "top top",
        end: function () { return "+=" + distance(); },
        scrub: .6,
        invalidateOnRefresh: true
      }
    });

    ScrollTrigger.addEventListener("refreshInit", sizeRail);
  }

  /* ── Convoy: truck drives the full width across the scroll range ──────── */
  function initConvoy() {
    var sec = document.getElementById("convoy");
    if (!sec || !hasGSAP) return;
    var truck = sec.querySelector(".convoy__truck");
    if (!truck) return;

    if (REDUCED) {
      gsap.set(truck, { x: window.innerWidth * 0.15 });
      return;
    }

    gsap.fromTo(truck,
      { x: function () { return window.innerWidth + 60; } },
      {
        x: function () { return -(truck.offsetWidth + 80); },
        ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top bottom", end: "bottom top",
          scrub: .5, invalidateOnRefresh: true
        }
      }
    );
  }

  /* ── Services: cursor-follow image peek ───────────────────────────────── */
  function initServicePeek() {
    var peek = document.getElementById("peek");
    if (!peek || COARSE) return;
    var img = peek.querySelector("img");
    var rows = document.querySelectorAll(".svc__row[data-img]");
    if (!rows.length) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (active) peek.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function (e) {
        img.src = row.dataset.img;
        /* Seed from the entry point so it grows at the cursor
           instead of flying in from wherever it was left. */
        tx = cx = e.clientX;
        ty = cy = e.clientY;
        peek.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
        active = true;
        peek.classList.add("on");
      });
      row.addEventListener("mouseleave", function () {
        active = false;
        peek.classList.remove("on");
      });
    });
  }

  /* ── Marquees ─────────────────────────────────────────────────────────── */
  function initMarquees() {
    if (!hasGSAP) return;
    document.querySelectorAll("[data-marquee]").forEach(function (el) {
      var speed = parseFloat(el.dataset.marquee) || 34;
      var track = el.querySelector(".marq__t, .tick__t");
      if (!track) return;
      /* Content is duplicated in markup, so -50% is a seamless loop. */
      gsap.to(track, { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
    });
  }

  /* ── Parallax on tagged elements ──────────────────────────────────────── */
  function initParallax() {
    if (!hasGSAP || REDUCED) return;
    gsap.utils.toArray("[data-par]").forEach(function (el) {
      var amt = parseFloat(el.dataset.par) || 12;
      gsap.to(el, {
        yPercent: amt, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    initLenis();
    initNav();
    initCursor();
    initReveals();
    initCounters();
    initCorridor();
    initConvoy();
    initRail();
    initServicePeek();
    initMarquees();
    initParallax();

    runPreloader(function () {
      initHero();
      if (hasGSAP) ScrollTrigger.refresh();
    });
  });

  window.addEventListener("load", function () { if (hasGSAP) ScrollTrigger.refresh(); });
})();
