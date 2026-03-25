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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {meals.map((meal) => (
          <article key={meal.meal_id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-in-out hover:scale-105">
            <div className="flex-shrink-0">
              <img
                src={meal.pImage}
                alt={meal.name}
                className="h-40 w-full object-contain p-4"
                onError={(event) => {
                  event.currentTarget.src = '/assets/huyuhoy-logo.jpg'
                }}
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <h2 className="text-center text-lg font-semibold text-slate-900">{meal.name}</h2>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">With Rice:</span> ₱{meal.withRice}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Without Rice:</span> ₱{meal.withOutRice}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
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
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
