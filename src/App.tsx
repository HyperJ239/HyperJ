import { useEffect, useState } from 'react'
import type { ChangeEvent, Dispatch, FormEvent, ReactElement, ReactNode, SetStateAction } from 'react'

type ProjectStatus = 'Quote' | 'Approved' | 'Tufting' | 'Gluing' | 'Finished' | 'Picked Up'

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
}

type InventoryItem = {
  id: string
  yarnColor: string
  brand: string
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

type Page = 'dashboard' | 'projects' | 'inventory' | 'customers' | 'expenses' | 'settings'

type ProjectFormState = Omit<Project, 'id'>
type InventoryFormState = Omit<InventoryItem, 'id'>
type CustomerFormState = Omit<Customer, 'id'>
type ExpenseFormState = Omit<Expense, 'id'>
type Accent = 'teal' | 'purple' | 'pink'

const projectStatuses: ProjectStatus[] = ['Quote', 'Approved', 'Tufting', 'Gluing', 'Finished', 'Picked Up']
const expenseCategories: ExpenseCategory[] = ['Yarn', 'Glue', 'Backing', 'Tools', 'Shipping', 'Booth/Event Fee', 'Other']

const sampleProjects: Project[] = [
  { id: 'p1', name: 'Galaxy Logo Rug', customer: 'Maya Chen', size: '3 ft x 4 ft', status: 'Tufting', price: 420, depositPaid: 150, dueDate: '2026-05-24', notes: 'Match brand colors closely.' },
  { id: 'p2', name: 'Barbershop Entry Rug', customer: 'Jalen Brooks', size: '4 ft x 6 ft', status: 'Approved', price: 560, depositPaid: 280, dueDate: '2026-05-30', notes: 'Durable backing for storefront traffic.' },
  { id: 'p3', name: 'Pink Flame Rug', customer: 'Sasha Lee', size: '2 ft x 3 ft', status: 'Finished', price: 310, depositPaid: 310, dueDate: '2026-05-18', notes: 'Ready for pickup.' },
]

const sampleInventory: InventoryItem[] = [
  { id: 'i1', yarnColor: 'Black', brand: 'TuftingCo', quantity: 8, lowStockThreshold: 6, cost: 14, supplier: 'Rug Supply Hub', notes: 'Primary outline color.' },
  { id: 'i2', yarnColor: 'Teal', brand: 'TuftingCo', quantity: 4, lowStockThreshold: 6, cost: 15, supplier: 'Rug Supply Hub', notes: 'Signature accent color.' },
  { id: 'i3', yarnColor: 'Hot Pink', brand: 'WoolWorks', quantity: 10, lowStockThreshold: 5, cost: 16, supplier: 'Color Loom', notes: 'Used for flame designs.' },
  { id: 'i4', yarnColor: 'Purple', brand: 'WoolWorks', quantity: 3, lowStockThreshold: 4, cost: 16, supplier: 'Color Loom', notes: 'Reorder soon.' },
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

const defaultProjectForm: ProjectFormState = {
  name: '',
  customer: '',
  size: '',
  status: 'Quote',
  price: 0,
  depositPaid: 0,
  dueDate: '',
  notes: '',
}

const defaultInventoryForm: InventoryFormState = {
  yarnColor: '',
  brand: '',
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
    }

    return {
      ...project,
      size: legacyProject.size ?? '',
      depositPaid: legacyProject.depositPaid ?? 0,
      notes: legacyProject.notes ?? '',
    }
  })
}

function normalizeInventory(items: InventoryItem[]) {
  return items.map((item) => {
    const legacyItem = item as InventoryItem & { name?: string }
    return {
      yarnColor: legacyItem.yarnColor ?? legacyItem.name ?? '',
      brand: legacyItem.brand ?? '',
      quantity: legacyItem.quantity ?? 0,
      lowStockThreshold: legacyItem.lowStockThreshold ?? 0,
      cost: legacyItem.cost ?? 0,
      supplier: legacyItem.supplier ?? '',
      notes: legacyItem.notes ?? '',
      id: legacyItem.id,
    }
  })
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

  function createProject(project: ProjectFormState) {
    setProjects((current) => [{ id: crypto.randomUUID(), ...project }, ...current])
  }

  function updateProject(id: string, project: ProjectFormState) {
    setProjects((current) => current.map((item) => (item.id === id ? { ...item, ...project } : item)))
  }

  function deleteProject(id: string) {
    setProjects((current) => current.filter((item) => item.id !== id))
    setSelectedProjectId((current) => (current === id ? null : current))
  }

  function createInventoryItem(item: InventoryFormState) {
    setInventory((current) => [{ id: crypto.randomUUID(), ...item }, ...current])
  }

  function updateInventoryItem(id: string, item: InventoryFormState) {
    setInventory((current) => current.map((entry) => (entry.id === id ? { ...entry, ...item } : entry)))
  }

  function deleteInventoryItem(id: string) {
    setInventory((current) => current.filter((entry) => entry.id !== id))
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
  const activeProjects = projects.filter((project) => project.status !== 'Picked Up')
  const finishedProjects = projects.filter((project) => project.status === 'Finished').length
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
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <Sidebar page={page} onChange={setPage} lowStockCount={lowStockItems.length} />
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:py-8">
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
              onCreate={createInventoryItem}
              onUpdate={updateInventoryItem}
              onDelete={deleteInventoryItem}
            />
          )}
          {page === 'customers' && <CustomersPage customers={customers} projects={projects} setCustomers={setCustomers} />}
          {page === 'expenses' && <ExpensesPage expenses={expenses} setExpenses={setExpenses} />}
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
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <>
    <aside className="border-b border-white/10 bg-white/[0.03] p-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Hyper J Ruggs</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Tracker</h1>
      </div>
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
      <div className="mt-5 rounded-3xl border border-pink-400/20 bg-pink-400/10 p-4">
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
    dashboard: 'Business overview',
    projects: 'Projects',
    inventory: 'Inventory',
    customers: 'Customers',
    expenses: 'Expenses',
    settings: 'Settings',
  }

  return (
    <header className="mb-6 flex flex-col gap-2">
      <p className="text-sm text-slate-400">Hyper J Ruggs Tracker</p>
      <h2 className="text-3xl font-semibold tracking-tight text-white">{titles[page]}</h2>
    </header>
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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-3xl border p-5 shadow-2xl shadow-black/20 ${accentStyles[stat.accent]}`}>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Panel title="Recent projects">
          <div className="space-y-3">
            {latestProjects.length === 0 ? (
              <EmptyState message="No projects yet. Add your first rug project to start tracking work." />
            ) : (
              latestProjects.map((project) => (
                <div key={project.id} className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
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
    if (!project.dueDate || project.status === 'Finished' || project.status === 'Picked Up') return false
    return new Date(project.dueDate) < new Date(new Date().toDateString())
  }

  return (
    <div className="space-y-6">
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
      <div className="sticky top-3 z-20 flex justify-end sm:static">
        <button onClick={openCreateModal} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.2)] transition hover:bg-teal-200">
          Add Project
        </button>
      </div>
      <Panel title="Project list">
        <div className="space-y-3">
          {projects.length === 0 ? (
            <EmptyState message="No projects yet. Use the form to create your first rug project." />
          ) : filteredProjects.length === 0 ? (
            <EmptyState message="No projects match the current search or filter." />
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`rounded-2xl border p-4 ${
                  isOverdue(project)
                    ? 'border-pink-400/40 bg-pink-400/10 shadow-[0_0_28px_rgba(244,114,182,0.12)]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenProject(project.id)}
                      className="font-medium text-white transition hover:text-teal-200"
                    >
                      {project.name}
                    </button>
                    <p className="text-sm text-slate-400">{project.customer} · {project.size} · {currency(project.price)}</p>
                    <p className="mt-1 text-xs text-slate-500">Due {project.dueDate || 'TBD'}</p>
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
                <RowActions
                  onEdit={() => edit(project)}
                  onDelete={() => onDelete(project.id)}
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
  onCreate,
  onUpdate,
  onDelete,
}: {
  inventory: InventoryItem[]
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
    setIsModalOpen(true)
  }

  function openCreateModal() {
    setForm(defaultInventoryForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setForm(defaultInventoryForm)
    setEditingId(null)
    setError('')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
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
      <div className="sticky top-3 z-20 flex justify-end sm:static">
        <button onClick={openCreateModal} className="rounded-2xl bg-teal-300 px-4 py-3 font-medium text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.2)] transition hover:bg-teal-200">
          Add Inventory Item
        </button>
      </div>
      <Panel title="Inventory list">
        <div className="space-y-3">
          {inventory.length === 0 ? (
            <EmptyState message="No inventory items yet. Add yarn, glue, backing, or tools to begin tracking stock." />
          ) : visibleInventory.length === 0 ? (
            <EmptyState message="No inventory items match the current search or filter." />
          ) : visibleInventory.map((item) => {
            const low = item.quantity <= item.lowStockThreshold
            return (
              <div key={item.id} className={`rounded-2xl border p-4 ${low ? 'border-pink-400/30 bg-pink-400/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{item.yarnColor}</p>
                    <p className="text-sm text-slate-400">{item.brand} · {item.quantity} cones · alert at {item.lowStockThreshold}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.supplier} · {currency(item.cost)} each</p>
                  </div>
                  {low && <span className="rounded-full bg-pink-400/20 px-3 py-1 text-xs text-pink-100">Low stock</span>}
                </div>
                <RowActions onEdit={() => edit(item)} onDelete={() => onDelete(item.id)} />
              </div>
            )
          })}
        </div>
      </Panel>
      <Modal title={editingId ? 'Edit Inventory Item' : 'Add Inventory Item'} open={isModalOpen} onClose={closeModal}>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yarn color"><input value={form.yarnColor} onChange={(event) => setForm({ ...form, yarnColor: event.target.value })} /></Field>
            <Field label="Brand"><input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} /></Field>
          </div>
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
      <FloatingActionButton label="Add inventory item" onClick={openCreateModal} />
    </div>
  )
}

function CustomersPage({
  customers,
  projects,
  setCustomers,
}: {
  customers: Customer[]
  projects: Project[]
  setCustomers: Dispatch<SetStateAction<Customer[]>>
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
    } else {
      setCustomers((current) => [{ id: crypto.randomUUID(), ...form }, ...current])
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
              <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
                <RowActions onEdit={() => edit(customer)} onDelete={() => setCustomers((current) => current.filter((entry) => entry.id !== customer.id))} />
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
}: {
  expenses: Expense[]
  setExpenses: Dispatch<SetStateAction<Expense[]>>
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
    } else {
      setExpenses((current) => [{ id: crypto.randomUUID(), ...form }, ...current])
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
      <section className="rounded-3xl border border-pink-300/20 bg-pink-300/[0.08] p-5 shadow-[0_0_28px_rgba(244,114,182,0.12)]">
        <p className="text-sm text-slate-400">Total expenses</p>
        <p className="mt-3 text-3xl font-semibold text-white">{currency(totalExpenses)}</p>
      </section>
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
      <Panel title="Expense list">
        <div className="grid gap-3 lg:grid-cols-2">
          {expenses.length === 0 ? (
            <EmptyState message="No expenses yet. Add your first cost to start tracking profit." />
          ) : visibleExpenses.length === 0 ? (
            <EmptyState message="No expenses match the current search or filter." />
          ) : (
            visibleExpenses.map((expense) => (
              <div key={expense.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
                  onDelete={() => setExpenses((current) => current.filter((entry) => entry.id !== expense.id))}
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
      'hyper-j-ruggs-backup.json',
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
          <EmptyState message="Photos section placeholder. Add uploaded project photos here later." />
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
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 sm:p-5">
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
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300">Hyper J Ruggs</p>
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
}: {
  onEdit: () => void
  onDelete: () => void
  extraAction?: ReactNode
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {extraAction}
      <button onClick={onEdit} className="rounded-full bg-purple-400/15 px-4 py-2 text-sm text-purple-100 hover:bg-purple-400/25">Edit</button>
      <button onClick={onDelete} className="rounded-full bg-pink-400/15 px-4 py-2 text-sm text-pink-100 hover:bg-pink-400/25">Delete</button>
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

function StatusPill({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Quote: 'bg-slate-400/15 text-slate-200',
    Approved: 'bg-teal-400/15 text-teal-100',
    Tufting: 'bg-purple-400/15 text-purple-100',
    Gluing: 'bg-fuchsia-400/15 text-fuchsia-100',
    Finished: 'bg-emerald-400/15 text-emerald-100',
    'Picked Up': 'bg-pink-400/15 text-pink-100',
  }

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs ${styles[status]}`}>{status}</span>
}

export default App



