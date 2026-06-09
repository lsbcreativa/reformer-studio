# Funcional Studio — Sitio web v2 (experiencia 3D)

Rediseño completo del sitio de **Funcional Studio** (Pilates Reformer & Barre · Miraflores y Surco).
Estética monocroma fiel a la marca (logo negro / fondo claro invertido a dark premium), tipografía
condensada y una **experiencia inmersiva 3D** con WebGL.

---

## 🚀 Cómo arrancar

```bash
npm install        # instala dependencias (solo la primera vez)
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build      # genera el sitio de producción en /dist
npm run preview    # previsualiza el build de /dist
```

Requisitos: Node.js 18+ (probado con Node 22).

---

## 🧱 Stack

| Tecnología | Para qué |
|-----------|----------|
| **Vite** | Bundler / dev server ultrarrápido (multi-página) |
| **Three.js** | Escenas 3D WebGL — Reformer de Pilates en el hero + aro de Pilates (magic circle) en el CTA, en cromo monocromo, reactivos al mouse |
| **GSAP + ScrollTrigger** | Animaciones de entrada y revelados al hacer scroll |
| **Lenis** | Scroll suave (smooth scroll) |
| **simplex-noise** | Deformación orgánica de los vértices del 3D |

Sin frameworks pesados: HTML semántico + CSS propio (sistema de diseño en `src/style.css`).

---

## 📁 Estructura

```
├─ index.html              Home inmersiva (hero 3D + secciones)
├─ miraflores.html         Sede Miraflores
├─ surco.html              Sede Surco
├─ pilates-reformer.html   Disciplina
├─ barre.html              Disciplina
├─ step-chair.html         Disciplina
├─ suspension-trx.html     Disciplina
├─ stretching.html         Disciplina
├─ src/
│  ├─ main.js              Lógica: loader, scroll suave, cursor, menú, FAQ, animaciones
│  ├─ scene.js            Escena 3D (Three.js)
│  └─ style.css           Sistema de diseño completo
├─ public/
│  └─ logo.png            Logo de la marca
└─ vite.config.js         Config multi-página
```

---

## 🖼️ Cómo personalizar

**Fotos:** actualmente se usan imágenes de Unsplash en blanco y negro como *placeholder*.
Reemplázalas por fotos reales del estudio/instructoras:
1. Coloca tus imágenes en `public/img/...`
2. En los HTML, cambia los `src="https://images.unsplash.com/..."` por `src="/img/tu-foto.jpg"`.
> Las fotos se muestran en escala de grises por diseño (`filter: grayscale(1)` en `style.css`).
> Si quieres color, quita ese filtro en las clases `.media img`, `.sede__bg img`, `.disc-thumb img`.

**Textos / precios:** están directamente en cada `.html`. Los precios viven en la sección `#precios` de `index.html`.

**Teléfonos / WhatsApp:** Miraflores `981835198`, Surco `993630152`. Búscalos como `wa.me/51...` y `tel:+51...`.

**El 3D (Reformer):** está modelado proceduralmente en `src/scene.js` (grupo `reformer`).
`scene3d.setColor('#...')` cambia el color del cromo desde JS. Si en el futuro consigues un
modelo `.glb` real del estudio, se puede cargar con `GLTFLoader` en su lugar.

**Instructoras reales:** la sección de equipo se puede reactivar (estaba en la v1). Pídeme reincorporarla con fotos reales.

---

## ⚡ Rendimiento / accesibilidad

- El 3D respeta `prefers-reduced-motion` (se congela la deformación si el usuario lo pide).
- `pixelRatio` limitado a 2 y geometría reducida en móvil para fluidez.
- Datos estructurados (Schema.org `HealthClub`), Open Graph y metadatos SEO incluidos.

---

## ☁️ Despliegue

Cualquier hosting estático sirve el contenido de `/dist`:

- **Netlify / Vercel / Cloudflare Pages:** conecta el repo → build command `npm run build`, output `dist`.
- **Hosting tradicional (cPanel):** sube el contenido de `dist/` a `public_html`.

---

## 📌 Notas

- La versión anterior (one-page vibrante en HTML+Tailwind) quedó archivada en `legacy-v1/`.
- Las imágenes son placeholders: reemplazar por material real del estudio antes de publicar.
- Reserva: hoy enlaza a WhatsApp y app FITCO. Se puede integrar reserva online nativa más adelante.
