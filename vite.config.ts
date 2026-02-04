import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ["preferredLanguage", "baseLocale"]
    }),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NearMiss.me',
        short_name: 'NearMiss',
        theme_color: '#FAF9F6',
        icons: [
          { src: 'web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }),
    tailwindcss(),
    sveltekit()
  ]
});
