import { useEffect, useState } from 'react'
import type { ChangeEvent, Dispatch, FormEvent, ReactElement, ReactNode, SetStateAction } from 'react'
import { masterYarnDatabase } from './masterYarnDatabase'

type ProjectStatus =
  | 'Quote'
  | 'Approved'
  | 'Designing'
  | 'Tracing'
  | 'Tufting'
  | 'Gluing'
  | 'Trimming'
  | 'Carving'
  | 'Backing'
  | 'Finished'
  | 'Picked Up'
  | 'Delivered'

type Project = {
  id: string
  name: string
  customer: string
  size: string
  status: ProjectStatus
  price: number
  depositPaid: number
  dueDate: string
  notes: string
  photos: string[]
}

type InventoryItem = {
  id: string
  yarnColor: string
  brand: string
  yarnLine: string
  colorCode: string
  upc: string
  colorFamily: ColorFamily
  hexColor: string
  quantity: number
  lowStockThreshold: number
  cost: number
  supplier: string
  notes: string
}

type Customer = {
  id: string
  name: string
  phone: string
  email: string
  instagram: string
  notes: string
  dateAdded: string
}

type ExpenseCategory = 'Yarn' | 'Glue' | 'Backing' | 'Tools' | 'Shipping' | 'Booth/Event Fee' | 'Other'

type Expense = {
  id: string
  itemName: string
  category: ExpenseCategory
  cost: number
  date: string
  supplier: string
  notes: string
}

type ColorFamily = 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple' | 'Pink' | 'Brown' | 'Black' | 'White' | 'Gray' | 'Neon' | 'Multi'

type YarnColor = {
  id: string
  name: string
  line: string
  sku: string
  upc: string
  family: ColorFamily
  hexColor: string
  weight: string
  yardage: string
  fiber: string
  store: string
  website: string
  photo: string
  inStockQuantity: number
  reorderLevel: number
  notes: string
}

type YarnBrand = {
  id: string
  name: string
  source: string
  website: string
  notes: string
  colors: YarnColor[]
}

type WebYarnResult = {
  brand: string
  line?: string
  colorName: string
  sku: string
  upc?: string
  family: ColorFamily
  hexColor: string
  weight?: string
  yardage?: string
  fiber?: string
  quantity?: number
  reorderLevel?: number
  sourceWebsite: string
  notes?: string
}

type Page = 'dashboard' | 'projects' | 'inventory' | 'customers' | 'expenses' | 'yarnLibrary' | 'settings'

type ProjectFormState = Omit<Project, 'id'>
type InventoryFormState = Omit<InventoryItem, 'id'>
type CustomerFormState = Omit<Customer, 'id'>
type ExpenseFormState = Omit<Expense, 'id'>
type Accent = 'teal' | 'purple' | 'pink'

const projectStatuses: ProjectStatus[] = [
  'Quote',
  'Approved',
  'Designing',
  'Tracing',
  'Tufting',
  'Gluing',
  'Trimming',
  'Carving',
  'Backing',
  'Finished',
  'Picked Up',
  'Delivered',
]
const expenseCategories: ExpenseCategory[] = ['Yarn', 'Glue', 'Backing', 'Tools', 'Shipping', 'Booth/Event Fee', 'Other']
const colorFamilies: ColorFamily[] = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White', 'Gray', 'Neon', 'Multi']
const starterYarnBrandNames = ['I Love This Yarn', 'Red Heart Super Saver', 'Caron One Pound', 'Loops & Threads', 'Big Twist', 'Mainstays', 'Lion Brand', 'Premier Yarns', 'Bernat']

const sampleProjects: Project[] = [
  { id: 'p1', name: 'Galaxy Logo Rug', customer: 'Maya Chen', size: '3 ft x 4 ft', status: 'Tufting', price: 420, depositPaid: 150, dueDate: '2026-05-24', notes: 'Match brand colors closely.', photos: [] },
  { id: 'p2', name: 'Barbershop Entry Rug', customer: 'Jalen Brooks', size: '4 ft x 6 ft', status: 'Approved', price: 560, depositPaid: 280, dueDate: '2026-05-30', notes: 'Durable backing for storefront traffic.', photos: [] },
  { id: 'p3', name: 'Pink Flame Rug', customer: 'Sasha Lee', size: '2 ft x 3 ft', status: 'Finished', price: 310, depositPaid: 310, dueDate: '2026-05-18', notes: 'Ready for pickup.', photos: [] },
]

const sampleInventory: InventoryItem[] = [
  { id: 'i1', yarnColor: 'Black', brand: 'I Love This Yarn', yarnLine: '', colorCode: '', upc: '', colorFamily: 'Black', hexColor: '#111111', quantity: 8, lowStockThreshold: 6, cost: 14, supplier: 'Rug Supply Hub', notes: 'Primary outline color.' },
  { id: 'i2', yarnColor: 'Teal', brand: 'Red Heart Super Saver', yarnLine: '', colorCode: '', upc: '', colorFamily: 'Blue', hexColor: '#14b8a6', quantity: 4, lowStockThreshold: 6, cost: 15, supplier: 'Rug Supply Hub', notes: 'Signature accent color.' },
  { id: 'i3', yarnColor: 'Hot Pink', brand: 'Caron One Pound', yarnLine: '', colorCode: '', upc: '', colorFamily: 'Pink', hexColor: '#ec4899', quantity: 10, lowStockThreshold: 5, cost: 16, supplier: 'Color Loom', notes: 'Used for flame designs.' },
  { id: 'i4', yarnColor: 'Purple', brand: 'Lion Brand', yarnLine: '', colorCode: '', upc: '', colorFamily: 'Purple', hexColor: '#a855f7', quantity: 3, lowStockThreshold: 4, cost: 16, supplier: 'Color Loom', notes: 'Reorder soon.' },
]

const sampleCustomers: Customer[] = [
  { id: 'c1', name: 'Maya Chen', phone: '(555) 014-2234', email: 'maya@example.com', instagram: '@maya', notes: 'Prefers text updates.', dateAdded: '2026-05-01' },
  { id: 'c2', name: 'Jalen Brooks', phone: '(555) 014-7712', email: 'jalen@example.com', instagram: '@jalenbrooks', notes: 'Repeat commercial client.', dateAdded: '2026-05-04' },
  { id: 'c3', name: 'Sasha Lee', phone: '(555) 014-9981', email: 'sasha@example.com', instagram: '@sashalee', notes: 'Pickup scheduled for Sunday.', dateAdded: '2026-05-08' },
]

const sampleExpenses: Expense[] = [
  { id: 'e1', itemName: 'Teal yarn restock', category: 'Yarn', cost: 90, date: '2026-05-06', supplier: 'Rug Supply Hub', notes: '6 cones' },
  { id: 'e2', itemName: 'Latex glue', category: 'Glue', cost: 48, date: '2026-05-09', supplier: 'Craft Depot', notes: '2 gallons' },
  { id: 'e3', itemName: 'Spring maker booth', category: 'Booth/Event Fee', cost: 120, date: '2026-05-12', supplier: 'Downtown Market', notes: 'Weekend vendor fee' },
]

function toColorFamily(value: string, colorName = ''): ColorFamily {
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

function buildStarterYarnBrands(): YarnBrand[] {
  const brandMap = new Map<string, YarnBrand>()

  ;(masterYarnDatabase as readonly Record<string, string | number | boolean>[]).forEach((row) => {
    const brandName = String(row.brand || 'Unknown Brand')
    let brand = brandMap.get(brandName)
    if (!brand) {
      brand = {
        id: `brand-${brandName.toLowerCase().replaceAll(/\s+/g, '-')}`,
        name: brandName,
        source: String(row.store ?? brandName),
        website: String(row.sourceUrl ?? ''),
        notes: 'Starter yarn database import.',
        colors: [],
      }
      brandMap.set(brandName, brand)
    }

    brand.colors.push({
      id: String(row.id),
      name: String(row.colorName || row.color_name || ''),
      line: String(row.line ?? ''),
      sku: String(row.sku ?? ''),
      upc: String(row.barcode ?? ''),
      family: toColorFamily(String(row.colorFamily ?? ''), String(row.colorName ?? '')),
      hexColor: String(row.hex || '#ffffff'),
      weight: String(row.weight ?? ''),
      yardage: String(row.yardage ?? ''),
      fiber: String(row.fiber ?? ''),
      store: String(row.store ?? brandName),
      website: String(row.sourceUrl ?? ''),
      photo: String(row.swatchImageUrl ?? ''),
      inStockQuantity: Number(row.quantity ?? 0),
      reorderLevel: Number(row.reorderLevel ?? 0),
      notes: String(row.notes ?? ''),
    })
  })

  starterYarnBrandNames.forEach((name) => {
    if (!brandMap.has(name)) {
      brandMap.set(name, { id: crypto.randomUUID(), name, source: '', website: '', notes: '', colors: [] })
    }
  })

  return [...brandMap.values()]
}

const sampleYarnBrands: YarnBrand[] = buildStarterYarnBrands()

const defaultProjectForm: ProjectFormState = {
  name: '',
  customer: '',
  size: '',
  status: 'Quote',
  price: 0,
  depositPaid: 0,
  dueDate: '',
  notes: '',
  photos: [],
}

const defaultInventoryForm: InventoryFormState = {
  yarnColor: '',
  brand: '',
  yarnLine: '',
  colorCode: '',
  upc: '',
  colorFamily: 'Multi',
  hexColor: '#ffffff',
  quantity: 0,
  lowStockThreshold: 0,
  cost: 0,
  supplier: '',
  notes: '',
}

const defaultCustomerForm: CustomerFormState = {
  name: '',
  phone: '',
  email: '',
  instagram: '',
  notes: '',
  dateAdded: '',
}

const defaultExpenseForm: ExpenseFormState = {
  itemName: '',
  category: 'Yarn',
  cost: 0,
  date: '',
  supplier: '',
  notes: '',
}

function useStoredState<T>(key: string, initialValue: T, normalize?: (value: T) => T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (!stored) return initialValue

    try {
      const parsed = JSON.parse(stored) as T
      return normalize ? normalize(parsed) : parsed
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function normalizeProjects(projects: Project[]) {
  return projects.map((project) => {
    const legacyProject = project as Project & {
      size?: string
      depositPaid?: number
      notes?: string
      photos?: string[]
    }

    const safeStatus = projectStatuses.includes(legacyProject.status) ? legacyProject.status : 'Quote'

    return {
      ...project,
      status: safeStatus,
      size: legacyProject.size ?? '',
      depositPaid: legacyProject.depositPaid ?? 0,
      notes: legacyProject.notes ?? '',
      photos: legacyProject.photos ?? [],
    }
  })
}

function normalizeInventory(items: InventoryItem[]) {
  return items.map((item) => {
    const legacyItem = item as InventoryItem & { name?: string }
    return {
      yarnColor: legacyItem.yarnColor ?? legacyItem.name ?? '',
      brand: legacyItem.brand ?? '',
      yarnLine: legacyItem.yarnLine ?? '',
      colorCode: legacyItem.colorCode ?? '',
      upc: legacyItem.upc ?? '',
      colorFamily: legacyItem.colorFamily ?? 'Multi',
      hexColor: legacyItem.hexColor ?? '#ffffff',
      quantity: legacyItem.quantity ?? 0,
      lowStockThreshold: legacyItem.lowStockThreshold ?? 0,
      cost: legacyItem.cost ?? 0,
      supplier: legacyItem.supplier ?? '',
      notes: legacyItem.notes ?? '',
      id: legacyItem.id,
    }
  })
}

function normalizeYarnBrands(brands: YarnBrand[]) {
  const normalized = brands.map((brand) => ({
    ...brand,
    colors: brand.colors.map((color) => ({
      ...color,
      line: color.line ?? '',
      upc: color.upc ?? '',
      weight: color.weight ?? '',
      yardage: color.yardage ?? '',
      fiber: color.fiber ?? '',
      store: color.store ?? brand.source ?? '',
      website: color.website ?? brand.website ?? '',
      photo: color.photo ?? '',
      notes: color.notes ?? '',
      reorderLevel: color.reorderLevel ?? 0,
    })),
  }))

  const missingBrands = starterYarnBrandNames
    .filter((name) => !normalized.some((brand) => brand.name === name))
    .map((name) => ({
      id: crypto.randomUUID(),
      name,
      source: '',
      website: '',
      notes: '',
      colors: [],
    }))

  return [...normalized, ...missingBrands]
}

function normalizeCustomers(customers: Customer[]) {
  return customers.map((customer) => {
    const legacyCustomer = customer as Customer & {
      instagram?: string
      dateAdded?: string
    }

    return {
      ...customer,
      instagram: legacyCustomer.instagram ?? '',
      dateAdded: legacyCustomer.dateAdded ?? '',
    }
  })
}

function normalizeExpenses(expenses: Expense[]) {
  return expenses.map((expense) => ({
    ...expense,
    notes: expense.notes ?? '',
  }))
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function remainingBalance(project: Project) {
  return Math.max(project.price - project.depositPaid, 0)
}

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useStoredState<Project[]>('hyper-j-projects', sampleProjects, normalizeProjects)
  const [inventory, setInventory] = useStoredState<InventoryItem[]>('hyper-j-inventory', sampleInventory, normalizeInventory)
  const [customers, setCustomers] = useStoredState<Customer[]>('hyper-j-customers', sampleCustomers, normalizeCustomers)
  const [expenses, setExpenses] = useStoredState<Expense[]>('hyper-j-expenses', sampleExpenses, normalizeExpenses)
  const [yarnBrands, setYarnBrands] = useStoredState<YarnBrand[]>('hyper-j-yarn-brands', sampleYarnBrands, normalizeYarnBrands)
  const [toast, setToast] = useState('')

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function createProject(project: ProjectFormState) {
    setProjects((current) => [{ id: crypto.randomUUID(), ...project }, ...current])
    notify('Project saved.')
  }

  function updateProject(id: string, project: ProjectFormState) {
    setProjects((current) => current.map((item) => (item.id === id ? { ...item, ...project } : item)))
    notify('Project updated.')
  }

  function deleteProject(id: string) {
    setProjects((current) => current.filter((item) => item.id !== id))
    setSelectedProjectId((current) => (current === id ? null : current))
    notify('Project deleted.')
  }

  function createInventoryItem(item: InventoryFormState) {
    setInventory((current) => [{ id: crypto.randomUUID(), ...item }, ...current])
    notify('Inventory item saved.')
  }

  function updateInventoryItem(id: string, item: InventoryFormState) {
    setInventory((current) => current.map((entry) => (entry.id === id ? { ...entry, ...item } : entry)))
    notify('Inventory item updated.')
  }

  function deleteInventoryItem(id: string) {
    setInventory((current) => current.filter((entry) => entry.id !== id))
    notify('Inventory item deleted.')
  }

  function saveWebYarnResult(result: WebYarnResult) {
    setYarnBrands((current) => {
      const existingBrand = current.find((brand) => brand.name === result.brand)
      const nextColor: YarnColor = {
        id: crypto.randomUUID(),
        name: result.colorName,
        line: result.line ?? '',
        sku: result.sku,
        upc: result.upc ?? '',
        family: result.family,
        hexColor: result.hexColor,
        weight: result.weight ?? '',
        yardage: result.yardage ?? '',
        fiber: result.fiber ?? '',
        store: result.sourceWebsite,
        website: result.sourceWebsite,
        photo: '',
        inStockQuantity: result.quantity ?? 0,
        reorderLevel: result.reorderLevel ?? 0,
        notes: result.notes ?? `Saved from ${result.sourceWebsite}`,
      }

      if (existingBrand) {
        const alreadySaved = existingBrand.colors.some(
          (color) =>
            color.name.toLowerCase() === result.colorName.toLowerCase() &&
            color.sku.toLowerCase() === result.sku.toLowerCase(),
        )
        if (alreadySaved) return current
        return current.map((brand) =>
          brand.id === existingBrand.id ? { ...brand, colors: [...brand.colors, nextColor] } : brand,
        )
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          name: result.brand,
          source: result.sourceWebsite,
          website: result.sourceWebsite,
          notes: 'Created from web lookup result.',
          colors: [nextColor],
        },
      ]
    })
    notify('Yarn color saved to library.')
  }

  function replaceAllData(data: {
    projects: Project[]
    inventory: InventoryItem[]
    customers: Customer[]
    expenses: Expense[]
  }) {
    setProjects(normalizeProjects(data.projects))
    setInventory(normalizeInventory(data.inventory))
    setCustomers(normalizeCustomers(data.customers))
    setExpenses(normalizeExpenses(data.expenses))
  }

  const lowStockItems = inventory.filter((item) => item.quantity <= item.lowStockThreshold)
  const completedStatuses: ProjectStatus[] = ['Picked Up', 'Delivered']
  const activeProjects = projects.filter((project) => !completedStatuses.includes(project.status))
  const finishedProjects = projects.filter((project) => ['Finished', 'Picked Up', 'Delivered'].includes(project.status)).length
  const totalPipelineValue = projects.reduce((sum, project) => sum + project.price, 0)
  const depositsCollected = projects.reduce((sum, project) => sum + project.depositPaid, 0)
  const balanceRemaining = projects.reduce((sum, project) => sum + remainingBalance(project), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.cost, 0)
  const estimatedProfit = totalPipelineValue - totalExpenses
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null

  const stats: { label: string; value: string; accent: Accent }[] = [
    { label: 'Total projects', value: projects.length.toString(), accent: 'teal' },
    { label: 'Active projects', value: activeProjects.length.toString(), accent: 'teal' },
    { label: 'Finished rugs', value: finishedProjects.toString(), accent: 'purple' },
    { label: 'Inventory items', value: inventory.length.toString(), accent: 'purple' },
    { label: 'Low stock items', value: lowStockItems.length.toString(), accent: 'pink' },
    { label: 'Total project value', value: currency(totalPipelineValue), accent: 'teal' },
    { label: 'Deposits collected', value: currency(depositsCollected), accent: 'purple' },
    { label: 'Balance remaining', value: currency(balanceRemaining), accent: 'pink' },
    { label: 'Total expenses', value: currency(totalExpenses), accent: 'purple' },
    { label: 'Estimated profit', value: currency(estimatedProfit), accent: 'teal' },
  ]

  return (
    <div className="min-h-screen bg-[#070814] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.14),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(236,72,153,0.12),transparent_28%)]" />
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col gap-4 p-0 lg:flex-row lg:gap-6 lg:p-5">
        <Sidebar page={page} onChange={setPage} lowStockCount={lowStockItems.length} />
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:rounded-[2rem] lg:border lg:border-white/10 lg:bg-white/[0.025] lg:px-6 lg:py-6 lg:shadow-[0_0_50px_rgba(0,0,0,0.28)] xl:px-8">
          <Header page={page} />
          {page === 'dashboard' && (
            <Dashboard stats={stats} projects={projects} lowStockItems={lowStockItems} />
          )}
          {page === 'projects' && selectedProject ? (
            <ProjectDetailPage
              project={selectedProject}
              customers={customers}
              onBack={() => setSelectedProjectId(null)}
              onUpdate={updateProject}
            />
          ) : page === 'projects' && (
            <ProjectsPage
              projects={projects}
              onCreate={createProject}
              onUpdate={updateProject}
              onDelete={deleteProject}
              onOpenProject={setSelectedProjectId}
            />
          )}
          {page === 'inventory' && (
            <InventoryPage
              inventory={inventory}
              yarnBrands={yarnBrands}
              onSaveWebYarnResult={saveWebYarnResult}
              onCreate={createInventoryItem}
              onUpdate={updateInventoryItem}
              onDelete={deleteInventoryItem}
            />
          )}
          {page === 'customers' && <CustomersPage customers={customers} projects={projects} setCustomers={setCustomers} onNotify={notify} />}
          {page === 'expenses' && <ExpensesPage expenses={expenses} setExpenses={setExpenses} onNotify={notify} />}
          {page === 'yarnLibrary' && <YarnLibraryPage brands={yarnBrands} setBrands={setYarnBrands} onNotify={notify} onSaveWebYarnResult={saveWebYarnResult} onAddToInventory={createInventoryItem} />}
          {page === 'settings' && (
            <SettingsPage
              projects={projects}
              inventory={inventory}
              customers={customers}
              expenses={expenses}
              onImport={replaceAllData}
            />
          )}
        </main>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}

function Sidebar({ page, onChange, lowStockCount }: { page: Page; onChange: (page: Page) => void; lowStockCount: number }) {
  const links: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'customers', label: 'Customers' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'yarnLibrary', label: 'Yarn Library' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <>
    <aside className="border-b border-white/10 bg-white/[0.03] p-4 backdrop-blur lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-72 lg:shrink-0 lg:rounded-[2rem] lg:border lg:border-white/10 lg:p-5 lg:shadow-[0_0_40px_rgba(0,0,0,0.24)]">
      <BrandMark className="mb-5" />
      <nav className="hidden grid-cols-2 gap-2 sm:grid lg:grid-cols-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onChange(link.id)}
            className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
              page === link.id
                ? 'bg-white text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.35)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="mt-5 rounded-3xl border border-pink-400/20 bg-pink-400/10 p-4 shadow-[0_0_24px_rgba(244,114,182,0.08)]">
        <p className="text-sm text-pink-100">Low-stock alerts</p>
        <p className="mt-2 text-3xl font-semibold text-pink-300">{lowStockCount}</p>
      </div>
    </aside>
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 gap-1 rounded-[1.5rem] border border-white/10 bg-[#0d1020]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur sm:hidden">
      {links.map((link) => (
        <button
          key={link.id}
          onClick={() => onChange(link.id)}
          className={`rounded-2xl px-2 py-3 text-[11px] transition ${
            page === link.id
              ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.28)]'
              : 'text-slate-300'
          }`}
        >
          {link.label}
        </button>
      ))}
    </nav>
    </>
  )
}

function Header({ page }: { page: Page }) {
  const titles: Record<Page, string> = {
    dashboard: 'TuftTrack Dashboard',
    projects: 'Projects',
    inventory: 'Inventory',
    customers: 'Customers',
    expenses: 'Expenses',
    yarnLibrary: 'Yarn Library',
    settings: 'Settings',
  }

  return (
    <header className="mb-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/10 sm:p-5">
      <p className="text-sm text-slate-400">by Hyper J Ruggs</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-semibold tracking-tight text-white">{titles[page]}</h2>
        <span className="w-fit rounded-full border border-teal-300/15 bg-teal-300/[0.08] px-3 py-1 text-xs text-teal-100">
          TuftTrack web app
        </span>
      </div>
    </header>
  )
}

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.35em] text-teal-300">by Hyper J Ruggs</p>
      <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 shadow-[0_0_28px_rgba(45,212,191,0.18),0_0_32px_rgba(236,72,153,0.08)]">
        <h1 className="bg-gradient-to-r from-teal-200 via-white to-pink-200 bg-clip-text text-2xl font-semibold tracking-[0.03em] text-transparent drop-shadow-[0_0_14px_rgba(45,212,191,0.25)]">
          TuftTrack
        </h1>
      </div>
    </div>
  )
}

function Dashboard({ stats, projects, lowStockItems }: { stats: { label: string; value: string; accent: Accent }[]; projects: Project[]; lowStockItems: InventoryItem[] }) {
  const latestProjects = projects.slice(0, 4)
  const accentStyles = {
    teal: 'border-teal-300/20 bg-teal-300/[0.08] shadow-[0_0_28px_rgba(45,212,191,0.12)]',
    purple: 'border-purple-300/20 bg-purple-300/[0.08] shadow-[0_0_28px_rgba(192,132,252,0.12)]',
    pink: 'border-pink-300/20 bg-pink-300/[0.08] shadow-[0_0_28px_rgba(244,114,182,0.12)]',
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Business pulse</p>
            <h3 className="text-2xl font-semibold text-white">Today at a glance</h3>
          </div>
          <span className="w-fit rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{projects.length} tracked projects</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-[1.75rem] border p-4 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 sm:p-5 ${accentStyles[stat.accent]}`}>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Panel title="Recent projects">
          <div className="space-y-3">
            {latestProjects.length === 0 ? (
              <EmptyState message="No projects yet. Add your first rug project to start tracking work." />
            ) : (
              latestProjects.map((project) => (
                <div key={project.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{project.name}</p>
                    <p className="text-sm text-slate-400">{project.customer}</p>
                  </div>
                  <StatusPill status={project.status} />
                </div>
              ))
            )}
          </div>
        </Panel>
        <Panel title="Low-stock warning">
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-400">Everything is stocked above threshold.</p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4">
                  <p className="font-medium text-white">{item.yarnColor}</p>
                  <p className="text-sm text-pink-100">{item.quantity} cones left · threshold {item.lowStockThreshold}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>
    </div>
  )
}

function ProjectsPage({
  projects,
  onCreate,
  onUpdate,
  onDelete,
  onOpenProject,
}: {
  projects: Project[]
  onCreate: (project: ProjectFormState) => void
  onUpdate: (id: string, project: ProjectFormState) => void
  onDelete: (id: string) => void
  onOpenProject: (id: string) => void
}) {
  const [form, setForm] = useState<ProjectFormState>(defaultProjectForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'All' | ProjectStatus>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [dueDateSort, setDueDateSort] = useState<'asc' | 'desc'>('asc')

  const filteredProjects = projects
    .filter((project) => selectedStatus === 'All' || project.status === selectedStatus)
    .filter((project) => {
      const query = searchTerm.trim().toLowerCase()
      if (!query) return true
      return project.name.toLowerCase().includes(query) || project.customer.toLowerCase().includes(query)
    })
    .sort((first, second) => {
      const firstDate = first.dueDate ? new Date(first.dueDate).getTime() : Number.POSITIVE_INFINITY
      const secondDate = second.dueDate ? new Date(second.dueDate).getTime() : Number.POSITIVE_INFINITY
      return dueDateSort === 'asc' ? firstDate - secondDate : secondDate - firstDate
    })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || !form.customer.trim() || !form.size.trim() || !form.dueDate) {
      setError('Project name, customer name, size, and due date are required.')
      return
    }

    if (editingId) {
      onUpdate(editingId, form)
    } else {
      onCreate(form)
    }

    setForm(defaultProjectForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  function edit(project: Project) {
    const { id: _id, ...nextForm } = project
    setForm(nextForm)
    setEditingId(project.id)
    setError('')
    setIsModalOpen(true)
  }

  function openCreateModal() {
    setForm(defaultProjectForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setForm(defaultProjectForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  function updateForm<K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    if (error) setError('')
  }

  function isOverdue(project: Project) {
    if (!project.dueDate || ['Finished', 'Picked Up', 'Delivered'].includes(project.status)) return false
    return new Date(project.dueDate) < new Date(new Date().toDateString())
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/10 sm:p-5">
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-sm text-slate-400">Production flow</p>
          <h3 className="text-xl font-semibold text-white">Project pipeline</h3>
        </div>
        <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {(['All', ...projectStatuses] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedStatus === status
                  ? 'bg-white text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.35)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            placeholder="Search project or customer"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setDueDateSort((current) => (current === 'asc' ? 'desc' : 'asc'))}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Due date {dueDateSort === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        </div>
      </section>
      <div className="sticky top-3 z-20 flex justify-end sm:static">
        <button onClick={openCreateModal} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.2)] transition hover:bg-teal-200">
          Add Project
        </button>
      </div>
      <Panel title="Project list">
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.length === 0 ? (
            <EmptyState message="No projects yet. Use the form to create your first rug project." />
          ) : filteredProjects.length === 0 ? (
            <EmptyState message="No projects match the current search or filter." />
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`group relative overflow-hidden rounded-[1.75rem] border p-4 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 sm:p-5 ${
                  isOverdue(project)
                    ? 'border-pink-400/40 bg-pink-400/10 shadow-[0_0_28px_rgba(244,114,182,0.12)]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-300 via-purple-300 to-pink-300 opacity-80" />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenProject(project.id)}
                      className="font-medium text-white transition hover:text-teal-200"
                    >
                      {project.name}
                    </button>
                    <p className="text-sm text-slate-400">{project.customer}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                      <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">{project.size}</span>
                      <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">{currency(project.price)}</span>
                      <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Due {project.dueDate || 'TBD'}</span>
                    </div>
                    {isOverdue(project) && <p className="mt-1 text-xs font-medium text-pink-200">Overdue</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-teal-400/15 px-3 py-1 text-teal-100">
                        Deposit {currency(project.depositPaid)}
                      </span>
                      <span className="rounded-full bg-pink-400/15 px-3 py-1 text-pink-100">
                        Remaining {currency(remainingBalance(project))}
                      </span>
                    </div>
                  </div>
                  <StatusPill status={project.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {projectStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onUpdate(project.id, {
                        name: project.name,
                        customer: project.customer,
                        size: project.size,
                        status,
                        price: project.price,
                        depositPaid: project.depositPaid,
                        dueDate: project.dueDate,
                        notes: project.notes,
                        photos: project.photos,
                      })}
                      className={`rounded-full px-3 py-2 text-xs transition ${
                        project.status === status
                          ? 'bg-white text-slate-950'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <RowActions
                  onEdit={() => edit(project)}
                  onDelete={() => onDelete(project.id)}
                  confirmMessage={`Delete ${project.name}?`}
                  extraAction={
                    <button
                      type="button"
                      onClick={() => onOpenProject(project.id)}
                      className="rounded-full bg-teal-400/15 px-4 py-2 text-sm text-teal-100 hover:bg-teal-400/25"
                    >
                      View
                    </button>
                  }
                />
              </div>
            ))
          )}
        </div>
      </Panel>
      <Modal title={editingId ? 'Edit Project' : 'Add Project'} open={isModalOpen} onClose={closeModal}>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name"><input value={form.name} onChange={(event) => updateForm('name', event.target.value)} /></Field>
            <Field label="Customer name"><input value={form.customer} onChange={(event) => updateForm('customer', event.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Size"><input value={form.size} onChange={(event) => updateForm('size', event.target.value)} /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(event) => updateForm('status', event.target.value as ProjectStatus)}>
                {projectStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price"><input type="number" min="0" value={form.price} onChange={(event) => updateForm('price', Number(event.target.value))} /></Field>
            <Field label="Deposit paid"><input type="number" min="0" value={form.depositPaid} onChange={(event) => updateForm('depositPaid', Number(event.target.value))} /></Field>
            <Field label="Due date"><input type="date" value={form.dueDate} onChange={(event) => updateForm('dueDate', event.target.value)} /></Field>
          </div>
          <Field label="Notes"><textarea rows={4} value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} /></Field>
          {error && <p className="rounded-2xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">{error}</p>}
          <ModalActions onCancel={closeModal} />
        </form>
      </Modal>
      <FloatingActionButton label="Add project" onClick={openCreateModal} />
    </div>
  )
}

function InventoryPage({
  inventory,
  yarnBrands,
  onSaveWebYarnResult,
  onCreate,
  onUpdate,
  onDelete,
}: {
  inventory: InventoryItem[]
  yarnBrands: YarnBrand[]
  onSaveWebYarnResult: (result: WebYarnResult) => void
  onCreate: (item: InventoryFormState) => void
  onUpdate: (id: string, item: InventoryFormState) => void
  onDelete: (id: string) => void
}) {
  const [form, setForm] = useState<InventoryFormState>(defaultInventoryForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [quantitySort, setQuantitySort] = useState<'asc' | 'desc'>('asc')
  const [selectedLibraryBrandId, setSelectedLibraryBrandId] = useState('')
  const [selectedLibraryLine, setSelectedLibraryLine] = useState('')
  const [selectedLibraryColorId, setSelectedLibraryColorId] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)

  const lowStockItems = inventory.filter((item) => item.quantity <= item.lowStockThreshold)
  const visibleInventory = inventory
    .filter((item) => {
      const query = searchTerm.trim().toLowerCase()
      if (!query) return true
      return (
        item.yarnColor.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query)
      )
    })
    .filter((item) => !lowStockOnly || item.quantity <= item.lowStockThreshold)
    .sort((first, second) =>
      quantitySort === 'asc' ? first.quantity - second.quantity : second.quantity - first.quantity,
    )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.yarnColor.trim() || !form.brand.trim() || !form.supplier.trim()) {
      setError('Yarn color, brand, and supplier are required.')
      return
    }

    if (editingId) {
      onUpdate(editingId, form)
    } else {
      onCreate(form)
    }

    setForm(defaultInventoryForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  function edit(item: InventoryItem) {
    const { id: _id, ...nextForm } = item
    setForm(nextForm)
    setEditingId(item.id)
    setError('')
    const matchedBrand = yarnBrands.find((brand) => brand.name === item.brand)
    const matchedColor = matchedBrand?.colors.find((color) => color.name === item.yarnColor)
    setSelectedLibraryBrandId(matchedBrand?.id ?? 'custom')
    setSelectedLibraryLine(matchedColor?.line ?? '')
    setSelectedLibraryColorId(matchedColor?.id ?? 'custom')
    setIsModalOpen(true)
  }

  function openCreateModal() {
    setForm(defaultInventoryForm)
    setEditingId(null)
    setError('')
    setSelectedLibraryBrandId('')
    setSelectedLibraryLine('')
    setSelectedLibraryColorId('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setForm(defaultInventoryForm)
    setEditingId(null)
    setError('')
    setSelectedLibraryBrandId('')
    setSelectedLibraryLine('')
    setSelectedLibraryColorId('')
    setIsModalOpen(false)
  }

  const selectedLibraryBrand = yarnBrands.find((brand) => brand.id === selectedLibraryBrandId)
  const selectedLineColors = selectedLibraryBrand?.colors.filter((color) => color.line === selectedLibraryLine) ?? []
  const selectedLibraryLines = [...new Set(selectedLibraryBrand?.colors.map((color) => color.line).filter(Boolean) ?? [])]

  function applyLibraryColor(colorId: string) {
    setSelectedLibraryColorId(colorId)
    if (colorId === 'custom') return
    const color = selectedLibraryBrand?.colors.find((entry) => entry.id === colorId)
    if (!selectedLibraryBrand || !color) return
    setForm((current) => ({
      ...current,
      brand: selectedLibraryBrand.name,
      yarnLine: color.line,
      yarnColor: color.name,
      colorCode: color.sku,
      upc: color.upc,
      colorFamily: color.family,
      hexColor: color.hexColor,
      supplier: color.store || current.supplier,
      notes: color.notes || current.notes,
    }))
  }

  function chooseLibraryBrand(brandId: string) {
    setSelectedLibraryBrandId(brandId)
    setSelectedLibraryLine('')
    setSelectedLibraryColorId('')
    if (brandId === 'custom') {
      setForm((current) => ({ ...current, brand: '', yarnLine: '', yarnColor: '', colorCode: '', upc: '', colorFamily: 'Multi', hexColor: '#ffffff' }))
      return
    }

    const brand = yarnBrands.find((entry) => entry.id === brandId)
    if (brand) {
      setForm((current) => ({ ...current, brand: brand.name, yarnLine: '', yarnColor: '', colorCode: '', upc: '', colorFamily: 'Multi', hexColor: '#ffffff' }))
    }
  }

  function handleBarcode(code: string) {
    const match = yarnBrands.flatMap((brand) => brand.colors.map((color) => ({ brand, color }))).find(({ color }) => color.upc === code)
    setForm((current) => ({ ...current, upc: code }))
    if (!match) {
      setScanMessage('No match found — add this yarn manually')
      return
    }
    setSelectedLibraryBrandId(match.brand.id)
    setSelectedLibraryLine(match.color.line)
    setSelectedLibraryColorId(match.color.id)
    setForm((current) => ({
      ...current,
      brand: match.brand.name,
      yarnLine: match.color.line,
      yarnColor: match.color.name,
      colorCode: match.color.sku,
      upc: match.color.upc,
      colorFamily: match.color.family,
      hexColor: match.color.hexColor,
      supplier: match.color.store || current.supplier,
      notes: match.color.notes || current.notes,
    }))
    setScanMessage('Yarn matched from barcode.')
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Low Stock">
        <div className="space-y-3">
          {lowStockItems.length === 0 ? (
            <EmptyState message="No low-stock yarn right now." />
          ) : (
            lowStockItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-pink-400/30 bg-pink-400/10 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{item.yarnColor}</p>
                    <p className="text-sm text-pink-100">{item.brand} · {item.quantity} cones left · reorder at {item.lowStockThreshold}</p>
                  </div>
                  <span className="rounded-full bg-pink-400/20 px-3 py-1 text-xs text-pink-100">Low stock</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/10 sm:p-5">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Find inventory</p>
          <h3 className="text-xl font-semibold text-white">Stock controls</h3>
        </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <input
          placeholder="Search yarn color, brand, or supplier"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setLowStockOnly((current) => !current)}
          className={`rounded-2xl px-4 py-2 text-sm transition ${
            lowStockOnly
              ? 'bg-white text-slate-950 shadow-[0_0_24px_rgba(244,114,182,0.25)]'
              : 'border border-white/10 text-slate-200 hover:bg-white/10'
          }`}
        >
          {lowStockOnly ? 'Low Stock Only' : 'All'}
        </button>
        <button
          type="button"
          onClick={() => setQuantitySort((current) => (current === 'asc' ? 'desc' : 'asc'))}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Quantity {quantitySort === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      </section>
      </section>
      <div className="sticky top-3 z-20 flex justify-end sm:static">
        <button onClick={openCreateModal} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.2)] transition hover:bg-teal-200">
          Add Inventory Item
        </button>
      </div>
      <Panel title="Inventory list">
        <div className="grid gap-4 xl:grid-cols-2">
          {inventory.length === 0 ? (
            <EmptyState message="No inventory items yet. Add yarn, glue, backing, or tools to begin tracking stock." />
          ) : visibleInventory.length === 0 ? (
            <EmptyState message="No inventory items match the current search or filter." />
          ) : visibleInventory.map((item) => {
            const low = item.quantity <= item.lowStockThreshold
            return (
              <div key={item.id} className={`overflow-hidden rounded-[1.75rem] border ${low ? 'border-pink-400/30 bg-pink-400/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="h-16 border-b border-white/10" style={{ background: `linear-gradient(135deg, ${item.hexColor}, #070814)` }} />
                <div className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{item.yarnColor}</p>
                    <p className="text-sm text-slate-400">{item.brand} · {item.quantity} cones · alert at {item.lowStockThreshold}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: item.hexColor }} />
                      <span>{item.colorFamily}{item.colorCode ? ` · ${item.colorCode}` : ''}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.supplier} · {currency(item.cost)} each</p>
                  </div>
                  {low && <span className="rounded-full bg-pink-400/20 px-3 py-1 text-xs text-pink-100">Low stock</span>}
                </div>
                <RowActions onEdit={() => edit(item)} onDelete={() => onDelete(item.id)} confirmMessage={`Delete ${item.yarnColor}?`} />
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
      <Modal title={editingId ? 'Edit Inventory Item' : 'Add Inventory Item'} open={isModalOpen} onClose={closeModal}>
        <form className="space-y-4" onSubmit={submit}>
          <WebYarnLookup onSave={onSaveWebYarnResult} compact />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yarn brand">
              <select value={selectedLibraryBrandId} onChange={(event) => chooseLibraryBrand(event.target.value)}>
                <option value="">Select a brand</option>
                {yarnBrands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                <option value="custom">Custom Brand</option>
              </select>
            </Field>
            <Field label="Yarn line">
              <select value={selectedLibraryLine} onChange={(event) => { setSelectedLibraryLine(event.target.value); setSelectedLibraryColorId('') }} disabled={!selectedLibraryBrandId || selectedLibraryBrandId === 'custom'}>
                <option value="">Select line</option>
                {selectedLibraryLines.map((line) => <option key={line}>{line}</option>)}
              </select>
            </Field>
            <Field label="Yarn color">
              <select value={selectedLibraryColorId} onChange={(event) => applyLibraryColor(event.target.value)} disabled={!selectedLibraryBrandId}>
                <option value="">Select color</option>
                {selectedLibraryBrand && selectedLibraryBrand.colors.length === 0 && <option value="" disabled>Add color to Yarn Library.</option>}
                {(selectedLibraryLine ? selectedLineColors : selectedLibraryBrand?.colors ?? []).map((color) => <option key={color.id} value={color.id}>{color.name}</option>)}
                {selectedLibraryBrandId && <option value="custom">Custom Color</option>}
              </select>
            </Field>
          </div>
          <p className="text-xs text-slate-400">
            Pick a saved brand/color to auto-fill the fields below, or leave the dropdowns blank and enter a custom brand manually.
          </p>
          {(selectedLibraryBrandId === 'custom' || selectedLibraryColorId === 'custom') && (
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedLibraryBrandId === 'custom' && (
                <Field label="Custom brand"><input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} /></Field>
              )}
              {selectedLibraryColorId === 'custom' && (
                <Field label="Custom color"><input value={form.yarnColor} onChange={(event) => setForm({ ...form, yarnColor: event.target.value })} /></Field>
              )}
            </div>
          )}
          <Field label="Yarn line/name"><input value={form.yarnLine} onChange={(event) => setForm({ ...form, yarnLine: event.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Color family">
              <select value={form.colorFamily} onChange={(event) => setForm({ ...form, colorFamily: event.target.value as ColorFamily })}>
                {colorFamilies.map((family) => <option key={family}>{family}</option>)}
              </select>
            </Field>
            <Field label="Hex preview"><input type="color" value={form.hexColor} onChange={(event) => setForm({ ...form, hexColor: event.target.value })} /></Field>
          </div>
          <Field label="Color code / SKU"><input value={form.colorCode} onChange={(event) => setForm({ ...form, colorCode: event.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Field label="UPC / barcode"><input value={form.upc} onChange={(event) => setForm({ ...form, upc: event.target.value })} /></Field>
            <div className="flex items-end"><button type="button" onClick={() => setScannerOpen(true)} className="rounded-2xl bg-purple-400/20 px-4 py-3 text-purple-100">Scan Barcode</button></div>
          </div>
          {scanMessage && <p className="text-sm text-teal-100">{scanMessage}</p>}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Quantity"><input type="number" min="0" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} /></Field>
            <Field label="Low stock number"><input type="number" min="0" value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: Number(event.target.value) })} /></Field>
            <Field label="Cost"><input type="number" min="0" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} /></Field>
          </div>
          <Field label="Supplier"><input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} /></Field>
          <Field label="Notes"><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          {error && <p className="rounded-2xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">{error}</p>}
          <ModalActions onCancel={closeModal} />
        </form>
      </Modal>
      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcode} />
      <FloatingActionButton label="Add inventory item" onClick={openCreateModal} />
    </div>
  )
}

function CustomersPage({
  customers,
  projects,
  setCustomers,
  onNotify,
}: {
  customers: Customer[]
  projects: Project[]
  setCustomers: Dispatch<SetStateAction<Customer[]>>
  onNotify: (message: string) => void
}) {
  const [form, setForm] = useState<CustomerFormState>(defaultCustomerForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  const visibleCustomers = customers.filter((customer) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.instagram.toLowerCase().includes(query)
    )
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || !form.dateAdded) {
      setError('Name and date added are required.')
      return
    }

    if (editingId) {
      setCustomers((current) => current.map((customer) => (customer.id === editingId ? { ...customer, ...form } : customer)))
      onNotify('Customer updated.')
    } else {
      setCustomers((current) => [{ id: crypto.randomUUID(), ...form }, ...current])
      onNotify('Customer saved.')
    }

    setForm(defaultCustomerForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  function edit(customer: Customer) {
    const { id: _id, ...nextForm } = customer
    setForm(nextForm)
    setEditingId(customer.id)
    setError('')
    setIsModalOpen(true)
  }

  function openCreateModal() {
    setForm({
      ...defaultCustomerForm,
      dateAdded: new Date().toISOString().slice(0, 10),
    })
    setEditingId(null)
    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setForm(defaultCustomerForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  function projectsForCustomer(customerName: string) {
    return projects.filter((project) => project.customer.trim().toLowerCase() === customerName.trim().toLowerCase())
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/10 sm:p-5">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Client book</p>
          <h3 className="text-xl font-semibold text-white">Customer directory</h3>
        </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          placeholder="Search customers"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button onClick={openCreateModal} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.2)] transition hover:bg-teal-200">
          Add Customer
        </button>
      </div>
      </section>
      <Panel title="Customer list">
        <div className="grid gap-3 lg:grid-cols-2">
          {customers.length === 0 ? (
            <EmptyState message="No customers yet. Add your first customer to keep contact details handy." />
          ) : visibleCustomers.length === 0 ? (
            <EmptyState message="No customers match the current search." />
          ) : (
            visibleCustomers.map((customer) => {
              const linkedProjects = projectsForCustomer(customer.name)
              return (
              <div key={customer.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-black/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{customer.name}</p>
                    <p className="text-sm text-slate-400">{customer.phone || 'No phone'} · {customer.email || 'No email'}</p>
                    <p className="mt-1 text-sm text-purple-100">{customer.instagram || 'No Instagram'}</p>
                  </div>
                  <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs text-teal-100">
                    {linkedProjects.length} project{linkedProjects.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">Added {customer.dateAdded || 'Unknown date'}</p>
                {customer.notes && <p className="mt-2 text-sm text-slate-300">{customer.notes}</p>}
                {linkedProjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {linkedProjects.map((project) => (
                      <span key={project.id} className="rounded-full bg-pink-400/15 px-3 py-1 text-xs text-pink-100">
                        {project.name}
                      </span>
                    ))}
                  </div>
                )}
                <RowActions
                  onEdit={() => edit(customer)}
                  onDelete={() => {
                    setCustomers((current) => current.filter((entry) => entry.id !== customer.id))
                    onNotify('Customer deleted.')
                  }}
                  confirmMessage={`Delete ${customer.name}?`}
                />
              </div>
            )})
          )}
        </div>
      </Panel>
      <Modal title={editingId ? 'Edit Customer' : 'Add Customer'} open={isModalOpen} onClose={closeModal}>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Date added"><input type="date" value={form.dateAdded} onChange={(event) => setForm({ ...form, dateAdded: event.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          </div>
          <Field label="Instagram"><input value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} /></Field>
          <Field label="Notes"><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          {error && <p className="rounded-2xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">{error}</p>}
          <ModalActions onCancel={closeModal} />
        </form>
      </Modal>
      <FloatingActionButton label="Add customer" onClick={openCreateModal} />
    </div>
  )
}

function ExpensesPage({
  expenses,
  setExpenses,
  onNotify,
}: {
  expenses: Expense[]
  setExpenses: Dispatch<SetStateAction<Expense[]>>
  onNotify: (message: string) => void
}) {
  const [form, setForm] = useState<ExpenseFormState>(defaultExpenseForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All')
  const [error, setError] = useState('')

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.cost, 0)
  const visibleExpenses = expenses.filter((expense) => {
    const query = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !query ||
      expense.itemName.toLowerCase().includes(query) ||
      expense.supplier.toLowerCase().includes(query) ||
      expense.notes.toLowerCase().includes(query)
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.itemName.trim() || !form.date || !form.supplier.trim()) {
      setError('Item name, date, and supplier are required.')
      return
    }

    if (editingId) {
      setExpenses((current) => current.map((expense) => (expense.id === editingId ? { ...expense, ...form } : expense)))
      onNotify('Expense updated.')
    } else {
      setExpenses((current) => [{ id: crypto.randomUUID(), ...form }, ...current])
      onNotify('Expense saved.')
    }

    setForm(defaultExpenseForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  function edit(expense: Expense) {
    const { id: _id, ...nextForm } = expense
    setForm(nextForm)
    setEditingId(expense.id)
    setError('')
    setIsModalOpen(true)
  }

  function openCreateModal() {
    setForm({
      ...defaultExpenseForm,
      date: new Date().toISOString().slice(0, 10),
    })
    setEditingId(null)
    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setForm(defaultExpenseForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-pink-300/20 bg-pink-300/[0.08] p-5 shadow-[0_0_28px_rgba(244,114,182,0.12)]">
        <p className="text-sm text-slate-400">Spending overview</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">Expenses</h3>
            <p className="mt-2 text-3xl font-semibold text-white">{currency(totalExpenses)}</p>
          </div>
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-pink-100">{expenses.length} entries</span>
        </div>
      </section>
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/10 sm:p-5">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Review costs</p>
          <h3 className="text-xl font-semibold text-white">Expense controls</h3>
        </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <input
          placeholder="Search expenses"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button onClick={openCreateModal} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.2)] transition hover:bg-teal-200">
          Add Expense
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['All', ...expenseCategories] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              selectedCategory === category
                ? 'bg-white text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.35)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      </section>
      <Panel title="Expense list">
        <div className="grid gap-3 lg:grid-cols-2">
          {expenses.length === 0 ? (
            <EmptyState message="No expenses yet. Add your first cost to start tracking profit." />
          ) : visibleExpenses.length === 0 ? (
            <EmptyState message="No expenses match the current search or filter." />
          ) : (
            visibleExpenses.map((expense) => (
              <div key={expense.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-black/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{expense.itemName}</p>
                    <p className="text-sm text-slate-400">{expense.category} · {expense.supplier}</p>
                    <p className="mt-1 text-xs text-slate-500">{expense.date}</p>
                  </div>
                  <span className="rounded-full bg-pink-400/15 px-3 py-1 text-xs text-pink-100">
                    {currency(expense.cost)}
                  </span>
                </div>
                {expense.notes && <p className="mt-3 text-sm text-slate-300">{expense.notes}</p>}
                <RowActions
                  onEdit={() => edit(expense)}
                  onDelete={() => {
                    setExpenses((current) => current.filter((entry) => entry.id !== expense.id))
                    onNotify('Expense deleted.')
                  }}
                  confirmMessage={`Delete ${expense.itemName}?`}
                />
              </div>
            ))
          )}
        </div>
      </Panel>
      <Modal title={editingId ? 'Edit Expense' : 'Add Expense'} open={isModalOpen} onClose={closeModal}>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Item name"><input value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} /></Field>
            <Field label="Category">
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })}>
                {expenseCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Cost"><input type="number" min="0" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} /></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
            <Field label="Supplier"><input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} /></Field>
          </div>
          <Field label="Notes"><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          {error && <p className="rounded-2xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">{error}</p>}
          <ModalActions onCancel={closeModal} />
        </form>
      </Modal>
      <FloatingActionButton label="Add expense" onClick={openCreateModal} />
    </div>
  )
}

function YarnLibraryPage({
  brands,
  setBrands,
  onNotify,
  onSaveWebYarnResult,
  onAddToInventory,
}: {
  brands: YarnBrand[]
  setBrands: Dispatch<SetStateAction<YarnBrand[]>>
  onNotify: (message: string) => void
  onSaveWebYarnResult: (result: WebYarnResult) => void
  onAddToInventory: (item: InventoryFormState) => void
}) {
  const [brandName, setBrandName] = useState('')
  const [brandSource, setBrandSource] = useState('')
  const [brandWebsite, setBrandWebsite] = useState('')
  const [brandNotes, setBrandNotes] = useState('')
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [brandFilter, setBrandFilter] = useState('All')
  const [familyFilter, setFamilyFilter] = useState<'All' | ColorFamily>('All')
  const [activeColorBrandId, setActiveColorBrandId] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMessage, setScanMessage] = useState('')
  const [colorForm, setColorForm] = useState<Omit<YarnColor, 'id'>>({
    name: '',
    line: '',
    sku: '',
    upc: '',
    family: 'Multi',
    hexColor: '#ffffff',
    weight: '',
    yardage: '',
    fiber: '',
    store: '',
    website: '',
    photo: '',
    inStockQuantity: 0,
    reorderLevel: 0,
    notes: '',
  })

  const visibleBrands = brands.filter((brand) => brandFilter === 'All' || brand.name === brandFilter)
  const visibleColors = visibleBrands.flatMap((brand) =>
    brand.colors
      .filter((color) => {
        const query = searchTerm.trim().toLowerCase()
        const matchesSearch =
          !query ||
          brand.name.toLowerCase().includes(query) ||
          color.name.toLowerCase().includes(query) ||
          color.family.toLowerCase().includes(query) ||
          color.sku.toLowerCase().includes(query)
        const matchesFamily = familyFilter === 'All' || color.family === familyFilter
        return matchesSearch && matchesFamily
      })
      .map((color) => ({ brand, color })),
  )

  function saveBrand() {
    if (!brandName.trim()) return
    if (editingBrandId) {
      setBrands((current) =>
        current.map((brand) =>
          brand.id === editingBrandId
            ? { ...brand, name: brandName, source: brandSource, website: brandWebsite, notes: brandNotes }
            : brand,
        ),
      )
      onNotify('Yarn brand updated.')
    } else {
      setBrands((current) => [
        ...current,
        { id: crypto.randomUUID(), name: brandName, source: brandSource, website: brandWebsite, notes: brandNotes, colors: [] },
      ])
      onNotify('Yarn brand saved.')
    }
    setBrandName('')
    setBrandSource('')
    setBrandWebsite('')
    setBrandNotes('')
    setEditingBrandId(null)
  }

  function editBrand(brand: YarnBrand) {
    setEditingBrandId(brand.id)
    setBrandName(brand.name)
    setBrandSource(brand.source)
    setBrandWebsite(brand.website)
    setBrandNotes(brand.notes)
  }

  function deleteBrand(id: string) {
    setBrands((current) => current.filter((brand) => brand.id !== id))
    onNotify('Yarn brand deleted.')
  }

  function saveColor(brandId: string) {
    if (!colorForm.name.trim()) return
    setBrands((current) =>
      current.map((brand) =>
        brand.id === brandId ? { ...brand, colors: [...brand.colors, { id: crypto.randomUUID(), ...colorForm }] } : brand,
      ),
    )
    setColorForm({ name: '', line: '', sku: '', upc: '', family: 'Multi', hexColor: '#ffffff', weight: '', yardage: '', fiber: '', store: '', website: '', photo: '', inStockQuantity: 0, reorderLevel: 0, notes: '' })
    setActiveColorBrandId(null)
    onNotify('Yarn color saved.')
  }

  function downloadYarnCsv(filename: string, rows: string[][]) {
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function exportYarnCsv() {
    downloadYarnCsv('tufttrack-yarn-library.csv', [
      ['brand', 'line', 'colorName', 'colorCode', 'upc', 'colorFamily', 'hex', 'weight', 'yardage', 'fiber', 'store', 'website', 'notes'],
      ...brands.flatMap((brand) => brand.colors.map((color) => [brand.name, color.line, color.name, color.sku, color.upc, color.family, color.hexColor, color.weight, color.yardage, color.fiber, color.store, color.website, color.notes])),
    ])
  }

  function downloadTemplate() {
    downloadYarnCsv('tufttrack-yarn-template.csv', [
      ['brand', 'line', 'colorName', 'colorCode', 'upc', 'colorFamily', 'hex', 'weight', 'yardage', 'fiber', 'store', 'website', 'notes'],
      ['Lion Brand', 'Basic Stitch', 'Aqua', '123', '000000000000', 'Blue', '#22d3ee', '4', '185 yd', '100% acrylic', 'Lion Brand', 'https://example.com', 'Sample row'],
    ])
  }

  async function importYarnCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean)
    const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '')))
    setBrands((current) => {
      const next = [...current]
      rows.forEach(([brandName, line, colorName, colorCode, upc, colorFamily, hex, weight, yardage, fiber, store, website, notes]) => {
        let brand = next.find((entry) => entry.name === brandName)
        if (!brand) {
          brand = { id: crypto.randomUUID(), name: brandName, source: store, website, notes: '', colors: [] }
          next.push(brand)
        }
        brand.colors.push({ id: crypto.randomUUID(), name: colorName, line, sku: colorCode, upc, family: (colorFamily as ColorFamily) || 'Multi', hexColor: hex || '#ffffff', weight, yardage, fiber, store, website, photo: '', inStockQuantity: 0, reorderLevel: 0, notes })
      })
      return [...next]
    })
    onNotify('Yarn CSV imported.')
    event.target.value = ''
  }

  function handleBarcode(code: string) {
    const match = brands.flatMap((brand) => brand.colors.map((color) => ({ brand, color }))).find(({ color }) => color.upc === code)
    setColorForm((current) => ({ ...current, upc: code }))
    if (!match) {
      setScanMessage('No match found — add this yarn manually')
      return
    }
    setActiveColorBrandId(match.brand.id)
    const { id: _id, ...matchedColorForm } = match.color
    setColorForm(({ photo, inStockQuantity }) => ({
      ...matchedColorForm,
      photo,
      inStockQuantity,
    }))
    setScanMessage(`Match found: ${match.brand.name} ${match.color.name}`)
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <WebYarnLookup onSave={onSaveWebYarnResult} />

      <Panel title={editingBrandId ? 'Edit yarn brand' : 'Add yarn brand'}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Brand name"><input value={brandName} onChange={(event) => setBrandName(event.target.value)} /></Field>
          <Field label="Store/source"><input value={brandSource} onChange={(event) => setBrandSource(event.target.value)} /></Field>
          <Field label="Website"><input value={brandWebsite} onChange={(event) => setBrandWebsite(event.target.value)} /></Field>
          <Field label="Notes"><input value={brandNotes} onChange={(event) => setBrandNotes(event.target.value)} /></Field>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={saveBrand} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950">Save brand</button>
          {editingBrandId && <button onClick={() => setEditingBrandId(null)} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200">Cancel</button>}
        </div>
      </Panel>
      </section>
      <Panel title="Yarn data tools">
        <div className="flex flex-wrap gap-3">
          <label className="cursor-pointer rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950">
            Import CSV
            <input className="hidden" type="file" accept=".csv,text/csv" onChange={importYarnCsv} />
          </label>
          <button onClick={exportYarnCsv} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200">Export yarn library CSV</button>
          <button onClick={downloadTemplate} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200">Download CSV template</button>
          <button onClick={() => setScannerOpen(true)} className="rounded-2xl bg-purple-400/20 px-4 py-3 text-purple-100">Scan Barcode</button>
        </div>
        {scanMessage && <p className="mt-3 text-sm text-teal-100">{scanMessage}</p>}
      </Panel>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/10 sm:p-5">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Browse library</p>
          <h3 className="text-xl font-semibold text-white">Filter the palette</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
        <input placeholder="Search yarn colors" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
          <option>All</option>
          {brands.map((brand) => <option key={brand.id}>{brand.name}</option>)}
        </select>
        <select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value as 'All' | ColorFamily)}>
          <option>All</option>
          {colorFamilies.map((family) => <option key={family}>{family}</option>)}
        </select>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleBrands.map((brand) => (
          <Panel key={brand.id} title={brand.name}>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="text-sm text-slate-300">
                  <p>{brand.source || 'No source listed'}</p>
                  <p>{brand.website || 'No website listed'}</p>
                  {brand.notes && <p className="mt-2 text-slate-400">{brand.notes}</p>}
                </div>
                <span className="w-fit rounded-full border border-teal-300/15 bg-teal-300/[0.08] px-3 py-1 text-xs text-teal-100">
                  {brand.colors.length} colors
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => editBrand(brand)} className="rounded-full bg-purple-400/15 px-4 py-2 text-sm text-purple-100">Edit</button>
                <button onClick={() => deleteBrand(brand.id)} className="rounded-full bg-pink-400/15 px-4 py-2 text-sm text-pink-100">Delete</button>
                <button onClick={() => setActiveColorBrandId(brand.id)} className="rounded-full bg-teal-400/15 px-4 py-2 text-sm text-teal-100">Add color</button>
              </div>
              {activeColorBrandId === brand.id && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Color name"><input value={colorForm.name} onChange={(event) => setColorForm({ ...colorForm, name: event.target.value })} /></Field>
                    <Field label="Yarn line/name"><input value={colorForm.line} onChange={(event) => setColorForm({ ...colorForm, line: event.target.value })} /></Field>
                    <Field label="Color code/SKU"><input value={colorForm.sku} onChange={(event) => setColorForm({ ...colorForm, sku: event.target.value })} /></Field>
                    <Field label="UPC / barcode"><input value={colorForm.upc} onChange={(event) => setColorForm({ ...colorForm, upc: event.target.value })} /></Field>
                    <Field label="Color family">
                      <select value={colorForm.family} onChange={(event) => setColorForm({ ...colorForm, family: event.target.value as ColorFamily })}>
                        {colorFamilies.map((family) => <option key={family}>{family}</option>)}
                      </select>
                    </Field>
                    <Field label="Hex color preview"><input type="color" value={colorForm.hexColor} onChange={(event) => setColorForm({ ...colorForm, hexColor: event.target.value })} /></Field>
                    <Field label="Weight/category"><input value={colorForm.weight} onChange={(event) => setColorForm({ ...colorForm, weight: event.target.value })} /></Field>
                    <Field label="Yardage"><input value={colorForm.yardage} onChange={(event) => setColorForm({ ...colorForm, yardage: event.target.value })} /></Field>
                    <Field label="Fiber content"><input value={colorForm.fiber} onChange={(event) => setColorForm({ ...colorForm, fiber: event.target.value })} /></Field>
                    <Field label="Store/source"><input value={colorForm.store} onChange={(event) => setColorForm({ ...colorForm, store: event.target.value })} /></Field>
                    <Field label="Website"><input value={colorForm.website} onChange={(event) => setColorForm({ ...colorForm, website: event.target.value })} /></Field>
                    <Field label="Reorder level"><input type="number" value={colorForm.reorderLevel} onChange={(event) => setColorForm({ ...colorForm, reorderLevel: Number(event.target.value) })} /></Field>
                    <Field label="In stock quantity"><input type="number" value={colorForm.inStockQuantity} onChange={(event) => setColorForm({ ...colorForm, inStockQuantity: Number(event.target.value) })} /></Field>
                    <Field label="Photo upload placeholder"><input placeholder="Photo upload later" disabled /></Field>
                  </div>
                  <Field label="Notes"><textarea rows={3} value={colorForm.notes} onChange={(event) => setColorForm({ ...colorForm, notes: event.target.value })} /></Field>
                  <button onClick={() => saveColor(brand.id)} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950">Save color</button>
                </div>
              )}
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Color palette">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleColors.length === 0 ? (
            <EmptyState message="No yarn colors match the current filters." />
          ) : visibleColors.map(({ brand, color }) => (
            <div key={color.id} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
              <div className="h-20 border-b border-white/10" style={{ background: `linear-gradient(135deg, ${color.hexColor}, #070814)` }} />
              <div className="p-4">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full border border-white/20 shadow-[0_0_18px_rgba(255,255,255,0.12)]" style={{ backgroundColor: color.hexColor }} />
                <div>
                  <p className="font-medium text-white">{color.name}</p>
                  <p className="text-sm text-slate-400">{brand.name} · {color.family}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">SKU {color.sku || '—'} · In stock {color.inStockQuantity}</p>
              <p className="mt-1 text-xs text-slate-500">{color.line || 'No line'} · UPC {color.upc || '—'} · {color.weight || 'No weight'} · {color.yardage || 'No yardage'} · {color.fiber || 'No fiber'} · Reorder {color.reorderLevel}</p>
              {color.notes && <p className="mt-2 text-sm text-slate-300">{color.notes}</p>}
              <button
                type="button"
                onClick={() => {
                  onAddToInventory({
                    yarnColor: color.name,
                    brand: brand.name,
                    yarnLine: color.line,
                    colorCode: color.sku,
                    upc: color.upc,
                    colorFamily: color.family,
                    hexColor: color.hexColor,
                    quantity: color.inStockQuantity,
                    lowStockThreshold: color.reorderLevel,
                    cost: 0,
                    supplier: color.store,
                    notes: color.notes,
                  })
                }}
                className="mt-4 rounded-2xl bg-teal-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-200"
              >
                Add to Inventory
              </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcode} />
    </div>
  )
}

function WebYarnLookup({ onSave, compact = false }: { onSave: (result: WebYarnResult) => void; compact?: boolean }) {
  const [brand, setBrand] = useState(starterYarnBrandNames[0])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WebYarnResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState('')

  async function searchWeb() {
    setIsSearching(true)
    setMessage('')
    try {
      const response = await fetch(`/api/yarn-search?brand=${encodeURIComponent(brand)}&query=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = (await response.json()) as { results: WebYarnResult[] }
      setResults(data.results)
      setMessage(data.results.length === 0 ? 'No yarn database matches found yet.' : '')
    } catch {
      setResults([])
      setMessage('Web lookup is unavailable right now.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Panel title="Yarn Database Lookup">
      <div className="space-y-4">
        <div className={`grid gap-3 ${compact ? 'md:grid-cols-[1fr_1fr_auto]' : 'md:grid-cols-[1fr_1fr_auto]'}`}>
          <Field label="Brand">
            <select value={brand} onChange={(event) => setBrand(event.target.value)}>
              {starterYarnBrandNames.map((name) => <option key={name}>{name}</option>)}
            </select>
          </Field>
          <Field label="Search brand/color">
            <input
              placeholder="Try teal, pink, 512..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={searchWeb}
              disabled={isSearching}
              className="w-full rounded-2xl bg-pink-300 px-4 py-3 font-medium text-slate-950 transition hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSearching ? 'Searching...' : 'Search Database'}
            </button>
          </div>
        </div>

        {message && <EmptyState message={message} />}

        {results.length > 0 && (
          <div className="grid gap-3">
            {results.map((result) => (
              <div
                key={`${result.brand}-${result.colorName}-${result.sku}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-8 w-8 shrink-0 rounded-full border border-white/20"
                      style={{ backgroundColor: result.hexColor }}
                    />
                    <div>
                      <p className="font-medium text-white">{result.colorName}</p>
                      <p className="text-sm text-slate-300">{result.brand}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {result.line ? `${result.line} · ` : ''}
                        {result.sku ? `SKU ${result.sku} · ` : ''}
                        {result.upc ? `UPC ${result.upc} · ` : ''}
                        {result.family} · {result.weight || 'No weight'} · {result.fiber || 'No fiber'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSave(result)}
                    className="rounded-2xl bg-teal-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-teal-200"
                  >
                    Save to Yarn Library
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  )
}

function SettingsPage({
  projects,
  inventory,
  customers,
  expenses,
  onImport,
}: {
  projects: Project[]
  inventory: InventoryItem[]
  customers: Customer[]
  expenses: Expense[]
  onImport: (data: {
    projects: Project[]
    inventory: InventoryItem[]
    customers: Customer[]
    expenses: Expense[]
  }) => void
}) {
  const [pendingImport, setPendingImport] = useState<{
    projects: Project[]
    inventory: InventoryItem[]
    customers: Customer[]
    expenses: Expense[]
  } | null>(null)
  const [message, setMessage] = useState('')

  function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function escapeCsv(value: string | number) {
    const stringValue = String(value ?? '')
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  function exportJson() {
    downloadFile(
      'tufttrack-backup.json',
      JSON.stringify({ projects, inventory, customers, expenses }, null, 2),
      'application/json',
    )
  }

  function exportCsv<T extends object>(filename: string, rows: T[]) {
    const headers = rows.length > 0 ? Object.keys(rows[0]) : []
    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) =>
        headers.map((header) => escapeCsv((row as Record<string, string | number>)[header] ?? '')).join(','),
      ),
    ].join('\n')
    downloadFile(filename, csv, 'text/csv;charset=utf-8')
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const parsed = JSON.parse(await file.text()) as Partial<{
        projects: Project[]
        inventory: InventoryItem[]
        customers: Customer[]
        expenses: Expense[]
      }>

      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.inventory) || !Array.isArray(parsed.customers) || !Array.isArray(parsed.expenses)) {
        setMessage('Import failed. The JSON file is missing one or more required data collections.')
        return
      }

      setPendingImport({
        projects: parsed.projects,
        inventory: parsed.inventory,
        customers: parsed.customers,
        expenses: parsed.expenses,
      })
      setMessage('')
    } catch {
      setMessage('Import failed. Please choose a valid backup JSON file.')
    } finally {
      event.target.value = ''
    }
  }

  function confirmImport() {
    if (!pendingImport) return
    onImport(pendingImport)
    setPendingImport(null)
    setMessage('Backup imported successfully.')
  }

  return (
    <div className="space-y-6">
      <Panel title="Brand">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <p className="max-w-md text-sm text-slate-400">
            TuftTrack keeps the same dark neon look while carrying the Hyper J Ruggs name as the studio behind the app.
          </p>
        </div>
      </Panel>

      <Panel title="Backup & Export">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <button onClick={exportJson} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 transition hover:bg-teal-200">
              Export all data as JSON
            </button>
            <button onClick={() => exportCsv('projects.csv', projects)} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:bg-white/10">
              Export projects CSV
            </button>
            <button onClick={() => exportCsv('inventory.csv', inventory)} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:bg-white/10">
              Export inventory CSV
            </button>
            <button onClick={() => exportCsv('customers.csv', customers)} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:bg-white/10">
              Export customers CSV
            </button>
            <button onClick={() => exportCsv('expenses.csv', expenses)} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:bg-white/10">
              Export expenses CSV
            </button>
            <label className="cursor-pointer rounded-2xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 text-center text-pink-100 transition hover:bg-pink-400/15">
              Import backup JSON
              <input className="hidden" type="file" accept="application/json" onChange={handleImport} />
            </label>
          </div>
          {message && <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">{message}</p>}
        </div>
      </Panel>

      {pendingImport && (
        <section className="rounded-3xl border border-pink-400/30 bg-pink-400/10 p-5">
          <p className="text-lg font-semibold text-white">Replace current data?</p>
          <p className="mt-2 text-sm text-pink-100">
            Importing this backup will replace your current projects, inventory, customers, and expenses.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setPendingImport(null)}
              className="rounded-2xl border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmImport}
              className="rounded-2xl bg-pink-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-pink-200"
            >
              Replace current data
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function ProjectDetailPage({
  project,
  customers,
  onBack,
  onUpdate,
}: {
  project: Project
  customers: Customer[]
  onBack: () => void
  onUpdate: (id: string, project: ProjectFormState) => void
}) {
  const [form, setForm] = useState<ProjectFormState>({
    name: project.name,
    customer: project.customer,
    size: project.size,
    status: project.status,
    price: project.price,
    depositPaid: project.depositPaid,
    dueDate: project.dueDate,
    notes: project.notes,
    photos: project.photos,
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [error, setError] = useState('')
  const linkedCustomer =
    customers.find((customer) => customer.name.trim().toLowerCase() === project.customer.trim().toLowerCase()) ?? null
  const projectExpenses: Expense[] = []

  useEffect(() => {
    setForm({
      name: project.name,
      customer: project.customer,
      size: project.size,
      status: project.status,
      price: project.price,
      depositPaid: project.depositPaid,
      dueDate: project.dueDate,
      notes: project.notes,
      photos: project.photos,
    })
  }, [project])

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || !form.customer.trim() || !form.size.trim() || !form.dueDate) {
      setError('Project name, customer name, size, and due date are required.')
      return
    }

    onUpdate(project.id, form)
    setError('')
    setIsEditOpen(false)
  }

  function markFinished() {
    onUpdate(project.id, { ...form, status: 'Finished' })
    setForm((current) => ({ ...current, status: 'Finished' }))
  }

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(file)
          }),
      ),
    ).then((newPhotos) => {
      const nextForm = { ...form, photos: [...form.photos, ...newPhotos] }
      setForm(nextForm)
      onUpdate(project.id, nextForm)
    })
  }

  function removePhoto(photo: string) {
    const nextForm = { ...form, photos: form.photos.filter((entry) => entry !== photo) }
    setForm(nextForm)
    onUpdate(project.id, nextForm)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-fit rounded-2xl border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/10"
        >
          Back to Projects
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="rounded-2xl bg-purple-400/20 px-4 py-2 text-purple-100 transition hover:bg-purple-400/30"
          >
            Edit Project
          </button>
          <button
            type="button"
            onClick={markFinished}
            disabled={project.status === 'Finished'}
            className="rounded-2xl bg-teal-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark as Finished
          </button>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-400">Project</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">{project.name}</h3>
            <p className="mt-2 text-slate-300">{project.customer}</p>
          </div>
          <StatusPill status={project.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStat label="Size" value={project.size || '—'} />
          <DetailStat label="Price" value={currency(project.price)} />
          <DetailStat label="Deposit paid" value={currency(project.depositPaid)} />
          <DetailStat label="Balance remaining" value={currency(remainingBalance(project))} />
        </div>
        <ProjectProgress status={project.status} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Project details">
          <div className="space-y-4 text-sm">
            <DetailRow label="Due date" value={project.dueDate || 'TBD'} />
            <DetailRow label="Status" value={project.status} />
            <DetailRow label="Notes" value={project.notes || 'No notes added.'} />
          </div>
        </Panel>
        <Panel title="Linked customer info">
          {linkedCustomer ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Name" value={linkedCustomer.name} />
              <DetailRow label="Phone" value={linkedCustomer.phone || '—'} />
              <DetailRow label="Email" value={linkedCustomer.email || '—'} />
              <DetailRow label="Instagram" value={linkedCustomer.instagram || '—'} />
            </div>
          ) : (
            <EmptyState message="No linked customer record found for this project name." />
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Project expenses">
          {projectExpenses.length === 0 ? (
            <EmptyState message="No linked expenses yet. Project-specific expense linking can be added next." />
          ) : (
            <div />
          )}
        </Panel>
        <Panel title="Photos">
          <div className="space-y-4">
            <label className="block cursor-pointer rounded-2xl border border-dashed border-teal-300/30 bg-teal-300/[0.06] p-4 text-center text-sm text-teal-100 transition hover:bg-teal-300/[0.1]">
              Upload project photos
              <input className="hidden" type="file" accept="image/*" multiple onChange={addPhotos} />
            </label>
            {form.photos.length === 0 ? (
              <EmptyState message="No photos yet. Upload progress shots or finished-rug photos here." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.photos.map((photo) => (
                  <div key={photo} className="group relative overflow-hidden rounded-2xl border border-white/10">
                    <img src={photo} alt="Project preview" className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </section>

      <Modal title="Edit Project" open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <form className="space-y-4" onSubmit={saveEdit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Customer name"><input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Size"><input value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}>
                {projectStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price"><input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></Field>
            <Field label="Deposit paid"><input type="number" min="0" value={form.depositPaid} onChange={(event) => setForm({ ...form, depositPaid: Number(event.target.value) })} /></Field>
            <Field label="Due date"><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></Field>
          </div>
          <Field label="Notes"><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          {error && <p className="rounded-2xl border border-pink-400/25 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">{error}</p>}
          <ModalActions onCancel={() => setIsEditOpen(false)} />
        </form>
      </Modal>
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function ProjectProgress({ status }: { status: ProjectStatus }) {
  const currentIndex = projectStatuses.indexOf(status)

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Workflow progress</p>
        <p className="text-xs text-teal-100">Step {currentIndex + 1} of {projectStatuses.length}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {projectStatuses.map((step, index) => {
          const complete = index <= currentIndex
          return (
            <div
              key={step}
              className={`rounded-2xl border px-3 py-2 text-xs ${
                complete
                  ? `${statusStyle(step)} shadow-[0_0_18px_rgba(45,212,191,0.08)]`
                  : 'border-white/10 bg-white/[0.03] text-slate-500'
              }`}
            >
              {step}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/10 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 sm:p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactElement }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  )
}

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0d1020] p-4 shadow-[0_0_60px_rgba(45,212,191,0.18)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300">by Hyper J Ruggs</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border border-white/10 px-4 py-2 text-slate-300 transition hover:bg-white/10"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="rounded-2xl bg-teal-300 px-4 py-2 font-medium text-slate-950 transition hover:bg-teal-200"
      >
        Save
      </button>
    </div>
  )
}

function BarcodeScanner({ open, onClose, onScan }: { open: boolean; onClose: () => void; onScan: (code: string) => void }) {
  const [scanner, setScanner] = useState<{ stop: () => Promise<void> } | null>(null)
  const [message, setMessage] = useState('Camera permission is required to scan UPC barcodes.')
  const scannerId = 'tufttrack-barcode-scanner'

  async function startScan() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const nextScanner = new Html5Qrcode(scannerId)
      setScanner(nextScanner)
      await nextScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 160 } },
        async (decodedText) => {
          onScan(decodedText)
          setMessage(`Scanned ${decodedText}`)
          await nextScanner.stop()
          setScanner(null)
        },
        () => {},
      )
      setMessage('Point the camera at a UPC barcode.')
    } catch {
      setMessage('Unable to start camera. Check permission and use HTTPS on mobile.')
    }
  }

  async function stopScan() {
    if (!scanner) return
    await scanner.stop()
    setScanner(null)
    setMessage('Scan stopped.')
  }

  async function close() {
    if (scanner) await scanner.stop()
    setScanner(null)
    onClose()
  }

  if (!open) return null

  return (
    <Modal title="Scan Barcode" open={open} onClose={() => void close()}>
      <div className="space-y-4">
        <div id={scannerId} className="overflow-hidden rounded-2xl border border-white/10 bg-black" />
        <p className="text-sm text-slate-300">{message}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void startScan()} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950">Start Scan</button>
          <button type="button" onClick={() => void stopScan()} className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200">Stop Scan</button>
        </div>
      </div>
    </Modal>
  )
}

function FloatingActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-teal-300 text-3xl font-light text-slate-950 shadow-[0_0_28px_rgba(45,212,191,0.35)] transition hover:bg-teal-200 sm:hidden"
    >
      +
    </button>
  )
}

function RowActions({
  onEdit,
  onDelete,
  extraAction,
  confirmMessage = 'Delete this item?',
}: {
  onEdit: () => void
  onDelete: () => void
  extraAction?: ReactNode
  confirmMessage?: string
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {extraAction}
      <button onClick={onEdit} className="rounded-full bg-purple-400/15 px-4 py-2 text-sm text-purple-100 hover:bg-purple-400/25">Edit</button>
      <button
        onClick={() => {
          if (window.confirm(confirmMessage)) onDelete()
        }}
        className="rounded-full bg-pink-400/15 px-4 py-2 text-sm text-pink-100 hover:bg-pink-400/25"
      >
        Delete
      </button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-sm text-slate-400">
      {message}
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full border border-teal-300/20 bg-[#0d1020]/95 px-4 py-3 text-sm text-teal-100 shadow-[0_0_28px_rgba(45,212,191,0.18)] backdrop-blur">
      {message}
    </div>
  )
}

function statusStyle(status: ProjectStatus) {
  const styles: Record<ProjectStatus, string> = {
    Quote: 'border-slate-300/20 bg-slate-400/15 text-slate-200',
    Approved: 'border-blue-300/20 bg-blue-400/15 text-blue-100',
    Designing: 'border-purple-300/20 bg-purple-400/15 text-purple-100',
    Tracing: 'border-cyan-300/20 bg-cyan-400/15 text-cyan-100',
    Tufting: 'border-teal-300/20 bg-teal-400/15 text-teal-100',
    Gluing: 'border-orange-300/20 bg-orange-400/15 text-orange-100',
    Trimming: 'border-yellow-300/20 bg-yellow-400/15 text-yellow-100',
    Carving: 'border-pink-300/20 bg-pink-400/15 text-pink-100',
    Backing: 'border-indigo-300/20 bg-indigo-400/15 text-indigo-100',
    Finished: 'border-green-300/20 bg-green-400/15 text-green-100',
    'Picked Up': 'border-emerald-300/20 bg-emerald-400/15 text-emerald-100',
    Delivered: 'border-lime-300/20 bg-lime-400/15 text-lime-100',
  }

  return styles[status]
}

function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusStyle(status)}`}>{status}</span>
}

export default App



