// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@cloudflare/puppeteer']
    },
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    ssr: {
      noExternal: ['react-hook-form', '@hookform/resolvers']
    }
  },

  integrations: [react()]
});
