import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from '../api/client'

const INITIAL_STATE = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
}

export default function SignupPage({ onSignedUp }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_STATE)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setSubmitting(true)
      const user = await signup(form)
      onSignedUp(user)
      navigate('/meal')
    } catch (signupError) {
      setError(signupError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Signup</h1>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input value={form.username} onChange={(event) => updateField('username', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">First Name</label>
            <input value={form.first_name} onChange={(event) => updateField('first_name', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Last Name</label>
            <input value={form.last_name} onChange={(event) => updateField('last_name', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <input value={form.address} onChange={(event) => updateField('address', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required minLength={8} />
          </div>
          {error && <p className="md:col-span-2 text-sm text-rose-600">{error}</p>}
          <button disabled={submitting} className="md:col-span-2 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </section>
    </main>
  )
}
