/* ==========================================================================
   MARTIN LOGISTICS — motion engine
   Lenis smooth scroll + GSAP ScrollTrigger.
   Two canvas pieces: the hero frame sequence and the dotted Africa network.
   ========================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COARSE = window.matchMedia("(pointer: coarse)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── Smooth scroll ────────────────────────────────────────────────────── */
  var lenis = null;
  function initLenis() {
    if (REDUCED || !window.Lenis) return;
    lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      syncTouch: false
    });
    lenis.on("scroll", function () { if (hasGSAP) ScrollTrigger.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Word split that keeps authored <br> ──────────────────────────────── */
  function splitWords(el) {
    if (el.dataset.split === "done") return;
    var out = document.createDocumentFragment();

    function pushWord(word) {
      var w = document.createElement("span");
      w.className = "w";
      var i = document.createElement("i");
      i.textContent = word;
      w.appendChild(i);
      out.appendChild(w);
      out.appendChild(document.createTextNode(" "));
    }

    [].slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.nodeValue.split(/\s+/).filter(Boolean).forEach(pushWord);
      } else if (node.nodeName === "BR") {
        out.appendChild(document.createElement("br"));
      } else if (node.nodeType === 1) {
        var w = document.createElement("span");
        w.className = "w";
        var i = document.createElement("i");
        i.appendChild(node.cloneNode(true));
        w.appendChild(i);
        out.appendChild(w);
        out.appendChild(document.createTextNode(" "));
      }
    });

    el.innerHTML = "";
    el.appendChild(out);
    el.dataset.split = "done";
  }

  /* ── Nav ──────────────────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var last = window.scrollY;

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle("solid", y > 30);
      nav.classList.toggle("up", y > 200 && y > last);
      last = y;
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
    if (!cur) return;
    if (COARSE) { cur.remove(); return; }
    var tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx = lerp(cx, tx, .2); cy = lerp(cy, ty, .2);
      cur.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a,button,.svc__row,.rail__card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("big"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("big"); });
    });
  }

  /* ── Preloader ────────────────────────────────────────────────────────── */
  function runPreloader(done) {
    var pre = document.getElementById("pre");
    if (!pre || !hasGSAP) { if (pre) pre.style.display = "none"; done(); return; }
    var bar = pre.querySelector(".pre__bar i");
    var pct = document.getElementById("prePct");
    var logo = pre.querySelector(".pre__logo");
    var c = { v: 0 };

    gsap.timeline({ onComplete: function () { pre.style.display = "none"; done(); } })
      .to(logo, { opacity: 1, duration: .45, ease: "power2.out" })
      .to(bar, { right: "0%", duration: REDUCED ? .1 : 1, ease: "power2.inOut" }, .1)
      .to(c, {
        v: 100, duration: REDUCED ? .1 : 1, ease: "power2.inOut",
        onUpdate: function () { if (pct) pct.textContent = String(Math.round(c.v)).padStart(3, "0"); }
      }, .1)
      .to(pre, { opacity: 0, duration: .5, ease: "power2.inOut" }, "+=0.1");
  }

  /* ══════════════════════════════════════════════════════════════════════
     Frame sequence renderer (shared)

     Draws a numbered WebP sequence to a canvas, cover-fitted and DPR aware.
     Frames arrive coarse-to-fine so the whole range is scrubbable early;
     until a given frame lands, the nearest decoded one is drawn instead.
     ══════════════════════════════════════════════════════════════════════ */
  function frameSequence(canvas) {
    var COUNT = parseInt(canvas.dataset.frames, 10) || 120;
    var PATH = canvas.dataset.path || "assets/seq/";
    var ctx = canvas.getContext("2d", { alpha: false });

    var frames = new Array(COUNT);
    var ready = new Array(COUNT);
    var shown = -1;
    var target = 0;

    function nearest(i) {
      if (ready[i]) return i;
      for (var r = 1; r < COUNT; r++) {
        if (i - r >= 0 && ready[i - r]) return i - r;
        if (i + r < COUNT && ready[i + r]) return i + r;
      }
      return -1;
    }

    function draw(force) {
      var idx = nearest(clamp(Math.round(target), 0, COUNT - 1));
      if (idx < 0 || (idx === shown && !force)) return;
      shown = idx;
      var img = frames[idx];
      var cw = canvas.width, ch = canvas.height;
      var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    function size() {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(true);
    }

    function load(i, done) {
      if (frames[i]) return;
      var img = new Image();
      img.decoding = "async";
      img.src = PATH + "f" + String(i).padStart(3, "0") + ".webp";
      frames[i] = img;
      img.onload = function () { ready[i] = true; if (done) done(); };
      img.onerror = function () { if (done) done(); };
    }

    load(0, function () { draw(true); });

    var order = [];
    for (var step = 8; step >= 1; step = Math.floor(step / 2)) {
      for (var i = 0; i < COUNT; i += step) if (order.indexOf(i) === -1) order.push(i);
      if (step === 1) break;
    }
    var qi = 0, live = 0, MAX = 6;
    (function pump() {
      while (live < MAX && qi < order.length) {
        var i = order[qi++];
        if (frames[i]) continue;
        live++;
        load(i, function () { live--; draw(); pump(); });
      }
    })();

    size();
    addEventListener("resize", size);

    return {
      count: COUNT,
      seek: function (p) { target = clamp(p, 0, 1) * (COUNT - 1); draw(); }
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     STAGE — locked camera, the truck crosses right to left

     The rig's size is set in CSS (--truck-w) and never touched here, so the
     only thing that changes is translateX. No scale, no perspective shift.
     ══════════════════════════════════════════════════════════════════════ */
  function initStage() {
    var stage = document.getElementById("stage");
    if (!stage) return;
    var rig = document.getElementById("rig");
    var caps = stage.querySelectorAll(".stage__cap");
    var odo = stage.querySelector("[data-odo]");
    var prog = stage.querySelector(".stage__prog i");
    var mark = stage.querySelector(".stage__h em");

    /* Entrance — independent of scroll so the page never opens on a blank frame. */
    if (hasGSAP) {
      var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro.from(".stage__kick", { opacity: 0, y: 12, duration: .8 })
        .from(".stage__h", { opacity: 0, y: 22, duration: 1.1 }, "-=0.5")
        .to(mark, { scaleX: 1, duration: .9, ease: "power3.inOut" }, "-=0.5")
        .from(".stage__foot", { opacity: 0, y: 16, duration: .9 }, "-=0.7")
        .from(".stage__odo", { opacity: 0, duration: .9 }, "-=0.8");
    }

    if (!hasGSAP || REDUCED) {
      if (caps[0]) caps[0].style.opacity = 1;
      return;
    }

    /* At rest the truck holds the composition of the source photograph —
       cab right of centre, air to its left. Scrolling drives it left until
       it has fully left the frame. Width never changes. */
    function restX() {
      var f = parseFloat(getComputedStyle(stage.querySelector(".stage__pin"))
        .getPropertyValue("--truck-rest")) || 0.38;
      return innerWidth * f;
    }
    function from() { return restX(); }
    function to() { return -(rig.offsetWidth + 40); }

    gsap.set(rig, { x: from() });

    var CROSS_IN = 0.05;   // truck starts moving
    var CROSS_OUT = 0.99;  // still clearing frame as the section hands over

    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: function (self) { place(self.progress); },
      onUpdate: function (self) { place(self.progress); }
    });

    function place(p) {
      var t = clamp((p - CROSS_IN) / (CROSS_OUT - CROSS_IN), 0, 1);
      gsap.set(rig, { x: lerp(from(), to(), t) });

      if (prog) prog.style.width = (p * 100).toFixed(2) + "%";
      if (odo) odo.textContent = Math.round(t * 1730).toLocaleString();

      /* Exactly one chapter is ever active — CSS handles the crossfade, so
         two captions can never stack on top of each other. */
      var n = caps.length;
      var active = clamp(Math.floor(t * n), 0, n - 1);
      for (var i = 0; i < n; i++) {
        caps[i].classList.toggle("on", i === active);
      }
    }

    place(0);

    /* The headline recedes but never leaves — once the truck has gone it is
       the only thing holding the frame, so it must not drop to nothing. */
    gsap.to(".stage__type", {
      opacity: .42, y: -16, ease: "none",
      scrollTrigger: { trigger: stage, start: "50% top", end: "80% top", scrub: .5 }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     REEL — the frame sequence, used as the paper-to-dark transition
     ══════════════════════════════════════════════════════════════════════ */
  function initReel() {
    var reel = document.getElementById("reel");
    if (!reel) return;
    var canvas = reel.querySelector(".reel__canvas");
    if (!canvas) return;

    var seq = frameSequence(canvas);
    if (!hasGSAP || REDUCED) { seq.seek(0.5); return; }

    ScrollTrigger.create({
      trigger: reel, start: "top top", end: "bottom bottom", scrub: .4,
      onUpdate: function (self) { seq.seek(self.progress); }
    });

    gsap.from(".reel__in", {
      opacity: 0, y: 26, ease: "none",
      scrollTrigger: { trigger: reel, start: "top top", end: "28% top", scrub: .6 }
    });
    gsap.to(".reel__in", {
      opacity: 0, y: -26, ease: "none",
      scrollTrigger: { trigger: reel, start: "68% top", end: "bottom bottom", scrub: .6 }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     DUST — Three.js mote field in the stage

     Vanilla three, no React. Gives the paper hero real atmospheric depth:
     motes sit at varying z, drift with the truck, and parallax on scroll.
     ══════════════════════════════════════════════════════════════════════ */
  function initDust() {
    var canvas = document.getElementById("dust");
    if (!canvas || !window.THREE || REDUCED || COARSE) return;

    var renderer, scene, camera, points, raf = null;
    var scroll = 0;

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    } catch (e) {
      return; // no webgl — the hero is complete without it
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 14;

    var N = 700;
    var pos = new Float32Array(N * 3);
    var speed = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
      speed[i] = 0.006 + Math.random() * 0.022;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    /* Soft round sprite so motes read as haze, not squares. */
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(20,20,24,1)");
    grd.addColorStop(0.45, "rgba(20,20,24,.5)");
    grd.addColorStop(1, "rgba(20,20,24,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);

    points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.1,
      map: new THREE.CanvasTexture(c),
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      sizeAttenuation: true
    }));
    scene.add(points);

    function size() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    size();
    addEventListener("resize", size);

    var arr = geo.getAttribute("position");
    function tick() {
      for (var i = 0; i < N; i++) {
        arr.array[i * 3] -= speed[i];           // drift left, with the truck
        if (arr.array[i * 3] < -23) arr.array[i * 3] = 23;
      }
      arr.needsUpdate = true;
      camera.position.y = scroll * 3.2;         // parallax against the page
      points.rotation.z = scroll * 0.06;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    /* Only run while the stage is on screen. */
    var stage = document.getElementById("stage");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && raf === null) tick();
        else if (!e.isIntersecting && raf !== null) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 });
    if (stage) io.observe(stage);

    if (hasGSAP && stage) {
      ScrollTrigger.create({
        trigger: stage, start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: function (self) { scroll = self.progress; }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     UI micro-interactions — Motion (the vanilla build of Framer Motion)
     ══════════════════════════════════════════════════════════════════════ */
  function initMicro() {
    var M = window.Motion;
    if (!M || REDUCED) return;

    /* Call these as methods, never detached: Motion's animate() silently
       no-ops when it loses its `this`, with no error to tell you why. */
    function anim(el, to, opts) { return M.animate(el, to, opts); }
    function spring(stiffness, damping) {
      return { type: "spring", stiffness: stiffness, damping: damping };
    }

    /* Springy press on every pill button */
    document.querySelectorAll(".btn").forEach(function (b) {
      b.addEventListener("pointerdown", function () {
        anim(b, { scale: 0.965 }, { duration: .12 });
      });
      ["pointerup", "pointerleave"].forEach(function (ev) {
        b.addEventListener(ev, function () {
          anim(b, { scale: 1 }, spring(420, 18));
        });
      });
    });

    /* Nav items lift a hair on hover */
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("pointerenter", function () { anim(a, { y: -2 }, spring(500, 20)); });
      a.addEventListener("pointerleave", function () { anim(a, { y: 0 }, spring(500, 22)); });
    });

    /* Menu items cascade in when the sheet opens */
    var burger = document.getElementById("burger");
    var sheet = document.getElementById("sheet");
    if (burger && sheet) {
      burger.addEventListener("click", function () {
        if (!sheet.classList.contains("open")) return;
        anim(sheet.querySelectorAll(".sheet__nav a"),
             { opacity: [0, 1], y: [22, 0] },
             { delay: M.stagger(0.05, { startDelay: 0.16 }), duration: .5 });
      });
    }

    /* Stat cards settle as they land */
    document.querySelectorAll(".num__c").forEach(function (el) {
      M.inView(el, function () {
        anim(el, { y: [14, 0], opacity: [0, 1] }, spring(240, 26));
      }, { amount: 0.4 });
    });

    /* Fleet cards lift under the cursor */
    document.querySelectorAll(".rail__card").forEach(function (c) {
      c.addEventListener("pointerenter", function () { anim(c, { y: -8 }, spring(300, 24)); });
      c.addEventListener("pointerleave", function () { anim(c, { y: 0 }, spring(300, 26)); });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     NETWORK — dotted Africa, scroll zooms from continent to corridor
     ══════════════════════════════════════════════════════════════════════ */
  function initNetwork() {
    var sec = document.getElementById("net");
    if (!sec) return;
    var canvas = sec.querySelector(".net__canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    var DATA = null;
    var progress = 0;
    var dpr = 1;

    /* Corridor legs, in order of reveal. Each spans two cities. */
    var LEGS = [
      { from: "mombasa", to: "nairobi", label: "Mombasa → Nairobi" },
      { from: "nairobi", to: "kigali", label: "Nairobi → Kigali" },
      { from: "dar", to: "kigali", label: "Dar es Salaam → Kigali" },
      { from: "kigali", to: "goma", label: "Kigali → DRC" },
      { from: "kigali", to: "lubumbashi", label: "Kigali → Southern DRC" }
    ];

    /* label text, horizontal side, vertical nudge — set by hand so the
       tightly-packed Great Lakes cities don't collide */
    var LABELS = {
      mombasa:    ["Mombasa", 1, 0],
      dar:        ["Dar es Salaam", 1, 0],
      nairobi:    ["Nairobi", 1, -1],
      kigali:     ["Kigali", -1, -1],
      goma:       ["Goma · DRC", -1, 1],
      lubumbashi: ["Lubumbashi", 1, 0],
      kampala:    ["Kampala", 1, -1]
    };

    fetch("assets/africa-dots.json")
      .then(function (r) { return r.json(); })
      .then(function (d) { DATA = d; resize(); });

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render();
    }

    /* The slice of canvas the map is allowed to occupy. Keeps the drawing
       clear of the copy instead of running underneath it. */
    function mapRect() {
      var cw = canvas.width, ch = canvas.height;
      if (cw / dpr >= 1000) {
        return { x: cw * 0.40, y: ch * 0.08, w: cw * 0.56, h: ch * 0.84 };
      }
      return { x: cw * 0.05, y: ch * 0.42, w: cw * 0.90, h: ch * 0.55 };
    }

    /* Map viewBox space -> canvas px, given a zoom window. */
    function makeView(p) {
      var vw = DATA.viewBox[0], vh = DATA.viewBox[1];

      // Wide: whole continent. Tight: the East African corridor, still
      // holding enough coastline to stay recognisably Africa.
      var wide = { x: 0, y: 0, w: vw, h: vh };
      var tight = { x: 615, y: 520, w: 310, h: 300 };

      var e = p * p * (3 - 2 * p); // smoothstep
      var box = {
        x: lerp(wide.x, tight.x, e),
        y: lerp(wide.y, tight.y, e),
        w: lerp(wide.w, tight.w, e),
        h: lerp(wide.h, tight.h, e)
      };

      var R = mapRect();
      var s = Math.min(R.w / box.w, R.h / box.h);
      var ox = R.x + R.w / 2 - (box.x + box.w / 2) * s;
      var oy = R.y + R.h / 2 - (box.y + box.h / 2) * s;
      return {
        s: s,
        px: function (x, y) { return [x * s + ox, y * s + oy]; }
      };
    }

    function render() {
      if (!DATA) return;
      var cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      var p = clamp(progress, 0, 1);
      var zoomP = clamp(p / 0.45, 0, 1);
      var v = makeView(zoomP);

      // Route reveal occupies the back half of the scroll.
      var routeP = clamp((p - 0.30) / 0.62, 0, 1);
      var legSpan = 1 / LEGS.length;

      var cities = DATA.cities;
      var R = mapRect();

      // Everything is drawn inside the map's own zone so it never wanders
      // under the copy once the view zooms in past the continent fit.
      ctx.save();
      ctx.beginPath();
      ctx.rect(R.x, R.y, R.w, R.h);
      ctx.clip();

      // Soften the clip edge so it reads as a fading field, not a crop.
      var FEATHER = Math.min(R.w, R.h) * 0.14;
      function edgeAlpha(x, y) {
        var d = Math.min(x - R.x, R.x + R.w - x, y - R.y, R.y + R.h - y);
        return clamp(d / FEATHER, 0, 1);
      }

      // ── dot field
      var r = clamp(v.s * 2.2, 0.7, 3.4);
      for (var i = 0; i < DATA.dots.length; i++) {
        var d = DATA.dots[i];
        var q = v.px(d[0], d[1]);
        if (q[0] < R.x - 4 || q[0] > R.x + R.w + 4 || q[1] < R.y - 4 || q[1] > R.y + R.h + 4) continue;
        var a = edgeAlpha(q[0], q[1]);
        if (a <= 0) continue;
        ctx.fillStyle = "rgba(244,241,232," + (0.15 * a).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(q[0], q[1], r, 0, 6.2832);
        ctx.fill();
      }

      // ── legs
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (var L = 0; L < LEGS.length; L++) {
        var leg = LEGS[L];
        var a = cities[leg.from], b = cities[leg.to];
        if (!a || !b) continue;

        var t = clamp((routeP - L * legSpan) / legSpan, 0, 1);
        if (t <= 0) continue;

        var A = v.px(a[0], a[1]), B = v.px(b[0], b[1]);

        // Bow the line so overlapping legs stay readable.
        var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        var dx = B[0] - A[0], dy = B[1] - A[1];
        var len = Math.hypot(dx, dy) || 1;
        var bow = len * 0.16;
        var cxp = mx - dy / len * bow, cyp = my + dx / len * bow;

        // partial quadratic via de Casteljau
        function qpt(tt) {
          var u = 1 - tt;
          return [
            u * u * A[0] + 2 * u * tt * cxp + tt * tt * B[0],
            u * u * A[1] + 2 * u * tt * cyp + tt * tt * B[1]
          ];
        }

        ctx.strokeStyle = "rgba(237,216,54,0.85)";
        ctx.lineWidth = Math.max(1, v.s * 1.5);
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        var STEPS = 40;
        for (var k = 1; k <= STEPS * t; k++) {
          var pt = qpt(k / STEPS);
          ctx.lineTo(pt[0], pt[1]);
        }
        ctx.stroke();

        // travelling head
        if (t < 1) {
          var head = qpt(t);
          ctx.fillStyle = "#EDD836";
          ctx.beginPath();
          ctx.arc(head[0], head[1], Math.max(2.5, v.s * 3.2), 0, 6.2832);
          ctx.fill();
          ctx.strokeStyle = "rgba(237,216,54,.28)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(head[0], head[1], Math.max(7, v.s * 9), 0, 6.2832);
          ctx.stroke();
        }
      }

      // ── city nodes + labels
      // Labels only earn their place once the view has zoomed in enough
      // for them not to pile on top of each other.
      var labelA = clamp((zoomP - 0.35) / 0.4, 0, 1);
      // Canvas is scaled by dpr, so size the label in device pixels.
      var fs = clamp(v.s * 9, 10.5 * dpr, 13.5 * dpr);
      ctx.font = "500 " + fs + "px 'JetBrains Mono', monospace";
      ctx.textBaseline = "middle";

      Object.keys(cities).forEach(function (key) {
        var c = cities[key];
        var q = v.px(c[0], c[1]);
        if (q[0] < -60 || q[0] > cw + 60 || q[1] < -40 || q[1] > ch + 40) return;

        var active = LEGS.some(function (l, li) {
          return (l.from === key || l.to === key) &&
                 routeP > li * legSpan;
        });

        ctx.fillStyle = active ? "#EDD836" : "rgba(244,241,232,.45)";
        ctx.beginPath();
        ctx.arc(q[0], q[1], Math.max(2, v.s * 2.6), 0, 6.2832);
        ctx.fill();

        if (active) {
          ctx.strokeStyle = "rgba(237,216,54,.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(q[0], q[1], Math.max(6, v.s * 7), 0, 6.2832);
          ctx.stroke();
        }

        if (labelA > 0) {
          var spec = LABELS[key] || [key, 1, 0];
          var off = Math.max(10, v.s * 9);
          ctx.textAlign = spec[1] > 0 ? "left" : "right";
          ctx.fillStyle = active
            ? "rgba(237,216,54," + (0.95 * labelA).toFixed(3) + ")"
            : "rgba(244,241,232," + (0.38 * labelA).toFixed(3) + ")";
          ctx.fillText(spec[0].toUpperCase(),
                       q[0] + off * spec[1],
                       q[1] + spec[2] * fs * 1.15);
        }
      });

      ctx.restore();
    }

    addEventListener("resize", resize);
    resize();

    var legEls = sec.querySelectorAll(".net__leg");
    var kmEl = sec.querySelector("[data-km]");

    if (!hasGSAP || REDUCED) {
      progress = 1;
      render();
      legEls.forEach(function (el) { el.classList.add("live"); });
      return;
    }

    ScrollTrigger.create({
      trigger: sec, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        progress = self.progress;
        render();

        var routeP = clamp((progress - 0.30) / 0.62, 0, 1);
        var idx = Math.floor(routeP * LEGS.length);
        legEls.forEach(function (el, i) { el.classList.toggle("live", i <= idx && routeP > 0); });

        if (kmEl) {
          var km = Math.round(routeP * 3330);
          kmEl.textContent = km.toLocaleString();
        }
      }
    });
  }

  /* ── Reveals ──────────────────────────────────────────────────────────── */
  function initReveals() {
    if (!hasGSAP) {
      document.querySelectorAll(".fade,.rise,.rv").forEach(function (el) {
        el.style.opacity = 1; el.style.transform = "none";
      });
      return;
    }
    document.querySelectorAll(".rv").forEach(function (el) {
      splitWords(el);
      var inner = el.querySelectorAll(".w > i");
      gsap.set(inner, { yPercent: 110 });
      gsap.to(inner, {
        yPercent: 0, duration: .95, ease: "expo.out", stagger: .03,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    gsap.utils.toArray(".rise").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true }
      });
    });
    gsap.utils.toArray(".fade").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 94%", once: true }
      });
    });
  }

  /* ── Counters ─────────────────────────────────────────────────────────── */
  function initCounters() {
    if (!hasGSAP) return;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var to = parseFloat(el.dataset.count);
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 94%", once: true,
        onEnter: function () {
          gsap.to(o, {
            v: to, duration: 1.7, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(o.v); }
          });
        }
      });
    });
  }

  /* ── Fleet rail ───────────────────────────────────────────────────────── */
  function initRail() {
    var rail = document.getElementById("rail");
    if (!rail || !hasGSAP || REDUCED) return;
    var track = rail.querySelector(".rail__track");
    if (!track) return;

    function distance() {
      var pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
      return Math.max(0, track.scrollWidth - innerWidth + pad);
    }
    function sizeRail() { rail.style.height = innerHeight + distance() + "px"; }
    sizeRail();

    gsap.to(track, {
      x: function () { return -distance(); },
      ease: "none",
      scrollTrigger: {
        trigger: rail, start: "top top",
        end: function () { return "+=" + distance(); },
        scrub: .5, invalidateOnRefresh: true
      }
    });
    ScrollTrigger.addEventListener("refreshInit", sizeRail);
  }

  /* ── Services hover peek ──────────────────────────────────────────────── */
  function initPeek() {
    var peek = document.getElementById("peek");
    if (!peek || COARSE) return;
    var img = peek.querySelector("img");
    var rows = document.querySelectorAll(".svc__row[data-img]");
    if (!rows.length) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx = lerp(cx, tx, .14); cy = lerp(cy, ty, .14);
      if (on) peek.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function (e) {
        img.src = row.dataset.img;
        tx = cx = e.clientX; ty = cy = e.clientY;
        peek.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
        on = true; peek.classList.add("on");
      });
      row.addEventListener("mouseleave", function () { on = false; peek.classList.remove("on"); });
    });
  }

  /* ── Marquees ─────────────────────────────────────────────────────────── */
  function initMarquees() {
    if (!hasGSAP) return;
    document.querySelectorAll("[data-marquee]").forEach(function (el) {
      var speed = parseFloat(el.dataset.marquee) || 34;
      var track = el.querySelector(".marq__t, .tick__t");
      if (track) gsap.to(track, { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
    });
  }

  /* ── Parallax ─────────────────────────────────────────────────────────── */
  function initParallax() {
    if (!hasGSAP || REDUCED) return;
    gsap.utils.toArray("[data-par]").forEach(function (el) {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.par) || 10, ease: "none",
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
    initNetwork();
    initRail();
    initPeek();
    initMarquees();
    initParallax();
    initReel();
    initDust();
    initMicro();
    runPreloader(function () {
      initStage();
      if (hasGSAP) ScrollTrigger.refresh();
    });
  });

  addEventListener("load", function () { if (hasGSAP) ScrollTrigger.refresh(); });
})();
