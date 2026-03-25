import { CircleHelp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchMeals } from '../api/client'
import MenuGrid from '../components/menu/MenuGrid'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

export default function HomePage({ onAddToCart }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadMeals() {
      try {
        setLoading(true)
        const data = await fetchMeals()
        if (mounted) {
          setMeals(data)
          setError('')
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMeals()

    return () => {
      mounted = false
    }
  }, [])

  const featuredMeals = meals.slice(0, 5)
  const sideHighlights = (() => {
    const names = meals.map((meal) => meal.name)
    const sisig = names.find((name) => name.toLowerCase().includes('sisig')) || 'Sisig'
    const fallback = [sisig, 'Tapsilog', 'Longsilog', 'Tocilog']
    const merged = [...new Set([...fallback, ...names])]
    return merged.slice(0, 4)
  })()

  if (loading) {
    return <LoadingState text="Loading meals..." />
  }

  if (error) {
    return <ErrorState text={error} />
  }

  return (
    <main className="w-full">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-center lg:py-10">
          <div className="w-full lg:w-3/5">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {featuredMeals.map((meal) => (
                  <CarouselItem key={meal.meal_id}>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="flex h-[58vh] min-h-[360px] w-full items-center justify-center bg-white p-4">
                        <img
                          src={meal.pImage}
                          alt={meal.name}
                          className="h-full w-full object-contain"
                          onError={(event) => {
                            event.currentTarget.src = '/assets/huyuhoy-logo.jpg'
                          }}
                        />
                      </div>
                      <div className="border-t border-slate-200 bg-white px-5 py-4">
                        <p className="text-xl font-bold tracking-tight text-slate-900">{meal.name}</p>
                        <p className="mt-1 text-sm text-slate-600">With rice ₱{meal.withRice} · Without rice ₱{meal.withOutRice}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </Carousel>
          </div>

          <div className="w-full lg:w-2/5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Our Best Selling Meal</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Sisig</h1>
              <p className="mt-3 text-base text-slate-600">
                Bold flavor, sizzling aroma, and made fresh daily. Perfect for quick cravings and group orders.
              </p>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">More crowd favorites</p>
                <ul className="mt-3 space-y-2">
                  {sideHighlights.slice(1, 4).map((mealName) => (
                    <li key={mealName} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
                      {mealName}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-white">
                <p className="text-sm font-medium">{meals.length} menu items available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Freshly cooked daily</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Build your order from the menu</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Pick your favorite silog meals, customize rice options, and check out quickly.
            </p>
          </div>
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-sm font-medium">{meals.length} menu items available</p>
          </div>
        </div>
        </div>

        <section id="menu">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Menu</h2>
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                  How pricing works
                  <CircleHelp className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Choose with rice or without rice before adding to cart.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <MenuGrid meals={meals} onAddToCart={onAddToCart} />
        </section>
      </section>
    </main>
  )
}
