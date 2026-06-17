import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive,
  ChevronDown,
  Download,
  Home,
  Layers3,
  Library,
  Minus,
  PackagePlus,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';
import './styles.css';

const STORAGE_KEY = 'tufttrack-yarn-data-v1';
const AUTH_KEY = 'tufttrack-yarn-auth-v1';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'tufttrack123';
const LOGO_SRC = `${import.meta.env.BASE_URL}tufttrack-logo.png`;

const BRANDS = [
  'I Love This Yarn',
  'Red Heart Super Saver',
  'Caron One Pound',
  'Loops & Threads',
  'Big Twist',
  'Mainstays',
  'Lion Brand',
  'Premier Yarns',
  'Bernat',
  'Custom Brand',
];

const WOUND_TYPES = ['Skein', 'Cake', 'Cone', 'Ball', 'Other'];
const LOCATIONS = ['Shelf', 'Bin', 'Bag', 'Closet', 'Other'];
const COLOR_FAMILIES = ['Pink', 'Purple', 'Teal', 'Blue', 'Green', 'Yellow', 'Orange', 'Red', 'Neutral', 'Multi'];

const STARTER_LIBRARY = [
  { id: crypto.randomUUID(), brand: 'I Love This Yarn', line: 'Solids', color: 'Hot Rose', family: 'Pink', hex: '#ff3aa6' },
  { id: crypto.randomUUID(), brand: 'Red Heart Super Saver', line: 'Solids', color: 'Amethyst', family: 'Purple', hex: '#8b5cf6' },
  { id: crypto.randomUUID(), brand: 'Caron One Pound', line: 'Solids', color: 'Aqua', family: 'Teal', hex: '#14f1d6' },
  { id: crypto.randomUUID(), brand: 'Big Twist', line: 'Value', color: 'Black', family: 'Neutral', hex: '#111827' },
  { id: crypto.randomUUID(), brand: 'Lion Brand', line: 'Heartland', color: 'Acadia', family: 'Blue', hex: '#2563eb' },
  { id: crypto.randomUUID(), brand: 'Bernat', line: 'Blanket', color: 'Vintage White', family: 'Neutral', hex: '#f8fafc' },
];

const blankForm = {
  brand: BRANDS[0],
  customBrand: '',
  line: '',
  color: 'custom',
  customColor: '',
  customHex: '#14f1d6',
  quantity: 1,
  woundType: 'Skein',
  location: 'Shelf',
  lowStock: 1,
  notes: '',
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.inventory && saved?.library) return saved;
  } catch {
    return null;
  }
  return { inventory: [], library: STARTER_LIBRARY };
}

function App() {
  const [data, setData] = useState(loadData);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [activePage, setActivePage] = useState('dashboard');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }
  }, []);

  function login(username, password) {
    if (username.trim() === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    setEditingItem(null);
    setActivePage('dashboard');
  }

  const stats = useMemo(() => makeStats(data.inventory), [data.inventory]);

  function saveYarn(form) {
    const libraryColor = data.library.find((entry) => entry.id === form.color);
    const brand = form.brand === 'Custom Brand' ? form.customBrand.trim() || 'Custom Brand' : form.brand;
    const color = libraryColor?.color || form.customColor.trim() || 'Custom Color';
    const line = libraryColor?.line || form.line.trim() || 'General';
    const hex = libraryColor?.hex || form.customHex;
    const family = libraryColor?.family || 'Custom';

    const item = {
      id: editingItem?.id || crypto.randomUUID(),
      brand,
      line,
      color,
      family,
      hex,
      quantity: Math.max(0, Number(form.quantity) || 0),
      woundType: form.woundType,
      location: form.location,
      lowStock: Math.max(0, Number(form.lowStock) || 0),
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    setData((current) => {
      const exists = current.inventory.some((entry) => entry.id === item.id);
      return {
        ...current,
        inventory: exists
          ? current.inventory.map((entry) => (entry.id === item.id ? item : entry))
          : [item, ...current.inventory],
      };
    });
    setEditingItem(null);
    setActivePage('inventory');
  }

  function editItem(item) {
    setEditingItem(item);
    setActivePage('add');
  }

  function deleteItem(id) {
    setData((current) => ({ ...current, inventory: current.inventory.filter((item) => item.id !== id) }));
  }

  function adjustQuantity(id, amount) {
    setData((current) => ({
      ...current,
      inventory: current.inventory.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount), updatedAt: new Date().toISOString() } : item
      ),
    }));
  }

  function saveLibraryColor(entry) {
    setData((current) => ({
      ...current,
      library: entry.id
        ? current.library.map((color) => (color.id === entry.id ? entry : color))
        : [{ ...entry, id: crypto.randomUUID() }, ...current.library],
    }));
  }

  function deleteLibraryColor(id) {
    setData((current) => ({ ...current, library: current.library.filter((entry) => entry.id !== id) }));
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed.inventory) || !Array.isArray(parsed.library)) throw new Error('Invalid backup');
        setData(parsed);
      } catch {
        alert('That backup file could not be imported.');
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    const confirmed = confirm('Clear all yarn inventory and library colors? This cannot be undone.');
    if (confirmed) setData({ inventory: [], library: STARTER_LIBRARY });
  }

  const pages = {
    dashboard: <Dashboard inventory={data.inventory} stats={stats} goTo={setActivePage} />,
    inventory: (
      <Inventory
        inventory={data.inventory}
        brands={BRANDS}
        onAdd={() => {
          setEditingItem(null);
          setActivePage('add');
        }}
        onEdit={editItem}
        onDelete={deleteItem}
        onAdjust={adjustQuantity}
      />
    ),
    add: <AddYarn library={data.library} editingItem={editingItem} onSave={saveYarn} onCancel={() => setActivePage('inventory')} />,
    library: <YarnLibrary library={data.library} onSave={saveLibraryColor} onDelete={deleteLibraryColor} />,
    settings: <SettingsPage data={data} onImport={importBackup} onClear={clearData} onLogout={logout} />,
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#07141f] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#07141f,#130d2c_58%,#07141f)]" />
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-28 pt-5 sm:px-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={LOGO_SRC}
              alt="TuftTrack logo"
              className="h-16 w-16 shrink-0 rounded-lg border border-teal-300/25 object-cover shadow-neon"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">TuftTrack</p>
              <h1 className="text-3xl font-black tracking-normal text-white">Yarn</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setActivePage('add');
            }}
            className="tap-target rounded-full bg-pink-500 p-4 text-white shadow-pink transition active:scale-95"
            aria-label="Add yarn"
            title="Add yarn"
          >
            <PackagePlus size={26} />
          </button>
        </header>
        {pages[activePage]}
      </main>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const success = onLogin(username, password);
    if (!success) setError('Username or password did not match.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07141f] bg-[linear-gradient(180deg,#07141f,#130d2c_58%,#07141f)] px-4 py-8 text-slate-100">
      <section className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src={LOGO_SRC}
            alt="TuftTrack logo"
            className="mx-auto mb-4 h-32 w-32 rounded-lg border border-teal-300/30 object-cover shadow-neon"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">TuftTrack</p>
          <h1 className="mt-1 text-4xl font-black text-white">Yarn</h1>
        </div>

        <form onSubmit={submit} className="panel space-y-4">
          <h2 className="section-title">Login</h2>
          <Field label="Username">
            <TextInput value={username} onChange={setUsername} placeholder="Username" />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="input"
              autoComplete="current-password"
            />
          </Field>
          {error && <p className="rounded-lg border border-pink-300/30 bg-pink-500/15 p-3 text-sm font-semibold text-pink-100">{error}</p>}
          <button type="submit" className="primary-button w-full">
            Login
          </button>
          <p className="text-center text-xs leading-5 text-slate-400">Basic local protection for this device only.</p>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ inventory, stats, goTo }) {
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Yarn items" value={stats.totalItems} tone="teal" />
        <StatCard label="Total pieces" value={stats.totalQuantity} tone="pink" />
        <StatCard label="Low stock" value={stats.lowStockCount} tone="purple" />
        <StatCard label="Brands" value={stats.brandCount} tone="teal" />
      </div>

      <div className="panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Most Used Brands</h2>
          <Layers3 className="text-teal-200" size={22} />
        </div>
        {stats.topBrands.length ? (
          <div className="space-y-3">
            {stats.topBrands.map(([brand, count]) => (
              <div key={brand} className="flex items-center justify-between rounded-lg bg-white/6 px-3 py-3">
                <span className="font-semibold text-white">{brand}</span>
                <span className="rounded-full border border-teal-300/30 px-3 py-1 text-sm text-teal-100">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState action="Add your first yarn" onClick={() => goTo('add')} />
        )}
      </div>

      <button type="button" onClick={() => goTo('inventory')} className="primary-button w-full">
        View Inventory
      </button>
    </section>
  );
}

function Inventory({ inventory, brands, onAdd, onEdit, onDelete, onAdjust }) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [lowOnly, setLowOnly] = useState(false);

  const filtered = inventory.filter((item) => {
    const matchesSearch = `${item.brand} ${item.color}`.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brand === 'All' || item.brand === brand;
    const matchesLow = !lowOnly || item.quantity <= item.lowStock;
    return matchesSearch && matchesBrand && matchesLow;
  });

  return (
    <section className="space-y-4">
      <div className="flex gap-3">
        <label className="field-shell flex-1">
          <Search size={20} className="text-teal-200" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search brand or color"
            className="field-input"
          />
        </label>
        <button type="button" onClick={onAdd} className="tap-target rounded-lg bg-teal-300 px-4 text-slate-950 shadow-neon">
          <Plus size={26} />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Select value={brand} onChange={setBrand} options={['All', ...brands]} icon={<SlidersHorizontal size={19} />} />
        <button
          type="button"
          onClick={() => setLowOnly((value) => !value)}
          className={`rounded-lg px-4 text-sm font-bold transition ${lowOnly ? 'bg-pink-500 text-white' : 'bg-white/10 text-slate-200'}`}
        >
          Low
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length ? (
          filtered.map((item) => (
            <YarnCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onAdjust={onAdjust} />
          ))
        ) : (
          <EmptyState action="Add yarn" onClick={onAdd} />
        )}
      </div>
    </section>
  );
}

function YarnCard({ item, onEdit, onDelete, onAdjust }) {
  const isLow = item.quantity <= item.lowStock;
  return (
    <article className="panel border-l-4 border-l-teal-300">
      <div className="flex gap-3">
        <div className="h-14 w-14 shrink-0 rounded-lg border border-white/20 shadow-neon" style={{ backgroundColor: item.hex }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-white">{item.color}</h3>
              <p className="truncate text-sm text-slate-300">{item.brand}</p>
            </div>
            {isLow && <span className="badge bg-pink-500/20 text-pink-100 ring-pink-300/30">Low</span>}
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {item.line} / {item.woundType} / {item.location}
          </p>
        </div>
      </div>
      {item.notes && <p className="mt-3 rounded-lg bg-white/6 p-3 text-sm text-slate-300">{item.notes}</p>}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-slate-950/50">
          <button type="button" onClick={() => onAdjust(item.id, -1)} className="tap-target px-4 text-teal-200" aria-label="Decrease quantity">
            <Minus size={20} />
          </button>
          <span className="min-w-12 text-center text-xl font-black text-white">{item.quantity}</span>
          <button type="button" onClick={() => onAdjust(item.id, 1)} className="tap-target px-4 text-teal-200" aria-label="Increase quantity">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onEdit(item)} className="secondary-button px-4">
            Edit
          </button>
          <button type="button" onClick={() => onDelete(item.id)} className="icon-button text-pink-200" aria-label="Delete yarn" title="Delete yarn">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}

function AddYarn({ library, editingItem, onSave, onCancel }) {
  const [form, setForm] = useState(() => itemToForm(editingItem, library));
  const brandColors = library.filter((entry) => form.brand === 'Custom Brand' || entry.brand === form.brand);

  useEffect(() => {
    setForm(itemToForm(editingItem, library));
  }, [editingItem, library]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className="panel space-y-4">
        <h2 className="section-title">{editingItem ? 'Edit Yarn' : 'Add Yarn'}</h2>
        <Field label="Brand">
          <Select value={form.brand} onChange={(value) => update('brand', value)} options={BRANDS} />
        </Field>
        {form.brand === 'Custom Brand' && (
          <Field label="Custom brand">
            <TextInput value={form.customBrand} onChange={(value) => update('customBrand', value)} placeholder="Brand name" />
          </Field>
        )}
        <Field label="Yarn line">
          <Select
            value={form.line}
            onChange={(value) => update('line', value)}
            options={unique(library.filter((entry) => entry.brand === form.brand).map((entry) => entry.line))}
            placeholder="Choose or type below"
          />
          <TextInput value={form.line} onChange={(value) => update('line', value)} placeholder="Custom line" />
        </Field>
        <Field label="Color">
          <Select
            value={form.color}
            onChange={(value) => update('color', value)}
            options={['custom', ...brandColors.map((entry) => entry.id)]}
            labels={{ custom: 'Custom color', ...Object.fromEntries(brandColors.map((entry) => [entry.id, `${entry.color} (${entry.family})`])) }}
          />
        </Field>
        {form.color === 'custom' && (
          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <Field label="Custom color">
              <TextInput value={form.customColor} onChange={(value) => update('customColor', value)} placeholder="Color name" />
            </Field>
            <Field label="Hex">
              <input
                type="color"
                value={form.customHex}
                onChange={(event) => update('customHex', event.target.value)}
                className="h-13 w-full rounded-lg border border-white/10 bg-white/10 p-1"
              />
            </Field>
          </div>
        )}
      </div>

      <div className="panel grid grid-cols-2 gap-4">
        <Field label="Quantity">
          <NumberInput value={form.quantity} onChange={(value) => update('quantity', value)} />
        </Field>
        <Field label="Low stock">
          <NumberInput value={form.lowStock} onChange={(value) => update('lowStock', value)} />
        </Field>
        <Field label="Wound type">
          <Select value={form.woundType} onChange={(value) => update('woundType', value)} options={WOUND_TYPES} />
        </Field>
        <Field label="Location">
          <Select value={form.location} onChange={(value) => update('location', value)} options={LOCATIONS} />
        </Field>
        <div className="col-span-2">
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              rows="4"
              className="input min-h-28 resize-none"
              placeholder="Project plans, dye lot, where it came from..."
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="secondary-button">
          Cancel
        </button>
        <button type="submit" className="primary-button">
          Save Yarn
        </button>
      </div>
    </form>
  );
}

function YarnLibrary({ library, onSave, onDelete }) {
  const [entry, setEntry] = useState({ brand: BRANDS[0], line: '', color: '', family: COLOR_FAMILIES[0], hex: '#14f1d6' });

  function update(key, value) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!entry.color.trim()) return;
    onSave({ ...entry, line: entry.line.trim() || 'General', color: entry.color.trim() });
    setEntry({ brand: BRANDS[0], line: '', color: '', family: COLOR_FAMILIES[0], hex: '#14f1d6' });
  }

  return (
    <section className="space-y-4">
      <form onSubmit={submit} className="panel space-y-4">
        <h2 className="section-title">Yarn Library</h2>
        <Field label="Brand">
          <Select value={entry.brand} onChange={(value) => update('brand', value)} options={BRANDS} />
        </Field>
        <Field label="Line">
          <TextInput value={entry.line} onChange={(value) => update('line', value)} placeholder="Yarn line" />
        </Field>
        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <Field label="Color">
            <TextInput value={entry.color} onChange={(value) => update('color', value)} placeholder="Color name" />
          </Field>
          <Field label="Hex">
            <input
              type="color"
              value={entry.hex}
              onChange={(event) => update('hex', event.target.value)}
              className="h-13 w-full rounded-lg border border-white/10 bg-white/10 p-1"
            />
          </Field>
        </div>
        <Field label="Family">
          <Select value={entry.family} onChange={(value) => update('family', value)} options={COLOR_FAMILIES} />
        </Field>
        <button type="submit" className="primary-button w-full">
          Add Color
        </button>
      </form>

      <div className="space-y-3">
        {library.map((color) => (
          <article key={color.id} className="panel flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg border border-white/20" style={{ backgroundColor: color.hex }} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-black text-white">{color.color}</h3>
              <p className="truncate text-sm text-slate-400">
                {color.brand} / {color.line} / {color.family}
              </p>
            </div>
            <button type="button" onClick={() => onDelete(color.id)} className="icon-button text-pink-200" aria-label="Delete color">
              <X size={20} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ data, onImport, onClear, onLogout }) {
  const backup = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  return (
    <section className="space-y-4">
      <div className="panel space-y-4">
        <h2 className="section-title">Settings</h2>
        <div className="rounded-lg border border-teal-300/25 bg-teal-300/10 p-3">
          <p className="text-sm font-black text-teal-100">Storage Mode</p>
          <p className="mt-1 text-sm text-slate-300">
            {isSupabaseConfigured ? 'Supabase client configured. Inventory is still stored locally in Version 1.' : 'Local device storage. Add Supabase env keys when you are ready to sync.'}
          </p>
        </div>
        <a href={backup} download={`tufttrack-yarn-backup-${new Date().toISOString().slice(0, 10)}.json`} className="primary-button flex justify-center">
          <Download size={20} />
          Export Backup JSON
        </a>
        <label className="secondary-button flex justify-center">
          <Upload size={20} />
          Import Backup JSON
          <input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => onImport(event.target.files?.[0])} />
        </label>
        <button type="button" onClick={onLogout} className="secondary-button w-full">
          <UserRound size={20} />
          Logout
        </button>
      </div>

      <div className="panel border border-pink-400/30">
        <h3 className="mb-2 text-lg font-black text-pink-100">Clear All Data</h3>
        <p className="mb-4 text-sm text-slate-300">This removes inventory and custom library colors from this device after a warning.</p>
        <button type="button" onClick={onClear} className="danger-button w-full">
          <Trash2 size={20} />
          Clear All Data
        </button>
      </div>
    </section>
  );
}

function BottomNav({ activePage, setActivePage }) {
  const nav = [
    ['dashboard', Home, 'Home'],
    ['inventory', Archive, 'Inventory'],
    ['add', PackagePlus, 'Add'],
    ['library', Library, 'Library'],
    ['settings', Settings, 'Settings'],
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#07141f]/95 px-2 pb-safe pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {nav.map(([key, Icon, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => setActivePage(key)}
            className={`flex min-h-16 flex-col items-center justify-center rounded-lg text-xs font-bold transition ${
              activePage === key ? 'bg-teal-300 text-slate-950 shadow-neon' : 'text-slate-300'
            }`}
          >
            <Icon size={22} />
            <span className="mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function StatCard({ label, value, tone }) {
  const toneClasses = {
    teal: 'border-teal-300/30 text-teal-100',
    pink: 'border-pink-300/30 text-pink-100',
    purple: 'border-purple-300/30 text-purple-100',
  };
  return (
    <div className={`rounded-lg border bg-white/10 p-4 shadow-neon ${toneClasses[tone]}`}>
      <p className="text-sm font-semibold text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input" />;
}

function NumberInput({ value, onChange }) {
  return <input type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} className="input" />;
}

function Select({ value, onChange, options, labels = {}, icon, placeholder }) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-200">{icon}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`input appearance-none pr-11 ${icon ? 'pl-10' : ''}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] || option || 'Choose'}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-teal-200" size={20} />
    </div>
  );
}

function EmptyState({ action, onClick }) {
  return (
    <div className="rounded-lg border border-dashed border-teal-300/30 bg-white/5 p-6 text-center">
      <p className="mb-4 text-slate-300">No yarn here yet.</p>
      <button type="button" onClick={onClick} className="primary-button mx-auto">
        <Plus size={20} />
        {action}
      </button>
    </div>
  );
}

function makeStats(inventory) {
  const brandTotals = inventory.reduce((totals, item) => {
    totals[item.brand] = (totals[item.brand] || 0) + item.quantity;
    return totals;
  }, {});
  return {
    totalItems: inventory.length,
    totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
    lowStockCount: inventory.filter((item) => item.quantity <= item.lowStock).length,
    brandCount: Object.keys(brandTotals).length,
    topBrands: Object.entries(brandTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4),
  };
}

function itemToForm(item, library) {
  if (!item) return blankForm;
  const libraryMatch = library.find((entry) => entry.brand === item.brand && entry.color === item.color && entry.line === item.line);
  return {
    brand: BRANDS.includes(item.brand) ? item.brand : 'Custom Brand',
    customBrand: BRANDS.includes(item.brand) ? '' : item.brand,
    line: item.line,
    color: libraryMatch?.id || 'custom',
    customColor: item.color,
    customHex: item.hex,
    quantity: item.quantity,
    woundType: item.woundType,
    location: item.location,
    lowStock: item.lowStock,
    notes: item.notes,
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

createRoot(document.getElementById('root')).render(<App />);
