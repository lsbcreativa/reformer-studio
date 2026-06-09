import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initScene, initRing } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PRELOADER
   ============================================================ */
const loader = document.querySelector('.loader');
const bar = document.querySelector('.loader__bar span');
const pct = document.querySelector('.loader__pct');

let started = false;
let progress = 0;
function setBar(p) {
  if (bar) bar.style.width = p + '%';
  if (pct) pct.textContent = String(Math.floor(p)).padStart(3, '0');
}
// Barra avanza hasta 90% mientras se cargan recursos; el 100% llega al estar todo listo.
function tickBar() {
  if (started) return;
  progress = Math.min(90, progress + Math.random() * 8 + 2);
  setBar(progress);
  setTimeout(tickBar, 140);
}
function startSite(done) {
  if (started) return;
  started = true;
  setBar(100);
  loader?.classList.add('done');
  document.body.classList.remove('lock');
  document.body.classList.add('is-ready');
  ScrollTrigger.refresh();
  done();
}

/* ============================================================
   SMOOTH SCROLL (Lenis) + 3D scene
   ============================================================ */
let scene3d = null;
const canvas = document.getElementById('bg-canvas');
// El Reformer 3D solo va en la Home (sección .hero). Las páginas interiores
// usan .phero con una foto en el hero, así que ahí ocultamos el canvas.
const isInnerPage = !!document.querySelector('.phero');
if (canvas && !isInnerPage) {
  try { scene3d = initScene(canvas); } catch (e) { console.warn('3D off:', e); }
} else if (canvas) {
  canvas.style.display = 'none';
}

// Aro de Pilates en el CTA (solo Home)
let ring3d = null;
const ctaCanvas = document.getElementById('cta-canvas');
if (ctaCanvas && !isInnerPage) {
  try { ring3d = initRing(ctaCanvas); } catch (e) { console.warn('ring 3D off:', e); }
}

// Pausar el render 3D cuando su sección no está en pantalla → libera GPU y el scroll va fluido
if ('IntersectionObserver' in window) {
  const heroEl = document.querySelector('.hero');
  if (scene3d && heroEl) new IntersectionObserver(([e]) => scene3d.setActive(e.isIntersecting), { threshold: 0, rootMargin: '120px' }).observe(heroEl);
  const ctaEl = document.querySelector('.cta');
  if (ring3d && ctaEl) new IntersectionObserver(([e]) => ring3d.setActive(e.isIntersecting), { threshold: 0, rootMargin: '120px' }).observe(ctaEl);
}

// Smooth-scroll (Lenis) SOLO en desktop. En cualquier dispositivo táctil → scroll NATIVO (fluido).
const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
const useSmooth = !reduceMotion && !isTouch;
let lenis = null;
if (useSmooth) {
  lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    if (scene3d) scene3d.setScroll(e.scroll / (e.limit || 1));
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
} else {
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (scene3d) scene3d.setScroll(window.scrollY / (max || 1));
    ScrollTrigger.update();
  }, { passive: true });
}

/* ============================================================
   NAV — hide on scroll down, show on up + scrolled bg
   ============================================================ */
const nav = document.querySelector('.nav');
let lastY = 0;
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    nav.classList.toggle('scrolled', y > 40);
    if (y > lastY && y > 300) nav.classList.add('hide');
    else nav.classList.remove('hide');
    lastY = y;
    document.querySelector('.to-top')?.classList.toggle('show', y > window.innerHeight * 0.9);
  },
});

/* ============================================================
   MENU OVERLAY
   ============================================================ */
const burger = document.querySelector('.burger');
burger?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded', String(open));
  if (lenis) open ? lenis.stop() : lenis.start();
});
document.querySelectorAll('.overlay a').forEach((a) =>
  a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    if (lenis) lenis.start();
  })
);

/* ============================================================
   HERO INTRO + reveals
   ============================================================ */
function animateIn() {
  if (reduceMotion) return;
  const lines = document.querySelectorAll('.hero__title .line > span');
  gsap.set(lines, { yPercent: 110 });
  gsap.from('.hero__content .eyebrow', { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', delay: 0.1 });
  gsap.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.25 });
  gsap.from('.hero__sub, .hero__content .btn-row', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.7 });
  gsap.from('.hero__scroll', { opacity: 0, duration: 1.2, delay: 1.1 });

  // Reveals on scroll
  gsap.utils.toArray('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%',
      onEnter: () => el.classList.add('in'),
    });
  });

  // Parallax sutil en imágenes con data-parallax
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.to(el, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
  });
}

/* ============================================================
   DISCIPLINAS — panel de imagen fijo con crossfade (sin seguir el mouse)
   ============================================================ */
const preview = document.querySelector('.disc-preview');
if (preview) {
  const imgs = preview.querySelectorAll('.disc-preview__img');
  const rows = document.querySelectorAll('.disc-row');
  const setActive = (i) => imgs.forEach((im, k) => im.classList.toggle('active', k === i));
  rows.forEach((row, i) => {
    row.addEventListener('mouseenter', () => { setActive(i); preview.classList.add('lit'); rows.forEach((r) => r.classList.toggle('dim', r !== row)); });
  });
  const list = document.querySelector('.disc-list');
  list?.addEventListener('mouseleave', () => { preview.classList.remove('lit'); rows.forEach((r) => r.classList.remove('dim')); });
}

/* ============================================================
   FAQ
   ============================================================ */
document.querySelectorAll('.faq__q').forEach((q) => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq');
    const a = item.querySelector('.faq__a');
    const open = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq.open').forEach((o) => {
      o.classList.remove('open'); o.querySelector('.faq__a').style.maxHeight = null;
    });
    if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
if (matchMedia('(hover: hover)').matches && !reduceMotion) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' }));
  });
}

/* ============================================================
   TEMA (dark / light) — persistente, con transición suave
   ============================================================ */
const root = document.documentElement;
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  try { localStorage.setItem('fs-theme', t); } catch (e) {}
}
function toggleTheme(e) {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  // Reveal circular desde el botón (View Transitions API) — elegante
  if (!document.startViewTransition || reduceMotion) {
    root.classList.add('theming');
    applyTheme(next);
    setTimeout(() => root.classList.remove('theming'), 500);
    return;
  }
  const x = (e && e.clientX) || window.innerWidth - 40;
  const y = (e && e.clientY) || 44;
  const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const vt = document.startViewTransition(() => applyTheme(next));
  vt.ready.then(() => {
    // Reveal circular suave + fundido del tema anterior → transición fluida (no robótica)
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 760, easing: 'cubic-bezier(.45,.05,.2,1)', pseudoElement: '::view-transition-new(root)' }
    );
    root.animate(
      { opacity: [1, 0] },
      { duration: 560, easing: 'ease-out', pseudoElement: '::view-transition-old(root)' }
    );
  });
}
document.querySelectorAll('.theme-toggle').forEach((btn) => btn.addEventListener('click', toggleTheme));

/* ============================================================
   BOTÓN "VOLVER ARRIBA"
   ============================================================ */
const toTopBtn = document.querySelector('.to-top');
if (toTopBtn) {
  toTopBtn.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   AÑO + arranque
   ============================================================ */
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

document.body.classList.add('lock');
tickBar();

// Levantamos la cortina solo cuando las FUENTES y la PÁGINA están listas → sin "flash" de tipografía.
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
const pageLoaded = new Promise((res) => {
  if (document.readyState === 'complete') res();
  else window.addEventListener('load', res, { once: true });
});
const minTime = new Promise((res) => setTimeout(res, 600)); // mínimo para que no parpadee

Promise.all([fontsReady, pageLoaded, minTime]).then(() => {
  // un frame extra para que el 3D ya esté pintado antes de mostrar
  requestAnimationFrame(() => requestAnimationFrame(() => startSite(animateIn)));
});
// Fallback duro por si algo se cuelga
setTimeout(() => startSite(animateIn), 6000);
