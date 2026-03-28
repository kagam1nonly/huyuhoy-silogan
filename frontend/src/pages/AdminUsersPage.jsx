import { Trash2, UserRoundCog } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { adminDeleteUser, adminFetchUsers, adminUpdateUser } from '../api/client'
import AdminShell from '../components/admin/AdminShell'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  is_staff: false,
  is_active: true,
}

function formatJoinedDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function roleClass(isStaff) {
  return isStaff
    ? 'bg-[#f4c23d]/20 text-[#926500] border-[#f4c23d]/45'
    : 'bg-slate-100 text-slate-700 border-slate-200'
}

function statusClass(isActive) {
  return isActive
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-rose-100 text-rose-700 border-rose-200'
}

export default function AdminUsersPage({ user, onUserUpdated }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await adminFetchUsers()
      setUsers(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.is_staff) {
      loadUsers()
    } else {
      setLoading(false)
    }
  }, [user])

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return users.filter((entry) => {
      if (!query) {
        return true
      }

      const haystack = [
        entry.username,
        entry.email,
        entry.first_name,
        entry.last_name,
        entry.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [users, searchTerm])

  function startEdit(entry) {
    setSelectedUser(entry)
    setForm({
      first_name: entry.first_name || '',
      last_name: entry.last_name || '',
      email: entry.email || '',
      phone: entry.phone || '',
      address: entry.address || '',
      is_staff: Boolean(entry.is_staff),
      is_active: Boolean(entry.is_active),
    })
  }

  function resetForm() {
    setSelectedUser(null)
    setForm(EMPTY_FORM)
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedUser) {
      return
    }

    setError('')
    setMessage('')

    try {
      const updated = await adminUpdateUser(selectedUser.id, form)
      setMessage(`User "${updated.username}" updated.`)
      toast.success(`User "${updated.username}" updated.`)

      await loadUsers()
      setSelectedUser((previous) => (previous ? updated : null))

      if (user?.id === updated.id && onUserUpdated) {
        onUserUpdated(updated)
      }
    } catch (submitError) {
      setError(submitError.message)
      toast.error(submitError.message || 'Unable to update user.')
    }
  }

  async function handleDelete(entry) {
    const confirmed = window.confirm(`Delete user ${entry.username}? This action cannot be undone.`)
    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await adminDeleteUser(entry.id)
      setMessage(response.detail || 'User deleted.')
      toast.success(response.detail || 'User deleted.')
      await loadUsers()

      if (selectedUser?.id === entry.id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
      toast.error(deleteError.message || 'Unable to delete user.')
    }
  }

  async function handleDeleteSelectedUser() {
    if (!selectedUser) {
      return
    }

    await handleDelete(selectedUser)
  }

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Loading user manager...</main>
  }

  return (
    <AdminShell user={user} title="Users" subtitle="Review, edit, and manage account access from one place.">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {filteredUsers.length} users visible
          </p>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search username, email, or name"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 md:w-72"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-3">Username</TableHead>
                <TableHead className="py-3">Email</TableHead>
                <TableHead className="py-3">Role</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="py-3">Joined</TableHead>
                <TableHead className="w-40 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="py-3">
                    <p className="font-semibold text-slate-900">{entry.username}</p>
                    <p className="text-xs text-slate-500">{[entry.first_name, entry.last_name].filter(Boolean).join(' ') || 'No profile name'}</p>
                  </TableCell>
                  <TableCell className="py-3 text-slate-700">{entry.email || 'N/A'}</TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${roleClass(entry.is_staff)}`}>
                      {entry.is_staff ? 'Admin' : 'Customer'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(entry.is_active)}`}>
                      {entry.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-slate-700">{formatJoinedDate(entry.date_joined)}</TableCell>
                  <TableCell className="py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-full rounded-md border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[#1b2132] transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                      onClick={() => startEdit(entry)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          {selectedUser ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-[0.05em] text-slate-900">
                  <UserRoundCog className="h-5 w-5 text-slate-700" />
                  Edit {selectedUser.username}
                </DialogTitle>
                <DialogDescription>Update role, profile, and account status.</DialogDescription>
              </DialogHeader>

              <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    First Name
                    <input
                      name="first_name"
                      type="text"
                      value={form.first_name}
                      onChange={handleInputChange}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Last Name
                    <input
                      name="last_name"
                      type="text"
                      value={form.last_name}
                      onChange={handleInputChange}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Email
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Phone
                  <input
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Address
                  <textarea
                    name="address"
                    rows={3}
                    value={form.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                  />
                </label>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="is_staff"
                      checked={form.is_staff}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    Admin Role
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    Active Account
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button type="submit" className="h-10 w-full bg-[#1b2132]/95 font-semibold text-white hover:bg-[#1b2132]/80">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    className="h-10 w-full rounded-md bg-rose-700 font-semibold text-white transition-all duration-200 hover:bg-rose-600 hover:shadow-md"
                    onClick={handleDeleteSelectedUser}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full border-slate-300 font-semibold"
                    onClick={resetForm}
                  >
                    Discard
                  </Button>
                </div>
              </form>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
