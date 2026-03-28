import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  adminCreateMeal,
  adminDeleteMeal,
  adminFetchMeals,
  adminUpdateMeal,
} from '../api/client'
import AdminShell from '../components/admin/AdminShell'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`
}

const EMPTY_FORM = {
  name: '',
  withUnliRice: '',
  withoutUnli: '',
  isHot: false,
  image: null,
}

function resolveMealImageUrl(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const backendOrigin = /^https?:\/\//i.test(apiBaseUrl)
    ? new URL(apiBaseUrl).origin
    : import.meta.env.DEV
      ? 'http://127.0.0.1:8000'
      : window.location.origin

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  return `${backendOrigin}${normalizedPath}`
}

export default function AdminMealsPage({ user }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [previewUrl, setPreviewUrl] = useState('')

  async function loadMeals() {
    try {
      setLoading(true)
      const data = await adminFetchMeals()
      setMeals(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.is_staff) {
      loadMeals()
    } else {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!form.image) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(form.image)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [form.image])

  const totalMenuValue = useMemo(
    () => meals.reduce((sum, meal) => sum + Number(meal.withUnliRice || 0), 0),
    [meals],
  )

  function resetForm() {
    setSelectedMeal(null)
    setForm(EMPTY_FORM)
  }

  function startEdit(meal) {
    setSelectedMeal(meal)
    setForm({
      name: meal.name || '',
      withUnliRice: meal.withUnliRice || '',
      withoutUnli: meal.withoutUnli || '',
      isHot: Boolean(meal.isHot),
      image: null,
    })
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null
    setForm((previous) => ({ ...previous, image: file }))
  }

  function buildFormData({ includeOptional = false } = {}) {
    const data = new FormData()

    if (!selectedMeal || includeOptional || form.name.trim()) {
      data.append('name', form.name.trim())
    }
    if (!selectedMeal || includeOptional || form.withUnliRice !== '') {
      data.append('withUnliRice', form.withUnliRice)
    }
    if (!selectedMeal || includeOptional || form.withoutUnli !== '') {
      data.append('withoutUnli', form.withoutUnli)
    }
    if (!selectedMeal || includeOptional || form.isHot !== Boolean(selectedMeal?.isHot)) {
      data.append('isHot', String(Boolean(form.isHot)))
    }
    if (form.image) {
      data.append('pImage', form.image)
    }

    return data
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      if (selectedMeal) {
        const updateData = buildFormData()
        if (!Array.from(updateData.keys()).length) {
          toast.error('No changes to save.')
          return
        }
        const updated = await adminUpdateMeal(selectedMeal.meal_id, updateData)
        setMessage(`Meal "${updated.name}" updated.`)
        toast.success(`Meal "${updated.name}" updated.`)
      } else {
        if (!form.name.trim() || !form.withUnliRice || !form.withoutUnli || !form.image) {
          toast.error('Name, both prices, and image are required to add a meal.')
          return
        }
        const createData = buildFormData({ includeOptional: true })
        const created = await adminCreateMeal(createData)
        setMessage(`Meal "${created.name}" created.`)
        toast.success(`Meal "${created.name}" created.`)
      }

      await loadMeals()
      resetForm()
    } catch (submitError) {
      setError(submitError.message)
      toast.error(submitError.message || 'Unable to save meal.')
    }
  }

  async function handleDelete(meal) {
    const confirmed = window.confirm(`Delete ${meal.name}? This action cannot be undone.`)
    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await adminDeleteMeal(meal.meal_id)
      setMessage(response.detail || 'Meal deleted.')
      toast.success(response.detail || 'Meal deleted.')
      await loadMeals()
      if (selectedMeal?.meal_id === meal.meal_id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
      toast.error(deleteError.message || 'Unable to delete meal.')
    }
  }

  async function handleDeleteSelectedMeal() {
    if (!selectedMeal) {
      return
    }

    await handleDelete(selectedMeal)
  }

  const currentMealImage = previewUrl || resolveMealImageUrl(selectedMeal?.pImage || '')

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Loading meal manager...</main>
  }

  return (
    <AdminShell user={user} title="Meals" subtitle="Create, update, and clean up menu entries directly from localhost admin.">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {meals.length} menu items
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3">Meal</TableHead>
                  <TableHead className="py-3">With Unli-rice</TableHead>
                  <TableHead className="py-3">Without Unli</TableHead>
                  <TableHead className="w-44 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.meal_id}>
                    <TableCell className="py-3 font-semibold text-slate-900">{meal.name}</TableCell>
                    <TableCell className="py-3 font-semibold text-slate-800">{formatCurrency(meal.withUnliRice)}</TableCell>
                    <TableCell className="py-3 font-semibold text-slate-800">{formatCurrency(meal.withoutUnli)}</TableCell>
                    <TableCell className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-full border-slate-300 px-3 text-xs font-semibold uppercase tracking-[0.06em]"
                        onClick={() => startEdit(meal)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!meals.length ? <p className="py-6 text-center text-sm text-slate-500">No meals yet. Add your first item.</p> : null}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black uppercase tracking-[0.05em] text-slate-900">
                {selectedMeal ? `Edit ${selectedMeal.name}` : 'Add Meal'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedMeal ? 'Update prices, image, or meal name.' : 'Add a new menu item for customers.'}
              </p>
            </div>

            {selectedMeal ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-md border-rose-400 bg-rose-600 text-white transition-all duration-200 hover:bg-rose-500 hover:shadow-md"
                onClick={handleDeleteSelectedMeal}
                aria-label="Delete meal"
                title="Delete meal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {currentMealImage ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <img
                src={currentMealImage}
                alt={selectedMeal?.name || form.name || 'Meal preview'}
                className="h-44 w-full rounded-lg object-contain"
              />
            </div>
          ) : null}

          <form className="mt-5 space-y-2" onSubmit={handleSubmit}>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Meal Name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter meal name"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 pt-3">
              <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                With Unli-rice Price
                <input
                  name="withUnliRice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.withUnliRice}
                  onChange={handleInputChange}
                  placeholder="120.00"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Without Unli Price
                <input
                  name="withoutUnli"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.withoutUnli}
                  onChange={handleInputChange}
                  placeholder="100.00"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Meal Image {selectedMeal ? '(optional)' : '(required)'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block h-10 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-[#1b2132]/95 file:px-3 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1b2132]/80"
              />
            </label>

            <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
              <input
                name="isHot"
                type="checkbox"
                checked={Boolean(form.isHot)}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-slate-300 accent-[#ef4444]"
              />
              Mark as Hot (shows 🔥 on homepage menu)
            </label>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button type="submit" className="h-10 w-full rounded-md bg-[#1b2132]/95 font-semibold text-white transition-all duration-200 hover:bg-[#1b2132]/80 hover:shadow-md">
                {selectedMeal ? 'Save Changes' : 'Add Meal'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-md border-slate-300 font-semibold transition-all duration-200 hover:shadow-md"
                onClick={resetForm}
              >
                Discard
              </Button>
            </div>
          </form>
        </aside>
      </div>
    </AdminShell>
  )
}
