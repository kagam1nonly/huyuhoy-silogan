import { BellRing, Palette, Save, ShieldCheck, UserCog } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { updateMe } from '../api/client'
import AdminShell from '../components/admin/AdminShell'
import { Button } from '../components/ui/button'

const PREFERENCES_KEY = 'huyuhoy-admin-preferences'

const DEFAULT_PREFS = {
  compactTables: false,
  orderAlerts: true,
  summaryCards: true,
}

export default function AdminConfigPage({ user, onUserUpdated }) {
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [preferences, setPreferences] = useState(DEFAULT_PREFS)

  useEffect(() => {
    if (!user) {
      return
    }

    setProfile({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    })
  }, [user])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY)
      if (!saved) {
        return
      }

      const parsed = JSON.parse(saved)
      setPreferences({
        ...DEFAULT_PREFS,
        ...parsed,
      })
    } catch {
      setPreferences(DEFAULT_PREFS)
    }
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    setSavingProfile(true)
    setError('')
    setMessage('')

    try {
      const updated = await updateMe(profile)
      onUserUpdated(updated)
      setMessage('Admin profile updated successfully.')
      toast.success('Admin profile updated.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save profile settings.')
      toast.error(saveError.message || 'Unable to save profile settings.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePreferences(event) {
    event.preventDefault()
    setSavingPrefs(true)
    setError('')
    setMessage('')

    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
      setMessage('Panel preferences saved on this device.')
      toast.success('Panel preferences saved.')
    } catch {
      setError('Unable to save preferences on this device.')
      toast.error('Unable to save preferences on this device.')
    } finally {
      setSavingPrefs(false)
    }
  }

  function togglePreference(key) {
    setPreferences((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  return (
    <AdminShell user={user} title="Settings" subtitle="Manage your admin identity and panel behavior.">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#1b2132]/95 p-2 text-[#f4c23d]">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-[0.05em] text-slate-900">Admin Identity</h2>
              <p className="text-sm text-slate-600">Keep your account details updated for order and payment coordination.</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              First Name
              <input
                type="text"
                value={profile.first_name}
                onChange={(event) => setProfile((previous) => ({ ...previous, first_name: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Last Name
              <input
                type="text"
                value={profile.last_name}
                onChange={(event) => setProfile((previous) => ({ ...previous, last_name: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Email
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((previous) => ({ ...previous, email: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Phone Number
              <input
                type="text"
                value={profile.phone}
                onChange={(event) => setProfile((previous) => ({ ...previous, phone: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:col-span-2">
              Admin Address
              <textarea
                rows={4}
                value={profile.address}
                onChange={(event) => setProfile((previous) => ({ ...previous, address: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="sm:col-span-2">
              <Button type="submit" className="bg-[#1b2132]/95 text-white hover:bg-[#1b2132]/80" disabled={savingProfile}>
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving Profile...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#1b2132]/95 p-2 text-[#f4c23d]">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-[0.05em] text-slate-900">Panel Preferences</h2>
              <p className="text-sm text-slate-600">Save visual and workflow defaults for this admin workstation.</p>
            </div>
          </div>

          <form onSubmit={savePreferences} className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => togglePreference('compactTables')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Compact Tables</p>
                <p className="text-xs text-slate-500">Use denser row heights in management tables.</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${preferences.compactTables ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {preferences.compactTables ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('orderAlerts')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="flex items-start gap-2">
                <BellRing className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order Alerts</p>
                  <p className="text-xs text-slate-500">Prioritize visibility for pending order actions.</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${preferences.orderAlerts ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {preferences.orderAlerts ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => togglePreference('summaryCards')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Priority Summary Cards</p>
                  <p className="text-xs text-slate-500">Highlight key metrics in dashboard and reviews.</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${preferences.summaryCards ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {preferences.summaryCards ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="pt-1">
              <Button type="submit" variant="outline" className="w-full bg-[#1b2132]/95 border-slate-300 font-semibold text-white hover:bg-[#1b2132]/80" disabled={savingPrefs}>
                {savingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}
