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

export default function handler(request, response) {
  const brand = String(request.query.brand ?? '').toLowerCase()
  const query = String(request.query.query ?? '').toLowerCase()
  const results = mockYarnSearchResults.filter((result) => {
    const matchesBrand = !brand || result.brand.toLowerCase() === brand
    const matchesQuery =
      !query ||
      result.colorName.toLowerCase().includes(query) ||
      result.sku.toLowerCase().includes(query) ||
      result.family.toLowerCase().includes(query)
    return matchesBrand && matchesQuery
  })

  response.status(200).json({ results })
}
