import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you requested doesn’t exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Go to Home
        </Link>
      </section>
    </main>
  )
}
