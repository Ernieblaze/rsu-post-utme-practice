import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'RSU Post-UTME Practice',
        short_name: 'RSU Post-UTME',
        description: 'Personalized RSU Post-UTME exam practice — timed mock exams, custom practice, and revision by course.',
        theme_color: '#002b5c',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // The question bank JSON is large (2–5 MB) — raise the precache limit so
        // the PWA service worker doesn't refuse to cache it as the bank grows.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MB
        // Never cache Supabase or Paystack requests -- auth, data, and payments must always hit the network.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*paystack.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ];

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    // Relative base so the build works on GitHub Pages under /<repo>/
    // as well as on a custom domain or local preview, with no extra config.
    base: './',
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Put bank.json in its own chunk so the app shell loads fast
            if (id.includes('bank.json')) return 'bank-data';
            // Vendor split for large third-party libs
            if (id.includes('node_modules/framer-motion')) return 'framer';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/lucide-react')) return 'lucide';
          },
        },
      },
    },
  };
})
