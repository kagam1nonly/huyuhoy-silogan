import { PencilLine, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { updateMe } from '../api/client'
import { Button } from '../components/ui/button'

export default function AccountPage({ user, onUserUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    if (!user) return

    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    })
  }, [user])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const updated = await updateMe(form)
      onUserUpdated(updated)
      setMessage('Account details updated.')
      setIsEditing(false)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return <main className="mx-auto w-full max-w-4xl px-4 py-10 text-slate-700">Please log in to view your account.</main>
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">My Account</h1>
            <p className="mt-1 text-sm text-slate-600">Update your personal information and delivery address.</p>
          </div>

          <Button
            type="button"
            variant={isEditing ? 'outline' : 'default'}
            className={isEditing ? 'border-slate-300 text-slate-800' : 'bg-[#1b2132] text-[#f4c23d] hover:bg-[#14192a]'}
            onClick={() => {
              setError('')
              setMessage('')
              setIsEditing((previous) => !previous)
            }}
          >
            <PencilLine className="h-4 w-4" />
            {isEditing ? 'Cancel Edit' : 'Edit Details'}
          </Button>
        </div>

        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

        <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            First Name
            <input
              type="text"
              value={form.first_name}
              disabled={!isEditing}
              onChange={(event) => setForm((previous) => ({ ...previous, first_name: event.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 disabled:bg-slate-100"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Last Name
            <input
              type="text"
              value={form.last_name}
              disabled={!isEditing}
              onChange={(event) => setForm((previous) => ({ ...previous, last_name: event.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 disabled:bg-slate-100"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Username
            <input
              type="text"
              value={user.username || ''}
              disabled
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm font-medium text-slate-700"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Email
            <input
              type="email"
              value={form.email}
              disabled={!isEditing}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 disabled:bg-slate-100"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:col-span-2">
            Phone Number
            <input
              type="text"
              value={form.phone}
              disabled={!isEditing}
              onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 disabled:bg-slate-100"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:col-span-2">
            Delivery Address
            <textarea
              value={form.address}
              disabled={!isEditing}
              onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 disabled:bg-slate-100"
            />
          </label>

          {isEditing ? (
            <div className="sm:col-span-2">
              <Button type="submit" className="bg-[#1b2132] text-[#f4c23d] hover:bg-[#14192a]" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  )
}
