import { CreditCard, LayoutDashboard, ListOrdered, Settings, UserRound, UtensilsCrossed } from 'lucide-react'
import { NavLink } from 'react-router-dom'

function linkClass({ isActive }) {
  return isActive
    ? 'flex items-center gap-2 rounded-lg border border-[#f4c23d]/40 bg-[#f4c23d]/15 px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4c23d]'
    : 'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-slate-300 transition-colors hover:bg-white/10 hover:text-white'
}

export default function AdminShell({ user, title, subtitle, children }) {
  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-[#f4c23d]/25 bg-[#1b2132]/95 p-4 shadow-lg">
          <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin Panel</p>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/orders" className={linkClass}>
              <ListOrdered className="h-4 w-4" />
              Orders
            </NavLink>
            <NavLink to="/admin/payments" className={linkClass}>
              <CreditCard className="h-4 w-4" />
              Payments
            </NavLink>
            <NavLink to="/admin/meals" className={linkClass}>
              <UtensilsCrossed className="h-4 w-4" />
              Meals
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              <UserRound className="h-4 w-4" />
              Users
            </NavLink>
            <NavLink to="/admin/settings" className={linkClass}>
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>

          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Control Room</p>
            <p className="mt-2 text-sm text-slate-200">Manage live orders, payment checks, and fulfillment updates.</p>
          </div>
        </aside>

        <section className="space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm font-medium text-slate-600">{subtitle}</p> : null}
          </header>
          {children}
        </section>
      </div>
    </main>
  )
}
