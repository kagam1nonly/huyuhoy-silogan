import { Link } from 'react-router-dom'

export default function HomePage({ user }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Online Ordering (React + DRF)</h1>
        <p className="mt-3 text-slate-600">
          Legacy Django templates are now decoupled. This frontend consumes the API-first backend.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/meal" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Browse Meals</Link>
          <Link to="/order" className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200">View Cart / Place Order</Link>
          {user && <Link to="/my-orders" className="rounded-md bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200">My Orders</Link>}
          {!user && <Link to="/login" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Login</Link>}
        </div>
      </section>
    </main>
  )
}
