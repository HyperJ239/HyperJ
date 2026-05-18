import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const mockYarnSearchResults = [
  { brand: 'I Love This Yarn', colorName: 'Hot Rose', sku: '14', family: 'Pink', hexColor: '#ec4899', sourceWebsite: 'hobbylobby.com' },
  { brand: 'Red Heart Super Saver', colorName: 'Turqua', sku: '512', family: 'Blue', hexColor: '#14b8a6', sourceWebsite: 'yarnspirations.com' },
  { brand: 'Caron One Pound', colorName: 'Lilac', sku: '577', family: 'Purple', hexColor: '#c084fc', sourceWebsite: 'yarnspirations.com' },
  { brand: 'Loops & Threads', colorName: 'Neon Pink', sku: '106', family: 'Neon', hexColor: '#ff3eb5', sourceWebsite: 'michaels.com' },
  { brand: 'Big Twist', colorName: 'Varsity Red', sku: '112', family: 'Red', hexColor: '#dc2626', sourceWebsite: 'joann.com' },
  { brand: 'Mainstays', colorName: 'Soft Silver', sku: 'MS-204', family: 'Gray', hexColor: '#cbd5e1', sourceWebsite: 'walmart.com' },
  { brand: 'Lion Brand', colorName: 'Lemon', sku: '158', family: 'Yellow', hexColor: '#fde047', sourceWebsite: 'lionbrand.com' },
  { brand: 'Premier Yarns', colorName: 'Parrot Green', sku: '1177', family: 'Green', hexColor: '#22c55e', sourceWebsite: 'premieryarns.com' },
  { brand: 'Bernat', colorName: 'Aqua', sku: '10203', family: 'Blue', hexColor: '#22d3ee', sourceWebsite: 'yarnspirations.com' },
]

function yarnSearchMiddleware(request: { url?: string }, response: { setHeader: (name: string, value: string) => void; end: (body: string) => void }) {
  const url = new URL(request.url ?? '', 'http://localhost')
  const brand = url.searchParams.get('brand')?.toLowerCase() ?? ''
  const query = url.searchParams.get('query')?.toLowerCase() ?? ''
  const results = mockYarnSearchResults.filter((result) => {
    const matchesBrand = !brand || result.brand.toLowerCase() === brand
    const matchesQuery =
      !query ||
      result.colorName.toLowerCase().includes(query) ||
      result.sku.toLowerCase().includes(query) ||
      result.family.toLowerCase().includes(query)
    return matchesBrand && matchesQuery
  })

  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify({ results }))
}

export default defineConfig({
  plugins: [
    {
      name: 'mock-yarn-search-api',
      configureServer(server) {
        server.middlewares.use('/api/yarn-search', yarnSearchMiddleware)
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api/yarn-search', yarnSearchMiddleware)
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'apple-touch-icon.svg'],
      manifest: {
        name: 'TuftTrack',
        short_name: 'TuftTrack',
        description: 'TuftTrack by Hyper J Ruggs tracks rug projects, inventory, customers, expenses, and business metrics.',
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
