/* The network globe: a dotted sphere with the corridor drawn as great-circle
   arcs off the Kigali hub.

   Same contract as the flat renderer it replaces — setData / setProgress /
   resize — so the component keeps owning the element and the scroll trigger
   while this owns the pixels. It adds drag(), because this one is handled.

   Projection is orthographic off real 3-space rather than the usual 2D
   "fake globe" ellipse maths. Working in vectors is what makes the arcs
   honest: they can lift off the surface, pass behind the limb and get culled
   per-point, and the hub can be occluded when it rotates round the back —
   none of which falls out of a 2D approximation. */

export type MapData = {
  /** [lon, lat] in degrees. */
  dots: [number, number][];
};

const RAD = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Spokes off the hub, in order of reveal. */
export const LEGS = [
  { from: "kigali", to: "mombasa" },
  { from: "kigali", to: "nairobi" },
  { from: "kigali", to: "dar" },
  { from: "kigali", to: "goma" },
  { from: "kigali", to: "lubumbashi" },
] as const;

/* Real coordinates, not positions read back off the old flat map. The globe
   needs true lon/lat and these are fixed points on the earth, so there is
   nothing to derive at runtime. */
const CITIES: Record<string, [number, number]> = {
  mombasa:    [39.67, -4.04],
  dar:        [39.28, -6.82],
  nairobi:    [36.82, -1.29],
  kigali:     [30.06, -1.94],
  goma:       [29.22, -1.68],
  lubumbashi: [27.48, -11.66],
};

const LABELS: Record<string, [string, number, number]> = {
  mombasa: ["Mombasa", 1, 0],
  dar: ["Dar es Salaam", 1, 1],
  nairobi: ["Nairobi", 1, -1],
  kigali: ["Kigali", -1, -1],
  goma: ["Goma · DRC", -1, 1],
  lubumbashi: ["Lubumbashi", -1, 1],
};

const HUB = "kigali";

/** Depth shading for the land dots, quantised so the draw loop never builds a
    colour string. Index by z (0 at the limb, 1 facing camera). */
const SHADES = Array.from({ length: 24 }, (_, i) =>
  `rgba(237,216,54,${(0.30 + 0.5 * (i / 23)).toFixed(3)})`,
);

type Vec = [number, number, number];

/* Longitude runs onto +x and the prime meridian faces the camera on +z.
   The previous form put lon on the *cosine* of x, which silently mirrors the
   world east-for-west — Madagascar came out on Africa's Atlantic side. */
function toVec(lon: number, lat: number): Vec {
  const la = lat * RAD, lo = lon * RAD;
  const c = Math.cos(la);
  return [c * Math.sin(lo), Math.sin(la), c * Math.cos(lo)];
}

/* Rotate the sphere so the camera sits over (lon0, lat0). Reduces to the
   textbook orthographic projection:
     x = cos(lat) sin(lon - lon0)
     y = cos(lat0) sin(lat) - sin(lat0) cos(lat) cos(lon - lon0)
   with z > 0 the near hemisphere. */
function rotate(v: Vec, lon0: number, lat0: number): Vec {
  const cl = Math.cos(lon0), sl = Math.sin(lon0);
  const x = v[0] * cl - v[2] * sl;
  const z0 = v[0] * sl + v[2] * cl;
  const cp = Math.cos(lat0), sp = Math.sin(lat0);
  return [x, v[1] * cp - z0 * sp, v[1] * sp + z0 * cp];
}

/** Great-circle interpolation, lifted off the surface at the midpoint. */
function arcPoint(a: Vec, b: Vec, t: number, lift: number): Vec {
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const om = Math.acos(dot);
  const so = Math.sin(om);
  let p: Vec;
  if (so < 1e-6) {
    p = [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  } else {
    const w1 = Math.sin((1 - t) * om) / so;
    const w2 = Math.sin(t * om) / so;
    p = [a[0] * w1 + b[0] * w2, a[1] * w1 + b[1] * w2, a[2] * w1 + b[2] * w2];
  }
  const r = 1 + lift * Math.sin(Math.PI * t);
  return [p[0] * r, p[1] * r, p[2] * r];
}

export function createNetworkRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let data: MapData | null = null;
  let land: Vec[] = [];
  let cities: Record<string, Vec> = {};
  let progress = 0;
  let dpr = 1;

  /* Camera. restYaw is the orientation the globe returns to — parked on the
     corridor so the hub faces us. The idle motion oscillates around it rather
     than integrating into it: a free-running `yaw += k` looks fine for a few
     seconds and then quietly rotates East Africa round the back, so by the
     time anyone scrolls here the arcs are drawing on the far side. Dragging
     adopts wherever the user left it as the new rest. */
  let restLon = 32 * RAD;   // camera longitude — parked over the corridor
  let lon0 = restLon;
  let lat0 = -3 * RAD;
  let phase = 0;
  let spin = 0;          // drag momentum, decays
  let dragging = false;

  const monoFamily = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
    "ui-monospace";

  /* The slice of canvas the globe may occupy — clear of the copy rather than
     running underneath it, matching how the flat map behaved.

     Scroll drives a dolly-in rather than a reveal: the sphere grows from a bit
     over its resting size to roughly three times it, so the section opens on a
     whole planet and ends up close over the corridor. Zoom is applied about
     the disc centre, and the camera already sits on the corridor, so the
     destinations stay put in frame while everything else swells past the edge.
     Eased so the move loads at the start and settles rather than tracking the
     wheel linearly. */
  function globeBox() {
    const cw = canvas.width, ch = canvas.height;
    // Smoothstep, not easeOut: the section has to open on a whole planet, so
    // the move needs a gentle start. An easeOut front-loads it and the globe
    // is already filling the frame before you have registered it as a globe.
    const ease = progress * progress * (3 - 2 * progress);
    const zoom = 1 + ease * 2.2;
    if (cw / dpr >= 1000) {
      return { cx: cw * 0.68, cy: ch * 0.5, r: Math.min(cw * 0.40, ch * 0.56) * zoom };
    }
    return { cx: cw * 0.5, cy: ch * 0.58, r: Math.min(cw * 0.58, ch * 0.38) * zoom };
  }

  function project(v: Vec, cx: number, cy: number, r: number) {
    const p = rotate(v, lon0, lat0);
    return { x: cx + p[0] * r, y: cy - p[1] * r, z: p[2] };
  }

  function render() {
    const cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!data) return;

    const { cx, cy, r } = globeBox();

    // ── Atmosphere ────────────────────────────────────────────────────────
    const halo = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.22);
    halo.addColorStop(0, "rgba(237,216,54,.20)");
    halo.addColorStop(1, "rgba(237,216,54,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2);
    ctx.fill();

    // ── The sphere ────────────────────────────────────────────────────────
    // Lit from upper-left so it reads as a ball, not a disc.
    const body = ctx.createRadialGradient(
      cx - r * 0.36, cy - r * 0.4, r * 0.06, cx, cy, r,
    );
    body.addColorStop(0, "#3A3418");
    body.addColorStop(0.55, "#1E1B0F");
    body.addColorStop(1, "#0B0B0C");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Terminator rim: a thin bright edge on the lit side.
    ctx.strokeStyle = "rgba(237,216,54,.30)";
    ctx.lineWidth = Math.max(1, r * 0.004);
    ctx.beginPath();
    ctx.arc(cx, cy, r - ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.stroke();

    // ── Land ──────────────────────────────────────────────────────────────
    // Brighter toward the centre of the disc: the falloff toward the limb is
    // most of what sells the curvature.
    /* 16k dots a frame, so the inner loop matters. Two things keep it cheap:
       once the section dollies in, most of the sphere is off-canvas and gets
       rejected on a bounds test before any drawing; and the depth shading is
       quantised into SHADES precomputed fill strings, so there is no per-dot
       template literal or toFixed allocation. */
    for (const v of land) {
      const p = project(v, cx, cy, r);
      if (p.z <= 0.02) continue;
      if (p.x < -4 || p.x > cw + 4 || p.y < -4 || p.y > ch + 4) continue;
      ctx.fillStyle = SHADES[(p.z * (SHADES.length - 1)) | 0];
      const s = clamp(r * 0.0042 * p.z, 0.5, 2.1 * dpr);
      ctx.beginPath();
      ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Arcs ──────────────────────────────────────────────────────────────
    /* Markers and type are sized off dpr, not off r. They are annotations on
       the scene, so they must hold their size on screen while the sphere
       dollies in underneath them — scaling them with the globe would just
       magnify the whole picture and gain nothing. */
    const ui = dpr;
    const hub = cities[HUB];
    if (!hub) return;

    /* Every leg is drawn in full. The corridor is a fact about the business,
       not a sequence to be unlocked — once you are at this section you should
       see the whole network at once. */
    const LIFT = 0.08;

    for (const leg of LEGS) {
      const end = cities[leg.to];
      if (!end) continue;

      const STEPS = 64;
      ctx.lineWidth = Math.max(1.2, 1.5 * ui);
      ctx.lineCap = "round";
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i <= STEPS; i++) {
        const p3 = arcPoint(hub, end, i / STEPS, LIFT);
        const p = project(p3, cx, cy, r);
        // Cull where the arc passes behind the limb.
        if (p.z <= 0) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "rgba(237,216,54,.75)";
      ctx.stroke();
    }

    // ── Cities ────────────────────────────────────────────────────────────
    ctx.font = `500 ${Math.round(11.5 * ui)}px ${monoFamily()}`;
    ctx.textBaseline = "middle";

    for (const key in cities) {
      const p = project(cities[key], cx, cy, r);
      if (p.z <= 0.04) continue;

      const isHub = key === HUB;
      if (isHub) {
        const glow = 20 * ui;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
        g.addColorStop(0, "rgba(237,216,54,.55)");
        g.addColorStop(1, "rgba(237,216,54,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glow, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#EDD836";
      ctx.beginPath();
      ctx.arc(p.x, p.y, (isHub ? 5 : 3.2) * ui, 0, Math.PI * 2);
      ctx.fill();

      const label = LABELS[key];
      if (!label) continue;
      const [text, side, vNudge] = label;
      ctx.textAlign = side > 0 ? "left" : "right";
      ctx.fillStyle = isHub ? "rgba(244,241,232,.95)" : "rgba(244,241,232,.72)";
      ctx.fillText(text, p.x + side * 11 * ui, p.y + vNudge * 13 * ui);
    }
  }

  // ── Frame loop ───────────────────────────────────────────────────────────
  // Only runs while there is motion to resolve: drag momentum, or the slow
  // idle drift. A static globe costs nothing.
  let raf = 0;
  let idle = true;
  function frame() {
    if (dragging) {
      // Held still by the pointer; render happens on move.
    } else if (Math.abs(spin) > 1e-5) {
      restLon += spin;
      lon0 = restLon;
      spin *= 0.94;
      render();
    } else if (idle) {
      phase += 0.005;
      lon0 = restLon + Math.sin(phase) * 0.1; // ±5.7°, enough to feel alive
      render();
    }
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    render();
  }

  return {
    resize,
    start() {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    setIdleSpin(on: boolean) {
      idle = on;
    },
    /** Pointer drag, in CSS pixels. */
    drag(dx: number, dy: number) {
      dragging = true;
      // Drag right spins the globe west, the way a real one turns.
      restLon -= dx * 0.005;
      lon0 = restLon;
      lat0 = clamp(lat0 + dy * 0.005, -1.1, 1.1);
      spin = -dx * 0.005;
      render();
    },
    endDrag() {
      dragging = false;
    },
    setData(d: MapData) {
      data = d;
      land = d.dots.map(([lon, lat]) => toVec(lon, lat));
      cities = {};
      for (const k in CITIES) cities[k] = toVec(...CITIES[k]);
      resize();
    },
    setProgress(p: number) {
      progress = clamp(p, 0, 1);
      render();
    },
  };
}
