"use client";

import { useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { calc, PAINT, WOOD, type PalletDesign } from "@/lib/pallet/model";

export type CameraKind = "iso" | "top" | "front" | "side" | "under";

export type PalletSceneHandle = {
  /** JPEG data URL of the pallet seen from the default angle — attached to the quote request. */
  snapshot: () => string | null;
};

type Props = {
  design: PalletDesign;
  camera: CameraKind;
  /** Bumped whenever the camera should snap back to `camera`, even if the kind didn't change. */
  cameraNonce: number;
  active: boolean;
  label: string;
  onUnavailable: () => void;
  /** Plain prop (not `ref`) so it survives `next/dynamic`. */
  handleRef: RefObject<PalletSceneHandle | null>;
};

type SceneState = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  group: THREE.Group;
};

// Warm light grey matching the site's `--surface-alt` (three.js can't parse oklch()).
const STAGE_BG = 0xf0ede8;

function woodTexture(hex: number, seed: number) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const x = c.getContext("2d");
  if (x) {
    x.fillStyle = `#${new THREE.Color(hex).getHexString()}`;
    x.fillRect(0, 0, 256, 64);
    let r = seed || 7;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 34; i++) {
      const yy = rnd() * 64;
      x.strokeStyle = `rgba(90,55,20,${0.04 + rnd() * 0.1})`;
      x.lineWidth = 0.6 + rnd() * 1.6;
      x.beginPath();
      x.moveTo(0, yy);
      for (let k = 0; k <= 256; k += 16) x.lineTo(k, yy + Math.sin(k / 30 + i) * 2 * rnd());
      x.stroke();
    }
    if (rnd() > 0.3) {
      x.fillStyle = "rgba(80,45,15,.25)";
      x.beginPath();
      x.ellipse(60 + rnd() * 140, 32, 6, 3.5, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function presTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const x = c.getContext("2d");
  if (x) {
    x.fillStyle = "#C9A774";
    x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 700; i++) {
      x.fillStyle = `rgba(${80 + Math.random() * 80},${50 + Math.random() * 50},20,${0.25 + Math.random() * 0.3})`;
      x.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 4, 1 + Math.random() * 2);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stampTexture(text: string, ht: boolean) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d");
  if (x) {
    x.strokeStyle = "rgba(25,25,25,.85)";
    x.fillStyle = "rgba(25,25,25,.85)";
    x.lineWidth = 8;
    x.strokeRect(14, 14, 484, 228);
    x.font = "700 64px 'Arial Narrow', Arial, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText((text || "").slice(0, 24).toLocaleUpperCase("tr"), 256, ht ? 90 : 128);
    if (ht) {
      x.font = "600 50px ui-monospace, Menlo, monospace";
      x.fillText("IPPC · TR · HT", 256, 176);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function disposeGroup(group: THREE.Group) {
  group.children.slice().forEach((o) => {
    group.remove(o);
    o.traverse((n) => {
      if (n instanceof THREE.Mesh || n instanceof THREE.LineSegments) {
        n.geometry.dispose();
        ([] as THREE.Material[]).concat(n.material).forEach((m) => {
          if ("map" in m && m.map instanceof THREE.Texture) m.map.dispose();
          m.dispose();
        });
      }
    });
  });
}

function buildPallet(group: THREE.Group, d: PalletDesign) {
  disposeGroup(group);
  const { boxes } = calc(d);
  const baseCol = WOOD[d.wood].color;
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x3a2a18, transparent: true, opacity: 0.35 });
  const getMat = (k: string, i: number) => {
    const paintC = (k === "block" || k === "stringer") && PAINT[d.paint];
    const pres = k === "block" && d.blkMat === "pres";
    const key = `${k}${pres ? "p" : ""}${paintC ? "c" : ""}${i % 3}`;
    if (mats[key]) return mats[key];
    let m: THREE.MeshStandardMaterial;
    if (pres) m = new THREE.MeshStandardMaterial({ map: presTexture(), roughness: 0.95 });
    else {
      const shade = new THREE.Color(baseCol).offsetHSL(0, 0, ((i % 3) - 1) * 0.03 + (k === "block" || k === "stringer" ? -0.04 : 0));
      m = new THREE.MeshStandardMaterial({ map: woodTexture(shade.getHex(), 11 + i * 17), roughness: 0.85 });
    }
    if (paintC) {
      m.map?.dispose();
      m.map = null;
      m.color = new THREE.Color(paintC);
      m.roughness = 0.6;
    }
    return (mats[key] = m);
  };
  boxes.forEach((b, i) => {
    const dx = b.x1 - b.x0;
    const dy = b.y1 - b.y0;
    const dz = b.z1 - b.z0;
    const geo = new THREE.BoxGeometry(dx, dy, dz);
    // Align the grain with the board's long axis.
    if (dz > dx) {
      const uv = geo.attributes.uv;
      for (let j = 0; j < uv.count; j++) {
        const u = uv.getX(j);
        const v = uv.getY(j);
        uv.setXY(j, v, u);
      }
    }
    const mesh = new THREE.Mesh(geo, getMat(b.k, i));
    mesh.position.set(b.x0 + dx / 2 - d.L / 2, b.y0 + dy / 2, b.z0 + dz / 2 - d.W / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    group.add(mesh);
  });
  const ht = d.treat === "ht" || d.treat === "htkd";
  if ((d.stamp || "").trim() || ht) {
    let w: number;
    let h: number;
    let y: number;
    if (d.type === "blok") {
      w = Math.min(d.blkX * 0.9, 140);
      h = Math.min(d.blkH * 0.8, w * 0.5);
      y = d.botT + d.blkH / 2;
    } else {
      w = Math.min(d.L * 0.25, 220);
      h = Math.min(d.strH * 0.75, w * 0.5);
      y = d.botT + d.strH / 2;
    }
    const pm = new THREE.MeshBasicMaterial({
      map: stampTexture(d.stamp, ht),
      transparent: true,
      depthWrite: false,
      opacity: PAINT[d.paint] ? 0.8 : 0.9,
    });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pm);
    pl.position.set(0, y, d.W / 2 + 0.8);
    group.add(pl);
  }
  group.scale.setScalar(0.001);
}

function placeCamera(s: SceneState, d: PalletDesign, kind: CameraKind) {
  const size = Math.max(d.L, d.W) / 1000;
  const H = calc(d).H / 1000;
  const target = new THREE.Vector3(0, H / 2, 0);
  let p: THREE.Vector3;
  if (kind === "top") p = new THREE.Vector3(0.0001, size * 2.4, 0.0001);
  else if (kind === "front") p = new THREE.Vector3(0, H / 2 + 0.05, size * 2.3);
  else if (kind === "side") p = new THREE.Vector3(size * 2.3, H / 2 + 0.05, 0);
  else if (kind === "under") p = new THREE.Vector3(size * 1.2, -size * 1.1, size * 1.3);
  else p = new THREE.Vector3(size * 1.35, size * 1.0, size * 1.55);
  // Narrow (portrait) stages need the camera further back so the pallet isn't cropped left and right.
  const fit = s.camera.aspect < 1.25 ? 1.25 / s.camera.aspect : 1;
  p.sub(target).multiplyScalar(fit).add(target);
  s.camera.position.copy(p);
  s.controls.target.copy(target);
  s.controls.update();
}

/** WebGL view of the pallet. Lives only on the client; reports back if WebGL is missing so the UI can fall back to the drawing. */
export function PalletScene({ design, camera, cameraNonce, active, label, onUnavailable, handleRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<SceneState | null>(null);
  const activeRef = useRef(active);
  const designRef = useRef(design);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    activeRef.current = active;
    designRef.current = design;
    onUnavailableRef.current = onUnavailable;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    } catch {
      onUnavailableRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(STAGE_BG);
    const cam = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
    const controls = new OrbitControls(cam, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.minDistance = 0.6;
    controls.maxDistance = 8;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8070, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(1.6, 3, 2.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 8 });
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.7);
    fill.position.set(-2, 1.2, -1.5);
    scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(6, 30, 0x000000, 0x000000);
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.07;
    grid.position.y = 0.0005;
    scene.add(grid);
    const group = new THREE.Group();
    scene.add(group);

    const state: SceneState = { renderer, scene, camera: cam, controls, group };
    stateRef.current = state;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const w = Math.max(10, r.width);
      const h = Math.max(10, r.height);
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    buildPallet(group, designRef.current);
    placeCamera(state, designRef.current, "iso");

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      if (activeRef.current) renderer.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      disposeGroup(group);
      renderer.dispose();
      stateRef.current = null;
    };
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (s) buildPallet(s.group, design);
  }, [design]);

  useEffect(() => {
    const s = stateRef.current;
    if (s) placeCamera(s, designRef.current, camera);
  }, [camera, cameraNonce]);

  useImperativeHandle(handleRef, () => ({
    snapshot() {
      const s = stateRef.current;
      if (!s) return null;
      try {
        const prev = s.camera.position.clone();
        const prevT = s.controls.target.clone();
        placeCamera(s, designRef.current, "iso");
        s.renderer.render(s.scene, s.camera);
        const src = s.renderer.domElement;
        const w = 640;
        const h = Math.round((w * src.height) / src.width);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d")?.drawImage(src, 0, 0, w, h);
        const url = c.toDataURL("image/jpeg", 0.78);
        s.camera.position.copy(prev);
        s.controls.target.copy(prevT);
        s.controls.update();
        return url.length < 180000 ? url : c.toDataURL("image/jpeg", 0.55);
      } catch {
        return null;
      }
    },
  }));

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} aria-label={label} className="block h-full w-full touch-none" />
    </div>
  );
}
