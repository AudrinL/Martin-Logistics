"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { useCoarsePointer, useReducedMotion } from "@/lib/hooks";

const COUNT = 700;

/* Atmospheric motes in the paper hero. They drift left with the truck and
   parallax against the page, which is what stops the hero reading as a flat
   photograph pasted onto a gradient.

   The mote seeds and the sprite are built at module scope rather than in a
   useMemo. Math.random() and document.createElement are both impure, and the
   React Compiler will not allow either during render — but neither needs to
   vary per mount, so hoisting them out is the honest fix rather than an
   escape hatch. */

function makeMotes() {
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 46;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    speeds[i] = 0.006 + Math.random() * 0.022;
  }
  return { positions, speeds };
}

/** A soft radial sprite, so the motes read as haze rather than squares. */
function makeSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(20,20,24,1)");
  grd.addColorStop(0.45, "rgba(20,20,24,.5)");
  grd.addColorStop(1, "rgba(20,20,24,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const MOTES = makeMotes();
// Canvas children only ever mount in the browser, so this is non-null by the
// time anything reads it.
const SPRITE = typeof document !== "undefined" ? makeSprite() : null;

function Motes({ scroll }: { scroll: RefObject<number> }) {
  const points = useRef<THREE.Points>(null);

  // Reading camera off the frame state rather than useThree() keeps the
  // mutation inside the callback that owns the frame, which is both the R3F
  // idiom and what the compiler's immutability rule wants.
  useFrame((state) => {
    const geo = points.current?.geometry;
    if (!geo) return;

    const attr = geo.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] -= MOTES.speeds[i];
      if (arr[i * 3] < -23) arr[i * 3] = 23; // wrap back to the right edge
    }
    attr.needsUpdate = true;

    const p = scroll.current ?? 0;
    state.camera.position.y = p * 3.2;
    points.current!.rotation.z = p * 0.06;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[MOTES.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        map={SPRITE}
        transparent
        opacity={0.32}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* The hero is complete without WebGL, so a failed context must not take the
   page down with it. */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function DustField({
  scroll,
  active,
}: {
  scroll: RefObject<number>;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  // The buffers are shared, so reset them when the field remounts (a route
  // change back to the hero) — otherwise the motes resume mid-drift.
  useEffect(() => {
    return () => {
      const fresh = makeMotes();
      MOTES.positions.set(fresh.positions);
    };
  }, []);

  if (reduced || coarse) return null;

  return (
    <Boundary>
      <Canvas
        className="stage__dust"
        aria-hidden
        // Parked entirely while the hero is off screen — R3F stops its loop
        // rather than us hand-rolling cancelAnimationFrame.
        frameloop={active ? "always" : "never"}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: false }}
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 14] }}
      >
        <Motes scroll={scroll} />
      </Canvas>
    </Boundary>
  );
}
