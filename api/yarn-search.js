import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const yarnDatabase = JSON.parse(readFileSync(join(__dirname, 'master-yarn-database.json'), 'utf8'))

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

function toResult(row) {
  return {
    brand: row.brand ?? '',
    line: row.line ?? '',
    colorName: row.colorName ?? row.color_name ?? '',
    sku: row.sku ?? row.colorNumber ?? '',
    upc: row.barcode ?? '',
    family: toColorFamily(row.colorFamily, row.colorName ?? row.color_name),
    hexColor: row.hex ?? '#ffffff',
    weight: row.weight ?? '',
    yardage: row.yardage ?? '',
    fiber: row.fiber ?? '',
    quantity: row.quantity ?? 0,
    reorderLevel: row.reorderLevel ?? 0,
    sourceWebsite: row.sourceUrl ?? row.supplierUrl ?? row.officialSource ?? '',
    notes: [row.notes, row.skeinSize ? `Skein size: ${row.skeinSize}` : ''].filter(Boolean).join(' · '),
    materialBlend: row.materialBlend ?? '',
    skeinSize: row.skeinSize ?? '',
    yarnForm: row.yarnForm ?? '',
    packageShape: row.packageShape ?? '',
    centerPull: row.centerPull ?? '',
    coneWeight: row.coneWeight ?? '',
    coreType: row.coreType ?? '',
    plies: row.plies ?? '',
    texture: row.texture ?? '',
    finish: row.finish ?? '',
    glowUV: row.glowUV ?? '',
    neon: row.neon ?? '',
    tuftingRecommended: row.tuftingRecommended ?? '',
    projectUsage: row.projectUsage ?? '',
    dyeLot: row.dyeLot ?? '',
    storageLocation: row.storageLocation ?? '',
    appCategory: row.appCategory ?? '',
    lastUpdated: row.lastUpdated ?? '',
  }
}

export default function handler(request, response) {
  const brand = String(request.query.brand ?? '').toLowerCase()
  const query = String(request.query.query ?? '').toLowerCase()

  const results = yarnDatabase
    .filter((row) => {
      const rowBrand = String(row.brand ?? '').toLowerCase()
      const searchable = [
        row.brand,
        row.line,
        row.colorName,
        row.color_name,
        row.sku,
        row.colorNumber,
        row.barcode,
        row.colorFamily,
        row.weight,
        row.fiber,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesBrand = !brand || rowBrand === brand
      const matchesQuery = !query || searchable.includes(query)
      return matchesBrand && matchesQuery
    })
    .map(toResult)

  response.status(200).json({ results })
}
