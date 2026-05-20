import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import yarnDatabase from './api/master-yarn-database.json' with { type: 'json' }

function toColorFamily(value = '', colorName = '') {
  const combined = `${value} ${colorName}`.toLowerCase()
  if (combined.includes('red')) return 'Red'
  if (combined.includes('orange')) return 'Orange'
  if (combined.includes('yellow') || combined.includes('gold')) return 'Yellow'
  if (combined.includes('green')) return 'Green'
  if (combined.includes('blue') || combined.includes('teal') || combined.includes('aqua')) return 'Blue'
  if (combined.includes('purple') || combined.includes('violet') || combined.includes('lilac')) return 'Purple'
  if (combined.includes('pink') || combined.includes('rose')) return 'Pink'
  if (combined.includes('brown') || combined.includes('tan') || combined.includes('aran')) return 'Brown'
  if (combined.includes('black')) return 'Black'
  if (combined.includes('white')) return 'White'
  if (combined.includes('gray') || combined.includes('grey') || combined.includes('silver')) return 'Gray'
  if (combined.includes('neon')) return 'Neon'
  return 'Multi'
}

function yarnSearchMiddleware(request: { url?: string }, response: { setHeader: (name: string, value: string) => void; end: (body: string) => void }) {
  const url = new URL(request.url ?? '', 'http://localhost')
  const brand = url.searchParams.get('brand')?.toLowerCase() ?? ''
  const query = url.searchParams.get('query')?.toLowerCase() ?? ''
  const results = yarnDatabase
    .filter((row) => {
      const searchable = [row.brand, row.line, row.colorName, row.color_name, row.sku, 'colorNumber' in row ? row.colorNumber : '', row.barcode, row.colorFamily, row.weight, row.fiber]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return (!brand || row.brand.toLowerCase() === brand) && (!query || searchable.includes(query))
    })
    .map((row) => ({
      brand: row.brand,
      line: row.line,
      colorName: row.colorName || row.color_name,
      sku: row.sku ?? ('colorNumber' in row ? row.colorNumber : ''),
      upc: row.barcode,
      family: toColorFamily(row.colorFamily, row.colorName || row.color_name),
      hexColor: row.hex || '#ffffff',
      weight: row.weight,
      yardage: 'yardage' in row ? row.yardage : '',
      fiber: row.fiber,
      quantity: row.quantity,
      reorderLevel: row.reorderLevel,
      sourceWebsite: row.sourceUrl ?? ('supplierUrl' in row ? row.supplierUrl : '') ?? ('officialSource' in row ? row.officialSource : ''),
      notes: [row.notes, 'skeinSize' in row && row.skeinSize ? `Skein size: ${row.skeinSize}` : ''].filter(Boolean).join(' · '),
      materialBlend: 'materialBlend' in row ? row.materialBlend : '',
      skeinSize: 'skeinSize' in row ? row.skeinSize : '',
      yarnForm: 'yarnForm' in row ? row.yarnForm : '',
      packageShape: 'packageShape' in row ? row.packageShape : '',
      centerPull: 'centerPull' in row ? row.centerPull : '',
      coneWeight: 'coneWeight' in row ? row.coneWeight : '',
      coreType: 'coreType' in row ? row.coreType : '',
      plies: 'plies' in row ? row.plies : '',
      texture: 'texture' in row ? row.texture : '',
      finish: 'finish' in row ? row.finish : '',
      glowUV: 'glowUV' in row ? row.glowUV : '',
      neon: 'neon' in row ? row.neon : '',
      tuftingRecommended: 'tuftingRecommended' in row ? row.tuftingRecommended : '',
      projectUsage: 'projectUsage' in row ? row.projectUsage : '',
      dyeLot: 'dyeLot' in row ? row.dyeLot : '',
      storageLocation: 'storageLocation' in row ? row.storageLocation : '',
      appCategory: 'appCategory' in row ? row.appCategory : '',
      lastUpdated: 'lastUpdated' in row ? row.lastUpdated : '',
    }))

  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify({ results }))
}

export default defineConfig({
  plugins: [
    {
      name: 'yarn-database-search-api',
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
