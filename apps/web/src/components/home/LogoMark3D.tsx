'use client';

/**
 * AAF11 logo extruded to 3D, per-part depth:
 *  - orange AAF11 mark  → full extrude
 *  - cog outline (rim)  → full extrude (ring = outline with an inset hole)
 *  - cog fill face      → half extrude, flat
 *
 * Raw three.js (no React Three Fiber) so it never conflicts with the
 * ShaderGradient canvas's bundled R3F. Self-contained renderer + RAF loop.
 * Scale driven 0→1 by `progress`; idle auto-rotates, pointer movement tilts it.
 */

import React, { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';

const FULL = 32; // tall parts: mark + cog rim
const HALF = 15; // flat half-height cog face
const RIM_INSET = 0.9;

function centroid(pts: THREE.Vector2[]) {
  const c = new THREE.Vector2();
  pts.forEach((p) => c.add(p));
  return c.divideScalar(pts.length || 1);
}

function buildLogo(svgText: string) {
  const data = new SVGLoader().parse(svgText);
  const root = new THREE.Group();
  const matCharcoal = new THREE.MeshStandardMaterial({ color: '#2a2f3a', roughness: 0.6, metalness: 0 });
  const matDark = new THREE.MeshStandardMaterial({ color: '#0b0c0f', roughness: 0.45, metalness: 0 });
  const matOrange = new THREE.MeshStandardMaterial({
    color: '#ff7a1a',
    roughness: 0.38,
    metalness: 0,
    emissive: new THREE.Color('#3a1500'),
    emissiveIntensity: 0.35,
  });

  data.paths.forEach((path) => {
    // the cog is the only path with a stroke; the AAF11 mark has none.
    const stroke = (path.userData?.style?.stroke || 'none').toLowerCase();
    const isCog = stroke !== 'none' && stroke !== '';
    SVGLoader.createShapes(path).forEach((shape) => {
      if (isCog) {
        const outline = shape.getPoints(96);
        const c = centroid(outline);
        const inset = (k: number) => outline.map((p) => new THREE.Vector2(c.x + (p.x - c.x) * k, c.y + (p.y - c.y) * k));
        // full-height rim (the extruded stroke) = outline with an inset hole
        const ring = new THREE.Shape(outline);
        ring.holes.push(new THREE.Path(inset(RIM_INSET)));
        root.add(new THREE.Mesh(new THREE.ExtrudeGeometry(ring, { depth: FULL, bevelEnabled: false }), matDark));
        // flat half-height face — sized LARGER than the rim hole so it tucks under
        // the rim (no gap), and pushed back in z so the overlap never z-fights.
        const face = new THREE.Mesh(
          new THREE.ExtrudeGeometry(new THREE.Shape(inset(RIM_INSET + 0.05)), { depth: HALF, bevelEnabled: false }),
          matCharcoal,
        );
        face.position.z = -1;
        root.add(face);
      } else {
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: FULL, bevelEnabled: false }), matOrange);
        m.position.z = 2; // lift off the z=0 plane so back caps don't fight the cog
        root.add(m);
      }
    });
  });

  root.scale.y = -1; // SVG y-down
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  root.position.sub(center);
  const wrap = new THREE.Group();
  wrap.add(root);
  wrap.scale.setScalar(3 / Math.max(size.x, size.y));
  return wrap;
}

export default function LogoMark3D({
  progress,
  reduced,
}: {
  progress: MutableRefObject<{ v: number }>;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(3, 6, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.7);
    fill.position.set(-5, -1, 4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffb070, 0.6);
    rim.position.set(0, 2, -6);
    scene.add(rim);

    const spin = new THREE.Group();
    spin.scale.setScalar(0);
    scene.add(spin);

    let disposed = false;
    fetch('/aaf11_logo.svg')
      .then((r) => r.text())
      .then((text) => {
        if (!disposed) spin.add(buildLogo(text));
      })
      .catch(() => {});

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const pointer = { x: 0, y: 0 };
    let lastMove = -9999;
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      lastMove = performance.now();
    };
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let prev = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const target = reduced ? 1 : progress.current.v;
      spin.scale.setScalar(spin.scale.x + (target - spin.scale.x) * 0.12);

      if (!reduced) {
        if (now - lastMove < 450) {
          spin.rotation.y += (pointer.x * 0.7 - spin.rotation.y) * 0.08;
          spin.rotation.x += (-0.2 + pointer.y * 0.45 - spin.rotation.x) * 0.08;
        } else {
          // settle to a slight tilt (so depth reads) and rotate gently
          spin.rotation.x += (-0.22 - spin.rotation.x) * 0.05;
          spin.rotation.y += delta * 0.5;
        }
      } else {
        spin.rotation.x = -0.22;
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => mat.dispose());
      });
    };
  }, [progress, reduced]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
