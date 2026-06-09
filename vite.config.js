import { defineConfig } from 'vite';
import { resolve } from 'path';

const r = (p) => resolve(__dirname, p);

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: r('index.html'),
        miraflores: r('miraflores.html'),
        surco: r('surco.html'),
        reformer: r('pilates-reformer.html'),
        barre: r('barre.html'),
        stepchair: r('step-chair.html'),
        trx: r('suspension-trx.html'),
        stretching: r('stretching.html'),
      },
    },
  },
});
