/* Dotted Africa, zooming from the whole continent down to the East African
   corridor while the route legs draw in.

   Kept out of the component because it is pure canvas work with no React in
   it: the component owns the element and the scroll trigger, this owns the
   pixels. */

export type MapData = {
  viewBox: [number, number];
  dots: [number, number][];
  cities: Record<string, [number, number]>;
};

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Corridor legs, in order of reveal. Each spans two cities. */
export const LEGS = [
  { from: "mombasa", to: "nairobi" },
  { from: "nairobi", to: "kigali" },
  { from: "dar", to: "kigali" },
  { from: "kigali", to: "goma" },
  { from: "kigali", to: "lubumbashi" },
] as const;

/* label text, horizontal side, vertical nudge — set by hand so the tightly
   packed Great Lakes cities don't collide */
const LABELS: Record<string, [string, number, number]> = {
  mombasa: ["Mombasa", 1, 0],
  dar: ["Dar es Salaam", 1, 0],
  nairobi: ["Nairobi", 1, -1],
  kigali: ["Kigali", -1, -1],
  goma: ["Goma · DRC", -1, 1],
  lubumbashi: ["Lubumbashi", 1, 0],
  kampala: ["Kampala", 1, -1],
};

export function createNetworkRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let data: MapData | null = null;
  let progress = 0;
  let dpr = 1;

  /* next/font gives the family a generated name, so the literal
     "'JetBrains Mono'" the static site used would silently fall back to the
     generic monospace here. Read the variable the stylesheet actually sets. */
  const monoFamily = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
    "ui-monospace";

  /* The slice of canvas the map may occupy. Keeps the drawing clear of the
     copy instead of running underneath it. */
  function mapRect() {
    const cw = canvas.width;
    const ch = canvas.height;
    if (cw / dpr >= 1000) {
      return { x: cw * 0.4, y: ch * 0.08, w: cw * 0.56, h: ch * 0.84 };
    }
    return { x: cw * 0.05, y: ch * 0.42, w: cw * 0.9, h: ch * 0.55 };
  }

  /** Map viewBox space -> canvas px, given a zoom window. */
  function makeView(p: number) {
    const [vw, vh] = data!.viewBox;

    // Wide: whole continent. Tight: the East African corridor, still holding
    // enough coastline to stay recognisably Africa.
    const wide = { x: 0, y: 0, w: vw, h: vh };
    const tight = { x: 615, y: 520, w: 310, h: 300 };

    const e = p * p * (3 - 2 * p); // smoothstep
    const box = {
      x: lerp(wide.x, tight.x, e),
      y: lerp(wide.y, tight.y, e),
      w: lerp(wide.w, tight.w, e),
      h: lerp(wide.h, tight.h, e),
    };

    const R = mapRect();
    const s = Math.min(R.w / box.w, R.h / box.h);
    const ox = R.x + R.w / 2 - (box.x + box.w / 2) * s;
    const oy = R.y + R.h / 2 - (box.y + box.h / 2) * s;
    return { s, px: (x: number, y: number) => [x * s + ox, y * s + oy] as const };
  }

  function render() {
    if (!data) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const p = clamp(progress, 0, 1);
    const zoomP = clamp(p / 0.45, 0, 1);
    const v = makeView(zoomP);

    // Route reveal occupies the back half of the scroll.
    const routeP = clamp((p - 0.3) / 0.62, 0, 1);
    const legSpan = 1 / LEGS.length;

    const cities = data.cities;
    const R = mapRect();

    // Everything is drawn inside the map's own zone so it never wanders under
    // the copy once the view zooms past the continent fit.
    ctx.save();
    ctx.beginPath();
    ctx.rect(R.x, R.y, R.w, R.h);
    ctx.clip();

    // Soften the clip edge so it reads as a fading field, not a crop.
    const FEATHER = Math.min(R.w, R.h) * 0.14;
    const edgeAlpha = (x: number, y: number) => {
      const d = Math.min(x - R.x, R.x + R.w - x, y - R.y, R.y + R.h - y);
      return clamp(d / FEATHER, 0, 1);
    };

    // ── dot field
    const r = clamp(v.s * 2.2, 0.7, 3.4);
    for (const d of data.dots) {
      const q = v.px(d[0], d[1]);
      if (q[0] < R.x - 4 || q[0] > R.x + R.w + 4 || q[1] < R.y - 4 || q[1] > R.y + R.h + 4)
        continue;
      const a = edgeAlpha(q[0], q[1]);
      if (a <= 0) continue;
      ctx.fillStyle = `rgba(244,241,232,${(0.15 * a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(q[0], q[1], r, 0, 6.2832);
      ctx.fill();
    }

    // ── legs
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    LEGS.forEach((leg, L) => {
      const a = cities[leg.from];
      const b = cities[leg.to];
      if (!a || !b) return;

      const t = clamp((routeP - L * legSpan) / legSpan, 0, 1);
      if (t <= 0) return;

      const A = v.px(a[0], a[1]);
      const B = v.px(b[0], b[1]);

      // Bow the line so overlapping legs stay readable.
      const mx = (A[0] + B[0]) / 2;
      const my = (A[1] + B[1]) / 2;
      const dx = B[0] - A[0];
      const dy = B[1] - A[1];
      const len = Math.hypot(dx, dy) || 1;
      const bow = len * 0.16;
      const cxp = mx - (dy / len) * bow;
      const cyp = my + (dx / len) * bow;

      // partial quadratic via de Casteljau
      const qpt = (tt: number) => {
        const u = 1 - tt;
        return [
          u * u * A[0] + 2 * u * tt * cxp + tt * tt * B[0],
          u * u * A[1] + 2 * u * tt * cyp + tt * tt * B[1],
        ] as const;
      };

      ctx.strokeStyle = "rgba(237,216,54,0.85)";
      ctx.lineWidth = Math.max(1, v.s * 1.5);
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      const STEPS = 40;
      for (let k = 1; k <= STEPS * t; k++) {
        const pt = qpt(k / STEPS);
        ctx.lineTo(pt[0], pt[1]);
      }
      ctx.stroke();

      // travelling head
      if (t < 1) {
        const head = qpt(t);
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
    });

    // ── city nodes + labels
    // Labels only earn their place once the view has zoomed in enough for
    // them not to pile on top of each other.
    const labelA = clamp((zoomP - 0.35) / 0.4, 0, 1);
    // Canvas is scaled by dpr, so size the label in device pixels.
    const fs = clamp(v.s * 9, 10.5 * dpr, 13.5 * dpr);
    ctx.font = `500 ${fs}px ${monoFamily()}, monospace`;
    ctx.textBaseline = "middle";

    Object.keys(cities).forEach((key) => {
      const c = cities[key];
      const q = v.px(c[0], c[1]);
      if (q[0] < -60 || q[0] > cw + 60 || q[1] < -40 || q[1] > ch + 40) return;

      const active = LEGS.some(
        (l, li) => (l.from === key || l.to === key) && routeP > li * legSpan,
      );

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
        const spec = LABELS[key] || [key, 1, 0];
        const off = Math.max(10, v.s * 9);
        ctx.textAlign = spec[1] > 0 ? "left" : "right";
        ctx.fillStyle = active
          ? `rgba(237,216,54,${(0.95 * labelA).toFixed(3)})`
          : `rgba(244,241,232,${(0.38 * labelA).toFixed(3)})`;
        ctx.fillText(
          String(spec[0]).toUpperCase(),
          q[0] + off * spec[1],
          q[1] + spec[2] * fs * 1.15,
        );
      }
    });

    ctx.restore();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    render();
  }

  return {
    resize,
    render,
    setData(d: MapData) {
      data = d;
      resize();
    },
    setProgress(p: number) {
      progress = p;
      render();
    },
  };
}
