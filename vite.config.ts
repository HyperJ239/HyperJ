import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'apple-touch-icon.svg'],
      manifest: {
        name: 'TuftTrack',
        short_name: 'TuftTrack',
        description: 'TuftTrack, powered by Hyper J Ruggs, tracks rug projects, inventory, customers, expenses, and business metrics.',
        theme_color: '#070814',
        background_color: '#070814',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,svg,ico,png,webmanifest}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
