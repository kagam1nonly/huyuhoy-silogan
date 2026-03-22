import { useEffect, useState } from 'react'
import { fetchMeals } from '../api/client'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

export default function MealPage({ onAddToCart }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedMessage, setAddedMessage] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadMeals() {
      try {
        setLoading(true)
        const data = await fetchMeals()
        if (mounted) setMeals(data)
      } catch (loadError) {
        if (mounted) setError(loadError.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMeals()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <LoadingState text="Loading meals..." />
  }

  if (error) {
    return <ErrorState text={error} />
  }

  function handleAdd(meal, riceLabel) {
    onAddToCart(meal, riceLabel)
    setAddedMessage(`${meal.name} added to cart (${riceLabel}).`)
    window.setTimeout(() => {
      setAddedMessage('')
    }, 1500)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Meals</h1>
      {addedMessage && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {addedMessage}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <article key={meal.meal_id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <img
              src={meal.pImage}
              alt={meal.name}
              className="h-44 w-full rounded-md object-cover"
              onError={(event) => {
                event.currentTarget.src = '/assets/huyuhoy-logo.jpg'
              }}
            />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{meal.name}</h2>
            <p className="mt-1 text-sm text-slate-600">With rice: ₱{meal.withRice}</p>
            <p className="text-sm text-slate-600">Without rice: ₱{meal.withOutRice}</p>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                onClick={() => handleAdd(meal, 'with rice')}
              >
                Add (With Rice)
              </button>
              <button
                className="rounded-md bg-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-300"
                onClick={() => handleAdd(meal, 'without rice')}
              >
                Add (No Rice)
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
