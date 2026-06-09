// =============================================================
//  Funcional Studio — Escena 3D
//  Reformer de Pilates estilizado en cromo monocromo.
//  Gira lento, flota y reacciona suavemente al mouse/scroll.
// =============================================================
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function initScene(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.2, 7);

  // Reflejos de estudio (sin archivos externos)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(4, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.3); rim.position.set(-6, -1, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  // ---------- Material cromo ----------
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0x16161a, metalness: 1, roughness: 0.17, clearcoat: 1, clearcoatRoughness: 0.14, envMapIntensity: 1.75 });
  const matte = new THREE.MeshStandardMaterial({ color: 0x202024, metalness: 0.5, roughness: 0.55, envMapIntensity: 0.8 });

  // ---------- Reformer ----------
  const reformer = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); reformer.add(m); return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r, h, s = 20) => new THREE.CylinderGeometry(r, r, h, s);

  const railZ = 0.5;
  // Rieles (largo en X)
  add(box(4.0, 0.12, 0.12), chrome, 0, 0, railZ);
  add(box(4.0, 0.12, 0.12), chrome, 0, 0, -railZ);
  // Travesaños de los extremos
  add(box(0.14, 0.12, 1.12), chrome, 1.95, 0, 0);
  add(box(0.14, 0.12, 1.12), chrome, -1.95, 0, 0);
  // Patas
  [[1.8, railZ], [1.8, -railZ], [-1.8, railZ], [-1.8, -railZ]].forEach(([x, z]) => add(box(0.14, 0.5, 0.14), chrome, x, -0.3, z));

  // Carro (carriage) + colchón
  const carriage = new THREE.Group();
  carriage.add(new THREE.Mesh(box(1.55, 0.16, 1.0), chrome));
  const pad = new THREE.Mesh(box(1.45, 0.12, 0.9), matte); pad.position.y = 0.14; carriage.add(pad);
  // Hombreras
  [0.3, -0.3].forEach((z) => { const sr = new THREE.Mesh(cyl(0.1, 0.24, 16), matte); sr.position.set(-0.6, 0.32, z); carriage.add(sr); });
  // Reposacabezas inclinado
  const head = new THREE.Mesh(box(0.5, 0.1, 0.85), matte); head.position.set(0.55, 0.18, 0); head.rotation.z = -0.18; carriage.add(head);
  carriage.position.set(-0.25, 0.16, 0);
  reformer.add(carriage);

  // Placa de resortes (extremo derecho)
  add(box(0.1, 0.55, 1.0), chrome, 1.78, 0.18, 0);

  // Resortes (hélices) del carro a la placa
  function spring(x0, x1, y, z) {
    const coils = 7, rad = 0.055, N = 90, pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N, a = t * coils * Math.PI * 2; pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y + Math.sin(a) * rad, z + Math.cos(a) * rad)); }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 130, 0.014, 6, false);
    reformer.add(new THREE.Mesh(geo, chrome));
  }
  [-0.28, -0.1, 0.1, 0.28].forEach((z) => spring(0.62, 1.7, 0.12, z));

  // Barra de pies (U) extremo derecho
  add(cyl(0.045, 0.55), chrome, 1.5, 0.28, railZ - 0.05);
  add(cyl(0.045, 0.55), chrome, 1.5, 0.28, -railZ + 0.05);
  add(cyl(0.045, 1.0), chrome, 1.5, 0.55, 0, Math.PI / 2, 0, 0);

  // Torre de poleas (extremo izquierdo)
  add(cyl(0.06, 1.5), chrome, -1.95, 0.6, railZ);
  add(cyl(0.06, 1.5), chrome, -1.95, 0.6, -railZ);
  add(cyl(0.05, 1.12), chrome, -1.95, 1.32, 0, Math.PI / 2, 0, 0);
  // Manillas colgantes (cuerdas + asas)
  [0.32, -0.32].forEach((z) => {
    add(cyl(0.012, 0.7), matte, -1.7, 0.95, z);
    add(new THREE.TorusGeometry(0.07, 0.018, 10, 24), chrome, -1.7, 0.58, z, Math.PI / 2, 0, 0);
  });

  // Centrar y orientar
  reformer.position.y = -0.35;
  reformer.rotation.set(-0.32, -0.6, 0.04);
  reformer.scale.setScalar(1.18);
  scene.add(reformer);

  // ---------- Partículas sutiles ----------
  const PCOUNT = window.innerWidth < 768 ? 200 : 380;
  const pPos = new Float32Array(PCOUNT * 3);
  for (let i = 0; i < PCOUNT; i++) {
    const r = 4 + Math.random() * 4, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(p) * Math.cos(t); pPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t); pPos[i * 3 + 2] = r * Math.cos(p);
  }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.016, transparent: true, opacity: 0.28, depthWrite: false }));
  scene.add(particles);

  // ---------- Interacción ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollProgress = 0;
  let aimX = -1.7; // desplaza el Reformer hacia la derecha en pantallas anchas
  window.addEventListener('pointermove', (e) => { pointer.tx = (e.clientX / window.innerWidth) * 2 - 1; pointer.ty = (e.clientY / window.innerHeight) * 2 - 1; });

  let raf, last = performance.now(), active = true;
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!active) { last = performance.now(); return; } // pausa render fuera de vista → scroll fluido
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now * 0.001;
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    if (!reduceMotion) {
      // Tumble multi-eje: recorre TODOS los ángulos (ritmos distintos → nunca se repite)
      reformer.rotation.y += dt * 0.30;
      reformer.rotation.x += dt * 0.18;
      reformer.rotation.z += dt * 0.09;
    }
    reformer.position.y = -0.35 + (reduceMotion ? 0 : Math.sin(t * 0.9) * 0.07);
    particles.rotation.y -= 0.0004;

    // El mouse mueve la cámara (parallax), no la rotación → sensación natural
    camera.position.x += (aimX + pointer.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (0.2 - pointer.y * 0.28 - camera.position.y) * 0.04;
    camera.position.z = 7 + scrollProgress * 1.2;
    camera.lookAt(aimX, -0.1, 0);

    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    // En desktop: Reformer a la derecha. En móvil/tablet: centrado y más pequeño.
    if (w > 900) { aimX = -2.25; reformer.scale.setScalar(1.08); }
    else { aimX = 0; reformer.scale.setScalar(w < 600 ? 0.78 : 0.95); }
  }
  window.addEventListener('resize', resize); resize(); tick();

  return {
    setScroll(p) { scrollProgress = Math.max(0, Math.min(1, p)); },
    setActive(v) { active = v; },
    setColor(hex) { chrome.color.set(hex); },
    destroy() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); envTex.dispose(); pmrem.dispose(); renderer.dispose(); },
  };
}

// =============================================================
//  Aro de Pilates (magic circle) — pieza minimalista para el CTA
// =============================================================
export function initRing(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.7);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const rKey = new THREE.DirectionalLight(0xffffff, 1.8); rKey.position.set(3, 4, 5); scene.add(rKey);
  const rRim = new THREE.DirectionalLight(0xffffff, 1.3); rRim.position.set(-5, -2, -3); scene.add(rRim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const chrome = new THREE.MeshPhysicalMaterial({ color: 0x17171b, metalness: 1, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.13, envMapIntensity: 1.8 });
  const grip = new THREE.MeshStandardMaterial({ color: 0x1d1d22, metalness: 0.45, roughness: 0.6, envMapIntensity: 0.9 });

  const ring = new THREE.Group();
  // Aro flexible
  ring.add(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.105, 36, 180), chrome));
  // Pequeñas estrías de refuerzo (como el aro real)
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.05), chrome);
    rib.position.set(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0);
    rib.rotation.z = a;
    ring.add(rib);
  }
  // Dos almohadillas (handles) en los lados opuestos
  [1, -1].forEach((s) => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.34), grip);
    pad.position.set(s * 1.0, 0, 0);
    ring.add(pad);
  });
  ring.rotation.x = 0.55;
  ring.position.y = 0.3; // lo subimos para que enmarque el texto y no tape los botones
  scene.add(ring);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => { pointer.tx = (e.clientX / window.innerWidth) * 2 - 1; pointer.ty = (e.clientY / window.innerHeight) * 2 - 1; });

  let raf, active = true;
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!active) return; // pausa fuera de vista
    const t = performance.now() * 0.001;
    pointer.x += (pointer.tx - pointer.x) * 0.07;
    pointer.y += (pointer.ty - pointer.y) * 0.07;
    ring.rotation.y = (reduceMotion ? 0.6 : t * 0.4) + pointer.x * 0.4;
    ring.rotation.x = 0.55 + pointer.y * 0.25;
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    // Aro grande que enmarca el texto (arcos visibles arriba y abajo)
    ring.scale.setScalar(w < 700 ? 1.15 : 1.6);
  }
  window.addEventListener('resize', resize); resize(); tick();

  return { setActive(v) { active = v; }, destroy() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); envTex.dispose(); pmrem.dispose(); renderer.dispose(); } };
}
